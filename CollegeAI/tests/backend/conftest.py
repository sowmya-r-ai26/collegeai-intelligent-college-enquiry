import os
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure backend app is importable
BACKEND_DIR = Path(__file__).resolve().parents[2] / "backend"
sys.path.insert(0, str(BACKEND_DIR))

os.environ["DATABASE_URL"] = "sqlite:///./test_collegeai.db"
os.environ["GEMINI_API_KEY"] = ""

from app.database.seed import seed_database  # noqa: E402
from app.database.session import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402

TEST_ENGINE = create_engine(
    "sqlite:///./test_collegeai.db",
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=TEST_ENGINE)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=TEST_ENGINE)
    Base.metadata.create_all(bind=TEST_ENGINE)
    db = TestingSessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield
    Base.metadata.drop_all(bind=TEST_ENGINE)
    db_file = Path("test_collegeai.db")
    if db_file.exists():
        db_file.unlink()


@pytest.fixture()
def client():
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
