/**
 * Community Hub Backend Server
 * 
 * This simple Express server handles shared community listings.
 * In production, replace the in-memory storage with a real database.
 * 
 * Start this server with: node backend.js
 */

const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage of mesh networks and listings
// In production, use a real database instead
const meshNetworks = new Map();

/**
 * Get or create a mesh network
 */
function getMeshNetwork(meshKey) {
  if (!meshNetworks.has(meshKey)) {
    meshNetworks.set(meshKey, {
      key: meshKey,
      listings: [],
      subscribers: new Set(),
      createdAt: new Date()
    });
  }
  return meshNetworks.get(meshKey);
}

/**
 * Broadcast updates to all WebSocket subscribers of a mesh network
 */
function broadcastToMesh(meshKey, data) {
  const mesh = meshNetworks.get(meshKey);
  if (mesh) {
    mesh.subscribers.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      }
    });
  }
}

// ==================== REST API Endpoints ====================

/**
 * GET /api/community/listings
 * Fetch all listings for a mesh network
 */
app.get('/api/community/listings', (req, res) => {
  const { mesh_key } = req.query;

  if (!mesh_key) {
    return res.status(400).json({ error: 'mesh_key parameter required' });
  }

  const mesh = getMeshNetwork(mesh_key);
  res.json({
    mesh_key,
    listings: mesh.listings,
    count: mesh.listings.length
  });
});

/**
 * POST /api/community/listings
 * Add a new listing to a mesh network
 */
app.post('/api/community/listings', (req, res) => {
  const { mesh_key, ...listing } = req.body;

  if (!mesh_key) {
    return res.status(400).json({ error: 'mesh_key required' });
  }

  if (!listing.item || !listing.meeting_address) {
    return res.status(400).json({ error: 'item and meeting_address required' });
  }

  const mesh = getMeshNetwork(mesh_key);

  // Set the user to the posted_by_user if "You" or use existing
  if (listing.user === 'You' && listing.posted_by_user) {
    listing.user = listing.posted_by_user;
  }

  // Ensure ID is set
  if (!listing.id) {
    listing.id = Math.random().toString(36).substr(2, 9);
  }

  // Add timestamp
  listing.posted_at = new Date();

  // Add to listings
  mesh.listings.unshift(listing); // Add to front

  // Broadcast to all connected WebSocket clients
  broadcastToMesh(mesh_key, {
    type: 'listing_added',
    listing,
    listings: mesh.listings
  });

  res.status(201).json({
    success: true,
    listing,
    mesh_key
  });
});

/**
 * PATCH /api/community/listings/:id
 * Update a listing status
 */
app.patch('/api/community/listings/:id', (req, res) => {
  const { id } = req.params;
  const { status, mesh_key } = req.body;

  if (!mesh_key) {
    return res.status(400).json({ error: 'mesh_key required' });
  }

  const mesh = getMeshNetwork(mesh_key);
  const listing = mesh.listings.find(l => l.id === id);

  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }

  listing.status = status;
  listing.updated_at = new Date();

  // Broadcast update
  broadcastToMesh(mesh_key, {
    type: 'listing_updated',
    listing,
    listings: mesh.listings
  });

  res.json({ success: true, listing });
});

/**
 * DELETE /api/community/listings/:id
 * Remove a listing
 */
app.delete('/api/community/listings/:id', (req, res) => {
  const { id } = req.params;
  const { mesh_key } = req.query;

  if (!mesh_key) {
    return res.status(400).json({ error: 'mesh_key required' });
  }

  const mesh = getMeshNetwork(mesh_key);
  const index = mesh.listings.findIndex(l => l.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Listing not found' });
  }

  const removed = mesh.listings.splice(index, 1)[0];

  // Broadcast deletion
  broadcastToMesh(mesh_key, {
    type: 'listing_removed',
    listing_id: id,
    listings: mesh.listings
  });

  res.json({ success: true, removed });
});

// ==================== WebSocket API ====================

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, 'http://localhost');
  const meshKey = url.searchParams.get('mesh_key');

  if (!meshKey) {
    ws.close();
    return;
  }

  const mesh = getMeshNetwork(meshKey);
  mesh.subscribers.add(ws);

  // Send initial listings
  ws.send(JSON.stringify({
    type: 'initial',
    listings: mesh.listings
  }));

  // Handle disconnect
  ws.on('close', () => {
    mesh.subscribers.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// ==================== Health Check ====================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    meshNetworks: meshNetworks.size
  });
});

// ==================== Server Startup ====================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  Re:Plate Community Hub Backend Server                     ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                                            ║
║  ✓ Server running on http://localhost:${PORT}             ║
║  ✓ WebSocket server ready                                 ║
║  ✓ API endpoint: http://localhost:${PORT}/api             ║
║                                                            ║
║  Configure your frontend with:                            ║
║  localStorage.setItem('COMMUNITY_API_URL',                ║
║    'http://localhost:${PORT}/api');                       ║
║                                                            ║
║  Or for Docker containers on the same network:           ║
║  localStorage.setItem('COMMUNITY_API_URL',                ║
║    'http://backend:${PORT}/api');                         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
