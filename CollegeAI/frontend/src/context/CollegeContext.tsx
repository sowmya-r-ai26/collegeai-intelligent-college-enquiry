import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import type { Application, CollegeInfo, Course, LanguageCode } from '../types';

interface VerifiedApplicant {
  full_name: string;
  email: string;
  mobile_number: string;
  is_demo: boolean;
}

interface CollegeContextValue {
  courses: Course[];
  coursesLoading: boolean;
  collegeInfo: CollegeInfo | null;
  savedCourseIds: number[];
  recentCourseIds: number[];
  toggleSaveCourse: (courseId: number) => void;
  recordViewedCourse: (courseId: number) => void;
  chatSessionId: string;
  enquiryCount: number;
  incrementEnquiryCount: () => void;
  verifiedApplicant: VerifiedApplicant | null;
  verifiedApplications: Application[];
  unlockDashboard: (contact: string, applicationNumber?: string) => Promise<void>;
  lockDashboard: () => void;
  registerSubmittedApplication: (app: Application) => void;
  language: LanguageCode;
  toggleLanguage: () => void;
}

const CollegeContext = createContext<CollegeContextValue | undefined>(undefined);

const SAVED_KEY = 'collegeai_saved_courses';
const RECENT_KEY = 'collegeai_recent_courses';
const SESSION_KEY = 'collegeai_chat_session_id';
const ENQUIRY_COUNT_KEY = 'collegeai_enquiry_count';
const VERIFIED_CONTACT_KEY = 'collegeai_verified_contact';

function getOrCreateSessionId(): string {
  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const fresh = `vetias-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
  localStorage.setItem(SESSION_KEY, fresh);
  return fresh;
}

export function CollegeProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [collegeInfo, setCollegeInfo] = useState<CollegeInfo | null>(null);
  const [language, setLanguage] = useState<LanguageCode>('EN');

  const [savedCourseIds, setSavedCourseIds] = useState<number[]>(() => {
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === 'number');
      }
    } catch {
      // ignore
    }
    return [1, 2]; // Initial featured bookmarks matching screenshots
  });

  const [recentCourseIds, setRecentCourseIds] = useState<number[]>(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === 'number');
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [enquiryCount, setEnquiryCount] = useState<number>(() => {
    const val = Number(localStorage.getItem(ENQUIRY_COUNT_KEY) || '0');
    return Number.isFinite(val) ? val : 0;
  });

  const [verifiedApplicant, setVerifiedApplicant] = useState<VerifiedApplicant | null>(null);
  const [verifiedApplications, setVerifiedApplications] = useState<Application[]>([]);

  const chatSessionId = useMemo(() => getOrCreateSessionId(), []);

  useEffect(() => {
    let active = true;
    async function loadInitial() {
      try {
        const [courseRes, infoRes] = await Promise.all([
          api.getCourses(),
          api.getCollegeInfo(),
        ]);
        if (!active) return;
        setCourses(courseRes.courses);
        setCollegeInfo(infoRes);
      } catch (err) {
        console.error('Failed to bootstrap CollegeAI metadata:', err);
      } finally {
        if (active) setCoursesLoading(false);
      }
    }
    loadInitial();

    // Restore verified dashboard session if previously unlocked in this browser
    const savedContact = localStorage.getItem(VERIFIED_CONTACT_KEY);
    if (savedContact) {
      api
        .verifyDashboardAccess(savedContact)
        .then((res) => {
          if (!active) return;
          setVerifiedApplicant(res.applicant);
          setVerifiedApplications(res.applications);
        })
        .catch(() => {
          localStorage.removeItem(VERIFIED_CONTACT_KEY);
        });
    }

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(SAVED_KEY, JSON.stringify(savedCourseIds));
  }, [savedCourseIds]);

  useEffect(() => {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recentCourseIds));
  }, [recentCourseIds]);

  const toggleSaveCourse = (courseId: number) => {
    setSavedCourseIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId],
    );
  };

  const recordViewedCourse = (courseId: number) => {
    setRecentCourseIds((prev) => [courseId, ...prev.filter((id) => id !== courseId)].slice(0, 5));
  };

  const incrementEnquiryCount = () => {
    setEnquiryCount((prev) => {
      const next = prev + 1;
      localStorage.setItem(ENQUIRY_COUNT_KEY, String(next));
      return next;
    });
  };

  const unlockDashboard = async (contact: string, applicationNumber?: string) => {
    const res = await api.verifyDashboardAccess(contact, applicationNumber);
    setVerifiedApplicant(res.applicant);
    setVerifiedApplications(res.applications);
    localStorage.setItem(VERIFIED_CONTACT_KEY, contact.trim());
  };

  const lockDashboard = () => {
    setVerifiedApplicant(null);
    setVerifiedApplications([]);
    localStorage.removeItem(VERIFIED_CONTACT_KEY);
  };

  const registerSubmittedApplication = (app: Application) => {
    setVerifiedApplicant({
      full_name: app.full_name,
      email: app.email,
      mobile_number: app.mobile_number,
      is_demo: false,
    });
    setVerifiedApplications((prev) => {
      const others = prev.filter((a) => a.application_number !== app.application_number);
      return [app, ...others];
    });
    localStorage.setItem(VERIFIED_CONTACT_KEY, app.email);
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'EN' ? 'TA' : 'EN'));
  };

  return (
    <CollegeContext.Provider
      value={{
        courses,
        coursesLoading,
        collegeInfo,
        savedCourseIds,
        recentCourseIds,
        toggleSaveCourse,
        recordViewedCourse,
        chatSessionId,
        enquiryCount,
        incrementEnquiryCount,
        verifiedApplicant,
        verifiedApplications,
        unlockDashboard,
        lockDashboard,
        registerSubmittedApplication,
        language,
        toggleLanguage,
      }}
    >
      {children}
    </CollegeContext.Provider>
  );
}

export function useCollege() {
  const ctx = useContext(CollegeContext);
  if (!ctx) throw new Error('useCollege must be used within CollegeProvider');
  return ctx;
}
