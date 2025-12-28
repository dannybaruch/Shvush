
import React, { useState, useEffect, useMemo } from 'react';
import { Candidate, Stage, Institution, Interaction, Status, Source } from '../types';
import { exportElementToPdf } from '../services/pdfService';
import { Language, t } from '../services/translations';
import { getManagementInsights } from '../services/geminiService';

interface RoshYeshivaDashboardProps {
  candidates: Candidate[];
  interactions: Interaction[];
  institution: Institution;
  language: Language;
}

const RoshYeshivaDashboard: React.FC<RoshYeshivaDashboardProps> = ({ candidates, interactions, institution, language }) => {
  const [aiInsights, setAiInsights] = useState<string>('');
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  useEffect(() => {
    const fetchInsights = async () => {
      setIsLoadingInsights(true);
      const insights = await getManagementInsights(candidates, interactions);
      setAiInsights(insights || '');
      setIsLoadingInsights(false);
    };
    if (candidates.length > 0) fetchInsights();
  }, [candidates.length]);

  const stats = useMemo(() => {
    const total = candidates.length;
    const accepted = candidates.filter(c => c.status === Status.Accepted || c.status === Status.Enrolled).length;
    const enrolled = candidates.filter(c => c.status === Status.Enrolled).length;
    const conversionRate = total > 0 ? Math.round((enrolled / total) * 100) : 0;
    
    const visitingNow = candidates.filter(c => c.stage === Stage.Visiting).length;

    return {
      total,
      accepted,
      enrolled,
      conversionRate,
      visitingNow
    };
  }, [candidates]);

  if (candidates.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-8 text-center" dir={language === 'he' ? 'rtl' : 'ltr'}>
        <div className="w-24 h-24 bg-blue-100 rounded-3xl flex items-center justify-center mb-6 text-blue-600">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
        </div>
        <h2 className="text-3xl font-black text-[#003366] mb-4">{t(language, 'managementHome')}</h2>
        <p className="text-slate-500 max-w-md font-medium leading-relaxed">
          {language === 'he' 
            ? 'דשבורד המנהלים יתחיל להציג נתוני הצלחה, אחוזי המרה ותובנות אסטרטגיות ברגע שתזינו את המועמדים הראשונים למערכת.'
            : 'The management dashboard will start showing success rates, conversion funnel, and strategic insights once you add your first candidates.'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700 bg-[#F8FAFC] min-h-screen font-['Assistant']" dir={language === 'he' ? 'rtl' : 'ltr'}>
      {/* Executive Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-[#003366] tracking-tight">
            {t(language, 'managementHome')}
          </h2>
          <p className="text-slate-500 font-bold mt-2 uppercase text-xs tracking-widest">
            {institution.name} • {t(language, 'managementHomeSubtitle')}
          </p>
        </div>
        <button 
          onClick={() => exportElementToPdf('rosh-dashboard-main', 'Executive_Success_Report', institution.name)}
          className="bg-[#003366] text-white px-8 py-4 rounded-2xl font-black shadow-2xl hover:bg-blue-900 transition flex items-center gap-3 active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2.667a2 2 0 002-2V5a2 2 0 00-2-2H4.333a2 2 0 00-2 2v10a2 2 0 002 2H7m10 0v-2a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0h-3m-4 0h-3m-3 2h14"/></svg>
          {t(language, 'exportManagementReport')}
        </button>
      </div>

      <div id="rosh-dashboard-main" className="space-y-8">
        {/* Recruitment Success Snapshot Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-slate-400"></div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-2">{t(language, 'totalShabushim')}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-900">{stats.total}</span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-blue-500"></div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-2">{t(language, 'totalAccepted')}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-900">{stats.accepted}</span>
            </div>
          </div>

          <div className="bg-emerald-50 p-8 rounded-[2.5rem] shadow-sm border border-emerald-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div>
            <p className="text-emerald-600 text-[10px] font-black uppercase tracking-wider mb-2">{t(language, 'totalEnrolled')}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-emerald-900">{stats.enrolled}</span>
            </div>
          </div>

          <div className={`bg-[#003366] p-8 rounded-[2.5rem] shadow-2xl text-white relative`}>
            <p className="text-blue-200 text-[10px] font-black uppercase tracking-wider mb-2">{t(language, 'conversionRate')}</p>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-5xl font-black">{stats.conversionRate}%</span>
            </div>
            <div className="w-full bg-blue-900/50 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-blue-400 transition-all duration-1000" style={{ width: `${stats.conversionRate}%` }}></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Success Funnel Chart */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                משפך המרה: משבו"ש לתלמיד
              </h3>
              <div className="flex flex-col gap-4">
                {[
                  { label: t(language, 'totalShabushim'), val: stats.total, color: 'bg-slate-200' },
                  { label: t(language, 'totalAccepted'), val: stats.accepted, color: 'bg-blue-400' },
                  { label: t(language, 'totalEnrolled'), val: stats.enrolled, color: 'bg-emerald-500' },
                ].map((step, idx) => (
                  <div key={idx} className="relative">
                    <div className="flex justify-between items-center mb-1 px-2">
                      <span className="text-xs font-black text-slate-600">{step.label}</span>
                      <span className="text-xs font-black text-slate-800">{step.val}</span>
                    </div>
                    <div className="h-10 w-full bg-slate-100 rounded-xl overflow-hidden">
                      <div 
                        className={`h-full ${step.color} transition-all duration-1000`} 
                        style={{ width: stats.total > 0 ? `${(step.val / stats.total) * 100}%` : '0%' }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Candidate Summary Table with Enrolled status */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h3 className="text-xl font-black text-slate-800 mb-8">פירוט מועמדים - סטטוס סופי</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                      <th className="pb-4">שם המועמד</th>
                      <th className="pb-4">ישיבת מקור</th>
                      <th className="pb-4">שלב נוכחי</th>
                      <th className="pb-4">סטטוס סופי</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {candidates.map(c => (
                      <tr key={c.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-5 font-bold text-slate-800">{c.full_name}</td>
                        <td className="py-5 text-sm text-slate-500">{c.current_yeshiva}</td>
                        <td className="py-5 text-xs font-bold text-slate-400 uppercase">{c.stage}</td>
                        <td className="py-5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ring-1 ring-inset ${
                            c.status === Status.Enrolled ? 'bg-emerald-100 text-emerald-700 ring-emerald-200' : 
                            c.status === Status.Accepted ? 'bg-blue-50 text-blue-700 ring-blue-100' : 
                            'bg-slate-50 text-slate-400 ring-slate-100'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* AI Strategic Insights */}
            <div className="bg-[#0f172a] p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden group">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl transition-transform group-hover:scale-150 duration-1000"></div>
               <h4 className="text-xl font-black mb-6 flex items-center gap-3">
                 <span className="text-2xl">✨</span>
                 תובנות הנהלה (AI)
               </h4>
               {isLoadingInsights ? (
                 <div className="space-y-3">
                   <div className="h-3 bg-white/10 rounded w-full animate-pulse"></div>
                   <div className="h-3 bg-white/10 rounded w-3/4 animate-pulse"></div>
                 </div>
               ) : (
                 <div className="text-sm text-slate-300 leading-relaxed font-medium whitespace-pre-line italic">
                   {aiInsights || "ממתין לנתונים מספקים להפקת תובנות..."}
                 </div>
               )}
            </div>

            {/* Top Sources Success Rate */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h4 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.99 7.99 0 0120 13a7.98 7.98 0 01-2.343 5.657z"/></svg>
                מקורות הגעה מובילים
              </h4>
              <div className="space-y-6">
                 {Object.values(Source).map(src => {
                   const count = candidates.filter(c => c.source === src).length;
                   const enrolledFromSrc = candidates.filter(c => c.source === src && c.status === Status.Enrolled).length;
                   if (count === 0) return null;
                   return (
                     <div key={src} className="space-y-1">
                       <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                         <span>{src}</span>
                         <span>{enrolledFromSrc} נרשמו / {count}</span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-500" style={{ width: `${(count / stats.total) * 100}%` }}></div>
                       </div>
                     </div>
                   );
                 })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoshYeshivaDashboard;
