import React from 'react';
import {
  ArrowRight,
  Bookmark,
  BrainCircuit,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  Database,
  GraduationCap,
  MapPin,
  Phone,
  Sparkles,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { useCollege } from '../context/CollegeContext';
import type { ActiveTab } from '../types';

interface HomePageProps {
  onNavigate: (tab: ActiveTab) => void;
  onViewCourse: (courseId: number) => void;
  onOpenMatcher: () => void;
  onOpenCampusLife: () => void;
  onOpenPlacements: () => void;
}

export function HomePage({
  onNavigate,
  onViewCourse,
  onOpenMatcher,
  onOpenCampusLife,
  onOpenPlacements,
}: HomePageProps) {
  const { courses, collegeInfo, savedCourseIds, toggleSaveCourse } = useCollege();

  const featuredCourses = React.useMemo(() => {
    const featured = courses.filter((c) => c.featured);
    return featured.length > 0 ? featured : courses.slice(0, 3);
  }, [courses]);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0E1633] via-[#0B1126] to-[#080D1D] border border-slate-800/80 px-5 py-8 sm:px-10 sm:py-12">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-xs font-medium text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Next-Gen RAG Intelligence</span>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-white leading-tight [text-wrap:balance]">
            AI-Powered College Enquiry &amp; Admission Assistant
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Welcome to {collegeInfo?.institution_name || 'VET Institute of Arts & Science'}. Get
            instant, verified answers on academic courses, eligibility criteria, admission
            procedures, fee structures, scholarships, and campus facilities.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => onNavigate('chat')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white text-sm font-semibold shadow-lg shadow-indigo-950/60 transition-all whitespace-nowrap min-h-[44px]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask CollegeAI</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('courses')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-100 text-sm font-semibold transition-colors whitespace-nowrap min-h-[44px]"
            >
              <span>Explore Courses</span>
            </button>
          </div>

          {/* Grounded Knowledge Base Status Strip */}
          <div className="max-w-xl mx-auto pt-2">
            <div className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#0A1328] border border-emerald-500/30 text-xs text-slate-300">
              <Database className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                CollegeAI RAG Active ·{' '}
                <strong className="font-mono text-emerald-300">
                  {collegeInfo?.stats.rag_chunks ?? 23}
                </strong>{' '}
                Verified Knowledge Chunks · Gemini Grounded Retrieval
              </span>
            </div>
          </div>

          {/* 3-Column Highlight Metrics */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-3 max-w-2xl mx-auto">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#10172E] border border-slate-800/90 text-center space-y-1.5">
              <GraduationCap className="w-5 h-5 text-indigo-400 mx-auto" />
              <p className="text-xs sm:text-sm font-semibold text-white">
                {collegeInfo?.stats.accredited_degrees ?? 8}+ Accredited Degrees
              </p>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#10172E] border border-slate-800/90 text-center space-y-1.5">
              <TrendingUp className="w-5 h-5 text-emerald-400 mx-auto" />
              <p className="text-xs sm:text-sm font-semibold text-white">
                {collegeInfo?.stats.placement_rate ?? '94%'} Placement Success
              </p>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#10172E] border border-slate-800/90 text-center space-y-1.5">
              <BrainCircuit className="w-5 h-5 text-sky-400 mx-auto" />
              <p className="text-xs sm:text-sm font-semibold text-white">24/7 RAG Guidance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Services */}
      <section className="space-y-4">
        <h2 className="font-display text-lg sm:text-xl font-semibold text-white">Quick Services</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => onNavigate('apply')}
            className="p-4 rounded-2xl bg-[#10172B] hover:bg-[#141D36] border border-slate-800/90 flex items-center gap-3.5 text-left transition-colors group"
          >
            <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white group-hover:text-indigo-200 truncate">
                Apply Online
              </p>
              <p className="text-xs text-slate-400 truncate">Phase 2 open</p>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenCampusLife}
            className="p-4 rounded-2xl bg-[#10172B] hover:bg-[#141D36] border border-slate-800/90 flex items-center gap-3.5 text-left transition-colors group"
          >
            <div className="w-11 h-11 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-sky-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white group-hover:text-sky-200 truncate">
                Campus Life
              </p>
              <p className="text-xs text-slate-400 truncate">Hostel &amp; Fees</p>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenMatcher}
            className="p-4 rounded-2xl bg-[#10172B] hover:bg-[#141D36] border border-slate-800/90 flex items-center gap-3.5 text-left transition-colors group"
          >
            <div className="w-11 h-11 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
              <BrainCircuit className="w-5 h-5 text-rose-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white group-hover:text-rose-200 truncate">
                AI Matcher
              </p>
              <p className="text-xs text-slate-400 truncate">12th Stream Quiz</p>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenPlacements}
            className="p-4 rounded-2xl bg-[#10172B] hover:bg-[#141D36] border border-slate-800/90 flex items-center gap-3.5 text-left transition-colors group"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white group-hover:text-emerald-200 truncate">
                Placements
              </p>
              <p className="text-xs text-slate-400 truncate">Top recruiters</p>
            </div>
          </button>
        </div>
      </section>

      {/* Featured Academic Programs */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg sm:text-xl font-semibold text-white">
            Featured Academic Programs
          </h2>
          <button
            type="button"
            onClick={() => onNavigate('courses')}
            className="text-xs sm:text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View All
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredCourses.map((course) => {
            const isSaved = savedCourseIds.includes(course.id);
            return (
              <div
                key={course.id}
                className="p-5 rounded-2xl bg-[#10172B] border border-slate-800/90 flex flex-col justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                      {course.level} · {course.course_category}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleSaveCourse(course.id)}
                      aria-label={isSaved ? 'Remove from saved courses' : 'Save course'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isSaved
                          ? 'text-indigo-400 bg-indigo-500/15'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  <div>
                    <h3 className="font-display text-base sm:text-lg font-semibold text-white leading-snug">
                      {course.course_name}
                    </h3>
                    <p className="font-mono text-xs sm:text-sm text-sky-400 font-medium mt-1.5">
                      ₹{course.fee_numeric.toLocaleString('en-IN')} / semester · {course.duration}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">
                    {course.seats} Seats Intake
                  </span>
                  <button
                    type="button"
                    onClick={() => onViewCourse(course.id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <span>Explore</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Upcoming Campus Events & College Info */}
      <div className="grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-4">
          <h2 className="font-display text-lg sm:text-xl font-semibold text-white">
            Upcoming Campus Events
          </h2>
          <div className="space-y-3">
            {(collegeInfo?.events ?? []).map((event) => (
              <div
                key={event.id}
                className="p-4 sm:p-5 rounded-2xl bg-[#10172B] border border-slate-800/90 flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h3 className="font-display text-sm sm:text-base font-semibold text-white">
                      {event.title}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {event.date} · {event.venue}
                    </p>
                    <p className="text-xs text-slate-400/90 leading-relaxed pt-0.5">
                      {event.description}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-teal-500/15 border border-teal-500/30 text-[11px] font-medium text-teal-300 whitespace-nowrap shrink-0">
                  {event.tag}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Institution Contact & Info */}
        <section className="space-y-4">
          <h2 className="font-display text-lg sm:text-xl font-semibold text-white">
            College Information
          </h2>
          <div className="p-5 rounded-2xl bg-[#10172B] border border-slate-800/90 space-y-4 text-xs sm:text-sm">
            <div>
              <p className="font-display font-semibold text-white text-base">
                {collegeInfo?.institution_name || 'VET Institute of Arts & Science'}
              </p>
              <p className="text-slate-400 text-xs mt-0.5">
                {collegeInfo?.affiliation || 'Bharathiar University Affiliation'} · Session{' '}
                {collegeInfo?.academic_session || '2026–2027'}
              </p>
            </div>

            <div className="space-y-2.5 text-slate-300 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>{collegeInfo?.location || 'Thindal, Erode - 638012, Tamil Nadu'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-mono">
                  {collegeInfo?.admissions_phone || '+91-4294-224400'}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Admissions Desk: Mon–Sat, 9:00 AM – 5:00 PM</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('chat')}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-white transition-colors"
            >
              Ask Admissions Assistant
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
