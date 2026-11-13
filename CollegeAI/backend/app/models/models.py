import json
from datetime import datetime, timezone
from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    TypeDecorator,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class EmbeddingVector(TypeDecorator):
    """Stores 768-dim embeddings using pgvector on PostgreSQL and JSON text on SQLite tests."""

    impl = Text
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            from pgvector.sqlalchemy import Vector

            return dialect.type_descriptor(Vector(768))
        return dialect.type_descriptor(Text())

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if dialect.name == "postgresql":
            return value
        return json.dumps(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, str):
            return json.loads(value)
        return list(value)


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False, index=True)
    course_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    course_category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    level: Mapped[str] = mapped_column(String(32), nullable=False, default="UG", index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    duration: Mapped[str] = mapped_column(String(64), nullable=False)
    eligibility: Mapped[str] = mapped_column(Text, nullable=False)
    fees: Mapped[str] = mapped_column(String(100), nullable=False)
    fee_numeric: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    seats: Mapped[int] = mapped_column(Integer, nullable=False, default=60)
    career_opportunities_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    featured: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    applications: Mapped[list["Application"]] = relationship("Application", back_populates="course")

    @property
    def career_opportunities(self) -> list[str]:
        try:
            return json.loads(self.career_opportunities_json)
        except Exception:
            return []


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    application_number: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    mobile_number: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    date_of_birth: Mapped[str] = mapped_column(String(20), nullable=False)
    gender: Mapped[str] = mapped_column(String(20), nullable=False)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    selected_course_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("courses.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    academic_qualification: Mapped[str] = mapped_column(String(120), nullable=False)
    percentage: Mapped[float] = mapped_column(Float, nullable=False)
    tenth_percentage: Mapped[float | None] = mapped_column(Float, nullable=True)
    previous_institution: Mapped[str | None] = mapped_column(String(255), nullable=True)
    quota: Mapped[str] = mapped_column(String(64), nullable=False, default="Merit")
    application_status: Mapped[str] = mapped_column(String(64), nullable=False, default="Submitted")
    status_note: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        default="Application received by VETIAS Admissions Portal. Pending academic screening.",
    )
    is_demo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    course: Mapped["Course"] = relationship("Course", back_populates="applications")


class CollegeKnowledge(Base):
    __tablename__ = "college_knowledge"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    source_file: Mapped[str] = mapped_column(String(255), nullable=False, default="knowledge_base")
    embedding: Mapped[list[float] | None] = mapped_column(EmbeddingVector(), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_id: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    user_message: Mapped[str] = mapped_column(Text, nullable=False)
    assistant_response: Mapped[str] = mapped_column(Text, nullable=False)
    sources_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    __table_args__ = (Index("ix_chat_messages_session_created", "session_id", "created_at"),)

    @property
    def sources(self) -> list[dict]:
        try:
            return json.loads(self.sources_json)
        except Exception:
            return []
