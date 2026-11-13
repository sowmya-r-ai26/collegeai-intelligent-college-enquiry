import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Bell,
  Loader2,
  Lock,
  LogOut,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useCollege } from '../context/CollegeContext';

interface DashboardPageProps {
  onViewCourse: (courseId: number) => void;
  onNavigateApply: () => void;
}

export function DashboardPage({
  onViewCourse,
  onNavigateApply,
}: DashboardPageProps) {
  const {
    courses,
    collegeInfo,
    savedCourseIds,
    recentCourseIds,
    enquiryCount,
    verifiedApplicant,
    verifiedApplications,
    unlockDashboard,
    lockDashboard,
  } = useCollege();

  const [contactInput, setContactInput] = useState('');
  const [refInput, setRefInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const savedCourses = courses.filter((c) => savedCourseIds.includes(c.id));
  const recentCourses = recentCourseIds
    .map((id) => courses.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const notices = collegeInfo?.notices ?? [];

  const handleUnlock = async (contact: string, ref?: string) => {
    if (!contact.trim()) {
      setVerifyError('Please enter your registered email address or 10-digit mobile number.');
      return;
    }
    setVerifyError(null);
    setVerifying(true);
    try {
      await unlockDashboard(contact, ref);
    } catch (err: unknown) {
      setVerifyError(
        err instanceof Error ? err.message : 'Verification failed. Check your contact details.',
      );
    } finally {
      setVerifying(false);
    }
  };

  const initials = verifiedApplicant
    ? verifiedApplicant.full_name
        .split(' ')
        .filter((p) => !p.startsWith('('))
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() || '')
        .join('')
    : 'ST';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Student Dashboard
          </h1>
          <div className="flex items-center gap-2.5 mt-1">
            <p className="text-xs sm:text-sm text-slate-300">
              {verifiedApplicant
                ? `Welcome back, ${verifiedApplicant.full_name}`
                : 'Applicant Portal · Verify contact to view private application records'}
            </p>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wide">
              {verifiedApplicant?.is_demo ? 'Demo Applicant' : 'Student'}
            </span>
          </div>
        </div>

        {verifiedApplicant && (
          <button
            type="button"
            onClick={lockDashboard}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock Session</span>
          </button>
        )}
      </div>

      {/* 4 KPI Summary Cards matching Screenshot 8 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#10172B] border border-slate-800/90">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Saved Courses
          </p>
          <p className="font-mono text-2xl sm:text-3xl font-bold text-indigo-400 mt-1.5">
            {savedCourses.length}
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#10172B] border border-slate-800/90">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Applications
          </p>
          <p className="font-mono text-2xl sm:text-3xl font-bold text-sky-400 mt-1.5">
            {verifiedApplicant ? verifiedApplications.length : '—'}
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#10172B] border border-slate-800/90">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Enquiries
          </p>
          <p className="font-mono text-2xl sm:text-3xl font-bold text-rose-400 mt-1.5">
            {enquiryCount}
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#10172B] border border-slate-800/90">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Notifications
          </p>
          <p className="font-mono text-2xl sm:text-3xl font-bold text-emerald-400 mt-1.5">
            {notices.length}
          </p>
        </div>
      </div>

      {/* Verification Gate OR Verified My Profile + Applications */}
      {!verifiedApplicant ? (
        <section className="p-5 sm:p-6 rounded-2xl bg-[#10172B] border border-indigo-500/30 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <h2 className="font-display text-base sm:text-lg font-semibold text-white">
                  Verify Applicant Identity to View Applications
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  No account password needed. Enter the email or mobile number used in your
                  admission application.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handleUnlock('student.demo@vetias.edu.in')}
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 underline"
            >
              Preview Demo Applicant Profile
            </button>
          </div>

          {verifyError && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-center gap-2 text-xs text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{verifyError}</span>
            </div>
          )}

          <div className="grid sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={contactInput}
              onChange={(e) => setContactInput(e.target.value)}
              placeholder="Registered Email or Mobile"
              className="px-4 py-3 rounded-xl bg-[#090E1E] border border-slate-700/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              value={refInput}
              onChange={(e) => setRefInput(e.target.value)}
              placeholder="Reference No. (Optional)"
              className="px-4 py-3 rounded-xl bg-[#090E1E] border border-slate-700/80 font-mono text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              disabled={verifying}
              onClick={() => void handleUnlock(contactInput, refInput)}
              className="py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
            >
              {verifying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              <span>Unlock Dashboard</span>
            </button>
          </div>
        </section>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* MY PROFILE card matching Screenshot 8 */}
          <section className="p-5 rounded-2xl bg-[#10172B] border border-slate-800/90 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                My Profile
              </h2>
              <User className="w-4 h-4 text-indigo-400" />
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center font-display font-bold text-indigo-200 shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-white truncate">{verifiedApplicant.full_name}</p>
                <p className="text-xs text-slate-400 truncate">{verifiedApplicant.email}</p>
                <p className="text-xs font-mono text-sky-400 mt-0.5">
                  +91 {verifiedApplicant.mobile_number} · Bharathiar University
                </p>
              </div>
            </div>
          </section>

          {/* Admission Applications matching Screenshot 9 */}
          <section className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-white">
                Admission Applications ({verifiedApplications.length})
              </h2>
              <button
                type="button"
                onClick={onNavigateApply}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                Apply More
              </button>
            </div>

            <div className="space-y-3">
              {verifiedApplications.map((app) => (
                <div
                  key={app.application_number}
                  className="p-5 rounded-2xl bg-[#10172B] border border-slate-800/90 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs sm:text-sm font-semibold text-indigo-300">
                      {app.application_number}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        app.application_status.includes('Shortlisted') ||
                        app.application_status.includes('Confirmed')
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {app.application_status}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-semibold text-white">
                    {app.course_name}
                  </h3>

                  <p className="text-xs text-slate-400">
                    Quota: {app.quota} · Submitted: {app.created_at.slice(0, 10)}
                  </p>

                  <p className="text-xs text-sky-300 leading-relaxed">Note: {app.status_note}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Saved Courses & Recently Viewed + Notices */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Saved Courses */}
          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-white">
              Saved Courses ({savedCourses.length})
            </h2>
            {savedCourses.length === 0 ? (
              <div className="p-5 rounded-2xl bg-[#10172B] border border-slate-800 text-xs text-slate-400">
                No courses bookmarked yet. Explore Academic Programs and tap the bookmark icon to
                save courses here.
              </div>
            ) : (
              <div className="space-y-2.5">
                {savedCourses.map((course) => (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => onViewCourse(course.id)}
                    className="w-full p-4 rounded-2xl bg-[#10172B] hover:bg-[#141D36] border border-slate-800/90 flex items-center justify-between gap-4 text-left transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-white truncate">
                        {course.course_name}
                      </p>
                      <p className="font-mono text-xs text-slate-400 mt-1">
                        ₹{course.fee_numeric.toLocaleString('en-IN')} / sem · {course.duration}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-indigo-400 shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Recently Viewed Courses */}
          {recentCourses.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-display text-lg font-semibold text-white">
                Recently Viewed Courses ({recentCourses.length})
              </h2>
              <div className="space-y-2">
                {recentCourses.map((course) => (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => onViewCourse(course.id)}
                    className="w-full p-3.5 rounded-xl bg-[#0D1428] hover:bg-[#141D36] border border-slate-800/80 flex items-center justify-between gap-3 text-left transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-slate-100 truncate">
                        {course.course_name}
                      </p>
                      <p className="font-mono text-[11px] text-slate-400 mt-0.5">
                        {course.code} · {course.fees}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Institutional Alerts & Notices matching Screenshot 9 */}
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-white">
            Institutional Alerts &amp; Notices
          </h2>
          <div className="space-y-3">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className="p-4 sm:p-5 rounded-2xl bg-[#10172B] border border-slate-800/90 flex items-start gap-3.5"
              >
                <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-4 h-4 text-sky-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white">{notice.title}</h3>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">
                      {notice.time_label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{notice.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
