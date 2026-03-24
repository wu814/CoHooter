"""Integration tests for the full submission pipeline.

Requires both Judge0 and Flask server running.
"""

import pytest
import requests

from backend.tests.test_data import AI_GENERATOR_TEST_CASES


BASE_URL = "http://localhost:5000"


@pytest.fixture
def api_client():
    """Simple fixture that returns a configured requests session."""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.mark.integration
class TestSubmissionEndpoint:
    """Integration tests for /api/submit endpoint."""

    def test_health_check(self, api_client):
        """Test health endpoint."""
        response = api_client.get(f"{BASE_URL}/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"

    def test_simple_correct_submission(self, api_client):
        """Test a correct code submission."""
        payload = {
            "user_code": "def solution(a, b): return a + b",
            "username": "test_user",
            "session_id": "test-room",
            "test_cases": [
                {"input": "solution(10, 5)", "expected": "15"},
                {"input": "solution(3, 7)", "expected": "10"},
            ],
        }
        response = api_client.post(f"{BASE_URL}/api/submit", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 2
        assert data["passed"] == 2
        assert data["all_passed"] is True
        assert data["score_percent"] == 100.0

    def test_incorrect_submission(self, api_client):
        """Test an incorrect code submission."""
        payload = {
            "user_code": "def solution(a, b): return 0",
            "username": "test_user",
            "session_id": "test-room",
            "test_cases": [
                {"input": "solution(10, 5)", "expected": "15"},
            ],
        }
        response = api_client.post(f"{BASE_URL}/api/submit", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["passed"] == 0
        assert data["all_passed"] is False

    def test_missing_user_code(self, api_client):
        """Test submission without user_code."""
        payload = {
            "username": "test_user",
            "session_id": "test-room",
            "test_cases": [],
        }
        response = api_client.post(f"{BASE_URL}/api/submit", json=payload)
        assert response.status_code == 400
        assert "user_code" in response.json()["error"]

    def test_missing_test_cases(self, api_client):
        """Test submission without test_cases."""
        payload = {
            "user_code": "def solution(): pass",
            "username": "test_user",
            "session_id": "test-room",
        }
        response = api_client.post(f"{BASE_URL}/api/submit", json=payload)
        assert response.status_code == 400
        assert "test_cases" in response.json()["error"]


@pytest.mark.integration
class TestAIGeneratorInteroperability:
    """Test all 5 AI generator dummy inputs."""

    @pytest.mark.parametrize(
        "test_case",
        AI_GENERATOR_TEST_CASES,
        ids=[tc["problem"] for tc in AI_GENERATOR_TEST_CASES],
    )
    def test_ai_generator_case(self, api_client, test_case):
        """Test each AI generator input achieves 100% pass rate."""
        payload = {
            "user_code": test_case["correct_solution"],
            "username": "ai_test",
            "session_id": "ai-test-room",
            "test_cases": test_case["test_cases"],
        }
        response = api_client.post(f"{BASE_URL}/api/submit", json=payload)
        assert response.status_code == 200
        data = response.json()

        # Assert 100% pass rate
        assert data["all_passed"] is True, (
            f"Problem '{test_case['problem']}' failed: "
            f"passed {data['passed']}/{data['total']}"
        )
        assert data["score_percent"] == 100.0
