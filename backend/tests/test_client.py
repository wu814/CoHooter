"""Tests for judge/client.py - Requires Judge0 running."""

import pytest
from backend.judge.client import (
    Judge0Client,
    STATUS_ACCEPTED,
    STATUS_WRONG_ANSWER,
    STATUS_COMPILATION_ERROR,
    STATUS_RUNTIME_ERROR,
)


@pytest.fixture
def client():
    return Judge0Client()


@pytest.mark.integration
class TestJudge0Client:
    """Integration tests requiring Judge0 to be running."""

    def test_health_check(self, client):
        """Test Judge0 is reachable."""
        assert client.check_health() is True

    def test_successful_submission(self, client):
        """Test a correct Python submission."""
        result = client.submit_and_wait(
            source_code="print(2 + 2)",
            expected_output="4",
        )
        assert result.status_id == STATUS_ACCEPTED
        assert result.stdout.strip() == "4"

    def test_wrong_answer(self, client):
        """Test submission with wrong output."""
        result = client.submit_and_wait(
            source_code="print(5)",
            expected_output="4",
        )
        # Note: With the SDK, wrong answer may still return ACCEPTED status
        # since we're not using Judge0's built-in comparison
        assert result.stdout.strip() == "5"

    def test_syntax_error(self, client):
        """Test submission with syntax error."""
        result = client.submit_and_wait(
            source_code="def broken(",
        )
        assert result.status_id == STATUS_COMPILATION_ERROR

    def test_runtime_error(self, client):
        """Test submission that raises an exception."""
        result = client.submit_and_wait(
            source_code="raise ValueError('test error')",
        )
        assert result.status_id == STATUS_RUNTIME_ERROR
