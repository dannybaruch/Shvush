
import React, { useState } from 'react';
import { Institution } from '../types';
import { Language, t } from '../services/translations';
import { SHEETS_API_URL, testDbConnection } from '../services/api';

interface SettingsProps {
  institution: Institution;
  onUpdate: (updates: Partial<Institution>) => void;
  language: Language;
  lastSync: Date | null;
  onRefetch: () => void;
}

const Settings: React.FC<SettingsProps> = ({ institution, onUpdate, language, lastSync, onRefetch }) => {
  const [name, setName] = useState(institution.name);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'none' | 'success' | 'error'>('none');

  const dir = language === 'he' ? 'rtl' : 'ltr';

  const handleSave = () => {
    onUpdate({ name });
    const message = language === 'he' ? 'ההגדרות נשמרו בהצלחה' : 'Settings saved successfully';
    alert(message);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult('none');
    const ok = await testDbConnection();
    setTestResult(ok ? 'success' : 'error');
    setIsTesting(false);
    if (ok) onRefetch();
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500" dir={dir}>
      <div>
        <h2 className="text-3xl font-black text-slate-800">{t(language, 'settings')}</h2>
        <p className="text-slate-500">{t(language, 'manageTracking')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-primary-blue mb-6">{t(language, 'institutionDetails')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  {language === 'he' ? 'שם המוסד' : 'Institution Name'}
                </label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 outline-none transition"
                />
              </div>
              
              <div className="pt-6 border-t border-slate-100 space-y-4">
                <h4 className="text-lg font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  {language === 'he' ? 'סטטוס מסד נתונים' : 'Database Status'}
                </h4>
                
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center md:text-right">
                    <p className="text-sm font-bold text-slate-700">{t(language, 'lastSync')}:</p>
                    <p className="text-xs text-slate-500 font-mono">
                      {lastSync ? lastSync.toLocaleString(language === 'he' ? 'he-IL' : 'en-US') : '---'}
                    </p>
                  </div>
                  <button 
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="bg-blue-50 text-blue-700 px-6 py-3 rounded-xl font-bold border border-blue-200 hover:bg-blue-100 transition active:scale-95 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isTesting ? (
                      <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                    )}
                    {t(language, 'testSync')}
                  </button>
                </div>

                {testResult === 'success' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                    ✅ {t(language, 'syncSuccess')}
                  </div>
                )}
                {testResult === 'error' && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                    ❌ {t(language, 'syncError')}
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleSave}
                  className="w-full bg-[#003366] hover:bg-blue-900 text-white font-bold px-8 py-4 rounded-2xl shadow-xl transition active:scale-95"
                >
                  {t(language, 'saveChanges')}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100">
            <h3 className="text-lg font-bold text-blue-900 mb-4">{t(language, 'subscriptionStatus')}</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center"><span className="text-blue-700">{t(language, 'accountType')}:</span><span className="font-bold text-blue-900">{institution.has_payment_method ? t(language, 'premium') : t(language, 'trial')}</span></div>
              <div className="flex justify-between items-center"><span className="text-blue-700">{t(language, 'joinDate')}:</span><span className="font-bold text-blue-900">{new Date(institution.signup_date).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US')}</span></div>
              <div className="pt-4"><div className="w-full bg-blue-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: '80%' }}></div></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
