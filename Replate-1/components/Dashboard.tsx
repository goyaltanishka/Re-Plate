
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { InventoryItem } from '../types';
import { FOOD_METRICS } from '../constants';

interface DashboardProps {
  inventory: InventoryItem[];
  rescuedImpact?: {
    gbp: number;
    co2: number;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ inventory, rescuedImpact }) => {
  const criticalCount = inventory.filter(i => i.risk_score > 75).length;
  const warningCount = inventory.filter(i => i.risk_score > 45 && i.risk_score <= 75).length;

  const rescuedCo2 = rescuedImpact?.co2 ?? 0;
  const rescuedValue = rescuedImpact?.gbp ?? 0;

  const inventoryCo2 = inventory.reduce((acc, item) => {
    const metric = FOOD_METRICS[item.item_key];
    return acc + (metric ? metric.co2_kg : 0);
  }, 0);

  const inventoryValue = inventory.reduce((acc, item) => {
    const metric = FOOD_METRICS[item.item_key];
    return acc + (metric ? metric.price_gbp : 0);
  }, 0);

  const totalCo2Offset = rescuedCo2 > 0 ? rescuedCo2 : inventoryCo2;
  const totalValueRescued = rescuedValue > 0 ? rescuedValue : inventoryValue;

  const efficiency = inventory.length > 0 ? 80 : 0;

  // Initial empty data if inventory is empty, otherwise mock some progression
  const dataTrend = inventory.length === 0 
    ? [
        { name: 'Mon', waste: 0, saved: 0 },
        { name: 'Tue', waste: 0, saved: 0 },
        { name: 'Wed', waste: 0, saved: 0 },
        { name: 'Thu', waste: 0, saved: 0 },
        { name: 'Fri', waste: 0, saved: 0 },
        { name: 'Sat', waste: 0, saved: 0 },
        { name: 'Sun', waste: 0, saved: 0 },
      ]
    : [
        { name: 'Mon', waste: 1.2, saved: 4.5 },
        { name: 'Tue', waste: 2.1, saved: 3.8 },
        { name: 'Wed', waste: 0.8, saved: 6.2 },
        { name: 'Thu', waste: 1.5, saved: 5.1 },
        { name: 'Fri', waste: 0.5, saved: 8.4 },
        { name: 'Sat', waste: 0.2, saved: 12.5 },
        { name: 'Sun', waste: 0.1, saved: 14.2 },
      ];

  const StatCard = ({ title, value, sub, icon, color, trend }: any) => (
    <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[3rem] border border-white shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className={`w-16 h-16 rounded-[1.5rem] ${color} flex items-center justify-center text-2xl shadow-lg ring-4 ring-white`}>
            <i className={`fa-solid ${icon}`}></i>
          </div>
          {trend && inventory.length > 0 && (
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm border border-emerald-100">
              <i className="fa-solid fa-arrow-trend-up"></i> {trend}
            </span>
          )}
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1 font-heading">{title}</p>
        <p className="text-5xl font-black text-slate-900 tracking-tighter mb-2 font-heading italic">
          {typeof value === 'number' && title.includes('Offset') ? value.toFixed(1) : value}
        </p>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{sub}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="Rescue Priority" 
          value={criticalCount} 
          sub="Items in red zone" 
          icon="fa-fire-flame-curved" 
          color="bg-rose-500 text-white shadow-rose-500/30" 
          trend={criticalCount > 0 ? "+12%" : null}
        />
        <StatCard 
          title="Watch List" 
          value={warningCount} 
          sub="Early warning status" 
          icon="fa-hourglass-half" 
          color="bg-amber-500 text-white shadow-amber-500/30" 
        />
        <StatCard 
          title="CO2 Offset" 
          value={totalCo2Offset} 
          sub="Carbon kept out (kg)" 
          icon="fa-leaf" 
          color="bg-emerald-500 text-white shadow-emerald-500/30" 
          trend={inventory.length > 0 ? "8.4kg" : null}
        />
        <StatCard 
          title="Value Reboot" 
          value={`£${totalValueRescued.toFixed(0)}`} 
          sub="Financial rescue" 
          icon="fa-sterling-sign" 
          color="bg-indigo-500 text-white shadow-indigo-500/30" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white/60 backdrop-blur-xl p-10 rounded-[4rem] border border-white shadow-2xl shadow-slate-200/50">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter font-heading italic">Sustainability</h3>
              <p className="text-sm text-slate-500 font-medium">Daily efficiency metrics across the node.</p>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/20"></span>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Rescued</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full bg-rose-500 shadow-lg shadow-rose-500/20"></span>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Risk</span>
              </div>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataTrend}>
                <defs>
                  <linearGradient id="colorSaved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: '800', fill: '#94a3b8'}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: '800', fill: '#94a3b8'}} />
                <Tooltip 
                  cursor={{stroke: '#e2e8f0', strokeWidth: 2}}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px', fontWeight: '800' }}
                />
                <Area type="monotone" dataKey="saved" stroke="#6366f1" strokeWidth={6} fillOpacity={1} fill="url(#colorSaved)" />
                <Area type="monotone" dataKey="waste" stroke="#f43f5e" strokeWidth={3} strokeDasharray="10 5" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-950 p-10 rounded-[4rem] text-white shadow-[0_40px_80px_rgba(0,0,0,0.2)] relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&q=80&w=1000" 
              alt="Fresh food accent" 
              className="w-full h-full object-cover opacity-20 scale-125 group-hover:scale-100 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-slate-950/80"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className={`w-3 h-3 rounded-full ${inventory.length > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`}></span>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em]">Kitchen Efficiency</p>
            </div>
            <h3 className="text-7xl font-black tracking-tighter mb-4 font-heading italic">{efficiency}%</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-10 font-medium">
              {inventory.length > 0 
                ? "Your pantry turnover is actively contributing to community sustainability nodes."
                : "Initialize your asset ledger to begin tracking efficiency metrics."
              }
            </p>
          </div>

          <div className="space-y-8 relative z-10">
            <div className="w-full h-5 bg-white/5 rounded-full overflow-hidden border border-white/10 p-1 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-indigo-500 rounded-full transition-all duration-[2000ms] shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                style={{ width: `${efficiency}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur-md p-5 rounded-[2rem] border border-white/10 shadow-lg">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Waste Factor</p>
                <p className="text-xl font-black text-rose-400 font-heading">{inventory.length > 0 ? 'Low' : 'N/A'}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md p-5 rounded-[2rem] border border-white/10 shadow-lg">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Safety Index</p>
                <p className="text-xl font-black text-indigo-400 font-heading">{inventory.length > 0 ? '94%' : '0%'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
