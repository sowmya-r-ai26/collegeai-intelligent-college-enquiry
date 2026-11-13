# CollegeAI Database Schema (PostgreSQL + pgvector)

CollegeAI uses **4 core tables** managed with SQLAlchemy 2.0 and Alembic migrations:

## 1. `courses`
Stores accredited UG, PG, and Diploma programs.
- `id` (INTEGER, PK)
- `code` (VARCHAR(32), UNIQUE, INDEXED)
- `course_name` (VARCHAR(255), INDEXED)
- `course_category` (VARCHAR(100), INDEXED)
- `level` (VARCHAR(32), INDEXED)
- `description` (TEXT)
- `duration` (VARCHAR(64))
- `eligibility` (TEXT)
- `fees` (VARCHAR(100))
- `fee_numeric` (INTEGER)
- `seats` (INTEGER)
- `career_opportunities_json` (TEXT)
- `featured` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)

## 2. `applications`
Stores online admission submissions and tracking state.
- `id` (INTEGER, PK)
- `application_number` (VARCHAR(64), UNIQUE, INDEXED)
- `full_name` (VARCHAR(200))
- `email` (VARCHAR(200), INDEXED)
- `mobile_number` (VARCHAR(20), INDEXED)
- `date_of_birth` (VARCHAR(20))
- `gender` (VARCHAR(20))
- `address` (TEXT)
- `selected_course_id` (INTEGER, FK -> `courses.id`)
- `academic_qualification` (VARCHAR(120))
- `percentage` (FLOAT)
- `tenth_percentage` (FLOAT, NULLABLE)
- `previous_institution` (VARCHAR(255), NULLABLE)
- `quota` (VARCHAR(64))
- `application_status` (VARCHAR(64))
- `status_note` (TEXT)
- `is_demo` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)

## 3. `college_knowledge`
Stores curated institutional documents and 768-dimensional `pgvector` embeddings.
- `id` (INTEGER, PK)
- `title` (VARCHAR(255), INDEXED)
- `content` (TEXT)
- `category` (VARCHAR(100), INDEXED)
- `source_file` (VARCHAR(255))
- `embedding` (`VECTOR(768)` via `pgvector`)
- `created_at` (TIMESTAMPTZ)

## 4. `chat_messages`
Stores session-scoped chatbot conversation turns and cited sources.
- `id` (INTEGER, PK)
- `session_id` (VARCHAR(128), INDEXED)
- `user_message` (TEXT)
- `assistant_response` (TEXT)
- `sources_json` (TEXT)
- `created_at` (TIMESTAMPTZ)
- Composite index: `ix_chat_messages_session_created (session_id, created_at)`
