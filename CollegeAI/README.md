# CollegeAI — Intelligent College Enquiry & Admission Assistant

Full-stack AI-powered college enquiry, Retrieval-Augmented Generation (RAG) chatbot, academic program explorer, online admission portal, and verified student dashboard built for **VET Institute of Arts & Science (VETIAS)**.

## Architecture

```text
User Question ─▶ React + TypeScript + Tailwind Frontend
                      │
                      ▼ (/api/*)
                 FastAPI REST Backend
                      ├─▶ Gemini Embeddings (gemini-embedding-2) ─▶ PostgreSQL + pgvector (23 Chunks)
                      ├─▶ Gemini Chat Model (gemini-4-hydrogen)  ─▶ Grounded Response + Source Citations
                      └─▶ SQLAlchemy + Alembic ORM               ─▶ Courses, Applications, Chat_Messages
```

## Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React
- **Backend:** Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic
- **Database:** PostgreSQL 16 with `pgvector` extension
- **AI / RAG:** Official `google-genai` SDK (`gemini-4-hydrogen` + `gemini-embedding-2`)
- **Testing:** Pytest (`tests/backend`), Vitest (`tests/frontend`)

## Key Features

- **Home Portal:** Featured UG & PG programs, quick services, upcoming campus events, and institutional contact details.
- **Gemini RAG Chatbot:** Strictly grounded in verified VETIAS knowledge documents with session persistence and cited sources.
- **Academic Programs Explorer:** Live database search, stream filters (`AI & DS`, `CS & IT`, `Commerce`, `Management`), degree level filters (`UG`, `PG`, `Diploma`), bookmarking, and dedicated Course Details pages.
- **AI Stream Matcher Quiz:** Interactive 3-step recommendation flow matching 12th stream and career goals to VETIAS programs.
- **3-Step Online Admission Portal:** Validates Personal, Academic, and Course preferences, generates unique `VETIAS-2026-APP-XXXX` reference numbers, and persists applications in PostgreSQL.
- **Contact-Verified Application Tracking & Student Dashboard:** Protects private application data behind reference number + email/mobile verification without requiring account registration.

## Quick Start

See [docs/SETUP_GUIDE.md](./docs/SETUP_GUIDE.md), [docs/API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md), and [docs/DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md).

### 1. Start PostgreSQL (`pgvector`)
```bash
docker compose up -d db
```

### 2. Run Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### 3. Run Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### 4. Upload to GitHub
```bash
git init
git add .
git commit -m "Initial commit: CollegeAI full-stack application"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/CollegeAI.git
git push -u origin main
```
