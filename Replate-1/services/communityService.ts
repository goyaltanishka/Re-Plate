import { CommunityListing, UserProfile } from '../types';

// Backend API endpoint - configure this to your server
const API_BASE_URL = localStorage.getItem('COMMUNITY_API_URL') || 'http://localhost:5000/api';

/**
 * Set the community API endpoint URL (used when connecting to network)
 */
export const setCommunityApiUrl = (url: string) => {
  localStorage.setItem('COMMUNITY_API_URL', url);
};

/**
 * Get the current community API endpoint
 */
export const getCommunityApiUrl = (): string => {
  return localStorage.getItem('COMMUNITY_API_URL') || 'http://localhost:5000/api';
};

/**
 * Fetch all community listings from the network
 */
export const fetchCommunityListings = async (meshKey: string): Promise<CommunityListing[]> => {
  try {
    const response = await fetch(`${getCommunityApiUrl()}/community/listings?mesh_key=${meshKey}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch listings: ${response.statusText}`);
    }

    const data = await response.json();
    return data.listings || [];
  } catch (error) {
    console.error('Error fetching community listings:', error);
    return [];
  }
};

/**
 * Post a new listing to the community network
 */
export const postCommunityListing = async (
  listing: CommunityListing,
  meshKey: string,
  username: string
): Promise<CommunityListing | null> => {
  try {
    const response = await fetch(`${getCommunityApiUrl()}/community/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...listing,
        mesh_key: meshKey,
        posted_by_user: username,
        posted_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to post listing: ${response.statusText}`);
    }

    const data = await response.json();
    return data.listing || listing;
  } catch (error) {
    console.error('Error posting community listing:', error);
    throw error;
  }
};

/**
 * Update a listing status (e.g., claim, available, taken)
 */
export const updateListingStatus = async (
  listingId: string,
  status: string,
  meshKey: string
): Promise<boolean> => {
  try {
    const response = await fetch(`${getCommunityApiUrl()}/community/listings/${listingId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, mesh_key: meshKey })
    });

    return response.ok;
  } catch (error) {
    console.error('Error updating listing status:', error);
    return false;
  }
};

/**
 * Start polling for community listing updates
 * Call this periodically to fetch new listings from the network
 */
export const startCommunitySync = (
  meshKey: string,
  onUpdate: (listings: CommunityListing[]) => void,
  intervalMs: number = 5000 // Poll every 5 seconds
): (() => void) => {
  const pollInterval = setInterval(async () => {
    const listings = await fetchCommunityListings(meshKey);
    if (listings.length > 0) {
      onUpdate(listings);
    }
  }, intervalMs);

  // Return cleanup function
  return () => clearInterval(pollInterval);
};

/**
 * Initialize WebSocket connection for real-time updates (optional, more efficient)
 */
export const initializeWebSocketSync = (
  meshKey: string,
  onUpdate: (listings: CommunityListing[]) => void
): (() => void) => {
  const wsUrl = getCommunityApiUrl().replace('http', 'ws');
  const socket = new WebSocket(`${wsUrl}/community/stream?mesh_key=${meshKey}`);

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.listings) {
        onUpdate(data.listings);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  // Return cleanup function
  return () => {
    socket.close();
  };
};
