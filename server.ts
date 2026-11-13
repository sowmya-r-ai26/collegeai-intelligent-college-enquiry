import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.ts';
import { generateRagChatReply } from './server/rag.ts';
import { COLLEGE_INFO } from './server/seedData.ts';

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'CollegeAI API',
    institution: COLLEGE_INFO.short_code,
    courses_count: db.getCourses().length,
    knowledge_chunks_count: db.getKnowledgeChunks().length,
    gemini_configured: Boolean(
      process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY',
    ),
    timestamp: new Date().toISOString(),
  });
});

// College overview, events, notices, placements, campus life
app.get('/api/college/info', (_req, res) => {
  res.json({
    ...COLLEGE_INFO,
    stats: {
      ...COLLEGE_INFO.stats,
      accredited_degrees: db.getCourses().length,
      rag_chunks: db.getKnowledgeChunks().length,
    },
  });
});

// Courses endpoints
app.get('/api/courses', (req, res) => {
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;
  const level = typeof req.query.level === 'string' ? req.query.level : undefined;
  const courses = db.searchCourses(undefined, category, level);
  res.json({ courses, total: courses.length });
});

app.get('/api/courses/search', (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q : '';
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;
  const level = typeof req.query.level === 'string' ? req.query.level : undefined;
  const courses = db.searchCourses(q, category, level);
  res.json({ courses, total: courses.length, query: q });
});

app.get('/api/courses/:courseId', (req, res) => {
  const courseId = Number(req.params.courseId);
  if (!Number.isInteger(courseId) || courseId <= 0) {
    return res.status(400).json({ error: 'Invalid course ID.' });
  }
  const course = db.getCourseById(courseId);
  if (!course) {
    return res.status(404).json({ error: 'Course not found.' });
  }
  res.json({ course });
});

// Applications endpoints
app.post('/api/applications', (req, res) => {
  try {
    const body = req.body ?? {};
    const fullName = String(body.full_name ?? '').trim();
    const email = String(body.email ?? '').trim();
    const mobile = String(body.mobile_number ?? '').trim();
    const dob = String(body.date_of_birth ?? '').trim();
    const gender = String(body.gender ?? '').trim();
    const address = String(body.address ?? '').trim();
    const selectedCourseId = Number(body.selected_course_id);
    const qualification = String(body.academic_qualification ?? '').trim();
    const percentage = Number(body.percentage);
    const tenthPercentage =
      body.tenth_percentage !== undefined && body.tenth_percentage !== ''
        ? Number(body.tenth_percentage)
        : undefined;
    const previousInstitution = String(body.previous_institution ?? '').trim();
    const quota = String(body.quota ?? 'Merit').trim() || 'Merit';

    if (fullName.length < 2) {
      return res.status(422).json({ error: 'Full name must be at least 2 characters.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(422).json({ error: 'Please provide a valid email address.' });
    }
    const mobileDigits = mobile.replace(/\D/g, '');
    if (mobileDigits.length < 10 || mobileDigits.length > 13) {
      return res.status(422).json({ error: 'Please provide a valid 10-digit mobile number.' });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      return res.status(422).json({ error: 'Date of birth must be in YYYY-MM-DD format.' });
    }
    if (!['Male', 'Female', 'Other'].includes(gender)) {
      return res.status(422).json({ error: 'Gender must be Male, Female, or Other.' });
    }
    if (address.length < 5) {
      return res.status(422).json({ error: 'Please provide a complete residential address.' });
    }
    if (!Number.isInteger(selectedCourseId) || !db.getCourseById(selectedCourseId)) {
      return res.status(422).json({ error: 'Please select a valid academic program.' });
    }
    if (!qualification) {
      return res.status(422).json({ error: 'Please select your 12th / academic qualification group.' });
    }
    if (Number.isNaN(percentage) || percentage < 35 || percentage > 100) {
      return res
        .status(422)
        .json({ error: 'Higher secondary percentage must be between 35 and 100.' });
    }

    const created = db.createApplication({
      full_name: fullName,
      email,
      mobile_number: mobileDigits.slice(-10),
      date_of_birth: dob,
      gender: gender as 'Male' | 'Female' | 'Other',
      address,
      selected_course_id: selectedCourseId,
      academic_qualification: qualification,
      percentage,
      tenth_percentage: tenthPercentage,
      previous_institution: previousInstitution,
      quota,
    });

    res.status(201).json({
      message: 'Application submitted successfully.',
      application: created,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unable to submit application.';
    res.status(500).json({ error: msg });
  }
});

// Track application by reference number WITH mandatory contact verification
app.get('/api/applications/track/:applicationNumber', (req, res) => {
  const applicationNumber = req.params.applicationNumber;
  const contact = typeof req.query.contact === 'string' ? req.query.contact.trim() : '';

  if (!contact) {
    return res.status(400).json({
      error:
        'Contact verification required. Provide your registered email address or mobile number to view application status.',
    });
  }

  const appRecord = db.findApplicationByNumber(applicationNumber);
  if (!appRecord) {
    return res.status(404).json({
      error: `No application found matching reference number "${applicationNumber}".`,
    });
  }

  const normalizedContact = contact.toLowerCase();
  const contactDigits = normalizedContact.replace(/\D/g, '').slice(-10);
  const recordDigits = appRecord.mobile_number.replace(/\D/g, '').slice(-10);

  const emailVerified = appRecord.email.toLowerCase() === normalizedContact;
  const phoneVerified = contactDigits.length >= 10 && recordDigits === contactDigits;

  if (!emailVerified && !phoneVerified) {
    return res.status(403).json({
      error:
        'Contact verification failed. The email or mobile number does not match this application reference.',
    });
  }

  res.json({ application: appRecord });
});

// Verify applicant contact to unlock Student Dashboard applications
app.post('/api/applications/verify-dashboard', (req, res) => {
  const contact = String(req.body?.contact ?? '').trim();
  const reference = String(req.body?.application_number ?? '').trim();

  if (!contact) {
    return res.status(400).json({ error: 'Please provide your registered email or mobile number.' });
  }

  let matched = db.findApplicationsByContact(contact);
  if (reference) {
    matched = matched.filter(
      (a) => a.application_number.toUpperCase() === reference.toUpperCase(),
    );
  }

  if (matched.length === 0) {
    return res.status(404).json({
      error: 'No verified applications found for those credentials.',
    });
  }

  res.json({
    applicant: {
      full_name: matched[0].full_name,
      email: matched[0].email,
      mobile_number: matched[0].mobile_number,
      is_demo: Boolean(matched[0].is_demo),
    },
    applications: matched,
  });
});

// AI Chatbot RAG endpoints
app.post('/api/chat', async (req, res) => {
  try {
    const sessionId = String(req.body?.session_id ?? '').trim();
    const message = String(req.body?.message ?? '').trim();

    if (!sessionId) {
      return res.status(400).json({ error: 'session_id is required.' });
    }
    if (!message || message.length > 1500) {
      return res.status(400).json({ error: 'Please enter a valid question (1–1500 characters).' });
    }

    const result = await generateRagChatReply(sessionId, message);
    res.json({
      session_id: sessionId,
      user_message: message,
      assistant_response: result.assistant_response,
      sources: result.sources,
    });
  } catch (err: unknown) {
    console.error('Gemini RAG Chat Error:', err);
    const errMsg = err instanceof Error ? err.message : 'Failed to process enquiry.';
    const status = errMsg.includes('GEMINI_API_KEY') ? 503 : 500;
    res.status(status).json({ error: errMsg });
  }
});

app.get('/api/chat/history/:sessionId', (req, res) => {
  const sessionId = req.params.sessionId.trim();
  const messages = db.getChatHistory(sessionId);
  res.json({ session_id: sessionId, messages });
});

// Download full-stack GitHub-ready ZIP package
app.get('/api/project/download', (_req, res) => {
  const zipPath = path.resolve(process.cwd(), 'public', 'CollegeAI-FullStack.zip');
  if (!fs.existsSync(zipPath)) {
    return res.status(404).json({ error: 'Source package is not generated yet.' });
  }
  res.download(zipPath, 'CollegeAI-FullStack.zip');
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CollegeAI full-stack preview running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
