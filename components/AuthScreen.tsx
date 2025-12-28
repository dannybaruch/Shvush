
import React, { useState } from 'react';
import { Language, t } from '../services/translations';
import { Institution } from '../types';

interface AuthScreenProps {
  onLogin: (institution: Institution) => void;
  language: Language;
  onToggleLanguage: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, language, onToggleLanguage }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [error, setError] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (!isLoginMode && !institutionName)) {
      setError(language === 'he' ? 'אנא מלא את כל השדות' : 'Please fill all fields');
      return;
    }

    // סימולציה של לוגיקת צד שרת עבור Multi-tenant
    if (isLoginMode) {
      // כאן תתבצע קריאת API לבדיקת המוסד
      const mockInstitution: Institution = {
        id: `inst-${email.split('@')[0]}`,
        name: 'מוסד קיים במערכת',
        email: email,
        signup_date: new Date().toISOString(),
        trial_expiry_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        has_payment_method: false
      };
      onLogin(mockInstitution);
    } else {
      // רישום מוסד חדש
      const newInstitution: Institution = {
        id: `inst-${Date.now()}`,
        name: institutionName,
        email: email,
        signup_date: new Date().toISOString(),
        trial_expiry_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        has_payment_method: false
      };
      onLogin(newInstitution);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center p-6 relative overflow-hidden" dir={language === 'he' ? 'rtl' : 'ltr'}>
      <button 
        onClick={onToggleLanguage} 
        className={`absolute top-6 ${language === 'he' ? 'left-6' : 'right-6'} bg-white shadow-md border px-5 py-2.5 rounded-2xl font-bold z-50 text-slate-700 hover:bg-slate-50 transition-colors active:scale-95`}
      >
        {t(language, 'switchLanguage')}
      </button>

      <div className="max-w-md w-full z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#003366] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
             <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" /></svg>
          </div>
          <h1 className="text-4xl font-black text-[#003366] mb-2">{t(language, 'appName')}</h1>
          <p className="text-slate-500 font-bold">{isLoginMode ? (language === 'he' ? 'כניסת מוסד רשום' : 'Institution Login') : (language === 'he' ? 'רישום מוסד חדש' : 'New Institution Registration')}</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 space-y-6">
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLoginMode && (
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 mr-2 uppercase">{language === 'he' ? 'שם המוסד' : 'Institution Name'}</label>
                <input 
                  type="text" 
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-blue-400 outline-none font-bold"
                  placeholder={language === 'he' ? 'למשל: ישיבת אור החיים' : 'e.g. Yeshivat Light'}
                />
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 mr-2 uppercase">אימייל מנהל</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-blue-400 outline-none font-bold"
                placeholder="email@institution.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 mr-2 uppercase">סיסמה</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-blue-400 outline-none font-bold"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-red-500 text-xs font-bold text-center animate-pulse">{error}</p>}

            <button type="submit" className="w-full py-4 bg-[#003366] text-white font-black rounded-2xl shadow-lg hover:bg-blue-900 transition active:scale-95">
              {isLoginMode ? (language === 'he' ? 'כניסה למערכת' : 'Sign In') : (language === 'he' ? 'צור חשבון מוסד' : 'Create Account')}
            </button>
          </form>

          <div className="text-center pt-2">
            <button 
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="text-sm font-bold text-blue-600 hover:text-blue-800 transition"
            >
              {isLoginMode ? (language === 'he' ? 'אין לכם חשבון? הירשמו כאן' : "Don't have an account? Sign up") : (language === 'he' ? 'כבר רשומים? היכנסו' : 'Already registered? Log in')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
