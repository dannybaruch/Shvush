
import React, { useState } from 'react';

interface AdminLoginProps {
  onLogin: (adminData: { user: string; role: string }) => void;
  onCancel: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // רשימת המנהלים המורשים במערכת
  const AUTHORIZED_ADMINS = [
    { user: 'מנהל', pass: '302804786', role: 'Master Admin' },
    { user: 'אדמין', pass: 'leads_on_2025', role: 'System Admin' }
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const admin = AUTHORIZED_ADMINS.find(
      (a) => a.user === username && a.pass === password
    );

    if (admin) {
      onLogin({ user: admin.user, role: admin.role });
    } else {
      setError('שם משתמש או סיסמה שגויים');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-[200] backdrop-blur-md p-4" dir="rtl">
      <div className="bg-white max-w-sm w-full rounded-[2.5rem] shadow-2xl p-8 space-y-6 border border-slate-100 animate-in fade-in zoom-in duration-300">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-6h.01M10 12h.01M12 18a9 9 0 110-18 9 9 0 010 18zM12 9h.01"/></svg>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">כניסת הנהלת המערכת</h2>
          <p className="text-slate-400 text-sm mt-1">אנא הזן פרטי גישה מורשים</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-500 mr-1">שם משתמש</label>
            <input 
              type="text" 
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 transition outline-none font-medium"
              placeholder="שם משתמש"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-500 mr-1">סיסמה</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 transition outline-none font-medium"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 text-xs font-bold p-3 rounded-xl text-center animate-shake">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2">
            <button 
              type="submit"
              className="w-full py-4 bg-[#003366] text-white font-bold rounded-2xl shadow-lg shadow-blue-900/20 hover:bg-blue-900 transition active:scale-95"
            >
              התחברות למערכת
            </button>
            <button 
              type="button"
              onClick={onCancel}
              className="w-full py-2 text-slate-400 text-sm font-bold hover:text-slate-600 transition"
            >
              ביטול
            </button>
          </div>
        </form>
        
        <div className="pt-4 text-center">
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Yeshiva Leads Admin Portal</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
