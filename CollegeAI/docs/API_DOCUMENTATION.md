# CollegeAI REST API Documentation

Base URL (Local Development): `http://localhost:8000`  
Interactive Swagger UI: `http://localhost:8000/docs`

## Endpoints

### 1. Health Check
- **GET `/api/health`**
  - Returns service status, database connectivity check (`SELECT 1`), total seeded courses, knowledge chunks count, and Gemini configuration status.

### 2. Institution Info
- **GET `/api/college/info`**
  - Returns VET Institute of Arts & Science (VETIAS) overview, stats, upcoming campus events, institutional notices, placement highlights, and hostel facilities.

### 3. Academic Programs (Courses)
- **GET `/api/courses`**
  - Optional query params: `category` (`AI & DS`, `CS & IT`, `Commerce`, `Management`), `level` (`UG`, `PG`, `Diploma`).
- **GET `/api/courses/search`**
  - Query params: `q`, `category`, `level`. Searches across course names, codes, descriptions, eligibility, and career tracks.
- **GET `/api/courses/{course_id}`**
  - Returns full details for a single course or `404` if not found.

### 4. Online Admissions & Tracking
- **POST `/api/applications`**
  - Validates Personal, Academic, and Course selection fields using Pydantic v2.
  - Generates a unique reference number (`VETIAS-2026-APP-XXXX`), stores in PostgreSQL, and returns `201 Created`.
- **GET `/api/applications/track/{application_number}?contact=...`**
  - Requires `contact` (registered email or 10-digit mobile number). Returns `403` on mismatch, `404` if unknown, or `200 OK` with verified application status.
- **POST `/api/applications/verify-dashboard`**
  - Body: `{ "contact": "...", "application_number": "..." }`. Unlocks verified applicant applications for the Student Dashboard.

### 5. Gemini RAG Admissions Chatbot
- **POST `/api/chat`**
  - Body: `{ "session_id": "...", "message": "..." }`.
  - Runs `gemini-embedding-2` query embedding -> `pgvector` cosine similarity search on `college_knowledge` -> `gemini-4-hydrogen` grounded generation -> stores turn in `chat_messages`.
- **GET `/api/chat/history/{session_id}`**
  - Returns chronological conversation history and cited sources for `session_id`.
