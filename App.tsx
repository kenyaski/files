
import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronRight, 
  Clock, 
  LogOut,
  PanelLeftClose,
  PanelLeft,
  Moon,
  Sun,
  ShieldCheck
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import PDFPreview from './components/PDFPreview';
import BottomNav from './components/BottomNav';
import CourseSelection from './components/CourseSelection';
import AdminPanel from './components/AdminPanel';
import LecturerDashboard from './components/LecturerDashboard';
import SettingsView from './components/SettingsView';
import DigitalLibrary from './components/DigitalLibrary';
import MasterLogo from './components/MasterLogo';
import { Tab, FileMetadata, UsageStats, Course, UserRole } from './types';
import { DEPARTMENT_VAULTS, INITIAL_RESEARCH } from './constants';

const App: React.FC = () => {
  // Authentication & Identity
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Data State - Isolated per Session
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileMetadata | null>(null);
  const [vault, setVault] = useState<FileMetadata[]>([]);
  const [research, setResearch] = useState<FileMetadata[]>([]);
  const [usage, setUsage] = useState<UsageStats>({ used: 0, total: 1000 });
  
  // UI State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);

  // Sync Dark Mode Class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth > 1024;
      setIsDesktop(desktop);
      if (!desktop && activeTab === 'chat' && isSidebarCollapsed) {
        setIsSidebarCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab, isSidebarCollapsed]);

  // Strictly bind Vault to Selected Course
  useEffect(() => {
    if (selectedCourse) {
      setVault(DEPARTMENT_VAULTS[selectedCourse.id] || []);
      setSelectedFile(null); // Deselect file when course changes to prevent context overlap
    } else {
      setVault([]);
    }
  }, [selectedCourse]);

  // CRITICAL: Session Reset Logic
  const resetSession = useCallback(() => {
    setIsTransitioning(true);
    // Absolute wipe of all user-specific data
    setSelectedFile(null);
    setResearch([]);
    setVault([]);
    setSelectedCourse(null);
    setUsage({ used: 0, total: 1000 });
    setActiveTab('chat');
    
    // Clear transient caches
    sessionStorage.clear();
    
    setTimeout(() => setIsTransitioning(false), 400);
  }, []);

  const handleLogout = () => {
    resetSession();
    setIsAuthenticated(false);
  };

  const handleAuthSuccess = (role: UserRole, preselectedCourse?: Course) => {
    // Ensure fresh start before authorizing new role
    resetSession();
    
    setUserRole(role);
    setIsAuthenticated(true);
    
    // Initialize session-specific data for Student role
    if (role === 'student') {
      setResearch([...INITIAL_RESEARCH]);
      setUsage({ used: 0, total: 1000 });
    }

    if (preselectedCourse) {
      setSelectedCourse(preselectedCourse);
    }
  };

  const handleFilesAdded = (files: FileList | null) => {
    if (!files || !isAuthenticated) return;
    
    const newFiles: FileMetadata[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type.includes('pdf') ? 'pdf' : (file.type.includes('image') ? 'image' : 'doc'),
      source: userRole === 'student' ? 'personal' : 'institutional',
      tags: [userRole === 'student' ? 'Upload' : 'Institutional', 'NEW'],
      content: `Extracted content from ${file.name}. This institutional asset is now indexed for AI retrieval and cross-referencing within the ${selectedCourse?.name || 'Academic'} context.`
    }));

    if (userRole === 'student') setResearch(prev => [...newFiles, ...prev]);
    else setVault(prev => [...prev, ...newFiles]);
  };

  const handleFileDelete = (id: string) => {
    setVault(prev => prev.filter(f => f.id !== id));
  };

  const handleFileUpdate = (id: string, updates: Partial<FileMetadata>) => {
    setVault(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Gatekeeper: Authentication Layer
  if (!isAuthenticated) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <CourseSelection 
          onSelect={setSelectedCourse} 
          onAuthSuccess={handleAuthSuccess}
          role={userRole} 
          setRole={setUserRole} 
        />
      </div>
    );
  }

  // Gatekeeper: Course Selection for Non-Admins
  if (isAuthenticated && !selectedCourse && userRole !== 'admin') {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <CourseSelection 
          onSelect={setSelectedCourse} 
          onAuthSuccess={handleAuthSuccess}
          role={userRole} 
          setRole={setUserRole}
          forceShowCourses={true}
        />
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen overflow-hidden transition-colors ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Session Transition Overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 z-[200] bg-[#064e3b] dark:bg-[#022c22] flex flex-col items-center justify-center animate-in fade-in duration-300">
          <ShieldCheck className="w-16 h-16 text-yellow-400 animate-pulse mb-4" />
          <p className="text-white font-black uppercase tracking-[0.3em] text-xs">Purging Private Node Data...</p>
        </div>
      )}

      {/* Universal Institutional Header */}
      <header className="h-16 bg-[#064e3b] dark:bg-[#022c22] text-white flex items-center justify-between px-4 lg:px-8 border-b border-white/10 z-50 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <MasterLogo size={44} />
          </div>
          <div className="min-w-0">
            <h1 className="font-black text-lg tracking-tighter hidden sm:block">NNP-GPT</h1>
            <div className="flex items-center text-[10px] text-yellow-100/70 uppercase tracking-widest font-black overflow-hidden truncate">
              <span className="opacity-60 hidden sm:inline">{userRole.toUpperCase()} NODE</span>
              <ChevronRight className="w-3 h-3 hidden sm:inline" />
              <span className="text-white truncate">{userRole === 'admin' ? 'Campus Oversight' : selectedCourse?.name}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all border border-white/10 shadow-sm"
            title="Toggle Light/Dark Mode"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
          </button>
          
          {isDesktop && userRole === 'student' && (
             <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 text-yellow-400 border border-white/10"
              title="Toggle Knowledge Tray"
             >
               {isSidebarCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
             </button>
          )}
          <div className="hidden sm:flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full text-[10px] font-bold border border-white/10 text-yellow-100 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-[#facc15]" />
            Session Isolated
          </div>
          <button onClick={handleLogout} className="p-2.5 bg-red-500/10 text-white rounded-xl hover:bg-red-500/20 transition-all border border-red-500/20 group">
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </header>

      {/* Adaptive Workspace Grid */}
      <main className="flex-1 flex overflow-hidden relative">
        {userRole === 'admin' ? (
          <AdminPanel />
        ) : userRole === 'lecturer' ? (
          selectedCourse && (
            <LecturerDashboard 
              course={selectedCourse} 
              vault={vault} 
              onUpload={handleFilesAdded} 
              onDelete={handleFileDelete}
              onUpdate={handleFileUpdate}
              onBack={() => setSelectedCourse(null)}
            />
          )
        ) : (
          /* Student Adaptive Isolated View */
          <>
            {isDesktop && !isSidebarCollapsed && (
              <div className="w-[20%] border-r dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 flex flex-col animate-in slide-in-from-left duration-300">
                <Sidebar 
                  vault={vault} 
                  research={research} 
                  usage={usage} 
                  selectedCourse={selectedCourse}
                  onSelect={(file) => setSelectedFile(file)} 
                  onUpload={handleFilesAdded}
                />
              </div>
            )}

            <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-hidden relative">
              {!isDesktop && activeTab === 'library' ? (
                <DigitalLibrary course={selectedCourse} vault={vault} />
              ) : (!isDesktop && activeTab === 'settings') ? (
                <SettingsView userRole={userRole} onRoleSwitch={handleLogout} isDarkMode={isDarkMode} onToggleDarkMode={toggleTheme} />
              ) : isDesktop && activeTab === 'library' ? (
                <DigitalLibrary course={selectedCourse} vault={vault} />
              ) : isDesktop && activeTab === 'settings' ? (
                <SettingsView userRole={userRole} onRoleSwitch={handleLogout} isDarkMode={isDarkMode} onToggleDarkMode={toggleTheme} />
              ) : (
                <ChatInterface 
                  vault={vault}
                  selectedFile={selectedFile} 
                  onFileDeselect={() => setSelectedFile(null)}
                  onUsageUpdate={(increment) => setUsage(prev => ({ ...prev, used: prev.used + increment }))}
                  courseName={selectedCourse?.name || 'General'}
                />
              )}
            </div>

            {isDesktop && activeTab === 'chat' && (
              <div className="w-[30%] border-l dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col shrink-0 animate-in slide-in-from-right duration-300">
                <PDFPreview file={selectedFile} />
              </div>
            )}

            {!isDesktop && selectedFile && activeTab === 'chat' && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end">
                <div className="bg-white dark:bg-slate-900 w-full rounded-t-[32px] h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300 border-t border-white/10">
                  <div className="h-1.5 w-12 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto my-3" />
                  <div className="flex-1 overflow-hidden">
                    <PDFPreview file={selectedFile} onManualClose={() => setSelectedFile(null)} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {!isDesktop && userRole === 'student' && (
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
      
      {isDesktop && userRole === 'student' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#064e3b] dark:bg-[#022c22] px-6 py-2.5 rounded-full flex items-center gap-8 shadow-2xl border border-white/10 z-[100] scale-90 hover:scale-100 transition-all">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'chat' ? 'text-yellow-400' : 'text-white/60 hover:text-white'}`}
          >
            Chat
          </button>
          <button 
            onClick={() => setActiveTab('library')}
            className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'library' ? 'text-yellow-400' : 'text-white/60 hover:text-white'}`}
          >
            Library
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'settings' ? 'text-yellow-400' : 'text-white/60 hover:text-white'}`}
          >
            Settings
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
