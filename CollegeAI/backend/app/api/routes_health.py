from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.database.session import get_db
from app.models.models import CollegeKnowledge, Course

router = APIRouter(prefix="/api", tags=["Health"])


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    settings = get_settings()
    db.execute(text("SELECT 1"))
    courses_count = db.query(Course).count()
    chunks_count = db.query(CollegeKnowledge).count()
    return {
        "status": "ok",
        "service": settings.APP_NAME,
        "institution": "VETIAS",
        "database": "connected",
        "courses_count": courses_count,
        "knowledge_chunks_count": chunks_count,
        "gemini_configured": bool(
            settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "YOUR_GEMINI_API_KEY"
        ),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
