
import React, { useState, useRef, useEffect } from 'react';
import { Candidate, Source, Stage, Status } from '../types';
import { Language, t } from '../services/translations';

interface CandidateFormProps {
  institutionId: string;
  onSave: (candidate: Omit<Candidate, 'id'>) => void;
  onCancel: () => void;
  language: Language;
}

const CandidateForm: React.FC<CandidateFormProps> = ({ institutionId, onSave, onCancel, language }) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [originSchool, setOriginSchool] = useState('');
  const [status, setStatus] = useState<Status>(Status.Accepted);
  const [source, setSource] = useState<Source>(Source.Friend);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  // Logistics
  const [visitStart, setVisitStart] = useState('');
  const [visitEnd, setVisitEnd] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        setPhoto(dataUrl);
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
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) {
      alert(language === 'he' ? "אנא מלא שם מלא וטלפון" : "Please fill full name and phone");
      return;
    }
    onSave({
      institution_id: institutionId,
      full_name: fullName,
      phone,
      current_yeshiva: originSchool,
      source,
      stage: Stage.Initial,
      status,
      photo: photo || undefined,
      visit_start: visitStart || undefined,
      visit_end: visitEnd || undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="bg-[#003366] p-6 text-white flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-2xl font-black">{t(language, 'registration')}</h2>
          <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">{t(language, 'fullName')}</label>
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 outline-none transition font-bold"
                  placeholder={language === 'he' ? 'למשל: יוסף כהן' : 'e.g. John Doe'}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">{t(language, 'phone')}</label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 outline-none transition text-left font-mono"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">{t(language, 'currentInstitution')}</label>
                <input 
                  type="text" 
                  value={originSchool} 
                  onChange={e => setOriginSchool(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 outline-none transition"
                />
              </div>
            </div>

            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-40 h-40 bg-slate-100 rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 relative flex items-center justify-center">
                {photo ? (
                  <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                ) : isCameraOpen ? (
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                )}
              </div>
              
              <div className="flex flex-col gap-2 w-full">
                {!isCameraOpen ? (
                  <>
                    <button type="button" onClick={startCamera} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl transition flex items-center justify-center gap-2">
                       {photo ? t(language, 'retake') : t(language, 'takePhoto')}
                    </button>
                    <button type="button" onClick={triggerFileUpload} className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-4 py-2 rounded-xl transition flex items-center justify-center gap-2 text-xs">
                       {t(language, 'uploadPhoto')}
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  </>
                ) : (
                  <button type="button" onClick={capturePhoto} className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 rounded-xl transition shadow-lg animate-pulse w-full">
                    צלם
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-lg font-black text-[#003366] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              {t(language, 'visitDuration')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-500 mb-1 uppercase tracking-tighter">{t(language, 'visitStart')}</label>
                <input 
                  type="datetime-local" 
                  value={visitStart}
                  onChange={e => setVisitStart(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 outline-none transition font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 mb-1 uppercase tracking-tighter">{t(language, 'visitEnd')}</label>
                <input 
                  type="datetime-local" 
                  value={visitEnd}
                  onChange={e => setVisitEnd(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 outline-none transition font-bold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">{t(language, 'status')}</label>
              <select value={status} onChange={e => setStatus(e.target.value as Status)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none">
                {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">{t(language, 'source')}</label>
              <select value={source} onChange={e => setSource(e.target.value as Source)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none">
                {Object.values(Source).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <canvas ref={canvasRef} className="hidden" />

          <div className="flex gap-4 pt-4 sticky bottom-0 bg-white py-4 border-t border-slate-50">
             <button type="button" onClick={onCancel} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition">
               {t(language, 'cancel')}
             </button>
             <button type="submit" className="flex-1 py-4 bg-[#003366] text-white font-bold rounded-2xl shadow-xl hover:bg-blue-900 transition active:scale-[0.98]">
               {t(language, 'saveCandidate')}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CandidateForm;
