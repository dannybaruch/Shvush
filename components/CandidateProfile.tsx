
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Candidate, Interaction, InteractionType, Status, Institution, Stage, Source } from '../types';
import { exportElementToPdf } from '../services/pdfService';
import { Language, t } from '../services/translations';

interface CandidateProfileProps {
  candidate: Candidate;
  interactions: Interaction[];
  institution: Institution;
  onAddInteraction: (type: InteractionType, summary: string) => void;
  onUpdate: (updated: Candidate) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
  language: Language;
}

const CandidateProfile: React.FC<CandidateProfileProps> = ({ candidate, interactions, institution, onAddInteraction, onUpdate, onDelete, onBack, language }) => {
  const [newInteractionType, setNewInteractionType] = useState<InteractionType>(InteractionType.Phone);
  const [newInteractionSummary, setNewInteractionSummary] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formState, setFormState] = useState({ ...candidate });
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // מיון אינטראקציות מהחדש לישן
  const sortedInteractions = useMemo(() => {
    return [...interactions].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [interactions]);

  const handleSubmitInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInteractionSummary.trim()) return;
    onAddInteraction(newInteractionType, newInteractionSummary);
    setNewInteractionSummary('');
  };

  const handleSaveChanges = () => {
    onUpdate(formState);
  };

  const handleExport = () => {
    exportElementToPdf('candidate-profile-content', `Profile_${formState.full_name}`, institution.name);
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert(language === 'he' ? "שגיאה בגישה למצלמה" : "Error accessing camera");
      setIsCameraOpen(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/png');
        setFormState({ ...formState, photo: dataUrl });
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormState({ ...formState, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const getStatusStyle = (status: Status) => {
    switch (status) {
      case Status.Enrolled:
        return 'bg-emerald-100 text-emerald-800 ring-emerald-200';
      case Status.Accepted:
        return 'bg-blue-100 text-blue-800 ring-blue-200';
      case Status.Passed:
        return 'bg-red-100 text-red-800 ring-red-200';
      default:
        return 'bg-slate-100 text-slate-600 ring-slate-200';
    }
  };

  const getInteractionIcon = (type: InteractionType) => {
    switch (type) {
      case InteractionType.Phone:
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>;
      case InteractionType.WhatsApp:
        return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.6-30.6-37.9-3.2-5.5-.3-8.6 2.5-11.2 2.5-2.5 5.5-6.5 8.3-9.8 2.8-3.3 3.7-5.6 5.5-9.2 1.9-3.7.9-7-2.3-10.1-3.2-3.3-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.5 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>;
      case InteractionType.Meeting:
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>;
      case InteractionType.Email:
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>;
      case InteractionType.Interview:
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>;
      case InteractionType.Observation:
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>;
      default:
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>;
    }
  };

  const cleanPhone = (phone: string) => phone.replace(/\D/g, '');

  return (
    <div id="candidate-profile-content" className="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 md:p-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className={`p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-primary-blue transition-colors ${language === 'en' ? 'rotate-180' : ''}`}>
              <svg className="w-6 h-6 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
            </button>
            <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shrink-0 relative group">
              {formState.photo ? (
                <img src={formState.photo} alt={formState.full_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300 text-2xl font-black">{formState.full_name[0]}</div>
              )}
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-black text-slate-800">{formState.full_name}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${getStatusStyle(formState.status)}`}>{formState.status}</span>
              <span className="text-slate-400 text-sm font-bold">• {formState.stage}</span>
              <div className="flex items-center gap-2 mr-2">
                <a href={`tel:${formState.phone}`} title={t(language, 'call')} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all border border-blue-100 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  <span className="text-[10px] font-black">{t(language, 'call')}</span>
                </a>
                <a href={`https://wa.me/${cleanPhone(formState.phone)}`} target="_blank" title={t(language, 'whatsapp')} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all border border-emerald-100 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.6-30.6-37.9-3.2-5.5-.3-8.6 2.5-11.2 2.5-2.5 5.5-6.5 8.3-9.8 2.8-3.3 3.7-5.6 5.5-9.2 1.9-3.7.9-7-2.3-10.1-3.2-3.3-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.5 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
                  <span className="text-[10px] font-black">{t(language, 'whatsapp')}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={() => setShowDeleteConfirm(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-xl font-bold transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            {t(language, 'delete')}
          </button>
          <button onClick={handleExport} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#003366] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-900 transition shadow-lg">{t(language, 'exportPdf')}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-primary-blue mb-6 border-b pb-4">{t(language, 'institutionDetails')}</h3>
            
            {/* Photo Management Section */}
            <div className="flex flex-col items-center mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <label className="block text-xs font-black text-slate-500 mb-4 uppercase tracking-tighter w-full text-center">תמונת מועמד</label>
              <div className="w-32 h-32 bg-white rounded-3xl overflow-hidden border-2 border-slate-200 shadow-inner relative flex items-center justify-center mb-4">
                {isCameraOpen ? (
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                ) : formState.photo ? (
                  <img src={formState.photo} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                )}
              </div>
              
              <div className="flex flex-wrap justify-center gap-2 w-full">
                {!isCameraOpen ? (
                  <>
                    <button 
                      type="button" 
                      onClick={startCamera} 
                      className="bg-white hover:bg-blue-50 text-blue-600 px-4 py-2 rounded-xl border border-blue-100 text-xs font-bold transition flex items-center gap-2 shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      {formState.photo ? t(language, 'retake') : t(language, 'takePhoto')}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()} 
                      className="bg-white hover:bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl border border-emerald-100 text-xs font-bold transition flex items-center gap-2 shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                      {t(language, 'uploadPhoto')}
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  </>
                ) : (
                  <div className="flex gap-2 w-full">
                    <button 
                      type="button" 
                      onClick={capturePhoto} 
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg animate-pulse"
                    >
                      צלם כעת
                    </button>
                    <button 
                      type="button" 
                      onClick={stopCamera} 
                      className="bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold"
                    >
                      ביטול
                    </button>
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleSaveChanges(); }}>
              <div>
                <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-tighter">{t(language, 'fullName')}</label>
                <input type="text" value={formState.full_name} onChange={(e) => setFormState({...formState, full_name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 outline-none transition font-bold" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-tighter">{t(language, 'phone')}</label>
                <input type="text" value={formState.phone} onChange={(e) => setFormState({...formState, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 outline-none transition text-left font-mono" dir="ltr" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-tighter">{t(language, 'status')}</label>
                    <select value={formState.status} onChange={(e) => setFormState({...formState, status: e.target.value as Status})} className="w-full px-3 py-3 rounded-xl border border-slate-200 outline-none text-xs font-bold">
                      {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-tighter">{t(language, 'stage')}</label>
                    <select value={formState.stage} onChange={(e) => setFormState({...formState, stage: e.target.value as Stage})} className="w-full px-3 py-3 rounded-xl border border-slate-200 outline-none text-xs font-bold">
                      {Object.values(Stage).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                 </div>
              </div>
              <button type="submit" className="w-full py-4 font-black rounded-xl shadow-lg bg-primary-blue text-white hover:bg-blue-900 transition active:scale-95">{t(language, 'saveChanges')}</button>
            </form>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
             <h3 className="text-xl font-black text-[#003366] mb-6 border-b pb-4">{t(language, 'visitDetails')}</h3>
             <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                   <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-tighter">{t(language, 'visitStart')}</label>
                      <input 
                        type="datetime-local" 
                        value={formState.visit_start || ''} 
                        onChange={e => setFormState({...formState, visit_start: e.target.value})}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-bold"
                      />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-tighter">{t(language, 'visitEnd')}</label>
                      <input 
                        type="datetime-local" 
                        value={formState.visit_end || ''} 
                        onChange={e => setFormState({...formState, visit_end: e.target.value})}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-bold"
                      />
                   </div>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-tighter">{t(language, 'assignedHost')}</label>
                   <input 
                    type="text" 
                    value={formState.assigned_host || ''} 
                    onChange={e => setFormState({...formState, assigned_host: e.target.value})}
                    placeholder="שם תלמיד מארח..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                   />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-tighter">{t(language, 'assignedRoom')}</label>
                   <input 
                    type="text" 
                    value={formState.assigned_room || ''} 
                    onChange={e => setFormState({...formState, assigned_room: e.target.value})}
                    placeholder="מספר חדר..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                   />
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-2xl font-black text-primary-blue mb-10 flex items-center gap-3">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              {t(language, 'interactionTimeline')}
            </h3>
            
            <div className={`relative space-y-12 ${language === 'he' ? 'before:right-6' : 'before:left-6'} before:absolute before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100`}>
              {sortedInteractions.length > 0 ? sortedInteractions.map((interaction, idx) => (
                <div key={interaction.id} className={`relative ${language === 'he' ? 'pr-14' : 'pl-14'} animate-in fade-in slide-in-from-top-4 duration-500`} style={{ animationDelay: `${idx * 100}ms` }}>
                  {/* Icon Circle */}
                  <div className={`absolute ${language === 'he' ? 'right-0' : 'left-0'} top-0 w-12 h-12 bg-white border-2 border-blue-100 rounded-full flex items-center justify-center z-10 shadow-sm group-hover:border-blue-400 transition-colors`}>
                    <div className="text-blue-600">
                      {getInteractionIcon(interaction.type)}
                    </div>
                  </div>
                  
                  {/* Interaction Card */}
                  <div className="bg-slate-50/50 hover:bg-white p-6 rounded-[1.5rem] border border-slate-100 hover:border-blue-200 transition-all hover:shadow-xl hover:shadow-blue-500/5 group">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          interaction.type === InteractionType.Interview ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                          interaction.type === InteractionType.Phone ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                          interaction.type === InteractionType.WhatsApp ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                          'bg-slate-200 text-slate-600'
                        }`}>
                          {interaction.type}
                        </span>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">
                        {new Date(interaction.timestamp).toLocaleString(language === 'he' ? 'he-IL' : 'en-US', {
                          day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed font-bold text-sm">
                      {interaction.summary}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-16 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                  </div>
                  <p className="text-slate-400 font-black">{language === 'he' ? 'אין תיעודי שיחות עדיין' : 'No interaction logs yet'}</p>
                </div>
              )}
            </div>

            <div className="mt-16 pt-10 border-t border-slate-100">
              <h4 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
                </div>
                {t(language, 'newInteraction')}
              </h4>
              <form onSubmit={handleSubmitInteraction} className="space-y-6">
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {Object.values(InteractionType).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewInteractionType(type)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl text-[10px] font-black border transition-all ${
                        newInteractionType === type 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 scale-105' 
                          : 'bg-white text-slate-500 border-slate-100 hover:border-blue-200'
                      }`}
                    >
                      <div className="mb-1">{getInteractionIcon(type)}</div>
                      <span className="truncate w-full text-center">{type}</span>
                    </button>
                  ))}
                </div>
                <div className="relative group">
                  <textarea 
                    value={newInteractionSummary} 
                    onChange={(e) => setNewInteractionSummary(e.target.value)} 
                    placeholder={t(language, 'summaryPlaceholder')} 
                    rows={3} 
                    className="w-full px-6 py-5 rounded-[1.5rem] border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none resize-none transition-all font-bold placeholder:text-slate-300"
                  />
                  <div className="absolute bottom-4 left-4 sm:left-auto sm:right-4 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={!newInteractionSummary.trim()}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-black px-8 py-3 rounded-xl shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center gap-2"
                    >
                      {t(language, 'saveInteraction')}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[200] backdrop-blur-sm p-4">
          <div className="bg-white max-w-sm w-full rounded-[2.5rem] shadow-2xl p-8 space-y-6">
            <h3 className="text-2xl font-black text-slate-800 text-center">{t(language, 'confirmDelete')}</h3>
            <p className="text-slate-500 text-center font-medium leading-relaxed">{t(language, 'confirmDeleteText').replace('{name}', formState.full_name)}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all">{t(language, 'cancel')}</button>
              <button onClick={() => onDelete(candidate.id)} className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95">{t(language, 'deleteCandidate')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateProfile;
