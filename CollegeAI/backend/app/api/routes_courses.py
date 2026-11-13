from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.models import Course
from app.schemas.schemas import CourseDetailResponse, CourseListResponse

router = APIRouter(prefix="/api/courses", tags=["Courses"])


@router.get("", response_model=CourseListResponse)
def list_courses(
    category: str | None = Query(default=None),
    level: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(Course)
    if category and category.lower() != "all":
        query = query.filter(Course.course_category.ilike(category))
    if level and level.lower() != "all":
        query = query.filter(Course.level.ilike(level))
    courses = query.order_by(Course.id.asc()).all()
    return {"courses": courses, "total": len(courses)}


@router.get("/search", response_model=CourseListResponse)
def search_courses(
    q: str = Query(default=""),
    category: str | None = Query(default=None),
    level: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(Course)
    if category and category.lower() != "all":
        query = query.filter(Course.course_category.ilike(category))
    if level and level.lower() != "all":
        query = query.filter(Course.level.ilike(level))
    if q.strip():
        pattern = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Course.course_name.ilike(pattern),
                Course.code.ilike(pattern),
                Course.course_category.ilike(pattern),
                Course.description.ilike(pattern),
                Course.eligibility.ilike(pattern),
                Course.career_opportunities_json.ilike(pattern),
            )
        )
    courses = query.order_by(Course.id.asc()).all()
    return {"courses": courses, "total": len(courses)}


@router.get("/{course_id}", response_model=CourseDetailResponse)
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found.")
    return {"course": course}
