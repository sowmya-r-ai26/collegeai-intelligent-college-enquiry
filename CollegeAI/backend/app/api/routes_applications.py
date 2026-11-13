import re
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.models import Application, Course
from app.schemas.schemas import (
    ApplicationCreate,
    ApplicationCreateResponse,
    ApplicationOut,
    ApplicationTrackResponse,
    DashboardVerifyRequest,
)
from app.utils.reference_generator import generate_unique_application_number

router = APIRouter(prefix="/api/applications", tags=["Applications"])


def _serialize_application(app: Application) -> ApplicationOut:
    return ApplicationOut(
        id=app.id,
        application_number=app.application_number,
        full_name=app.full_name,
        email=app.email,
        mobile_number=app.mobile_number,
        date_of_birth=app.date_of_birth,
        gender=app.gender,
        address=app.address,
        selected_course_id=app.selected_course_id,
        course_name=app.course.course_name if app.course else None,
        course_code=app.course.code if app.course else None,
        academic_qualification=app.academic_qualification,
        percentage=app.percentage,
        tenth_percentage=app.tenth_percentage,
        previous_institution=app.previous_institution,
        quota=app.quota,
        application_status=app.application_status,
        status_note=app.status_note,
        is_demo=app.is_demo,
        created_at=app.created_at,
    )


@router.post("", response_model=ApplicationCreateResponse, status_code=status.HTTP_201_CREATED)
def submit_application(payload: ApplicationCreate, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == payload.selected_course_id).first()
    if not course:
        raise HTTPException(status_code=422, detail="Selected course was not found.")

    app_number = generate_unique_application_number(db)
    record = Application(
        application_number=app_number,
        full_name=payload.full_name.strip(),
        email=str(payload.email).strip(),
        mobile_number=payload.mobile_number,
        date_of_birth=payload.date_of_birth,
        gender=payload.gender,
        address=payload.address.strip(),
        selected_course_id=payload.selected_course_id,
        academic_qualification=payload.academic_qualification.strip(),
        percentage=payload.percentage,
        tenth_percentage=payload.tenth_percentage,
        previous_institution=(payload.previous_institution or "").strip() or None,
        quota=payload.quota.strip() or "Merit",
        application_status="Submitted",
        status_note="Application received by VETIAS Admissions Portal. Pending initial screening.",
        is_demo=False,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "message": "Application submitted successfully.",
        "application": _serialize_application(record),
    }


@router.get("/track/{application_number}", response_model=ApplicationTrackResponse)
def track_application(
    application_number: str,
    contact: str = Query(..., min_length=4, description="Registered email or 10-digit mobile"),
    db: Session = Depends(get_db),
):
    app_record = (
        db.query(Application)
        .filter(func.upper(Application.application_number) == application_number.strip().upper())
        .first()
    )
    if not app_record:
        raise HTTPException(
            status_code=404,
            detail=f"No application found matching reference number '{application_number}'.",
        )

    normalized = contact.strip().lower()
    digits = re.sub(r"\D", "", normalized)[-10:]
    record_digits = re.sub(r"\D", "", app_record.mobile_number)[-10:]

    email_ok = app_record.email.lower() == normalized
    phone_ok = len(digits) >= 10 and record_digits == digits

    if not email_ok and not phone_ok:
        raise HTTPException(
            status_code=403,
            detail="Contact verification failed. Email or mobile does not match this application.",
        )

    return {"application": _serialize_application(app_record)}


@router.post("/verify-dashboard")
def verify_dashboard(payload: DashboardVerifyRequest, db: Session = Depends(get_db)):
    normalized = payload.contact.strip().lower()
    digits = re.sub(r"\D", "", normalized)[-10:]

    candidates = db.query(Application).order_by(Application.created_at.desc()).all()
    matched: list[Application] = []
    for app in candidates:
        email_ok = app.email.lower() == normalized
        phone_ok = len(digits) >= 10 and re.sub(r"\D", "", app.mobile_number)[-10:] == digits
        if email_ok or phone_ok:
            if payload.application_number:
                if app.application_number.upper() != payload.application_number.strip().upper():
                    continue
            matched.append(app)

    if not matched:
        raise HTTPException(
            status_code=404,
            detail="No verified applications found for those credentials.",
        )

    return {
        "applicant": {
            "full_name": matched[0].full_name,
            "email": matched[0].email,
            "mobile_number": matched[0].mobile_number,
            "is_demo": matched[0].is_demo,
        },
        "applications": [_serialize_application(a) for a in matched],
    }
