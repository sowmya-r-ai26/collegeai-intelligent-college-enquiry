import re
from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class CourseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    course_name: str
    course_category: str
    level: str
    description: str
    duration: str
    eligibility: str
    fees: str
    fee_numeric: int
    seats: int
    career_opportunities: list[str]
    featured: bool
    created_at: datetime


class CourseListResponse(BaseModel):
    courses: list[CourseOut]
    total: int


class CourseDetailResponse(BaseModel):
    course: CourseOut


class ApplicationCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=200)
    email: EmailStr
    mobile_number: str = Field(..., min_length=10, max_length=20)
    date_of_birth: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    gender: Literal["Male", "Female", "Other"]
    address: str = Field(..., min_length=5, max_length=500)
    selected_course_id: int = Field(..., gt=0)
    academic_qualification: str = Field(..., min_length=2, max_length=120)
    percentage: float = Field(..., ge=35.0, le=100.0)
    tenth_percentage: float | None = Field(default=None, ge=35.0, le=100.0)
    previous_institution: str | None = Field(default=None, max_length=255)
    quota: str = Field(default="Merit", max_length=64)

    @field_validator("mobile_number")
    @classmethod
    def normalize_mobile(cls, v: str) -> str:
        digits = re.sub(r"\D", "", v)
        if len(digits) < 10 or len(digits) > 13:
            raise ValueError("Mobile number must contain 10 to 13 digits.")
        return digits[-10:]


class ApplicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    application_number: str
    full_name: str
    email: str
    mobile_number: str
    date_of_birth: str
    gender: str
    address: str
    selected_course_id: int
    course_name: str | None = None
    course_code: str | None = None
    academic_qualification: str
    percentage: float
    tenth_percentage: float | None = None
    previous_institution: str | None = None
    quota: str
    application_status: str
    status_note: str
    is_demo: bool = False
    created_at: datetime


class ApplicationCreateResponse(BaseModel):
    message: str
    application: ApplicationOut


class ApplicationTrackResponse(BaseModel):
    application: ApplicationOut


class DashboardVerifyRequest(BaseModel):
    contact: str = Field(..., min_length=4, max_length=200)
    application_number: str | None = None


class ChatRequest(BaseModel):
    session_id: str = Field(..., min_length=3, max_length=128)
    message: str = Field(..., min_length=1, max_length=1500)


class ChatSourceOut(BaseModel):
    id: int
    title: str
    category: str
    score: float


class ChatResponse(BaseModel):
    session_id: str
    user_message: str
    assistant_response: str
    sources: list[ChatSourceOut]


class ChatMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    session_id: str
    user_message: str
    assistant_response: str
    sources: list[ChatSourceOut]
    created_at: datetime


class ChatHistoryResponse(BaseModel):
    session_id: str
    messages: list[ChatMessageOut]
