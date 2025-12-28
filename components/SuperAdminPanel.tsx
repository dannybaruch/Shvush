
import React, { useState } from 'react';
import { Institution } from '../types';
import { SHEETS_MASTER_DB_URL } from '../services/api';

interface SuperAdminPanelProps {
  adminInfo: { user: string; role: string } | null;
  institutions: Institution[];
  onUpdateInstitution: (id: string, updates: Partial<Institution>) => void;
  onLogout: () => void;
}

const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({ adminInfo, institutions, onUpdateInstitution, onLogout }) => {
  const [activeInsts, setActiveInsts] = useState(institutions);

  const stats = {
    totalYeshivas: activeInsts.length,
    paidSubscriptions: activeInsts.filter(i => i.has_payment_method).length,
    freeTrials: activeInsts.filter(i => !i.has_payment_method).length,
    totalCandidates: activeInsts.reduce((acc, curr) => acc + (curr.candidate_count || 0), 0)
  };

  const handleExtendTrial = (id: string) => {
    const inst = activeInsts.find(i => i.id === id);
    if (!inst) return;
    
    const currentExpiry = new Date(inst.trial_expiry_date);
    currentExpiry.setDate(currentExpiry.getDate() + 30);
    
    onUpdateInstitution(id, { trial_expiry_date: currentExpiry.toISOString() });
    setActiveInsts(activeInsts.map(i => i.id === id ? { ...i, trial_expiry_date: currentExpiry.toISOString() } : i));
  };

  const handleToggleActive = (id: string) => {
    const inst = activeInsts.find(i => i.id === id);
    if (!inst) return;

    const newState = !inst.is_active;
    onUpdateInstitution(id, { is_active: newState });
    setActiveInsts(activeInsts.map(i => i.id === id ? { ...i, is_active: newState } : i));
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-6 md:p-12 font-['Assistant']" dir="rtl">
      {/* Header */}
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-l from-blue-400 to-emerald-400">
              ניהול מערכת שבו"ש-ON
            </h1>
            <div className="flex items-center gap-3">
              <p className="text-slate-400 font-medium">מחובר כ: <span className="text-blue-400 font-bold">{adminInfo?.user}</span></p>
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase rounded-full border border-blue-500/20">{adminInfo?.role}</span>
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <a 
              href={SHEETS_MASTER_DB_URL} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-900/20 transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6-9a3 3 0 116 0 3 3 0 01-6 0zm-1 9a9 9 0 1118 0 9 9 0 01-18 0z"/></svg>
              מסד נתונים (Sheets)
            </a>
            <button 
              onClick={onLogout}
              className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-3 rounded-2xl font-bold transition border border-slate-700"
            >
              יציאה
            </button>
          </div>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 backdrop-blur-sm">
            <p className="text-slate-500 text-[10px] font-black uppercase mb-2">מוסדות רשומים</p>
            <p className="text-4xl font-black">{stats.totalYeshivas}</p>
          </div>
          <div className="bg-emerald-500/10 p-6 rounded-3xl border border-emerald-500/20 backdrop-blur-sm">
            <p className="text-emerald-500 text-[10px] font-black uppercase mb-2">מנויי פרימיום</p>
            <p className="text-4xl font-black text-emerald-400">{stats.paidSubscriptions}</p>
          </div>
          <div className="bg-amber-500/10 p-6 rounded-3xl border border-amber-500/20 backdrop-blur-sm">
            <p className="text-amber-500 text-[10px] font-black uppercase mb-2">בתקופת ניסיון</p>
            <p className="text-4xl font-black text-amber-400">{stats.freeTrials}</p>
          </div>
          <div className="bg-blue-500/10 p-6 rounded-3xl border border-blue-500/20 backdrop-blur-sm">
            <p className="text-blue-500 text-[10px] font-black uppercase mb-2">סה"כ מועמדים</p>
            <p className="text-4xl font-black text-blue-400">{stats.totalCandidates}</p>
          </div>
        </div>

        {/* Institutions Table */}
        <div className="bg-slate-800/30 rounded-[2rem] border border-slate-700/50 overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-700/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold">ניהול Tenants</h2>
            <div className="relative w-full md:w-72">
              <input type="text" placeholder="חיפוש מוסד..." className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition" />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-slate-900/50 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                  <th className="px-6 py-4">שם המוסד ואימייל</th>
                  <th className="px-6 py-4">תאריך הצטרפות</th>
                  <th className="px-6 py-4">סטטוס מנוי</th>
                  <th className="px-6 py-4 text-center">פעיל?</th>
                  <th className="px-6 py-4 text-left">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {activeInsts.map(inst => (
                  <tr key={inst.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-200">{inst.name}</div>
                      {/* Fixed: changed inst.admin_email to inst.email to match Institution interface */}
                      <div className="text-xs text-slate-500 font-medium">{inst.email}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-mono text-slate-400">{new Date(inst.signup_date).toLocaleDateString('he-IL')}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full inline-block w-fit ${inst.has_payment_method ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {inst.has_payment_method ? 'Premium' : 'Trial'}
                        </span>
                        <span className="text-[10px] text-slate-500 mt-1">
                          בתוקף עד: {new Date(inst.trial_expiry_date).toLocaleDateString('he-IL')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <button 
                          onClick={() => handleToggleActive(inst.id)}
                          className={`w-12 h-6 rounded-full relative transition-all duration-300 ${inst.is_active ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-600'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${inst.is_active ? 'right-7' : 'right-1'}`}></div>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-left space-x-reverse space-x-2">
                      <button onClick={() => handleExtendTrial(inst.id)} className="text-xs font-bold text-blue-400 bg-blue-500/10 px-4 py-2 rounded-xl border border-blue-500/20 hover:bg-blue-500/20 transition">הארכת ניסיון</button>
                      <button onClick={() => handleToggleActive(inst.id)} className={`text-xs font-bold px-4 py-2 rounded-xl border transition ${inst.is_active ? 'text-red-400 bg-red-500/10 border-red-500/20 hover:bg-red-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20'}`}>
                        {inst.is_active ? 'חסימה' : 'שחרור'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminPanel;
