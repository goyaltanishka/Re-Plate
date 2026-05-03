
import React, { useState } from 'react';
import { CommunityListing, UserProfile } from '../types';
import { ALLERGEN_OPTIONS, DIETARY_OPTIONS } from '../constants';
import { postCommunityListing } from '../services/communityService';

interface CommunityHubProps {
  userProfile: UserProfile;
  listings: CommunityListing[];
  meshKey: string | null;
  onSetMeshKey: (key: string) => void;
  onPostListing: (listing: CommunityListing) => void;
}

const CommunityHub: React.FC<CommunityHubProps> = ({ userProfile, listings, meshKey, onSetMeshKey, onPostListing }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [claimingItem, setClaimingItem] = useState<CommunityListing | null>(null);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [entryKey, setEntryKey] = useState('');
  const [authenticating, setAuthenticating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    item: '',
    qty: 1,
    meeting_address: '',
    vicinity: [] as string[],
    dietary: [] as string[]
  });

  const handlePost = async () => {
    if (!formData.item || !formData.meeting_address || !meshKey) {
      setPostError('Please fill in all required fields');
      return;
    }

    setIsPosting(true);
    setPostError(null);

    try {
      const newListing: CommunityListing = {
        id: Math.random().toString(36).substr(2, 9),
        user: 'You',
        item: formData.item,
        quantity: formData.qty,
        meeting_address: formData.meeting_address,
        expiry: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Verified Surplus',
        allergens: [],
        vicinity_hazards: formData.vicinity,
        dietary_tags: formData.dietary,
        status: 'available'
      };

      // Post to community API
      await postCommunityListing(newListing, meshKey, 'You');
      
      // Update local state
      onPostListing(newListing);
      setShowAdd(false);
      setFormData({ item: '', qty: 1, meeting_address: '', vicinity: [], dietary: [] });
    } catch (error: any) {
      setPostError(error.message || 'Failed to post listing to mesh network');
      console.error('Error posting listing:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const isSafeForUser = (listing: CommunityListing) => {
    const hazards = [...listing.allergens, ...listing.vicinity_hazards];
    return !hazards.some(h => userProfile.allergies.includes(h.toLowerCase()));
  };

  const handleGenerateNodeKey = () => {
    setAuthenticating(true);
    setTimeout(() => {
      const newKey = `EP-${Math.random().toString(36).toUpperCase().substr(2, 4)}`;
      onSetMeshKey(newKey);
      setAuthenticating(false);
    }, 1500);
  };

  const handleConnectMesh = (e: React.FormEvent) => {
    e.preventDefault();
    if (entryKey.length < 4) return;
    setAuthenticating(true);
    setTimeout(() => {
      onSetMeshKey(entryKey.toUpperCase());
      setAuthenticating(false);
    }, 1000);
  };

  if (!meshKey) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-[0_50px_100px_rgba(0,0,0,0.1)] border border-slate-200 p-12 text-center relative overflow-hidden">
          {/* Visual Accents */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-emerald-500 to-indigo-500"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-50 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="w-24 h-24 bg-slate-950 text-emerald-500 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-10 shadow-2xl">
              <i className="fa-solid fa-network-wired animate-pulse"></i>
            </div>
            
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 font-heading italic">Mesh Authentication</h2>
            <p className="text-slate-500 font-medium mb-12 leading-relaxed max-w-md mx-auto">
              Access the neighbor-to-neighbor ledger. Create your own mesh group or enter a key from a nearby peer.
            </p>

            <form onSubmit={handleConnectMesh} className="space-y-6 max-w-sm mx-auto">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-left ml-2">Neighbor Access Key</label>
                <input 
                  type="text"
                  placeholder="e.g. EP-X942"
                  className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-4 focus:ring-indigo-500/20 outline-none text-center text-xl font-black text-slate-900 tracking-[0.2em] transition-all placeholder:text-slate-300"
                  value={entryKey}
                  onChange={(e) => setEntryKey(e.target.value.toUpperCase())}
                />
              </div>

              <button 
                type="submit"
                disabled={authenticating || entryKey.length < 4}
                className="w-full bg-slate-900 hover:bg-black text-white font-black py-6 rounded-3xl shadow-xl transition-all transform active:scale-[0.98] text-sm uppercase tracking-widest flex items-center justify-center gap-3"
              >
                {authenticating ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-plug"></i>}
                CONNECT TO PEERS
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-slate-100">
              <p className="text-xs text-slate-400 font-bold mb-4 uppercase tracking-widest">New to the sector?</p>
              <button 
                onClick={handleGenerateNodeKey}
                disabled={authenticating}
                className="text-indigo-600 hover:text-indigo-700 font-black text-sm uppercase tracking-widest flex items-center gap-2 mx-auto transition-colors"
              >
                <i className="fa-solid fa-plus-circle"></i> INITIALIZE LOCAL NODE KEY
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleClaimConfirm = () => {
    if (!claimingItem) return;
    const query = encodeURIComponent(claimingItem.meeting_address);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(mapsUrl, '_blank');
    setClaimSuccess(true);
    setTimeout(() => {
      setClaimingItem(null);
      setClaimSuccess(false);
    }, 4000);
  };

  return (
    <div className="space-y-12 relative">
      {/* Asset Relocation Modal */}
      {claimingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-950/60 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-[0_50px_100px_rgba(0,0,0,0.3)] overflow-hidden border border-slate-200">
            {claimSuccess ? (
              <div className="p-16 text-center animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white text-4xl mx-auto mb-8 shadow-2xl shadow-emerald-500/40">
                  <i className="fa-solid fa-check"></i>
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-4 font-heading italic">Relocation Confirmed</h3>
                <p className="text-slate-500 mb-8 leading-relaxed font-medium">
                  The handover code has been generated. <br/> 
                  <span className="text-indigo-600 font-bold">RE-PLAT-X942</span> <br/>
                  Proceed to <span className="text-slate-900 font-black">{claimingItem.meeting_address}</span> within 2 hours.
                </p>
                <div className="bg-slate-50 p-6 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">
                  Transaction logged & Map Directions Triggered
                </div>
              </div>
            ) : (
              <>
                <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tighter font-heading italic">Confirm Rescue</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Asset: {claimingItem.item}</p>
                  </div>
                  <button onClick={() => setClaimingItem(null)} className="w-10 h-10 rounded-xl hover:bg-white text-slate-400 flex items-center justify-center transition-colors">
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
                <div className="p-10 space-y-8">
                  <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                        <i className="fa-solid fa-location-dot"></i>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meeting Point</p>
                        <p className="text-lg font-black text-slate-900">{claimingItem.meeting_address}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                      This rescue has been verified by the neighbor. Clicking confirm will log the transaction and open navigation to this point.
                    </p>
                  </div>
                  <button 
                    onClick={handleClaimConfirm}
                    className="w-full bg-slate-900 hover:bg-black text-white font-black py-6 rounded-2xl shadow-xl transition-all transform active:scale-[0.98] text-lg flex items-center justify-center gap-3"
                  >
                    <i className="fa-solid fa-location-arrow"></i> START RESCUE & VIEW MAP
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Mesh Connected: {meshKey}</p>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none font-heading italic">Rescue Hub</h2>
          <p className="text-slate-500 font-medium mt-2">Zero-waste peer nodes sharing resources in real-time.</p>
        </div>
        <div className="flex gap-4">
            <button 
                onClick={() => onSetMeshKey('')}
                className="font-black py-5 px-6 rounded-[2rem] bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-all text-sm uppercase tracking-widest"
                title="Disconnect Mesh"
            >
                <i className="fa-solid fa-power-off"></i>
            </button>
            <button 
                onClick={() => setShowAdd(!showAdd)}
                className={`font-black py-5 px-10 rounded-[2rem] shadow-2xl transition-all flex items-center gap-3 uppercase tracking-widest text-sm ${
                showAdd 
                    ? 'bg-slate-200 text-slate-700' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
            >
                {showAdd ? <><i className="fa-solid fa-xmark"></i> CLOSE</> : <><i className="fa-solid fa-bullhorn"></i> OFFER</>}
            </button>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white p-12 rounded-[3rem] border-2 border-indigo-100 shadow-2xl animate-in slide-in-from-top-10 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Item Descriptor</label>
                <input 
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 shadow-inner"
                  placeholder="e.g. Heirloom Tomatoes"
                  value={formData.item}
                  onChange={(e) => setFormData({...formData, item: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Meeting Point / Address</label>
                <input 
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 shadow-inner"
                  placeholder="e.g. 12 High St or Park Lobby"
                  value={formData.meeting_address}
                  onChange={(e) => setFormData({...formData, meeting_address: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Asset Count</label>
                <input 
                  type="number"
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 shadow-inner"
                  value={formData.qty}
                  onChange={(e) => setFormData({...formData, qty: parseInt(e.target.value)})}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Storage Vicinity Risks</label>
                <div className="h-40 overflow-y-auto p-4 border border-slate-100 rounded-2xl bg-slate-50 space-y-2">
                  {ALLERGEN_OPTIONS.map(opt => (
                    <label key={opt} className="flex items-center gap-3 text-xs font-bold text-slate-600 cursor-pointer hover:text-indigo-600 transition-colors">
                      <input 
                        type="checkbox" 
                        className="rounded-lg border-slate-200 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        onChange={(e) => {
                          const next = e.target.checked ? [...formData.vicinity, opt] : formData.vicinity.filter(v => v !== opt);
                          setFormData({...formData, vicinity: next});
                        }}
                      /> {opt}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Dietary Verification</label>
                <div className="h-40 overflow-y-auto p-4 border border-slate-100 rounded-2xl bg-slate-50 space-y-2">
                  {DIETARY_OPTIONS.map(opt => (
                    <label key={opt} className="flex items-center gap-3 text-xs font-bold text-slate-600 cursor-pointer hover:text-emerald-600 transition-colors">
                      <input 
                        type="checkbox"
                        className="rounded-lg border-slate-200 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                        onChange={(e) => {
                          const next = e.target.checked ? [...formData.dietary, opt] : formData.dietary.filter(d => d !== opt);
                          setFormData({...formData, dietary: next});
                        }}
                      /> {opt}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={handlePost}
            disabled={!formData.item || !formData.meeting_address || isPosting}
            className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white font-black py-6 rounded-[2rem] shadow-xl transition-all transform active:scale-[0.98] text-lg uppercase tracking-widest font-heading flex items-center justify-center gap-3"
          >
            {isPosting ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin"></i>
                BROADCASTING...
              </>
            ) : (
              <>
                <i className="fa-solid fa-broadcast"></i>
                BROADCAST TO MESH LEDGER
              </>
            )}
          </button>
          {postError && (
            <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 text-sm font-bold">
              {postError}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {listings.length === 0 ? (
          <div className="col-span-full py-32 flex flex-col items-center justify-center text-slate-300">
            <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center text-4xl mb-6">
              <i className="fa-solid fa-earth-europe"></i>
            </div>
            <p className="font-black uppercase tracking-widest text-slate-900">Local Sector Idle</p>
            <p className="text-sm font-medium mt-2">No active community resource broadcasts found.</p>
          </div>
        ) : (
          listings.map(listing => {
            const safe = isSafeForUser(listing);
            const isMine = listing.user === 'You';
            return (
              <div key={listing.id} className={`bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${!safe ? 'opacity-60 saturate-50' : ''}`}>
                <div className="p-8 border-b border-slate-100 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${isMine ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {isMine ? 'Your Post' : 'Nearby Node'}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400">by {listing.user}</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight font-heading">{listing.item}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <i className="fa-solid fa-location-dot text-[10px] text-indigo-500"></i>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{listing.meeting_address}</p>
                    </div>
                  </div>
                  <span className="bg-slate-900 text-white text-xs font-black px-4 py-2 rounded-2xl">× {listing.quantity}</span>
                </div>
                
                <div className="p-8 flex-grow space-y-6">
                  {listing.vicinity_hazards.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vicinity Risk Profile</p>
                      <div className="flex flex-wrap gap-1.5">
                        {listing.vicinity_hazards.map(v => (
                          <span key={v} className="text-[10px] font-bold bg-rose-50 text-rose-600 px-3 py-1.5 rounded-xl border border-rose-100 uppercase tracking-tighter">{v}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {listing.dietary_tags.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Safety Tags</p>
                      <div className="flex flex-wrap gap-1.5">
                        {listing.dietary_tags.map(d => (
                          <span key={d} className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl border border-emerald-100 uppercase tracking-tighter">{d}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-8 bg-slate-50/80 border-t border-slate-100 mt-auto">
                  {!safe ? (
                    <div className="bg-rose-500 p-4 rounded-2xl text-[10px] text-white font-black uppercase tracking-widest flex items-center justify-center gap-3">
                      <i className="fa-solid fa-triangle-exclamation animate-bounce"></i>
                      Allergy Violation Detected
                    </div>
                  ) : (
                    <button 
                      disabled={isMine}
                      onClick={() => setClaimingItem(listing)}
                      className={`w-full font-black py-4 rounded-2xl transition-all shadow-sm text-sm tracking-widest group ${isMine ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' : 'bg-white hover:bg-slate-900 hover:text-white text-slate-900 border border-slate-200'}`}
                    >
                      {isMine ? 'AWAITING CLAIM' : <><i className="fa-solid fa-hand-holding-heart mr-2"></i> CLAIM RESOURCE</>}
                      {!isMine && <i className="fa-solid fa-arrow-right ml-2 group-hover:translate-x-2 transition-transform"></i>}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CommunityHub;
