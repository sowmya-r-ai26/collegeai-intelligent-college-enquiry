import secrets
from sqlalchemy.orm import Session

from app.models.models import Application


def generate_unique_application_number(db: Session, year: int = 2026) -> str:
    """Generate a unique VETIAS-<YEAR>-APP-XXXX reference number."""
    for _ in range(50):
        digits = 1000 + secrets.randbelow(9000)
        candidate = f"VETIAS-{year}-APP-{digits}"
        exists = db.query(Application).filter(Application.application_number == candidate).first()
        if not exists:
            return candidate
    fallback_digits = 10000 + secrets.randbelow(89999)
    return f"VETIAS-{year}-APP-{fallback_digits}"
