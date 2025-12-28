
import React, { useState, useEffect } from 'react';
import { syncToSheets, fetchFromSheets } from './services/api';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CandidateList from './components/CandidateList';
import CandidateProfile from './components/CandidateProfile';
import CandidateForm from './components/CandidateForm';
import Settings from './components/Settings';
import RoshYeshivaDashboard from './components/RoshYeshivaDashboard';
import AuthScreen from './components/AuthScreen';
import AdminLogin from './components/AdminLogin';
import SuperAdminPanel from './components/SuperAdminPanel';
import { Candidate, Interaction, InteractionType, Institution } from './types';
import { Language } from './services/translations';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'candidates' | 'settings' | 'profile' | 'superadmin' | 'rosh-yeshiva'>('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentInstitution, setCurrentInstitution] = useState<Institution | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [language, setLanguage] = useState<Language>('he');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // בדיקת Session קיים בטעינה
  useEffect(() => {
    const savedInst = localStorage.getItem('active_institution');
    if (savedInst) {
      const inst = JSON.parse(savedInst);
      setCurrentInstitution(inst);
      setIsAuthenticated(true);
    }
  }, []);

  // טעינת נתונים מסוננים לפי המוסד המחובר
  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated && currentInstitution) {
        setIsLoading(true);
        try {
          // fetchFromSheets כבר מקבל את ה-institutionId ומסנן בשרת
          const data = await fetchFromSheets(currentInstitution.id);
          if (data) {
            setCandidates(data.candidates || []);
            setInteractions(data.interactions || []);
            setLastSyncTime(new Date());
            setDbConnected(true);
          }
        } catch (e) {
          setDbConnected(false);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadData();
  }, [isAuthenticated, currentInstitution?.id]);

  const handleLogin = (inst: Institution) => {
    setCurrentInstitution(inst);
    setIsAuthenticated(true);
    localStorage.setItem('active_institution', JSON.stringify(inst));
  };

  const handleLogout = () => {
    setCurrentInstitution(null);
    setIsAuthenticated(false);
    localStorage.removeItem('active_institution');
    setCandidates([]);
    setInteractions([]);
    setActiveView('dashboard');
  };

  const handleSaveCandidate = async (data: Omit<Candidate, 'id'>) => {
    if (!currentInstitution) return;
    
    // בידוד נתונים: תיוג אוטומטי של המועמד למוסד הנוכחי
    const newCandidate: Candidate = { 
      ...data, 
      id: `cand-${Date.now()}`,
      institution_id: currentInstitution.id 
    };
    
    setCandidates([newCandidate, ...candidates]);
    await syncToSheets('saveCandidate', newCandidate);
    setActiveView('candidates');
  };

  const handleAddInteraction = async (type: InteractionType, summary: string) => {
    if (!selectedCandidate || !currentInstitution) return;
    
    const newInt: Interaction = {
      id: `int-${Date.now()}`,
      candidate_id: selectedCandidate.id,
      institution_id: currentInstitution.id, // תיוג מוסד
      type,
      summary,
      timestamp: new Date().toISOString()
    };
    
    setInteractions([newInt, ...interactions]);
    await syncToSheets('saveInteraction', newInt);
  };

  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} language={language} onToggleLanguage={() => setLanguage(l => l === 'he' ? 'en' : 'he')} />;
  }

  return (
    <div className="relative">
      <Layout 
        institutionName={currentInstitution?.name || ''} 
        activeView={activeView === 'profile' ? 'candidates' : activeView} 
        onNavigate={setActiveView}
        user={{ name: 'מנהל מוסד', email: currentInstitution?.email || '', avatar: 'https://ui-avatars.com/api/?name=Admin' }}
        onLogout={handleLogout}
        language={language}
        onToggleLanguage={() => setLanguage(l => l === 'he' ? 'en' : 'he')}
      >
        {activeView === 'dashboard' && <Dashboard candidates={candidates} institution={currentInstitution!} language={language} lastSync={lastSyncTime} />}
        {activeView === 'candidates' && <CandidateList candidates={candidates} interactions={interactions} onSelect={(c) => { setSelectedCandidate(c); setActiveView('profile'); }} onDelete={(id) => setCandidates(c => c.filter(x => x.id !== id))} onAdd={() => setActiveView('dashboard')} language={language} />}
        {activeView === 'rosh-yeshiva' && <RoshYeshivaDashboard candidates={candidates} interactions={interactions} institution={currentInstitution!} language={language} />}
        {activeView === 'profile' && selectedCandidate && (
          <CandidateProfile 
            candidate={selectedCandidate} 
            interactions={interactions.filter(i => i.candidate_id === selectedCandidate.id)} 
            institution={currentInstitution!} 
            onAddInteraction={handleAddInteraction} 
            onUpdate={(u) => setCandidates(prev => prev.map(c => c.id === u.id ? u : c))}
            onDelete={(id) => setCandidates(prev => prev.filter(c => c.id !== id))} 
            onBack={() => setActiveView('candidates')} 
            language={language} 
          />
        )}
        {activeView === 'settings' && <Settings institution={currentInstitution!} onUpdate={u => setCurrentInstitution(prev => ({...prev, ...u}))} language={language} lastSync={lastSyncTime} onRefetch={() => {}} />}
      </Layout>
    </div>
  );
};

export default App;
