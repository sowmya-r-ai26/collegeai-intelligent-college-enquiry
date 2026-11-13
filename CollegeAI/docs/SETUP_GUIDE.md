# CollegeAI Local Setup Guide

## Prerequisites
- Python 3.10+
- Node.js 20+
- PostgreSQL 15+ with `pgvector` extension (or Docker)
- Google Gemini API Key

## 1. Start PostgreSQL with pgvector
Using Docker:
```bash
docker compose up -d db
```
Or using local PostgreSQL:
```sql
CREATE DATABASE collegeai_db;
\c collegeai_db
CREATE EXTENSION IF NOT EXISTS vector;
```

## 2. Configure & Run FastAPI Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and set GEMINI_API_KEY and DATABASE_URL
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```
Swagger UI will be available at `http://localhost:8000/docs`.

## 3. Configure & Run React Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
The frontend runs on `http://localhost:5173` and proxies `/api/*` requests to `http://127.0.0.1:8000`.

## 4. Run Automated Backend Tests
```bash
cd backend
pytest ../tests/backend -v
```
