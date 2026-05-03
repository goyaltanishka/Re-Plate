import React, { useState, useEffect } from 'react';
import { InventoryItem, UserProfile, CommunityListing } from './types';
import Inventory from './components/Inventory';
import RecipeGenerator from './components/RecipeGenerator';
import PantrySearch from './components/PantrySearch';
import CommunityHub from './components/CommunityHub';
import Dashboard from './components/Dashboard';
import Rewards from './components/Rewards';
import Auth from './components/Auth';
import { ALLERGEN_OPTIONS, DIETARY_OPTIONS } from './constants';
import { fetchCommunityListings, startCommunitySync } from './services/communityService';

interface Notification {
  id: string;
  message: string;
  item: string;
  user: string;
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [meshKey, setMeshKey] = useState<string | null>(null); // State for community mesh access
  const [view, setView] = useState<'dashboard' | 'inventory' | 'recipes' | 'pantry_search' | 'community' | 'rewards'>('dashboard');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [tokens, setTokens] = useState<number>(50); // Default 50 for new users
  const [rescuedImpact, setRescuedImpact] = useState<{ gbp: number; co2: number }>({ gbp: 0, co2: 0 });

  // Load persisted data on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('replate_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUsername(user.username);
      setIsAuthenticated(true);
    }

    const storedInventory = localStorage.getItem('replate_inventory');
    if (storedInventory) {
      setInventory(JSON.parse(storedInventory));
    }

    const storedTokens = localStorage.getItem('replate_tokens');
    if (storedTokens) {
      setTokens(parseInt(storedTokens));
    }

    const storedRescuedImpact = localStorage.getItem('replate_rescued_impact');
    if (storedRescuedImpact) {
      setRescuedImpact(JSON.parse(storedRescuedImpact));
    }

    const storedView = localStorage.getItem('replate_view');
    if (storedView) {
      setView(storedView as any);
    }

    const storedUserProfile = localStorage.getItem('replate_user_profile');
    if (storedUserProfile) {
      setUserProfile(JSON.parse(storedUserProfile));
    }
  }, []);

  // Persist inventory changes
  useEffect(() => {
    localStorage.setItem('replate_inventory', JSON.stringify(inventory));
  }, [inventory]);

  // Persist tokens changes
  useEffect(() => {
    localStorage.setItem('replate_tokens', tokens.toString());
  }, [tokens]);

  // Persist rescued impact changes
  useEffect(() => {
    localStorage.setItem('replate_rescued_impact', JSON.stringify(rescuedImpact));
  }, [rescuedImpact]);

  // Persist view changes
  useEffect(() => {
    localStorage.setItem('replate_view', view);
  }, [view]);

  // Persist user profile changes
  useEffect(() => {
    localStorage.setItem('replate_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);
  
  // Initial community listings (static neighbors, but no new auto-notifications)
  const [communityListings, setCommunityListings] = useState<CommunityListing[]>([
    {
      id: 'init-1',
      user: 'Sarah M.',
      item: 'Organic Spinach',
      quantity: 2,
      expiry: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      meeting_address: '14 Garden Lane, E1 6AN',
      notes: 'Fresh from local garden',
      allergens: [],
      vicinity_hazards: [],
      dietary_tags: ['vegan'],
      status: 'available'
    },
    {
      id: 'init-2',
      user: 'EcoWarrior_UK',
      item: 'Artisan Sourdough',
      quantity: 1,
      expiry: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      meeting_address: 'High St Bakery Collection Point',
      notes: 'Excess from bakery run',
      allergens: [],
      vicinity_hazards: ['gluten'],
      dietary_tags: ['vegetarian'],
      status: 'available'
    }
  ]);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    allergies: [],
    dietary_preferences: [],
    cooking_score: 0.5,
  });

  const addItem = (item: InventoryItem) => setInventory([item, ...inventory]);
  const removeItem = (id: string) => setInventory(inventory.filter(i => i.id !== id));

  const addCommunityListing = (listing: CommunityListing) => {
    setCommunityListings(prev => [listing, ...prev]);
    if (listing.user === 'You') {
      setTokens(t => t + 25);
    }
  };

  const handleRescueComplete = (impact: { gbp_saved: number; co2_saved_kg: number }) => {
    setRescuedImpact(prev => ({
      gbp: prev.gbp + impact.gbp_saved,
      co2: prev.co2 + impact.co2_saved_kg,
    }));
  };

  // Sync community listings when meshKey is set
  useEffect(() => {
    if (!meshKey) return;

    // Initial fetch of listings from network
    const loadListings = async () => {
      const listings = await fetchCommunityListings(meshKey);
      if (listings.length > 0) {
        setCommunityListings(listings);
      }
    };

    loadListings();

    // Start polling for updates every 5 seconds
    const unsubscribe = startCommunitySync(meshKey, (listings) => {
      if (listings.length > 0) {
        setCommunityListings(listings);
      }
    }, 5000);

    return () => unsubscribe();
  }, [meshKey]);

  // Auto-authenticate if user is stored in localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('replate_user');
    if (storedUser && !isAuthenticated) {
      const user = JSON.parse(storedUser);
      handleAuthenticated({ username: user.username });
    }
  }, []);

  const handleAuthenticated = (user: { username: string; referralCode?: string }) => {
    setUsername(user.username);
    setIsAuthenticated(true);
    // Award bonus 50 tokens if referral code is provided
    if (user.referralCode && user.referralCode.trim()) {
      setTokens(prev => prev + 50);
    }
  };

  const toggleAllergy = (allergy: string) => {
    const next = userProfile.allergies.includes(allergy)
      ? userProfile.allergies.filter(a => a !== allergy)
      : [...userProfile.allergies, allergy];
    setUserProfile({ ...userProfile, allergies: next });
  };

  const toggleDiet = (diet: string) => {
    const next = userProfile.dietary_preferences.includes(diet)
      ? userProfile.dietary_preferences.filter(d => d !== diet)
      : [...userProfile.dietary_preferences, diet];
    setUserProfile({ ...userProfile, dietary_preferences: next });
  };

  if (!isAuthenticated) {
    return <Auth onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative text-slate-900 font-sans selection:bg-emerald-500">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-80 bg-slate-950 text-slate-300 lg:fixed lg:h-full z-20 flex flex-col border-r border-white/5 shadow-2xl">
        <div className="p-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] ring-1 ring-white/20">
              <i className="fa-solid fa-plate-wheat"></i>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tighter leading-none font-heading italic">Re:Plate</h1>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">Node Active</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-grow px-6 space-y-1 overflow-y-auto">
          {[
            { id: 'dashboard', icon: 'fa-grid-2', label: 'Overview' },
            { id: 'inventory', icon: 'fa-layer-group', label: 'My Pantry' },
            { id: 'recipes', icon: 'fa-microchip', label: 'Rescue Recipes' },
            { id: 'pantry_search', icon: 'fa-magnifying-glass-chart', label: 'Meal Finder' },
            { id: 'community', icon: 'fa-network-wired', label: 'Community' },
            { id: 'rewards', icon: 'fa-coins', label: 'My Impact' },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setView(item.id as any)}
              className={`w-full flex items-center justify-between group px-5 py-4 rounded-xl font-bold transition-all duration-300 ${
                view === item.id 
                  ? 'bg-white/5 text-white ring-1 ring-white/10 shadow-lg' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-4">
                <i className={`fa-solid ${item.icon} text-lg transition-colors ${view === item.id ? 'text-emerald-400' : 'group-hover:text-slate-300'}`}></i>
                <span className="text-sm tracking-tight">{item.label}</span>
              </div>
              {view === item.id && <i className="fa-solid fa-chevron-right text-[10px] text-emerald-400"></i>}
            </button>
          ))}

          <div className="pt-10 px-4">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Safety Filter</p>
              <i className="fa-solid fa-shield-halved text-slate-700 text-[10px]"></i>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-3 uppercase tracking-wider">Allergy Guard</label>
                <div className="flex flex-wrap gap-2">
                  {ALLERGEN_OPTIONS.slice(0, 6).map(opt => (
                    <button 
                      key={opt}
                      onClick={() => toggleAllergy(opt)}
                      className={`text-[9px] px-3 py-1.5 rounded-lg border font-black uppercase tracking-tighter transition-all ${
                        userProfile.allergies.includes(opt) 
                          ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20' 
                          : 'border-white/5 bg-white/5 text-slate-500 hover:border-white/10'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-3 uppercase tracking-wider">Dietary Logic</label>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_OPTIONS.slice(0, 4).map(opt => (
                    <button 
                      key={opt}
                      onClick={() => toggleDiet(opt)}
                      className={`text-[9px] px-3 py-1.5 rounded-lg border font-black uppercase tracking-tighter transition-all ${
                        userProfile.dietary_preferences.includes(opt) 
                          ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                          : 'border-white/5 bg-white/5 text-slate-500 hover:border-white/10'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="p-10 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">v1.2.0-Alpha Build</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow lg:ml-80 bg-[#f8fafc] p-6 lg:p-12 overflow-y-auto min-h-screen">
        <header className="mb-12 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter font-heading">
              {view === 'dashboard' && 'Dashboard Overview'}
              {view === 'inventory' && 'My Pantry Inventory'}
              {view === 'recipes' && 'Rescue Meal Engine'}
              {view === 'pantry_search' && 'Smart Recipe Finder'}
              {view === 'community' && 'Community Resource Hub'}
              {view === 'rewards' && 'My Environmental Impact'}
            </h2>
            <p className="text-slate-500 font-medium mt-1">
              {view === 'dashboard' && 'View your kitchen efficiency and waste reduction metrics.'}
              {view === 'inventory' && 'Keep track of your items and their estimated shelf life.'}
              {view === 'recipes' && 'Discover recipes that use up your soon-to-expire ingredients.'}
              {view === 'pantry_search' && 'Find new meal ideas based on what you have right now.'}
              {view === 'community' && 'Share surplus food with neighbors and reduce local waste.'}
              {view === 'rewards' && 'See your contribution to the planet and earn eco-tokens.'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-900 leading-none">{username || 'Unknown Node'}</p>
              <div className="flex items-center gap-2 mt-1">
                <i className="fa-solid fa-coins text-emerald-500 text-[10px]"></i>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{tokens} Tokens</p>
              </div>
            </div>
            <div className="relative">
              <img className="w-12 h-12 rounded-2xl border-4 border-white shadow-xl object-cover" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} alt="User" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
          {view === 'dashboard' && <Dashboard inventory={inventory} rescuedImpact={rescuedImpact} />}
          {view === 'inventory' && <Inventory items={inventory} userProfile={userProfile} onAddItem={addItem} onRemoveItem={removeItem} />}
          {view === 'recipes' && <RecipeGenerator inventory={inventory} userProfile={userProfile} onRescueComplete={handleRescueComplete} />}
          {view === 'pantry_search' && <PantrySearch userProfile={userProfile} />}
          {view === 'community' && (
            <CommunityHub 
              userProfile={userProfile} 
              listings={communityListings}
              meshKey={meshKey}
              onSetMeshKey={setMeshKey}
              onPostListing={(listing) => {
                addCommunityListing(listing);
              }}
            />
          )}
          {view === 'rewards' && <Rewards tokens={tokens} setTokens={setTokens} />}
        </div>
      </main>
    </div>
  );
};

export default App;
