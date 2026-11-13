import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Bookmark,
  BrainCircuit,
  Loader2,
  Search,
} from 'lucide-react';
import { useCollege } from '../context/CollegeContext';
import { api } from '../services/api';
import type { Course } from '../types';

interface CoursesPageProps {
  onViewCourse: (courseId: number) => void;
  onApplyCourse: (courseId: number) => void;
  onOpenMatcher: () => void;
}

const STREAM_TABS = ['All', 'AI & DS', 'CS & IT', 'Commerce', 'Management'] as const;
const LEVEL_TABS = ['All', 'UG', 'PG', 'Diploma'] as const;

export function CoursesPage({
  onViewCourse,
  onApplyCourse,
  onOpenMatcher,
}: CoursesPageProps) {
  const { savedCourseIds, toggleSaveCourse } = useCollege();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeLevel, setActiveLevel] = useState<string>('All');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = searchQuery.trim()
          ? await api.searchCourses(searchQuery, activeCategory, activeLevel)
          : await api.getCourses({ category: activeCategory, level: activeLevel });
        if (!active) return;
        setCourses(res.courses);
      } catch (err: unknown) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to fetch academic programs.');
      } finally {
        if (active) setLoading(false);
      }
    }, 180);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery, activeCategory, activeLevel]);

  const resetFilters = () => {
    setSearchQuery('');
    setActiveCategory('All');
    setActiveLevel('All');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Academic Programs
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Explore accredited UG, PG &amp; Diploma degrees
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenMatcher}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/40 text-xs sm:text-sm font-semibold text-indigo-200 transition-colors whitespace-nowrap"
        >
          <BrainCircuit className="w-4 h-4 text-sky-400" />
          <span>AI Matcher</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by course, role (e.g. AI, CA, BCA)..."
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#0D1326] border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Filter Tabs: Stream + Degree Level */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {STREAM_TABS.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-[#10172B] text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {cat === 'All' && activeLevel === 'All' && !searchQuery
                  ? `All (${courses.length || 8})`
                  : cat}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 bg-[#0D1326] p-1 rounded-xl border border-slate-800 self-start">
          {LEVEL_TABS.map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setActiveLevel(lvl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeLevel === lvl
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lvl === 'All' ? 'All Levels' : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Results State */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2.5 text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
          <span>Loading academic programs...</span>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-500/40 text-center space-y-3">
          <AlertCircle className="w-6 h-6 text-rose-400 mx-auto" />
          <p className="text-sm text-rose-200">{error}</p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white"
          >
            Retry
          </button>
        </div>
      ) : courses.length === 0 ? (
        <div className="p-10 rounded-2xl bg-[#10172B] border border-slate-800 text-center space-y-3">
          <p className="text-sm font-medium text-slate-200">
            No academic programs matched your search or filter selection.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {courses.map((course) => {
            const isSaved = savedCourseIds.includes(course.id);
            return (
              <article
                key={course.id}
                className="p-5 sm:p-6 rounded-2xl bg-[#10172B] border border-slate-800/90 flex flex-col justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                        {course.level}
                      </span>
                      <span className="font-mono text-xs text-slate-400">{course.code}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleSaveCourse(course.id)}
                      aria-label={isSaved ? 'Unsave course' : 'Save course'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isSaved
                          ? 'text-indigo-400 bg-indigo-500/15'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  <h2 className="font-display text-lg font-semibold text-white leading-snug">
                    {course.course_name}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs pt-1">
                    <span className="font-mono font-semibold text-sky-400">
                      ₹ {course.fee_numeric.toLocaleString('en-IN')} / Sem
                    </span>
                    <span className="text-slate-300">{course.duration}</span>
                    <span className="text-slate-400">{course.seats} Seats</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800/70">
                  <button
                    type="button"
                    onClick={() => onViewCourse(course.id)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors whitespace-nowrap"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    onClick={() => onApplyCourse(course.id)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors whitespace-nowrap"
                  >
                    Apply Now
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
