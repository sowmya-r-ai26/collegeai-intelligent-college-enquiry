import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  Search,
  UserCheck,
} from 'lucide-react';
import { useCollege } from '../context/CollegeContext';
import { api } from '../services/api';
import type { Application, ApplySubTab } from '../types';

interface ApplyPageProps {
  initialCourseId?: number | null;
  initialSubTab?: ApplySubTab;
  onOpenDashboard: () => void;
}

const STREAM_GROUPS = [
  'Computer Science',
  'Maths-Biology',
  'Commerce-Accountancy',
  'Pure Mathematics',
  'Diploma / Graduate',
] as const;

const QUOTA_OPTIONS = ['Merit', 'First Graduate', 'Management', 'Sports'] as const;

export function ApplyPage({
  initialCourseId,
  initialSubTab = 'form',
  onOpenDashboard,
}: ApplyPageProps) {
  const { courses, registerSubmittedApplication } = useCollege();
  const [subTab, setSubTab] = useState<ApplySubTab>(initialSubTab);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Personal
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [address, setAddress] = useState('');

  // Step 2: Academic
  const [streamGroup, setStreamGroup] = useState<string>('Computer Science');
  const [plusTwoPct, setPlusTwoPct] = useState('');
  const [tenthPct, setTenthPct] = useState('');
  const [prevInstitution, setPrevInstitution] = useState('');

  // Step 3: Course & Quota
  const [selectedCourseId, setSelectedCourseId] = useState<number>(initialCourseId || 1);
  const [quota, setQuota] = useState<string>('Merit');
  const [declared, setDeclared] = useState(true);

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<Application | null>(null);

  // Track Status state
  const [trackNumber, setTrackNumber] = useState('');
  const [trackContact, setTrackContact] = useState('');
  const [tracking, setTracking] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [trackedApp, setTrackedApp] = useState<Application | null>(null);

  useEffect(() => {
    setSubTab(initialSubTab);
  }, [initialSubTab]);

  useEffect(() => {
    if (initialCourseId) {
      setSelectedCourseId(initialCourseId);
    } else if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [initialCourseId, courses, selectedCourseId]);

  const validateStep1 = (): boolean => {
    if (fullName.trim().length < 2) {
      setFormError('Please enter your full name as in your 10th marksheet.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError('Please enter a valid email address.');
      return false;
    }
    const digits = mobile.replace(/\D/g, '');
    if (digits.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return false;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob.trim())) {
      setFormError('Please select or enter your Date of Birth (YYYY-MM-DD).');
      return false;
    }
    if (address.trim().length < 5) {
      setFormError('Please enter your complete residential address.');
      return false;
    }
    setFormError(null);
    return true;
  };

  const validateStep2 = (): boolean => {
    const p2 = Number(plusTwoPct);
    if (!plusTwoPct || Number.isNaN(p2) || p2 < 35 || p2 > 100) {
      setFormError('Higher Secondary (+2) percentage must be between 35 and 100.');
      return false;
    }
    if (tenthPct) {
      const p10 = Number(tenthPct);
      if (Number.isNaN(p10) || p10 < 35 || p10 > 100) {
        setFormError('10th Standard percentage must be between 35 and 100.');
        return false;
      }
    }
    setFormError(null);
    return true;
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!declared) {
      setFormError('Please confirm the applicant declaration before submitting.');
      return;
    }
    setFormError(null);
    setSubmitting(true);

    try {
      const res = await api.submitApplication({
        full_name: fullName.trim(),
        email: email.trim(),
        mobile_number: mobile.trim(),
        date_of_birth: dob.trim(),
        gender,
        address: address.trim(),
        selected_course_id: selectedCourseId,
        academic_qualification: streamGroup,
        percentage: Number(plusTwoPct),
        tenth_percentage: tenthPct ? Number(tenthPct) : undefined,
        previous_institution: prevInstitution.trim() || undefined,
        quota,
      });

      setSubmittedApp(res.application);
      registerSubmittedApplication(res.application);
      setTrackNumber(res.application.application_number);
      setTrackContact(res.application.email);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Unable to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackNumber.trim() || !trackContact.trim()) {
      setTrackError('Both Application Reference Number and Registered Email/Mobile are required.');
      return;
    }
    setTrackError(null);
    setTracking(true);
    try {
      const res = await api.trackApplication(trackNumber, trackContact);
      setTrackedApp(res.application);
    } catch (err: unknown) {
      setTrackedApp(null);
      setTrackError(err instanceof Error ? err.message : 'Application lookup failed.');
    } finally {
      setTracking(false);
    }
  };

  const selectedCourseObj = courses.find((c) => c.id === selectedCourseId);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top 2-Tab Switcher matching Screenshot 7 & 10 */}
      <div className="grid grid-cols-2 border-b border-slate-800 bg-[#0A1022] rounded-t-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setSubTab('form')}
          className={`py-3.5 px-4 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
            subTab === 'form'
              ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Online Application</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('track')}
          className={`py-3.5 px-4 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
            subTab === 'track'
              ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Track Status</span>
        </button>
      </div>

      {/* Portal Title */}
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-white">
          VETIAS Online Admission Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Academic Session 2026–2027 · Bharathiar University Affiliation
        </p>
      </div>

      {subTab === 'form' ? (
        submittedApp ? (
          /* Post-Submission Success Confirmation */
          <div className="p-6 sm:p-8 rounded-3xl bg-[#10172B] border border-emerald-500/40 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-white">
                  Application Submitted Successfully
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Saved in Admissions Portal · Please save your reference number below
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#090F20] border border-slate-800 space-y-2">
              <p className="text-xs text-slate-400">Application Reference Number</p>
              <p className="font-mono text-xl sm:text-2xl font-bold text-sky-400">
                {submittedApp.application_number}
              </p>
              <p className="text-xs text-slate-300">
                Program: <strong className="text-white">{submittedApp.course_name}</strong> · Status:{' '}
                <strong className="text-emerald-400">{submittedApp.application_status}</strong>
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setSubTab('track');
                  setTrackedApp(submittedApp);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs sm:text-sm font-semibold text-white transition-colors"
              >
                Track Application Status
              </button>
              <button
                type="button"
                onClick={onOpenDashboard}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs sm:text-sm font-semibold text-slate-200 transition-colors"
              >
                Open Student Dashboard
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubmittedApp(null);
                  setStep(1);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
              >
                Submit Another Application
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 3-Step Stepper matching Screenshots 7 & 10 */}
            <div className="flex items-center justify-between px-2 sm:px-6">
              {[
                { num: 1, label: 'Personal' },
                { num: 2, label: 'Academic' },
                { num: 3, label: 'Course' },
              ].map((s, idx) => {
                const isDone = step > s.num;
                const isCurrent = step === s.num;
                return (
                  <React.Fragment key={s.num}>
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          isDone
                            ? 'bg-emerald-500 text-white'
                            : isCurrent
                              ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20'
                              : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isDone ? <Check className="w-4 h-4" /> : s.num}
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          isCurrent ? 'text-indigo-300' : isDone ? 'text-emerald-400' : 'text-slate-400'
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                    {idx < 2 && (
                      <div
                        className={`flex-1 h-0.5 mx-3 -mt-5 ${
                          step > s.num ? 'bg-emerald-500/60' : 'bg-slate-800'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-start gap-2.5 text-xs text-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form
              onSubmit={handleSubmitApplication}
              className="p-5 sm:p-7 rounded-3xl bg-[#10172B] border border-slate-800/90 space-y-5"
            >
              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="font-display text-base sm:text-lg font-semibold text-white">
                    1. Candidate Personal Details
                  </h2>

                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name (as in 10th marksheet)"
                    required
                    className="w-full px-4 py-3.5 rounded-xl bg-[#090E1E] border border-slate-700/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email Address"
                      required
                      className="w-full px-4 py-3.5 rounded-xl bg-[#090E1E] border border-slate-700/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="Mobile Number (+91)"
                      required
                      className="w-full px-4 py-3.5 rounded-xl bg-[#090E1E] border border-slate-700/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 items-center">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1.5">
                        Date of Birth (YYYY-MM-DD)
                      </label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-[#090E1E] border border-slate-700/80 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-2">Gender</label>
                      <div className="flex items-center gap-4">
                        {(['Male', 'Female', 'Other'] as const).map((g) => (
                          <label
                            key={g}
                            className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-200 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="gender"
                              checked={gender === g}
                              onChange={() => setGender(g)}
                              className="accent-indigo-500 w-4 h-4"
                            />
                            <span>{g}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Residential Address (City, District, PIN Code)"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[#090E1E] border border-slate-700/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep1()) setStep(2);
                    }}
                    className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
                  >
                    Continue to Academic Details
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <h2 className="font-display text-base sm:text-lg font-semibold text-white">
                    2. Academic Qualifications
                  </h2>

                  <div>
                    <p className="text-xs text-slate-300 mb-2.5">Select 12th Standard Group:</p>
                    <div className="flex flex-wrap gap-2">
                      {STREAM_GROUPS.map((grp) => (
                        <button
                          key={grp}
                          type="button"
                          onClick={() => setStreamGroup(grp)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors ${
                            streamGroup === grp
                              ? 'bg-sky-600/25 border-sky-400 text-sky-200'
                              : 'bg-[#090E1E] border-slate-700 text-slate-300 hover:border-slate-600'
                          }`}
                        >
                          {grp}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      type="number"
                      step="0.1"
                      min={35}
                      max={100}
                      value={plusTwoPct}
                      onChange={(e) => setPlusTwoPct(e.target.value)}
                      placeholder="Higher Secondary (+2) Percentage (%)"
                      required
                      className="w-full px-4 py-3.5 rounded-xl bg-[#090E1E] border border-slate-700/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="number"
                      step="0.1"
                      min={35}
                      max={100}
                      value={tenthPct}
                      onChange={(e) => setTenthPct(e.target.value)}
                      placeholder="10th Standard Percentage (%)"
                      className="w-full px-4 py-3.5 rounded-xl bg-[#090E1E] border border-slate-700/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <input
                    type="text"
                    value={prevInstitution}
                    onChange={(e) => setPrevInstitution(e.target.value)}
                    placeholder="Previous School / College Name & Board"
                    className="w-full px-4 py-3.5 rounded-xl bg-[#090E1E] border border-slate-700/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setFormError(null);
                        setStep(1);
                      }}
                      className="py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-semibold transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (validateStep2()) setStep(3);
                      }}
                      className="py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
                    >
                      Next: Course Choice
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <h2 className="font-display text-base sm:text-lg font-semibold text-white">
                    3. Program Selection &amp; Review
                  </h2>

                  <div>
                    <label
                      htmlFor="apply-course-select"
                      className="block text-xs text-slate-300 mb-2"
                    >
                      Select Academic Program
                    </label>
                    <select
                      id="apply-course-select"
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                      className="w-full px-4 py-3.5 rounded-xl bg-[#090E1E] border border-slate-700/80 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} — {c.course_name} ({c.fees})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedCourseObj && (
                    <div className="p-4 rounded-2xl bg-[#090E1E] border border-slate-800 text-xs space-y-1">
                      <p className="text-slate-400">
                        Eligibility: <span className="text-slate-200">{selectedCourseObj.eligibility}</span>
                      </p>
                      <p className="font-mono text-sky-400">
                        Tuition: {selectedCourseObj.fees} · Duration: {selectedCourseObj.duration}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-slate-300 mb-2">Admission Quota Category</p>
                    <div className="flex flex-wrap gap-2">
                      {QUOTA_OPTIONS.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setQuota(q)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors ${
                            quota === q
                              ? 'bg-indigo-600/25 border-indigo-400 text-indigo-200'
                              : 'bg-[#090E1E] border-slate-700 text-slate-300'
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary Preview */}
                  <div className="p-4 rounded-2xl bg-[#090E1E] border border-slate-800 text-xs text-slate-300 space-y-1.5">
                    <p className="font-semibold text-white">Application Summary</p>
                    <p>
                      Applicant: <span className="text-white">{fullName}</span> ({gender}, DOB:{' '}
                      <span className="font-mono">{dob}</span>)
                    </p>
                    <p>
                      Contact: <span className="text-white">{email}</span> ·{' '}
                      <span className="font-mono">{mobile}</span>
                    </p>
                    <p>
                      Academic: <span className="text-white">{streamGroup}</span> · +2 Score:{' '}
                      <span className="font-mono text-sky-400">{plusTwoPct}%</span>
                    </p>
                  </div>

                  <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={declared}
                      onChange={(e) => setDeclared(e.target.checked)}
                      className="accent-indigo-500 mt-0.5"
                    />
                    <span>
                      I declare that all academic and personal details entered above are accurate
                      and match my official marksheets.
                    </span>
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-semibold transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
                    >
                      {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>Submit Application</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )
      ) : (
        /* Track Status Tab */
        <div className="space-y-5">
          <form
            onSubmit={handleTrackSearch}
            className="p-5 sm:p-7 rounded-3xl bg-[#10172B] border border-slate-800/90 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-base sm:text-lg font-semibold text-white">
                  Track Admission Application
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Contact verification is required to protect applicant privacy.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTrackNumber('VETIAS-2026-APP-4821');
                  setTrackContact('student.demo@vetias.edu.in');
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline"
              >
                Use Demo Test Record
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="text"
                value={trackNumber}
                onChange={(e) => setTrackNumber(e.target.value)}
                placeholder="Application Reference (e.g. VETIAS-2026-APP-4821)"
                className="w-full px-4 py-3.5 rounded-xl bg-[#090E1E] border border-slate-700/80 font-mono text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <input
                type="text"
                value={trackContact}
                onChange={(e) => setTrackContact(e.target.value)}
                placeholder="Registered Email or 10-digit Mobile"
                className="w-full px-4 py-3.5 rounded-xl bg-[#090E1E] border border-slate-700/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={tracking}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
            >
              {tracking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ClipboardCheck className="w-4 h-4" />
              )}
              <span>Verify &amp; Check Status</span>
            </button>
          </form>

          {trackError && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex items-start gap-2.5 text-xs text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{trackError}</span>
            </div>
          )}

          {trackedApp && (
            <div className="p-6 rounded-3xl bg-[#10172B] border border-slate-800 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-semibold text-indigo-300">
                    {trackedApp.application_number}
                  </p>
                  <h3 className="font-display text-lg font-bold text-white mt-0.5">
                    {trackedApp.course_name}
                  </h3>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    trackedApp.application_status.includes('Shortlisted') ||
                    trackedApp.application_status.includes('Confirmed')
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {trackedApp.application_status}
                </span>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#090F20] border border-slate-800">
                  <p className="text-slate-400">Applicant Name</p>
                  <p className="text-white font-semibold mt-1">{trackedApp.full_name}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#090F20] border border-slate-800">
                  <p className="text-slate-400">Submission Date</p>
                  <p className="font-mono text-white font-semibold mt-1">
                    {trackedApp.created_at.slice(0, 10)}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#090F20] border border-slate-800">
                  <p className="text-slate-400">Quota &amp; +2 Score</p>
                  <p className="font-mono text-sky-400 font-semibold mt-1">
                    {trackedApp.quota} · {trackedApp.percentage}%
                  </p>
                </div>
              </div>

              {/* Application Progress Bar */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-300">Application Progress</p>
                <div className="grid grid-cols-4 gap-2 text-[11px]">
                  {['Submitted', 'Under Review', 'Counseling Shortlist', 'Admission Confirmed'].map(
                    (stage, idx) => {
                      const activeIdx = trackedApp.application_status.includes('Confirmed')
                        ? 3
                        : trackedApp.application_status.includes('Shortlisted')
                          ? 2
                          : trackedApp.application_status.includes('Review')
                            ? 1
                            : 0;
                      const reached = idx <= activeIdx;
                      return (
                        <div key={stage} className="space-y-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              reached ? 'bg-emerald-500' : 'bg-slate-800'
                            }`}
                          />
                          <p className={reached ? 'text-emerald-300 font-medium' : 'text-slate-500'}>
                            {stage}
                          </p>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#090F20] border border-slate-800 text-xs text-sky-300">
                <strong className="text-slate-200">Admissions Officer Note: </strong>
                {trackedApp.status_note}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
