import json
from pathlib import Path
from sqlalchemy.orm import Session

from app.models.models import Application, CollegeKnowledge, Course

SEED_COURSES = [
    {
        "code": "VET-AIDS-01",
        "course_name": "B.Sc Computer Science (Artificial Intelligence & Data Science)",
        "course_category": "AI & DS",
        "level": "UG",
        "description": (
            "Premier program blending Machine Learning, Neural Networks, Computer Vision, "
            "Big Data, and Generative AI with hands-on GPU lab projects and industry capstones."
        ),
        "duration": "3 Years",
        "eligibility": (
            "10+2 (Higher Secondary) pass with Mathematics or Computer Science and minimum 55% aggregate marks."
        ),
        "fees": "₹38,000 / Semester",
        "fee_numeric": 38000,
        "seats": 60,
        "career_opportunities": [
            "Machine Learning Engineer",
            "Data Scientist",
            "AI Application Developer",
            "Business Intelligence Analyst",
            "Computer Vision Associate",
        ],
        "featured": True,
    },
    {
        "code": "VET-BCA-02",
        "course_name": "Bachelor of Computer Applications (BCA)",
        "course_category": "CS & IT",
        "level": "UG",
        "description": (
            "Comprehensive software engineering, web application development, mobile computing, "
            "and database systems curriculum designed for modern product engineering careers."
        ),
        "duration": "3 Years",
        "eligibility": (
            "10+2 (Higher Secondary) pass in any stream with Mathematics / Computer Applications and minimum 50% aggregate."
        ),
        "fees": "₹32,000 / Semester",
        "fee_numeric": 32000,
        "seats": 120,
        "career_opportunities": [
            "Full-Stack Web Developer",
            "Software Engineer",
            "Mobile Application Developer",
            "Cloud Support Associate",
            "Database Administrator",
        ],
        "featured": True,
    },
    {
        "code": "VET-CS-03",
        "course_name": "B.Sc Computer Science",
        "course_category": "CS & IT",
        "level": "UG",
        "description": (
            "Foundational and modern computing curriculum covering operating systems, algorithms, "
            "compiler design, cybersecurity, and cloud-native architecture."
        ),
        "duration": "3 Years",
        "eligibility": (
            "10+2 (Higher Secondary) pass with Mathematics and Computer Science / Physics with minimum 50% aggregate."
        ),
        "fees": "₹30,000 / Semester",
        "fee_numeric": 30000,
        "seats": 60,
        "career_opportunities": [
            "Systems Programmer",
            "Backend Developer",
            "QA Automation Engineer",
            "Cybersecurity Analyst",
            "IT Infrastructure Specialist",
        ],
        "featured": False,
    },
    {
        "code": "VET-BCOM-04",
        "course_name": "B.Com (Professional Accounting)",
        "course_category": "Commerce",
        "level": "UG",
        "description": (
            "Integrated coaching alongside CA Foundation and CMA qualifications with intensive "
            "training in IFRS, taxation, auditing, and corporate law."
        ),
        "duration": "3 Years",
        "eligibility": "10+2 (Higher Secondary) pass with Commerce and Accountancy (55% recommended).",
        "fees": "₹34,000 / Semester",
        "fee_numeric": 34000,
        "seats": 60,
        "career_opportunities": [
            "Chartered Accountancy Track",
            "Corporate Financial Auditor",
            "Taxation & GST Consultant",
            "Investment Banking Analyst",
            "Cost & Management Accountant",
        ],
        "featured": False,
    },
    {
        "code": "VET-BCOM-05",
        "course_name": "B.Com (Computer Applications)",
        "course_category": "Commerce",
        "level": "UG",
        "description": (
            "Unique blend of commercial accounting and modern enterprise software systems, "
            "ERP workflows, e-commerce, and business analytics."
        ),
        "duration": "3 Years",
        "eligibility": "10+2 (Higher Secondary) pass with Commerce / Accountancy / CS (minimum 50%).",
        "fees": "₹28,000 / Semester",
        "fee_numeric": 28000,
        "seats": 60,
        "career_opportunities": [
            "ERP Financial Consultant",
            "FinTech Operations Analyst",
            "E-Commerce Manager",
            "Accounts & MIS Executive",
            "Business Analyst",
        ],
        "featured": False,
    },
    {
        "code": "VET-BBA-06",
        "course_name": "BBA (International Business)",
        "course_category": "Management",
        "level": "UG",
        "description": (
            "Global supply chain, international trade law, cross-border corporate strategy, "
            "export-import management, and venture leadership."
        ),
        "duration": "3 Years",
        "eligibility": "10+2 (Higher Secondary) pass in any recognized stream with minimum 50% aggregate.",
        "fees": "₹32,000 / Semester",
        "fee_numeric": 32000,
        "seats": 60,
        "career_opportunities": [
            "Global Supply Chain Coordinator",
            "International Trade Specialist",
            "Management Trainee",
            "Corporate Strategy Associate",
            "Business Development Lead",
        ],
        "featured": False,
    },
    {
        "code": "VET-MSC-07",
        "course_name": "M.Sc Data Analytics",
        "course_category": "AI & DS",
        "level": "PG",
        "description": (
            "Postgraduate advanced analytics, deep predictive modeling, time-series forecasting, "
            "MLOps, and cloud data engineering with research dissertation."
        ),
        "duration": "2 Years",
        "eligibility": (
            "Recognized Bachelor's degree in CS, Data Science, Math, Statistics, or IT with minimum 55% aggregate."
        ),
        "fees": "₹42,000 / Semester",
        "fee_numeric": 42000,
        "seats": 30,
        "career_opportunities": [
            "Senior Data Analyst",
            "Applied ML Researcher",
            "Data Engineering Lead",
            "Quantitative Risk Analyst",
            "Cloud Analytics Architect",
        ],
        "featured": True,
    },
    {
        "code": "VET-DIP-08",
        "course_name": "Diploma in Applied AI & Cloud Computing",
        "course_category": "CS & IT",
        "level": "Diploma",
        "description": (
            "Career-focused 1-year intensive diploma covering Python programming, Generative AI workflows, "
            "Docker containers, and cloud deployment practices."
        ),
        "duration": "1 Year",
        "eligibility": "10+2 (Higher Secondary) pass or equivalent technical certificate in any stream.",
        "fees": "₹22,000 / Semester",
        "fee_numeric": 22000,
        "seats": 40,
        "career_opportunities": [
            "AI Prompt & Workflow Specialist",
            "Junior Cloud Operations Associate",
            "Python Automation Developer",
            "Technical Support Engineer",
        ],
        "featured": False,
    },
]


def load_knowledge_chunks() -> list[dict]:
    kb_path = Path(__file__).resolve().parents[3] / "knowledge_base" / "documents" / "knowledge_chunks.json"
    if kb_path.exists():
        return json.loads(kb_path.read_text(encoding="utf-8"))
    return []


def seed_database(db: Session) -> None:
    if db.query(Course).count() == 0:
        for c in SEED_COURSES:
            db.add(
                Course(
                    code=c["code"],
                    course_name=c["course_name"],
                    course_category=c["course_category"],
                    level=c["level"],
                    description=c["description"],
                    duration=c["duration"],
                    eligibility=c["eligibility"],
                    fees=c["fees"],
                    fee_numeric=c["fee_numeric"],
                    seats=c["seats"],
                    career_opportunities_json=json.dumps(c["career_opportunities"]),
                    featured=c["featured"],
                )
            )
        db.commit()

    if db.query(CollegeKnowledge).count() == 0:
        for item in load_knowledge_chunks():
            db.add(
                CollegeKnowledge(
                    title=item["title"],
                    content=item["content"],
                    category=item["category"],
                    source_file=item.get("source_file", "knowledge_base"),
                )
            )
        db.commit()

    # Clearly labeled demonstration test records for tracking/dashboard verification
    if db.query(Application).count() == 0:
        first_course = db.query(Course).filter(Course.code == "VET-AIDS-01").first()
        second_course = db.query(Course).filter(Course.code == "VET-BCA-02").first()
        if first_course and second_course:
            db.add_all(
                [
                    Application(
                        application_number="VETIAS-2026-APP-4821",
                        full_name="Sowmya R (Demo Applicant)",
                        email="student.demo@vetias.edu.in",
                        mobile_number="9876543210",
                        date_of_birth="2008-05-14",
                        gender="Female",
                        address="42 Perundurai Road, Erode, Tamil Nadu 638011",
                        selected_course_id=first_course.id,
                        academic_qualification="Computer Science",
                        percentage=94.2,
                        tenth_percentage=96.0,
                        previous_institution="Bharathi Vidya Bhavan Higher Secondary School",
                        quota="Merit",
                        application_status="Shortlisted - Round 1",
                        status_note="High academic merit in Mathematics & CS. Shortlisted for Round 1 counseling.",
                        is_demo=True,
                    ),
                    Application(
                        application_number="VETIAS-2026-APP-7319",
                        full_name="Sowmya R (Demo Applicant)",
                        email="student.demo@vetias.edu.in",
                        mobile_number="9876543210",
                        date_of_birth="2008-05-14",
                        gender="Female",
                        address="42 Perundurai Road, Erode, Tamil Nadu 638011",
                        selected_course_id=second_course.id,
                        academic_qualification="Computer Science",
                        percentage=94.2,
                        tenth_percentage=96.0,
                        previous_institution="Bharathi Vidya Bhavan Higher Secondary School",
                        quota="First Graduate",
                        application_status="Under Review",
                        status_note="Certificates uploaded. Pending revenue officer verification.",
                        is_demo=True,
                    ),
                ]
            )
            db.commit()
