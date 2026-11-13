from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_applications import router as applications_router
from app.api.routes_chat import router as chat_router
from app.api.routes_college import router as college_router
from app.api.routes_courses import router as courses_router
from app.api.routes_health import router as health_router
from app.core.config import get_settings
from app.database.seed import seed_database
from app.database.session import Base, SessionLocal, engine

settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Intelligent College Enquiry & Admission Assistant REST API (FastAPI + PostgreSQL/pgvector + Gemini RAG)",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(college_router)
app.include_router(courses_router)
app.include_router(applications_router)
app.include_router(chat_router)
