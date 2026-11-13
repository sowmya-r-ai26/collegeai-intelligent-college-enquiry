def test_health_endpoint(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "ok"
    assert body["database"] == "connected"
    assert body["courses_count"] >= 8
    assert body["knowledge_chunks_count"] >= 23


def test_college_info_endpoint(client):
    res = client.get("/api/college/info")
    assert res.status_code == 200
    body = res.json()
    assert body["short_code"] == "VETIAS"
    assert len(body["events"]) >= 2
    assert len(body["notices"]) >= 3
