import math
import re
from google import genai
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.models import CollegeKnowledge


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    if not a or not b or len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot / (norm_a * norm_b)


def _lexical_score(query: str, chunk: CollegeKnowledge) -> float:
    terms = [t for t in re.sub(r"[^a-z0-9\s]", " ", query.lower()).split() if len(t) > 2]
    if not terms:
        return 0.0
    haystack = f"{chunk.title} {chunk.category} {chunk.content}".lower()
    hits = 0.0
    for t in terms:
        if t in haystack:
            hits += 2.0 if t in chunk.title.lower() else 1.0
    return hits / (len(terms) * 1.5)


def embed_text(text: str) -> list[float] | None:
    settings = get_settings()
    if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "YOUR_GEMINI_API_KEY":
        return None
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    response = client.models.embed_content(
        model=settings.GEMINI_EMBEDDING_MODEL,
        contents=text,
    )
    if response.embeddings and len(response.embeddings) > 0:
        return list(response.embeddings[0].values)
    return None


def ensure_knowledge_embeddings(db: Session) -> None:
    settings = get_settings()
    if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "YOUR_GEMINI_API_KEY":
        return

    missing = db.query(CollegeKnowledge).filter(CollegeKnowledge.embedding.is_(None)).all()
    if not missing:
        return

    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    contents = [f"{item.title}\n{item.content}" for item in missing]
    response = client.models.embed_content(
        model=settings.GEMINI_EMBEDDING_MODEL,
        contents=contents,
    )
    if response.embeddings:
        for chunk, emb in zip(missing, response.embeddings):
            chunk.embedding = list(emb.values)
        db.commit()


def retrieve_relevant_knowledge(db: Session, query: str, top_k: int = 5) -> list[dict]:
    query_vec: list[float] | None = None
    try:
        ensure_knowledge_embeddings(db)
        query_vec = embed_text(query)
    except Exception:
        query_vec = None

    # Use pgvector native cosine distance operator when connected to PostgreSQL and query_vec exists
    if query_vec is not None and db.bind is not None and db.bind.dialect.name == "postgresql":
        distance_expr = CollegeKnowledge.embedding.cosine_distance(query_vec)
        rows = (
            db.query(CollegeKnowledge, distance_expr.label("distance"))
            .filter(CollegeKnowledge.embedding.is_not(None))
            .order_by(distance_expr.asc())
            .limit(top_k)
            .all()
        )
        if rows:
            results = []
            for chunk, distance in rows:
                sim = max(0.0, 1.0 - float(distance))
                results.append(
                    {
                        "id": chunk.id,
                        "title": chunk.title,
                        "category": chunk.category,
                        "content": chunk.content,
                        "score": round(sim, 4),
                    }
                )
            return results

    # Fallback hybrid cosine + lexical ranking (used for SQLite tests or offline embeddings)
    chunks = db.query(CollegeKnowledge).all()
    scored = []
    for chunk in chunks:
        vec_sim = (
            _cosine_similarity(query_vec, chunk.embedding)
            if query_vec and chunk.embedding and len(chunk.embedding) == len(query_vec)
            else 0.0
        )
        lex = _lexical_score(query, chunk)
        combined = (vec_sim * 0.78 + min(lex, 1.0) * 0.22) if query_vec else lex
        scored.append(
            {
                "id": chunk.id,
                "title": chunk.title,
                "category": chunk.category,
                "content": chunk.content,
                "score": round(combined, 4),
            }
        )

    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:top_k]
