from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.models import CollegeKnowledge, Course
from app.services.college_data import COLLEGE_INFO_DATA

router = APIRouter(prefix="/api/college", tags=["College Info"])


@router.get("/info")
def get_college_info(db: Session = Depends(get_db)):
    data = dict(COLLEGE_INFO_DATA)
    stats = dict(COLLEGE_INFO_DATA["stats"])
    stats["accredited_degrees"] = db.query(Course).count() or stats["accredited_degrees"]
    stats["rag_chunks"] = db.query(CollegeKnowledge).count() or stats["rag_chunks"]
    data["stats"] = stats
    return data
