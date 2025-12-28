
import React from 'react';

const Paywall: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/95 flex items-center justify-center z-50 backdrop-blur-sm p-4 text-right" dir="rtl">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl p-10 space-y-8 animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-6h.01M10 12h.01M12 18a9 9 0 110-18 9 9 0 010 18zM12 9h.01"/></svg>
        </div>
        
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">תקופת הניסיון הסתיימה</h2>
          <p className="text-slate-500 leading-relaxed">
            ישיבת Leads הופכת את ניהול הרישום ליעיל ופשוט יותר. כדי להמשיך ליהנות מכלים מתקדמים, ניתוח AI ומעקב צמוד אחרי המועמדים שלכם, יש להוסיף אמצעי תשלום.
          </p>
        </div>

        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
          <h4 className="font-bold text-slate-700 mb-2">למה לשדרג?</h4>
          <ul className="text-sm text-slate-600 space-y-2">
            <li className="flex items-center gap-2">✅ ניהול בלתי מוגבל של מועמדים</li>
            <li className="flex items-center gap-2">✅ ניתוח סיכויי קבלה מבוסס בינה מלאכותית</li>
            <li className="flex items-center gap-2">✅ תמיכה בריבוי משתמשים (צוותי רישום)</li>
            <li className="flex items-center gap-2">✅ אבטחת מידע וגיבוי מלא</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-[0.98]">
            הוסף אמצעי תשלום והמשך (Paywall)
          </button>
          <button 
            onClick={onRetry}
            className="w-full text-slate-400 hover:text-slate-600 text-sm py-2 font-medium"
          >
            נסה להתחבר מחדש
          </button>
        </div>
        
        <p className="text-center text-[10px] text-slate-400">
          לשאלות נוספות: support@yeshivaleads.co.il
        </p>
      </div>
    </div>
  );
};

export default Paywall;
