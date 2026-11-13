import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Briefcase,
  CheckCircle2,
  Clock,
  GraduationCap,
  Loader2,
  Sparkles,
  Users,
} from 'lucide-react';
import { useCollege } from '../context/CollegeContext';
import { api } from '../services/api';
import type { Course } from '../types';

interface CourseDetailsPageProps {
  courseId: number;
  onBack: () => void;
  onApplyCourse: (courseId: number) => void;
  onAskAiAboutCourse: (courseName: string) => void;
}

export function CourseDetailsPage({
  courseId,
  onBack,
  onApplyCourse,
  onAskAiAboutCourse,
}: CourseDetailsPageProps) {
  const { savedCourseIds, toggleSaveCourse, recordViewedCourse } = useCollege();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    api
      .getCourseById(courseId)
      .then((res) => {
        if (!active) return;
        setCourse(res.course);
        recordViewedCourse(res.course.id);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load course details.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 gap-2.5 text-sm">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
        <span>Loading course details...</span>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-8 rounded-2xl bg-[#10172B] border border-slate-800 text-center space-y-4">
        <AlertCircle className="w-7 h-7 text-rose-400 mx-auto" />
        <p className="text-sm text-rose-200">{error || 'Course not found.'}</p>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
        >
          Back to Academic Programs
        </button>
      </div>
    );
  }

  const isSaved = savedCourseIds.includes(course.id);

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Academic Programs</span>
      </button>

      {/* Main Details Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#10172B] border border-slate-800/90 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-semibold">
                {course.level} Program
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-300 font-medium">{course.course_category}</span>
              <span className="text-slate-400">·</span>
              <span className="font-mono text-slate-400">{course.code}</span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight">
              {course.course_name}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => toggleSaveCourse(course.id)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${
              isSaved
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
            }`}
          >
            <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
            <span>{isSaved ? 'Saved Course' : 'Save Course'}</span>
          </button>
        </div>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">{course.description}</p>

        {/* Key Verified Metrics */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#0A1022] border border-slate-800">
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-sky-400" />
              <span>Verified Tuition Fee</span>
            </p>
            <p className="font-mono text-lg font-bold text-sky-400 mt-1.5">{course.fees}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0A1022] border border-slate-800">
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Program Duration</span>
            </p>
            <p className="text-lg font-bold text-white mt-1.5">{course.duration}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0A1022] border border-slate-800">
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Annual Intake</span>
            </p>
            <p className="font-mono text-lg font-bold text-white mt-1.5">{course.seats} Seats</p>
          </div>
        </div>

        {/* Eligibility & Career Opportunities */}
        <div className="grid md:grid-cols-2 gap-6 pt-2">
          <div className="p-5 rounded-2xl bg-[#0A1022] border border-slate-800 space-y-2.5">
            <h2 className="font-display text-base font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Admission Eligibility</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {course.eligibility}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0A1022] border border-slate-800 space-y-3">
            <h2 className="font-display text-base font-semibold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              <span>Career Opportunities</span>
            </h2>
            <ul className="grid sm:grid-cols-2 gap-2">
              {course.career_opportunities.map((role) => (
                <li key={role} className="text-xs text-slate-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                  <span>{role}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => onApplyCourse(course.id)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
          >
            <span>Apply Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              onAskAiAboutCourse(
                `Tell me about the curriculum, eligibility, and placement opportunities for ${course.course_name} (${course.code}).`,
              )
            }
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-semibold transition-colors"
          >
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Ask CollegeAI About This Program</span>
          </button>
        </div>
      </div>
    </div>
  );
}
