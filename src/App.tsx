/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState } from 'react';
import {
  AiMatcherModal,
  CampusLifeModal,
  ExportProjectModal,
  PlacementsModal,
} from './components/Modals';
import { CollegeProvider } from './context/CollegeContext';
import { MainLayout } from './layouts/MainLayout';
import { ApplyPage } from './pages/ApplyPage';
import { ChatbotPage } from './pages/ChatbotPage';
import { CourseDetailsPage } from './pages/CourseDetailsPage';
import { CoursesPage } from './pages/CoursesPage';
import { DashboardPage } from './pages/DashboardPage';
import { HomePage } from './pages/HomePage';
import type { ActiveTab, ApplySubTab } from './types';

function CollegeAIApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedCourseId, setSelectedCourseId] = useState<number>(1);
  const [applyCourseId, setApplyCourseId] = useState<number | null>(null);
  const [applySubTab, setApplySubTab] = useState<ApplySubTab>('form');
  const [queuedAiPrompt, setQueuedAiPrompt] = useState<string | null>(null);

  const [showMatcher, setShowMatcher] = useState(false);
  const [showCampusLife, setShowCampusLife] = useState(false);
  const [showPlacements, setShowPlacements] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const navigateToCourse = (courseId: number) => {
    setSelectedCourseId(courseId);
    setActiveTab('course-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToApply = (courseId?: number) => {
    setApplyCourseId(courseId ?? null);
    setApplySubTab('form');
    setActiveTab('apply');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const askAi = (question: string) => {
    setQueuedAiPrompt(question);
    setActiveTab('chat');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (tab: ActiveTab) => {
    if (tab === 'apply') {
      setApplySubTab('form');
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MainLayout
      activeTab={activeTab}
      onNavigate={handleNavigate}
      onOpenExportModal={() => setShowExport(true)}
    >
      {activeTab === 'home' && (
        <HomePage
          onNavigate={handleNavigate}
          onViewCourse={navigateToCourse}
          onOpenMatcher={() => setShowMatcher(true)}
          onOpenCampusLife={() => setShowCampusLife(true)}
          onOpenPlacements={() => setShowPlacements(true)}
        />
      )}

      {activeTab === 'courses' && (
        <CoursesPage
          onViewCourse={navigateToCourse}
          onApplyCourse={(id) => navigateToApply(id)}
          onOpenMatcher={() => setShowMatcher(true)}
        />
      )}

      {activeTab === 'course-detail' && (
        <CourseDetailsPage
          courseId={selectedCourseId}
          onBack={() => handleNavigate('courses')}
          onApplyCourse={(id) => navigateToApply(id)}
          onAskAiAboutCourse={askAi}
        />
      )}

      {activeTab === 'chat' && (
        <ChatbotPage
          queuedPrompt={queuedAiPrompt}
          onClearQueuedPrompt={() => setQueuedAiPrompt(null)}
        />
      )}

      {activeTab === 'apply' && (
        <ApplyPage
          initialCourseId={applyCourseId}
          initialSubTab={applySubTab}
          onOpenDashboard={() => handleNavigate('dashboard')}
        />
      )}

      {activeTab === 'dashboard' && (
        <DashboardPage
          onViewCourse={navigateToCourse}
          onNavigateApply={() => navigateToApply()}
        />
      )}

      {showMatcher && (
        <AiMatcherModal
          onClose={() => setShowMatcher(false)}
          onSelectCourse={navigateToCourse}
          onApplyCourse={(id) => navigateToApply(id)}
        />
      )}

      {showCampusLife && (
        <CampusLifeModal onClose={() => setShowCampusLife(false)} onAskAi={askAi} />
      )}

      {showPlacements && (
        <PlacementsModal onClose={() => setShowPlacements(false)} onAskAi={askAi} />
      )}

      {showExport && <ExportProjectModal onClose={() => setShowExport(false)} />}
    </MainLayout>
  );
}

export default function App() {
  return (
    <CollegeProvider>
      <CollegeAIApp />
    </CollegeProvider>
  );
}
