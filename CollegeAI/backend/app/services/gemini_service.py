import json
from google import genai
from google.genai import types
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.models import ChatMessage
from app.rag.embeddings import retrieve_relevant_knowledge


class GeminiServiceError(Exception):
    def __init__(self, message: str, status_code: int = 500):
        super().__init__(message)
        self.status_code = status_code


def generate_rag_response(db: Session, session_id: str, user_message: str) -> dict:
    settings = get_settings()
    if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "YOUR_GEMINI_API_KEY":
        raise GeminiServiceError(
            "GEMINI_API_KEY is not configured in backend .env.",
            status_code=503,
        )

    sources = retrieve_relevant_knowledge(db, user_message, top_k=5)
    recent_history = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(6)
        .all()
    )
    recent_history.reverse()

    context_block = "\n\n".join(
        f"[Source {idx + 1}: {s['title']} ({s['category']})]\n{s['content']}"
        for idx, s in enumerate(sources)
    )
    history_block = "\n\n".join(
        f"User: {m.user_message}\nCollegeAI: {m.assistant_response}"
        for m in recent_history
    )

    system_instruction = (
        "You are CollegeAI, the official Intelligent College Enquiry & Admission Assistant for "
        "VET Institute of Arts & Science (VETIAS), Erode, affiliated with Bharathiar University.\n"
        "STRICT GROUNDING RULES:\n"
        "1. Answer ONLY using the verified VETIAS Knowledge Base context provided.\n"
        "2. NEVER invent tuition fees, eligibility percentages, seat counts, hostel fees, or dates.\n"
        "3. If information is missing from the context, politely instruct the user to contact the "
        "VETIAS Admissions Office at admissions@vetias.edu.in or +91-4294-224400.\n"
        "4. Cite source titles or course codes naturally."
    )

    prompt_parts = [
        "--- VERIFIED VETIAS KNOWLEDGE BASE CONTEXT ---",
        context_block,
    ]
    if history_block:
        prompt_parts.append(f"\n--- RECENT CONVERSATION HISTORY ---\n{history_block}")
    prompt_parts.append(f"\n--- CURRENT USER QUESTION ---\n{user_message}")
    full_prompt = "\n".join(prompt_parts)

    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = client.models.generate_content(
            model=settings.GEMINI_CHAT_MODEL,
            contents=full_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
            ),
        )
        assistant_text = (response.text or "").strip()
        if not assistant_text:
            assistant_text = (
                "I could not generate an answer right now. Please contact VETIAS Admissions at "
                "admissions@vetias.edu.in."
            )
    except Exception as exc:
        raise GeminiServiceError(f"Gemini API error: {exc}", status_code=502) from exc

    cited_sources = [
        {
            "id": s["id"],
            "title": s["title"],
            "category": s["category"],
            "score": s["score"],
        }
        for s in sources
        if s["score"] > 0.05
    ][:3]

    record = ChatMessage(
        session_id=session_id,
        user_message=user_message,
        assistant_response=assistant_text,
        sources_json=json.dumps(cited_sources),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "session_id": session_id,
        "user_message": user_message,
        "assistant_response": assistant_text,
        "sources": cited_sources,
    }
