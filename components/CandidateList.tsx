
import React, { useState, useMemo } from 'react';
import { Candidate, Source, Stage, Status } from '../types';
import { getLeadAnalysis } from '../services/geminiService';
import { Language, t } from '../services/translations';
import { exportCatalogToPdf } from '../services/pdfService';

interface CandidateListProps {
  candidates: Candidate[];
  interactions: any[];
  onSelect: (c: Candidate) => void;
  onUpdate?: (c: Candidate) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  language: Language;
}

type SortConfig = {
  key: keyof Candidate | null;
  direction: 'asc' | 'desc';
};

const CandidateList: React.FC<CandidateListProps> = ({ candidates, interactions, onSelect, onUpdate, onDelete, onAdd, language }) => {
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [candidateToDelete, setCandidateToDelete] = useState<Candidate | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleAiAnalyze = async (c: Candidate) => {
    setAnalyzingId(c.id);
    const candidateInteractions = interactions.filter(i => i.candidate_id === c.id);
    const result = await getLeadAnalysis(c, candidateInteractions);
    setAiAnalysis(prev => ({ ...prev, [c.id]: result || 'ניתוח נכשל' }));
    setAnalyzingId(null);
  };

  const handleQuickEnroll = (c: Candidate) => {
    if (onUpdate) {
      onUpdate({ ...c, status: Status.Enrolled });
    }
  };

  const handleExportCatalog = async () => {
    setIsExporting(true);
    try {
      await exportCatalogToPdf(candidates, "המערכת שלי");
    } finally {
      setIsExporting(false);
    }
  };

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const nameMatch = c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
      const phoneMatch = c.phone?.includes(searchQuery) || false;
      const matchesSearch = nameMatch || phoneMatch;
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [candidates, searchQuery, statusFilter]);

  const processedCandidates = useMemo(() => {
    let items = [...filteredCandidates];
    if (sortConfig.key !== null) {
      items.sort((a, b) => {
        const aValue = (a as any)[sortConfig.key!] || '';
        const bValue = (b as any)[sortConfig.key!] || '';
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [filteredCandidates, sortConfig]);

  const getStatusStyle = (status: Status) => {
    switch (status) {
      case Status.Enrolled:
        return 'bg-emerald-100 text-emerald-800 ring-emerald-600/20';
      case Status.Accepted:
        return 'bg-blue-100 text-blue-800 ring-blue-600/20';
      case Status.Passed:
        return 'bg-red-100 text-red-800 ring-red-600/20';
      default:
        return 'bg-slate-100 text-slate-600 ring-slate-600/20';
    }
  };

  const cleanPhone = (phone: string) => phone.replace(/\D/g, '');

  const formatVisitDate = (dateStr: string | undefined) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleString(language === 'he' ? 'he-IL' : 'en-US', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch(e) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 p-4 md:p-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800">{t(language, 'candidateList')}</h2>
          <p className="text-slate-500 mt-1">{t(language, 'manageTracking')}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <button 
            onClick={handleExportCatalog} 
            disabled={isExporting || candidates.length === 0}
            className="bg-emerald-50 text-emerald-700 px-6 py-2.5 rounded-xl transition font-bold border border-emerald-200 hover:bg-emerald-100 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isExporting ? <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>}
            {t(language, 'exportCatalog')}
          </button>
          
          <div className="relative flex-1 sm:w-64">
            <svg className="w-5 h-5 absolute right-4 top-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input 
              type="text"
              placeholder={t(language, 'searchPlaceholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pr-12 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 outline-none font-medium"
            />
          </div>
          <button onClick={onAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl transition font-bold shadow-lg shadow-blue-200 active:scale-95 whitespace-nowrap">
            + {t(language, 'addCandidate')}
          </button>
        </div>
      </div>

      <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className={`w-full ${language === 'he' ? 'text-right' : 'text-left'}`}>
            <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-xs font-black uppercase tracking-wider">
              <tr>
                <th className="px-6 py-5">{t(language, 'fullName')}</th>
                <th className="px-6 py-5">{t(language, 'phone')}</th>
                <th className="px-6 py-5">{t(language, 'visitDuration')}</th>
                <th className="px-6 py-5">{t(language, 'status')}</th>
                <th className="px-6 py-5 text-center">{t(language, 'aiAnalysis')}</th>
                <th className={`px-6 py-5 ${language === 'he' ? 'text-left' : 'text-right'}`}>{t(language, 'actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {processedCandidates.length > 0 ? processedCandidates.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full overflow-hidden flex-shrink-0 border border-slate-200">
                        {c.photo ? <img src={c.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">{c.full_name[0]}</div>}
                      </div>
                      <span className="font-bold text-slate-800">{c.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <a href={`tel:${c.phone}`} title={t(language, 'call')} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg></a>
                      <a href={`https://wa.me/${cleanPhone(c.phone)}`} target="_blank" title={t(language, 'whatsapp')} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.6-30.6-37.9-3.2-5.5-.3-8.6 2.5-11.2 2.5-2.5 5.5-6.5 8.3-9.8 2.8-3.3 3.7-5.6 5.5-9.2 1.9-3.7.9-7-2.3-10.1-3.2-3.3-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.5 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg></a>
                      <span className="text-slate-500 font-mono text-sm">{c.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {c.visit_start ? (
                      <div className="text-[10px] font-bold text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100 flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <span className="text-emerald-600 font-black">הגעה:</span>
                          <span className="font-mono">{formatVisitDate(c.visit_start)}</span>
                        </div>
                        {c.visit_end && (
                          <div className="flex items-center gap-1 opacity-70">
                            <span className="text-red-500 font-black">סיום:</span>
                            <span className="font-mono">{formatVisitDate(c.visit_end)}</span>
                          </div>
                        )}
                      </div>
                    ) : <span className="text-slate-300 italic text-xs">לא הוזן לו"ז</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ring-1 ring-inset ${getStatusStyle(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {aiAnalysis[c.id] ? (
                      <div className="text-[10px] max-w-xs overflow-hidden line-clamp-2 text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100 mx-auto">{aiAnalysis[c.id]}</div>
                    ) : (
                      <button onClick={() => handleAiAnalyze(c)} disabled={analyzingId === c.id} className="text-xs text-purple-600 hover:text-purple-800 flex items-center justify-center gap-1 mx-auto bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100 transition-colors font-bold">
                        ⚡ {analyzingId === c.id ? t(language, 'analyzing') : t(language, 'smartAnalysis')}
                      </button>
                    )}
                  </td>
                  <td className={`px-6 py-4 ${language === 'he' ? 'text-left' : 'text-right'}`}>
                    <div className="flex items-center gap-2">
                      <a 
                        href={`tel:${c.phone}`}
                        className="text-white bg-blue-600 hover:bg-blue-700 font-black text-[10px] px-3 py-1.5 rounded-lg border border-blue-600 transition-all uppercase flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                        {t(language, 'call')}
                      </a>
                      {c.status !== Status.Enrolled && (
                        <button 
                          onClick={() => handleQuickEnroll(c)}
                          className="text-emerald-600 hover:text-emerald-900 font-black text-[10px] bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 transition-all uppercase tracking-tighter"
                        >
                          נרשם
                        </button>
                      )}
                      <button onClick={() => onSelect(c)} className="text-blue-600 hover:text-blue-900 font-bold text-sm bg-blue-50 px-4 py-1.5 rounded-lg border border-blue-100 transition-all">{t(language, 'viewEdit')}</button>
                      <button onClick={() => setCandidateToDelete(c)} className="text-red-600 hover:text-red-900 font-bold text-sm bg-red-50 p-1.5 rounded-lg border border-red-100 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-bold">{t(language, 'noCandidates')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="lg:hidden grid grid-cols-1 gap-4">
        {processedCandidates.length > 0 ? processedCandidates.map(c => (
          <div key={c.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-200">
                {c.photo ? <img src={c.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xl">{c.full_name[0]}</div>}
              </div>
              <div className="flex-1">
                <h4 className="font-black text-slate-800 text-lg">{c.full_name}</h4>
                <div className="flex flex-col gap-1 mt-1">
                   <p className="text-slate-500 text-xs font-medium">{c.current_yeshiva}</p>
                   {c.visit_start && (
                     <div className="text-blue-600 text-[10px] font-black space-y-0.5">
                       <p>🕒 הגעה: {formatVisitDate(c.visit_start)}</p>
                       {c.visit_end && <p>👋 עזיבה: {formatVisitDate(c.visit_end)}</p>}
                     </div>
                   )}
                </div>
              </div>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ring-1 ring-inset ${getStatusStyle(c.status)}`}>
                {c.status}
              </span>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => handleQuickEnroll(c)}
                className={`flex-1 py-3 rounded-2xl text-[11px] font-black transition-all ${c.status === Status.Enrolled ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                {c.status === Status.Enrolled ? 'נרשם ✓' : 'נרשם?'}
              </button>
              <a href={`tel:${c.phone}`} className="flex-1 bg-blue-600 text-white text-center py-3 rounded-2xl text-sm font-bold active:scale-95 transition-all shadow-md">
                {t(language, 'call')}
              </a>
              <button onClick={() => onSelect(c)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl border border-slate-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              </button>
            </div>
          </div>
        )) : (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center text-slate-400 font-bold">
            {t(language, 'noCandidates')}
          </div>
        )}
      </div>

      {candidateToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[200] backdrop-blur-sm p-4">
          <div className="bg-white max-w-sm w-full rounded-2xl shadow-2xl p-8 space-y-6">
            <h3 className="text-2xl font-bold text-slate-800 text-center">{t(language, 'confirmDelete')}</h3>
            <p className="text-slate-500 text-center">{t(language, 'confirmDeleteText').replace('{name}', candidateToDelete.full_name)}</p>
            <div className="flex gap-3">
              <button onClick={() => setCandidateToDelete(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl">{t(language, 'cancel')}</button>
              <button onClick={() => { onDelete(candidateToDelete.id); setCandidateToDelete(null); }} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl">{t(language, 'deleteCandidate')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateList;
