
import React from 'react';
import { Candidate, Institution, Stage } from '../types';
import { calculateTrialDaysRemaining } from '../services/saasLogic';
import { Language, t } from '../services/translations';

interface DashboardProps {
  candidates: Candidate[];
  institution: Institution;
  language: Language;
  lastSync: Date | null;
}

const CandidateCard: React.FC<{ candidate: Candidate, language: Language }> = ({ candidate, language }) => (
  <div className={`bg-white p-5 rounded-2xl shadow-sm ${language === 'he' ? 'border-r-4' : 'border-l-4'} border-primary-blue hover:shadow-md transition-all group active:scale-[0.98]`}>
    <div className="flex justify-between items-start mb-3">
      <div>
        <h4 className="font-bold text-lg text-slate-800">{candidate.full_name}</h4>
        <p className="text-sm text-slate-500">{candidate.current_yeshiva}</p>
      </div>
    </div>
    <div className="flex gap-2 mt-4">
      <a href={`tel:${candidate.phone}`} className="flex-1 bg-blue-50 text-blue-700 text-center py-3 rounded-xl text-sm font-bold hover:bg-blue-100 transition active:bg-blue-200">
        {t(language, 'call')}
      </a>
      <a href={`https://wa.me/${candidate.phone.replace(/\D/g, '')}`} target="_blank" className="flex-1 bg-emerald-50 text-emerald-700 text-center py-3 rounded-xl text-sm font-bold hover:bg-emerald-100 transition active:bg-emerald-200">
        {t(language, 'whatsapp')}
      </a>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ candidates, institution, language, lastSync }) => {
  const daysRemaining = calculateTrialDaysRemaining(institution.trial_expiry_date);
  const urgentCandidates = candidates.filter(c => c.stage === Stage.Decision);
  const visitingCandidates = candidates.filter(c => c.stage === Stage.Visiting);

  return (
    <div className="relative pb-32">
      <div className="bg-white border-b border-slate-200 sticky top-0 md:top-0 z-10 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-xl md:text-2xl font-black text-primary-blue flex items-center gap-2">
            <span className="w-2 h-6 md:h-8 bg-blue-400 rounded-full"></span>
            {institution.name}
          </h2>
          {lastSync ? (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full ring-1 ring-emerald-200">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              {t(language, 'dbConnected')}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full ring-1 ring-amber-200">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
              {language === 'he' ? 'עובד במצב מקומי' : 'Local Mode'}
            </div>
          )}
        </div>
        <div className={`px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold shadow-sm ring-1 ring-inset ${daysRemaining < 7 ? 'bg-red-50 text-red-700 ring-red-200' : 'bg-blue-50 text-blue-700 ring-blue-200'}`}>
          <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          {daysRemaining} {t(language, 'trialDays')}
        </div>
      </div>

      <div className="p-6 space-y-10">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
               <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
               {t(language, 'urgentCare')} ({urgentCandidates.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {urgentCandidates.length > 0 ? urgentCandidates.map(c => <CandidateCard key={c.id} candidate={c} language={language} />) : (
              <div className="col-span-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400">
                <p className="font-bold">{t(language, 'noUrgent')}</p>
                <p className="text-xs mt-2">{language === 'he' ? 'מועמדים שיגיעו לשלב ההחלטה יופיעו כאן למעקב צמוד.' : 'Candidates in decision stage will appear here.'}</p>
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
               <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
               {t(language, 'visitingNow')} ({visitingCandidates.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visitingCandidates.length > 0 ? visitingCandidates.map(c => <CandidateCard key={c.id} candidate={c} language={language} />) : (
              <div className="col-span-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400">
                <p className="font-bold">{t(language, 'noVisiting')}</p>
                <p className="text-xs mt-2">{language === 'he' ? 'כשבו"שים יגיעו לישיבה ויועברו לשלב "מבקר כעת", הם יופיעו כאן.' : 'Visiting candidates will appear here when their stage is updated.'}</p>
              </div>
            )}
          </div>
        </section>

        {candidates.length === 0 && (
          <div className="bg-blue-600 rounded-[2.5rem] p-12 text-center text-white shadow-2xl animate-pulse">
             <h3 className="text-3xl font-black mb-4">{language === 'he' ? 'ברוכים הבאים למערכת!' : 'Welcome!'}</h3>
             <p className="text-blue-100 text-lg mb-8">{language === 'he' ? 'התחילו בהזנת השבו"ש הראשון שלכם באמצעות כפתור ה-"+" למטה.' : 'Start by adding your first candidate using the "+" button below.'}</p>
             <div className="flex justify-center">
               <svg className="w-16 h-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
             </div>
          </div>
        )}
      </div>

      {/* Floating Action Button logic remains the same - usually handled in App.tsx but it triggers the form */}
    </div>
  );
};

export default Dashboard;
