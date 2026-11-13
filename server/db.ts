import fs from 'node:fs';
import path from 'node:path';
import {
  SEED_COURSES,
  SEED_DEMO_APPLICATIONS,
  SEED_KNOWLEDGE,
} from './seedData.ts';
import type {
  ApplicationRecord,
  ChatMessageRecord,
  CourseRecord,
  KnowledgeChunkRecord,
} from './types.ts';

interface DatabaseSchema {
  courses: CourseRecord[];
  applications: ApplicationRecord[];
  college_knowledge: KnowledgeChunkRecord[];
  chat_messages: ChatMessageRecord[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'collegeai_db.json');

function ensureInitialData(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as DatabaseSchema;
      if (Array.isArray(parsed.courses) && Array.isArray(parsed.college_knowledge)) {
        return parsed;
      }
    } catch {
      // Re-seed if corrupted
    }
  }

  const initial: DatabaseSchema = {
    courses: SEED_COURSES,
    applications: SEED_DEMO_APPLICATIONS,
    college_knowledge: SEED_KNOWLEDGE.map((chunk) => ({
      ...chunk,
      embedding: [],
      created_at: new Date().toISOString(),
    })),
    chat_messages: [],
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
  return initial;
}

class CollegeDatabase {
  private state: DatabaseSchema;

  constructor() {
    this.state = ensureInitialData();
  }

  private persist() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tmpFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(this.state, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
  }

  getCourses(): CourseRecord[] {
    return this.state.courses;
  }

  getCourseById(id: number): CourseRecord | undefined {
    return this.state.courses.find((c) => c.id === id);
  }

  searchCourses(query?: string, category?: string, level?: string): CourseRecord[] {
    const q = (query ?? '').trim().toLowerCase();
    const cat = (category ?? '').trim().toLowerCase();
    const lvl = (level ?? '').trim().toLowerCase();

    return this.state.courses.filter((course) => {
      if (cat && cat !== 'all' && course.course_category.toLowerCase() !== cat) {
        return false;
      }
      if (lvl && lvl !== 'all' && course.level.toLowerCase() !== lvl) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        course.course_name,
        course.code,
        course.course_category,
        course.level,
        course.description,
        course.eligibility,
        ...course.career_opportunities,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  generateApplicationNumber(): string {
    const existing = new Set(this.state.applications.map((a) => a.application_number));
    for (let i = 0; i < 50; i++) {
      const num = Math.floor(1000 + Math.random() * 9000);
      const candidate = `VETIAS-2026-APP-${num}`;
      if (!existing.has(candidate)) {
        return candidate;
      }
    }
    return `VETIAS-2026-APP-${Date.now().toString().slice(-4)}`;
  }

  createApplication(
    payload: Omit<
      ApplicationRecord,
      'id' | 'application_number' | 'application_status' | 'status_note' | 'created_at' | 'course_name' | 'course_code'
    >,
  ): ApplicationRecord {
    const course = this.getCourseById(payload.selected_course_id);
    if (!course) {
      throw new Error('Selected course was not found.');
    }

    const nextId =
      this.state.applications.length > 0
        ? Math.max(...this.state.applications.map((a) => a.id)) + 1
        : 1;

    const record: ApplicationRecord = {
      ...payload,
      id: nextId,
      application_number: this.generateApplicationNumber(),
      course_name: course.course_name,
      course_code: course.code,
      application_status: 'Submitted',
      status_note:
        'Application received by VETIAS Admissions Portal. Pending initial academic document screening.',
      is_demo: false,
      created_at: new Date().toISOString(),
    };

    this.state.applications.push(record);
    this.persist();
    return record;
  }

  findApplicationByNumber(applicationNumber: string): ApplicationRecord | undefined {
    const normalized = applicationNumber.trim().toUpperCase();
    const app = this.state.applications.find(
      (a) => a.application_number.toUpperCase() === normalized,
    );
    if (!app) return undefined;
    const course = this.getCourseById(app.selected_course_id);
    return {
      ...app,
      course_name: app.course_name ?? course?.course_name,
      course_code: app.course_code ?? course?.code,
    };
  }

  findApplicationsByContact(contact: string): ApplicationRecord[] {
    const normalizedContact = contact.trim().toLowerCase();
    const digitsOnly = normalizedContact.replace(/\D/g, '').slice(-10);

    return this.state.applications
      .filter((app) => {
        const emailMatch = app.email.toLowerCase() === normalizedContact;
        const appDigits = app.mobile_number.replace(/\D/g, '').slice(-10);
        const phoneMatch = digitsOnly.length >= 10 && appDigits === digitsOnly;
        return emailMatch || phoneMatch;
      })
      .map((app) => {
        const course = this.getCourseById(app.selected_course_id);
        return {
          ...app,
          course_name: app.course_name ?? course?.course_name,
          course_code: app.course_code ?? course?.code,
        };
      });
  }

  getKnowledgeChunks(): KnowledgeChunkRecord[] {
    return this.state.college_knowledge;
  }

  updateKnowledgeEmbedding(id: number, embedding: number[]) {
    const chunk = this.state.college_knowledge.find((k) => k.id === id);
    if (chunk) {
      chunk.embedding = embedding;
    }
  }

  persistAll() {
    this.persist();
  }

  getChatHistory(sessionId: string): ChatMessageRecord[] {
    return this.state.chat_messages.filter((m) => m.session_id === sessionId);
  }

  saveChatMessage(
    msg: Omit<ChatMessageRecord, 'id' | 'created_at'>,
  ): ChatMessageRecord {
    const nextId =
      this.state.chat_messages.length > 0
        ? Math.max(...this.state.chat_messages.map((m) => m.id)) + 1
        : 1;
    const record: ChatMessageRecord = {
      ...msg,
      id: nextId,
      created_at: new Date().toISOString(),
    };
    this.state.chat_messages.push(record);
    this.persist();
    return record;
  }
}

export const db = new CollegeDatabase();
