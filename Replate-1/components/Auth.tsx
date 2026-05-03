
import React, { useState, useEffect } from 'react';

interface AuthProps {
  onAuthenticated: (user: { username: string; referralCode?: string }) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthenticated }) => {
  const [isLogin, setIsLogin] = useState(false); // Default to register for new users
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [registeredUser, setRegisteredUser] = useState<{username: string, email: string, pass: string} | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Load stored user on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('replate_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setRegisteredUser(user);
      setEmail(user.email);
      setIsLogin(true); // Show login form since user already registered
    }
  }, []);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const newUser = { username, email, pass: password };
      setRegisteredUser(newUser);
      // Save to localStorage
      localStorage.setItem('replate_user', JSON.stringify(newUser));
      setLoading(false);
      setSuccessMsg('Registration Successful! Please login to initialize session.');
      setIsLogin(true);
    }, 1500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (registeredUser && email === registeredUser.email && password === registeredUser.pass) {
        onAuthenticated({ username: registeredUser.username, referralCode: referralCode || undefined });
      } else if (!registeredUser) {
        alert("No node registered. Please register first.");
        setIsLogin(false);
      } else {
        alert("Invalid credentials for this node.");
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=2070" 
          alt="Culinary background" 
          className="w-full h-full object-cover opacity-40 mix-blend-overlay scale-110 animate-[pulse_10s_infinite_alternate]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/80 to-slate-950"></div>
        <div className="absolute -top-48 -left-48 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[2rem] text-white text-5xl shadow-[0_0_50px_rgba(16,185,129,0.4)] ring-4 ring-white/10 mb-8 transition-all hover:scale-110">
            <i className="fa-solid fa-plate-wheat"></i>
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter mb-4 font-heading italic">Re:Plate</h1>
          <p className="text-emerald-400 font-black uppercase tracking-[0.4em] text-[10px] bg-white/5 inline-block px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">Predictive Kitchen Ledger</p>
        </div>

        <div className="bg-white/10 backdrop-blur-3xl p-10 rounded-[4rem] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)] animate-in zoom-in-95 fade-in duration-500 ring-1 ring-white/20">
          <div className="flex bg-slate-950/40 p-1.5 rounded-[1.5rem] mb-10 border border-white/5">
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-[1rem] transition-all ${!isLogin ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Register
            </button>
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-[1rem] transition-all ${isLogin ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Access
            </button>
          </div>

          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center animate-in slide-in-from-bottom-2">
              {successMsg}
            </div>
          )}

          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2 animate-in fade-in duration-300">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-2">Node Alias (Username)</label>
                <div className="relative group">
                  <i className="fa-solid fa-user absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors"></i>
                  <input 
                    required
                    type="text"
                    placeholder="Alex_Node"
                    className="w-full pl-16 pr-8 py-6 bg-slate-950/50 border border-white/5 rounded-3xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-white font-bold transition-all placeholder:text-slate-700"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-2">Email Identifier</label>
              <div className="relative group">
                <i className="fa-solid fa-envelope absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors"></i>
                <input 
                  required
                  type="email"
                  placeholder="alex@kitchen.node"
                  className="w-full pl-16 pr-8 py-6 bg-slate-950/50 border border-white/5 rounded-3xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-white font-bold transition-all placeholder:text-slate-700"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-2">Secure Key</label>
              <div className="relative group">
                <i className="fa-solid fa-lock absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors"></i>
                <input 
                  required
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-16 pr-8 py-6 bg-slate-950/50 border border-white/5 rounded-3xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-white font-bold transition-all placeholder:text-slate-700"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2 animate-in fade-in duration-300">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-2">Referral Code (Optional)</label>
                <div className="relative group">
                  <i className="fa-solid fa-gift absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors"></i>
                  <input 
                    type="text"
                    placeholder="Enter code for +50 RT bonus"
                    className="w-full pl-16 pr-8 py-6 bg-slate-950/50 border border-white/5 rounded-3xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-white font-bold transition-all placeholder:text-slate-700"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                  />
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black py-7 rounded-3xl shadow-[0_20px_50px_rgba(16,185,129,0.3)] transition-all transform active:scale-[0.98] text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 mt-6"
            >
              {loading ? (
                <><i className="fa-solid fa-circle-notch fa-spin"></i> PROCESSING...</>
              ) : (
                <>{isLogin ? 'INITIALIZE SESSION' : 'REGISTER NEW NODE'}</>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-[10px] font-black text-slate-500 hover:text-emerald-400 uppercase tracking-widest transition-colors"
            >
              {isLogin ? "Need to register first?" : "Already have a node? Login"}
            </button>
          </div>
        </div>

        <div className="mt-12 text-center animate-in fade-in duration-1000 delay-300">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] leading-relaxed">
            Propelling the <br/> 
            <span className="text-emerald-500/80">Zero-Waste Mesh Network</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
