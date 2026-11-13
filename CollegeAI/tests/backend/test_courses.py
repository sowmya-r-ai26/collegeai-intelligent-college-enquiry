def test_list_courses(client):
    res = client.get("/api/courses")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 8
    codes = [c["code"] for c in data["courses"]]
    assert "VET-AIDS-01" in codes
    assert "VET-BCA-02" in codes


def test_filter_courses_by_level_and_category(client):
    pg_res = client.get("/api/courses?level=PG")
    assert pg_res.status_code == 200
    assert all(c["level"] == "PG" for c in pg_res.json()["courses"])

    dip_res = client.get("/api/courses?level=Diploma")
    assert dip_res.status_code == 200
    assert dip_res.json()["total"] >= 1


def test_search_courses(client):
    res = client.get("/api/courses/search?q=Data")
    assert res.status_code == 200
    assert res.json()["total"] >= 2


def test_get_course_detail_and_not_found(client):
    res = client.get("/api/courses/1")
    assert res.status_code == 200
    assert res.json()["course"]["id"] == 1

    not_found = client.get("/api/courses/99999")
    assert not_found.status_code == 404
