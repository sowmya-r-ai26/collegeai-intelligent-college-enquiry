from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.models import ChatMessage
from app.schemas.schemas import ChatHistoryResponse, ChatMessageOut, ChatRequest, ChatResponse
from app.services.gemini_service import GeminiServiceError, generate_rag_response

router = APIRouter(prefix="/api/chat", tags=["Chatbot"])


@router.post("", response_model=ChatResponse)
def chat_enquiry(payload: ChatRequest, db: Session = Depends(get_db)):
    try:
        return generate_rag_response(db, payload.session_id.strip(), payload.message.strip())
    except GeminiServiceError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc


@router.get("/history/{session_id}", response_model=ChatHistoryResponse)
def get_chat_history(session_id: str, db: Session = Depends(get_db)):
    rows = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id.strip())
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    messages = [
        ChatMessageOut(
            id=row.id,
            session_id=row.session_id,
            user_message=row.user_message,
            assistant_response=row.assistant_response,
            sources=row.sources,
            created_at=row.created_at,
        )
        for row in rows
    ]
    return {"session_id": session_id, "messages": messages}
