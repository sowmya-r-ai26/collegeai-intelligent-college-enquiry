from unittest.mock import patch


def test_chatbot_missing_api_key_returns_503(client):
    res = client.post(
        "/api/chat",
        json={"session_id": "test-session-1", "message": "What is the BCA fee?"},
    )
    assert res.status_code == 503
    assert "GEMINI_API_KEY" in res.json()["detail"]


def test_chatbot_rag_pipeline_and_history(client):
    mocked_reply = {
        "session_id": "test-session-rag",
        "user_message": "What is the BCA tuition fee?",
        "assistant_response": "The tuition fee for BCA (VET-BCA-02) is ₹32,000 per semester.",
        "sources": [
            {
                "id": 4,
                "title": "Bachelor of Computer Applications (BCA) Overview",
                "category": "Courses",
                "score": 0.91,
            }
        ],
    }

    with patch("app.api.routes_chat.generate_rag_response", return_value=mocked_reply):
        res = client.post(
            "/api/chat",
            json={"session_id": "test-session-rag", "message": "What is the BCA tuition fee?"},
        )
        assert res.status_code == 200
        assert "32,000" in res.json()["assistant_response"]

    hist_res = client.get("/api/chat/history/test-session-rag")
    assert hist_res.status_code == 200
    assert hist_res.json()["session_id"] == "test-session-rag"
