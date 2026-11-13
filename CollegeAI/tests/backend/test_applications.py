def test_submit_application_and_verified_tracking(client):
    payload = {
        "full_name": "Arjun Kumar",
        "email": "arjun.kumar@example.com",
        "mobile_number": "9842211223",
        "date_of_birth": "2008-03-19",
        "gender": "Male",
        "address": "18 Mettur Road, Erode, Tamil Nadu 638001",
        "selected_course_id": 1,
        "academic_qualification": "Computer Science",
        "percentage": 91.5,
        "tenth_percentage": 93.0,
        "previous_institution": "Erode Model School",
        "quota": "Merit",
    }
    create_res = client.post("/api/applications", json=payload)
    assert create_res.status_code == 201
    app_data = create_res.json()["application"]
    ref_no = app_data["application_number"]
    assert ref_no.startswith("VETIAS-2026-APP-")
    assert app_data["application_status"] == "Submitted"

    # Tracking without contact should fail
    missing_contact = client.get(f"/api/applications/track/{ref_no}")
    assert missing_contact.status_code == 422

    # Tracking with wrong contact should return 403
    wrong_contact = client.get(f"/api/applications/track/{ref_no}?contact=wrong@example.com")
    assert wrong_contact.status_code == 403

    # Tracking with verified email succeeds
    ok_res = client.get(f"/api/applications/track/{ref_no}?contact=arjun.kumar@example.com")
    assert ok_res.status_code == 200
    assert ok_res.json()["application"]["full_name"] == "Arjun Kumar"


def test_application_validation_errors(client):
    invalid_payload = {
        "full_name": "A",
        "email": "not-an-email",
        "mobile_number": "123",
        "date_of_birth": "19-03-2008",
        "gender": "Male",
        "address": "12",
        "selected_course_id": 1,
        "academic_qualification": "CS",
        "percentage": 150,
    }
    res = client.post("/api/applications", json=invalid_payload)
    assert res.status_code == 422
