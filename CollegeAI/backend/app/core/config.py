from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "CollegeAI — VETIAS Admissions API"
    ENVIRONMENT: str = "development"
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/collegeai_db"
    GEMINI_API_KEY: str = ""
    GEMINI_CHAT_MODEL: str = "gemini-4-hydrogen"
    GEMINI_EMBEDDING_MODEL: str = "gemini-embedding-2"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
