import React from 'react';
import {
  Download,
  Globe,
  GraduationCap,
  Home,
  LayoutGrid,
  Sparkles,
  User,
  UserCheck,
} from 'lucide-react';
import { useCollege } from '../context/CollegeContext';
import type { ActiveTab } from '../types';

interface MainLayoutProps {
  activeTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  onOpenExportModal: () => void;
  children: React.ReactNode;
}

export function MainLayout({
  activeTab,
  onNavigate,
  onOpenExportModal,
  children,
}: MainLayoutProps) {
  const { language, toggleLanguage, verifiedApplicant } = useCollege();

  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ReactNode }> = [
    { id: 'home', label: language === 'TA' ? 'முகப்பு' : 'Home', icon: <Home className="w-5 h-5" /> },
    {
      id: 'courses',
      label: language === 'TA' ? 'படிப்புகள்' : 'Courses',
      icon: <GraduationCap className="w-5 h-5" />,
    },
    {
      id: 'chat',
      label: language === 'TA' ? 'AI உதவி' : 'Ask CollegeAI',
      icon: <Sparkles className="w-5 h-5" />,
    },
    {
      id: 'apply',
      label: language === 'TA' ? 'விண்ணப்பம்' : 'Apply',
      icon: <UserCheck className="w-5 h-5" />,
    },
    {
      id: 'dashboard',
      label: language === 'TA' ? 'டாஷ்போர்டு' : 'Dashboard',
      icon: <LayoutGrid className="w-5 h-5" />,
    },
  ];

  const isCourseSection = activeTab === 'courses' || activeTab === 'course-detail';

  return (
    <div className="min-h-screen bg-[#060A17] text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#080D1F]/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
          {/* Zone 1: Brand Lockup */}
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-950/50 shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-base sm:text-lg tracking-tight text-white whitespace-nowrap">
                  CollegeAI
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 whitespace-nowrap">
                  VETIAS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[175px] sm:max-w-none">
                VET Institute of Arts &amp; Science
              </p>
            </div>
          </button>

          {/* Zone 2: Desktop Single-Line Navigation */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium"
          >
            {navItems.map((item) => {
              const isActive =
                item.id === 'courses' ? isCourseSection : activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={`whitespace-nowrap shrink-0 py-1.5 border-b-2 transition-colors ${
                    isActive
                      ? 'text-white border-indigo-500'
                      : 'text-slate-400 border-transparent hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Language & Primary Action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={toggleLanguage}
              title="Toggle EN / Tamil Labels"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-medium text-slate-200 hover:border-slate-600 transition-colors whitespace-nowrap shrink-0 min-h-[38px]"
            >
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>{language}</span>
            </button>

            <button
              type="button"
              onClick={onOpenExportModal}
              title="Download Full-Stack Source Code (ZIP)"
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-medium text-slate-200 hover:border-indigo-500/60 hover:text-white transition-colors whitespace-nowrap shrink-0 min-h-[38px]"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Source Code</span>
              <span className="sm:hidden">ZIP</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-indigo-500/15 border border-indigo-500/40 text-xs font-medium text-indigo-200 hover:bg-indigo-500/25 transition-colors whitespace-nowrap shrink-0 min-h-[38px]"
            >
              <User className="w-3.5 h-3.5 text-indigo-300" />
              <span>{verifiedApplicant ? verifiedApplicant.full_name.split(' ')[0] : 'Student'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-12">
        {children}
      </main>

      {/* Desktop Footer */}
      <footer className="hidden md:block border-t border-slate-800/70 bg-[#070B1A] py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            <span className="text-slate-200 font-medium">VET Institute of Arts &amp; Science (VETIAS)</span>
            <span className="mx-2">·</span>
            <span>Thindal, Erode - 638012, Tamil Nadu · Bharathiar University Affiliation</span>
          </div>
          <div className="flex items-center gap-5">
            <span>Admissions: admissions@vetias.edu.in</span>
            <span>Helpline: +91-4294-224400</span>
            <button
              type="button"
              onClick={onOpenExportModal}
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Download Full-Stack ZIP
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar matching PDF Screenshots */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A1024]/95 backdrop-blur-md border-t border-slate-800/90 px-2"
      >
        <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className={`flex flex-col items-center justify-center gap-1 min-h-[44px] transition-colors ${
              activeTab === 'home' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[11px] font-medium">Home</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('courses')}
            className={`flex flex-col items-center justify-center gap-1 min-h-[44px] transition-colors ${
              isCourseSection ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-5 h-5" />
            <span className="text-[11px] font-medium">Courses</span>
          </button>

          {/* Elevated Center AI Sparkle Button */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => onNavigate('chat')}
              aria-label="Ask CollegeAI Chatbot"
              className={`-mt-6 w-14 h-14 rounded-full bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/60 border-4 border-[#060A17] transition-transform active:scale-95 ${
                activeTab === 'chat' ? 'ring-2 ring-sky-300' : ''
              }`}
            >
              <Sparkles className="w-6 h-6 text-white" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('apply')}
            className={`flex flex-col items-center justify-center gap-1 min-h-[44px] transition-colors ${
              activeTab === 'apply' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-5 h-5" />
            <span className="text-[11px] font-medium">Apply</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className={`flex flex-col items-center justify-center gap-1 min-h-[44px] transition-colors ${
              activeTab === 'dashboard' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="text-[11px] font-medium">Dashboard</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
