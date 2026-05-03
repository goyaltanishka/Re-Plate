
import React, { useState } from 'react';

interface RewardsProps {
  tokens: number;
  setTokens: (val: number | ((prev: number) => number)) => void;
}

const Rewards: React.FC<RewardsProps> = ({ tokens, setTokens }) => {
  const [referring, setReferring] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralSuccess, setReferralSuccess] = useState(false);

  const handleGenerateCode = () => {
    setReferring(true);
    // Simulate code generation
    setTimeout(() => {
      const mockCode = Math.random().toString(36).substr(2, 8).toUpperCase();
      setReferralCode(mockCode);
      setReferring(false);
    }, 1200);
  };

  const handleSimulateAcceptance = () => {
    setReferralCode(null);
    setTokens(prev => prev + 50);
    setReferralSuccess(true);
    setTimeout(() => setReferralSuccess(false), 4000);
  };

  const badges = [
    { name: 'Seedling', icon: 'fa-seedling', desc: 'Started the journey', unlocked: true },
    { name: 'Rescue Hero', icon: 'fa-mask', desc: '5 items rescued', unlocked: tokens >= 150 },
    { name: 'Eco Giant', icon: 'fa-tree', desc: '10 community posts', unlocked: tokens >= 300 },
    { name: 'Master Chef', icon: 'fa-utensils', desc: '5 AI recipes made', unlocked: false },
  ];

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Token Balance Card */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] p-12 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-emerald-500/20">
                <i className="fa-solid fa-vault"></i>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Asset Balance</p>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter font-heading italic">Your Eco Ledger</h3>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-end gap-8 mb-12">
              <div>
                <p className="text-7xl font-black text-slate-900 tracking-tighter flex items-start gap-2 font-heading italic">
                  {tokens}
                  <span className="text-emerald-500 text-2xl mt-4 tracking-normal font-sans not-italic font-bold">RT</span>
                </p>
                <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">Re:Plate Tokens Available</p>
              </div>
              <div className="flex-grow bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Next Tier Progress</span>
                  <span className="text-[10px] font-black text-emerald-600 uppercase">75%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-900 rounded-[2rem] text-white">
                <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4">Earning Rules</h4>
                <ul className="space-y-3">
                  <li className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400">Sign Up Bonus</span>
                    <span className="text-emerald-400">+50 RT (Initialized)</span>
                  </li>
                  <li className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400">Community Post</span>
                    <span className="text-emerald-400">+25 RT</span>
                  </li>
                  <li className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400">Referral Success</span>
                    <span className="text-emerald-400">+50 RT</span>
                  </li>
                </ul>
              </div>
              <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100">
                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4">Eco Status</h4>
                <p className="text-sm font-bold text-slate-700 leading-relaxed">
                  Your current tokens represent <span className="text-emerald-600 font-black">{(tokens * 0.42).toFixed(1)}kg</span> of total CO2 offset across the network.
                </p>
                <button className="mt-4 text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
                  Full Impact Report <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Card */}
        <div className="bg-slate-950 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between border border-white/5">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-xl mb-6 shadow-lg shadow-indigo-600/20">
              <i className="fa-solid fa-share-nodes"></i>
            </div>
            <h3 className="text-3xl font-black tracking-tighter mb-4 leading-tight font-heading italic">Refer a <br/> Neighbor</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 font-medium">
              Grow the mesh network. Tokens are awarded <span className="text-white font-bold">only after</span> your peer accepts the invite.
            </p>

            {referralCode && (
              <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-2xl animate-in slide-in-from-top-2">
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-3">Your Referral Code</p>
                <div className="flex items-center gap-3">
                  <input 
                    readOnly 
                    value={referralCode} 
                    className="bg-slate-950/50 text-[12px] font-black text-emerald-400 text-center tracking-widest w-full border border-white/10 rounded-2xl py-3 outline-none"
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(referralCode);
                    }}
                    className="text-indigo-400 hover:text-indigo-300 transition-colors" 
                    title="Copy Code"
                  >
                    <i className="fa-solid fa-copy"></i>
                  </button>
                </div>
                <p className="text-[8px] text-slate-500 mt-2 text-center">Share this code with peers to earn 50 RT when they sign up</p>
              </div>
            )}
          </div>

          <div className="space-y-4 relative z-10">
            {referralSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase p-4 rounded-2xl text-center tracking-widest animate-in fade-in slide-in-from-bottom-2">
                Peer Joined! Reward Dispatched +50 RT
              </div>
            )}

            {!referralCode ? (
              <button 
                onClick={handleGenerateCode}
                disabled={referring}
                className={`w-full font-black py-6 rounded-[2rem] transition-all flex items-center justify-center gap-3 shadow-xl ${
                  referring ? 'bg-slate-800 text-slate-500' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {referring ? (
                  <><i className="fa-solid fa-circle-notch fa-spin"></i> GENERATING CODE...</>
                ) : (
                  <><i className="fa-solid fa-link"></i> INVITE PEER</>
                )}
              </button>
            ) : (
              <button 
                onClick={handleSimulateAcceptance}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-6 rounded-[2rem] transition-all flex items-center justify-center gap-3 shadow-xl transform active:scale-95"
              >
                <i className="fa-solid fa-user-check"></i> SIMULATE PEER JOINING
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="bg-white rounded-[3rem] p-12 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter font-heading italic">Achievement Ledger</h3>
            <p className="text-slate-500 font-medium">Digital badges representing your systems efficiency.</p>
          </div>
          <button className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-600 transition-colors">
            View All Badges <i className="fa-solid fa-chevron-right ml-1"></i>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {badges.map((badge, i) => (
            <div key={i} className={`flex flex-col items-center text-center p-8 rounded-[2.5rem] transition-all border group ${
              badge.unlocked 
                ? 'bg-slate-50 border-slate-100 shadow-sm hover:shadow-lg' 
                : 'bg-white border-dashed border-slate-200 opacity-40'
            }`}>
              <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-3xl mb-6 transition-transform group-hover:scale-110 ${
                badge.unlocked ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-100' : 'bg-slate-100 text-slate-300'
              }`}>
                <i className={`fa-solid ${badge.icon}`}></i>
              </div>
              <h4 className="text-sm font-black text-slate-900 tracking-tight mb-1">{badge.name}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight">{badge.desc}</p>
              {!badge.unlocked && (
                <div className="mt-4 flex items-center gap-1">
                  <i className="fa-solid fa-lock text-[8px] text-slate-300"></i>
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Locked</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Rewards;
