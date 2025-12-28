
import React, { useState } from 'react';
import { Language, t } from '../services/translations';

interface LayoutProps {
  children: React.ReactNode;
  institutionName: string;
  onNavigate: (view: any) => void;
  activeView: string;
  user?: { name: string; email: string; avatar: string } | null;
  onLogout?: () => void;
  language: Language;
  onToggleLanguage: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, institutionName, onNavigate, activeView, user, onLogout, language, onToggleLanguage }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dir = language === 'he' ? 'rtl' : 'ltr';

  return (
    <div className={`min-h-screen flex flex-col md:flex-row bg-[#F5F7FA]`} dir={dir}>
      {/* Mobile Top Bar */}
      <header className="md:hidden bg-[#003366] text-white p-4 flex justify-between items-center sticky top-0 z-[60] shadow-lg">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-black">{t(language, 'appName')}</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"/></svg>
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 ${language === 'he' ? 'right-0' : 'left-0'} z-[55] w-72 bg-[#003366] text-white p-6 shadow-2xl transition-transform duration-300 md:relative md:translate-x-0 flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : (language === 'he' ? 'translate-x-full' : '-translate-x-full') + ' md:translate-x-0'}
      `}>
        <div className="mb-8">
          <h2 className="text-2xl font-black text-blue-400 mb-1">{institutionName}</h2>
          <p className="text-blue-200 text-xs opacity-60">{user?.email}</p>
        </div>

        <nav className="space-y-2 flex-1">
          <button onClick={() => onNavigate('dashboard')} className={`w-full text-right px-4 py-3 rounded-xl flex items-center gap-3 ${activeView === 'dashboard' ? 'bg-white/10' : 'hover:bg-white/5'}`}>
            <span className="font-bold">{t(language, 'managerHome')}</span>
          </button>
          <button onClick={() => onNavigate('candidates')} className={`w-full text-right px-4 py-3 rounded-xl flex items-center gap-3 ${activeView === 'candidates' ? 'bg-white/10' : 'hover:bg-white/5'}`}>
            <span className="font-bold">{t(language, 'candidates')}</span>
          </button>
          <button onClick={() => onNavigate('rosh-yeshiva')} className={`w-full text-right px-4 py-3 rounded-xl flex items-center gap-3 ${activeView === 'rosh-yeshiva' ? 'bg-white/10' : 'hover:bg-white/5'}`}>
            <span className="font-bold">{t(language, 'managementHome')}</span>
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10 space-y-2">
          <button onClick={onLogout} className="w-full text-right px-4 py-3 rounded-xl flex items-center gap-3 hover:bg-red-500/20 text-red-200 transition">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
             <span className="font-bold">{t(language, 'logout')}</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto h-screen bg-[#F5F7FA]">
        {children}
      </main>
    </div>
  );
};

export default Layout;
