import React, { useState } from 'react';
import {
  ArrowRight,
  Award,
  Briefcase,
  Building2,
  CheckCircle2,
  Download,
  FolderGit2,
  Sparkles,
  X,
} from 'lucide-react';
import { useCollege } from '../context/CollegeContext';
import type { Course } from '../types';

interface ModalShellProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}

function ModalShell({ title, subtitle, onClose, children }: ModalShellProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl bg-[#0F162B] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-800 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-white">{title}</h2>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto space-y-5">{children}</div>
      </div>
    </div>
  );
}

export function AiMatcherModal({
  onClose,
  onSelectCourse,
  onApplyCourse,
}: {
  onClose: () => void;
  onSelectCourse: (courseId: number) => void;
  onApplyCourse: (courseId: number) => void;
}) {
  const { courses } = useCollege();
  const [stream, setStream] = useState<'Computer Science' | 'Commerce' | 'Maths-Biology' | 'Graduate'>(
    'Computer Science',
  );
  const [interest, setInterest] = useState<'AI & Data' | 'Software Dev' | 'Finance & CA' | 'Business'>(
    'AI & Data',
  );
  const [percentage, setPercentage] = useState<string>('78');
  const [submitted, setSubmitted] = useState(false);

  const recommended: Course[] = React.useMemo(() => {
    const score = Number(percentage) || 0;
    const filtered = courses.filter((c) => {
      if (stream === 'Graduate') return c.level === 'PG' || c.level === 'Diploma';
      if (interest === 'AI & Data') return c.course_category === 'AI & DS' || c.code === 'VET-DIP-08';
      if (interest === 'Software Dev') return c.course_category === 'CS & IT';
      if (interest === 'Finance & CA') return c.course_category === 'Commerce';
      if (interest === 'Business') return c.course_category === 'Management' || c.code === 'VET-BCOM-05';
      return true;
    });
    const list = filtered.length > 0 ? filtered : courses.slice(0, 3);
    if (score < 55) {
      return list.sort((a, b) => a.fee_numeric - b.fee_numeric);
    }
    return list;
  }, [courses, stream, interest, percentage]);

  return (
    <ModalShell
      title="AI Stream & Program Matcher"
      subtitle="Answer 3 quick questions to match your 12th / academic background with VETIAS programs"
      onClose={onClose}
    >
      {!submitted ? (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              1. Current Academic Stream
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {(['Computer Science', 'Maths-Biology', 'Commerce', 'Graduate'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setStream(opt)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium border text-left transition-colors ${
                    stream === opt
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              2. Primary Career Interest
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {(['AI & Data', 'Software Dev', 'Finance & CA', 'Business'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setInterest(opt)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium border text-left transition-colors ${
                    interest === opt
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="matcher-pct" className="block text-sm font-medium text-slate-200 mb-2">
              3. Expected or Obtained Aggregate Percentage (%)
            </label>
            <input
              id="matcher-pct"
              type="number"
              min={35}
              max={100}
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="button"
            onClick={() => setSubmitted(true)}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Find Matching Programs</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-300">
              Top matches for <span className="text-white font-medium">{stream}</span> ·{' '}
              <span className="text-sky-400 font-medium">{interest}</span> ({percentage}%)
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Retake Quiz
            </button>
          </div>

          <div className="space-y-3">
            {recommended.map((course) => (
              <div
                key={course.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-slate-400">
                    {course.level} · {course.code}
                  </span>
                  <span className="font-mono text-xs text-sky-400 font-medium">{course.fees}</span>
                </div>
                <h3 className="font-display font-semibold text-white text-sm sm:text-base">
                  {course.course_name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2">{course.eligibility}</p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectCourse(course.id);
                    }}
                    className="px-3.5 py-2 rounded-lg border border-slate-700 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onApplyCourse(course.id);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white inline-flex items-center gap-1.5 transition-colors"
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ModalShell>
  );
}

export function CampusLifeModal({ onClose, onAskAi }: { onClose: () => void; onAskAi: (q: string) => void }) {
  const { collegeInfo } = useCollege();
  const campus = collegeInfo?.campus_life;

  return (
    <ModalShell
      title="Campus Life, Hostels & Facilities"
      subtitle="VET Institute of Arts & Science · Thindal Campus, Erode"
      onClose={onClose}
    >
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <p className="text-xs text-slate-400">Boys Residential Hostel</p>
          <p className="font-mono text-sm font-semibold text-sky-400 mt-1">
            {campus?.hostel_boys || '₹45,000 / year'}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <p className="text-xs text-slate-400">Girls Residential Hostel</p>
          <p className="font-mono text-sm font-semibold text-sky-400 mt-1">
            {campus?.hostel_girls || '₹45,000 / year'}
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-400" />
          <span>Academic &amp; Student Infrastructure</span>
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {(campus?.facilities ?? []).map((item) => (
            <div key={item.name} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <p className="text-sm font-medium text-white">{item.name}</p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          onClose();
          onAskAi('Tell me more about hostel facilities, mess fees, and campus bus routes.');
        }}
        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white transition-colors"
      >
        Ask CollegeAI About Hostel &amp; Transport
      </button>
    </ModalShell>
  );
}

export function PlacementsModal({ onClose, onAskAi }: { onClose: () => void; onAskAi: (q: string) => void }) {
  const { collegeInfo } = useCollege();
  const placements = collegeInfo?.placements;

  return (
    <ModalShell
      title="Campus Placements & Top Recruiters"
      subtitle="Central Placement & Training Block · VETIAS"
      onClose={onClose}
    >
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
          <p className="font-mono text-lg sm:text-xl font-bold text-emerald-400">
            {placements?.rate || '94%'}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Placement Success</p>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
          <p className="font-mono text-lg sm:text-xl font-bold text-sky-400">
            {placements?.highest_package || '₹12.5 LPA'}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Highest Package</p>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
          <p className="font-mono text-lg sm:text-xl font-bold text-indigo-300">
            {placements?.average_package || '₹4.8 LPA'}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Average Package</p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white mb-2.5 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-emerald-400" />
          <span>Leading Campus Recruiters</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {(placements?.top_recruiters ?? []).map((company) => (
            <span
              key={company}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200"
            >
              {company}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {(placements?.highlights ?? []).map((hl) => (
          <div key={hl} className="flex items-start gap-2.5 text-xs text-slate-300">
            <Award className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>{hl}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => {
          onClose();
          onAskAi('What placement training and internship support does VETIAS provide?');
        }}
        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white transition-colors"
      >
        Ask CollegeAI About Placements
      </button>
    </ModalShell>
  );
}

export function ExportProjectModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalShell
      title="Download Complete Full-Stack Project"
      subtitle="GitHub-ready source code with React Vite Frontend + Python FastAPI Backend + PostgreSQL/pgvector + Pytest"
      onClose={onClose}
    >
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 text-xs text-slate-300">
        <div className="flex items-center gap-2 text-white font-semibold text-sm">
          <FolderGit2 className="w-4 h-4 text-indigo-400" />
          <span>Included in CollegeAI-FullStack.zip</span>
        </div>
        <ul className="space-y-1.5 pl-1">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              <strong className="text-slate-100">frontend/</strong> — React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons
            </span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              <strong className="text-slate-100">backend/</strong> — Python FastAPI, Pydantic v2, SQLAlchemy, Alembic migrations, Gemini RAG
            </span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              <strong className="text-slate-100">PostgreSQL + pgvector</strong> — Courses, Applications, College_Knowledge, Chat_Messages
            </span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              <strong className="text-slate-100">tests/, knowledge_base/, docs/</strong> — Pytest suite, 23 RAG chunks, API &amp; Setup guides
            </span>
          </li>
        </ul>
      </div>

      <a
        href="/api/project/download"
        download="CollegeAI-FullStack.zip"
        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
      >
        <Download className="w-4 h-4" />
        <span>Download CollegeAI-FullStack.zip</span>
      </a>
    </ModalShell>
  );
}
