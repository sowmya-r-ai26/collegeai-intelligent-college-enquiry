"""Initial CollegeAI schema with pgvector extension

Revision ID: 001_initial_schema
Revises:
Create Date: 2026-11-13 00:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector

revision: str = "001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    op.create_table(
        "courses",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("code", sa.String(length=32), nullable=False),
        sa.Column("course_name", sa.String(length=255), nullable=False),
        sa.Column("course_category", sa.String(length=100), nullable=False),
        sa.Column("level", sa.String(length=32), nullable=False, server_default="UG"),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("duration", sa.String(length=64), nullable=False),
        sa.Column("eligibility", sa.Text(), nullable=False),
        sa.Column("fees", sa.String(length=100), nullable=False),
        sa.Column("fee_numeric", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("seats", sa.Integer(), nullable=False, server_default="60"),
        sa.Column("career_opportunities_json", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("featured", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_courses_code", "courses", ["code"], unique=True)
    op.create_index("ix_courses_course_name", "courses", ["course_name"])
    op.create_index("ix_courses_course_category", "courses", ["course_category"])

    op.create_table(
        "applications",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("application_number", sa.String(length=64), nullable=False),
        sa.Column("full_name", sa.String(length=200), nullable=False),
        sa.Column("email", sa.String(length=200), nullable=False),
        sa.Column("mobile_number", sa.String(length=20), nullable=False),
        sa.Column("date_of_birth", sa.String(length=20), nullable=False),
        sa.Column("gender", sa.String(length=20), nullable=False),
        sa.Column("address", sa.Text(), nullable=False),
        sa.Column(
            "selected_course_id",
            sa.Integer(),
            sa.ForeignKey("courses.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("academic_qualification", sa.String(length=120), nullable=False),
        sa.Column("percentage", sa.Float(), nullable=False),
        sa.Column("tenth_percentage", sa.Float(), nullable=True),
        sa.Column("previous_institution", sa.String(length=255), nullable=True),
        sa.Column("quota", sa.String(length=64), nullable=False, server_default="Merit"),
        sa.Column("application_status", sa.String(length=64), nullable=False, server_default="Submitted"),
        sa.Column("status_note", sa.Text(), nullable=False),
        sa.Column("is_demo", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_applications_application_number", "applications", ["application_number"], unique=True)
    op.create_index("ix_applications_email", "applications", ["email"])
    op.create_index("ix_applications_mobile_number", "applications", ["mobile_number"])

    op.create_table(
        "college_knowledge",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.Column("source_file", sa.String(length=255), nullable=False),
        sa.Column("embedding", Vector(768) if bind.dialect.name == "postgresql" else sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_college_knowledge_category", "college_knowledge", ["category"])

    op.create_table(
        "chat_messages",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("session_id", sa.String(length=128), nullable=False),
        sa.Column("user_message", sa.Text(), nullable=False),
        sa.Column("assistant_response", sa.Text(), nullable=False),
        sa.Column("sources_json", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_chat_messages_session_created", "chat_messages", ["session_id", "created_at"])


def downgrade() -> None:
    op.drop_table("chat_messages")
    op.drop_table("college_knowledge")
    op.drop_table("applications")
    op.drop_table("courses")
