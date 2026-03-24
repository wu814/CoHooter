"""Unit tests for judge/models.py."""

import pytest
from backend.judge.models import TestCase, TestCaseResult, GradingResult


class TestTestCase:
    def test_instantiation(self):
        tc = TestCase(input="solution(1, 2)", expected="3")
        assert tc.input == "solution(1, 2)"
        assert tc.expected == "3"


class TestTestCaseResult:
    def test_instantiation_passed(self):
        result = TestCaseResult(
            input="solution(1, 2)",
            expected="3",
            actual_output="3",
            passed=True,
            status_description="Accepted",
        )
        assert result.passed is True
        assert result.error_message is None

    def test_instantiation_failed(self):
        result = TestCaseResult(
            input="solution(1, 2)",
            expected="3",
            actual_output="4",
            passed=False,
            status_description="Wrong Answer",
            error_message="Output mismatch",
        )
        assert result.passed is False
        assert result.error_message == "Output mismatch"


class TestGradingResult:
    def test_all_passed_true(self):
        results = [
            TestCaseResult(
                input="t1", expected="1", actual_output="1",
                passed=True, status_description="Accepted"
            ),
            TestCaseResult(
                input="t2", expected="2", actual_output="2",
                passed=True, status_description="Accepted"
            ),
        ]
        gr = GradingResult(total=2, passed=2, results=results)
        assert gr.all_passed is True

    def test_all_passed_false(self):
        results = [
            TestCaseResult(
                input="t1", expected="1", actual_output="1",
                passed=True, status_description="Accepted"
            ),
            TestCaseResult(
                input="t2", expected="2", actual_output="3",
                passed=False, status_description="Wrong Answer"
            ),
        ]
        gr = GradingResult(total=2, passed=1, results=results)
        assert gr.all_passed is False

    def test_score_percent_full(self):
        gr = GradingResult(total=4, passed=4, results=[])
        assert gr.score_percent == 100.0

    def test_score_percent_partial(self):
        gr = GradingResult(total=4, passed=2, results=[])
        assert gr.score_percent == 50.0

    def test_score_percent_zero(self):
        gr = GradingResult(total=4, passed=0, results=[])
        assert gr.score_percent == 0.0

    def test_empty_results(self):
        gr = GradingResult(total=0, passed=0, results=[])
        assert gr.all_passed is False
        assert gr.score_percent == 0.0

    def test_to_dict(self):
        results = [
            TestCaseResult(
                input="t1", expected="1", actual_output="1",
                passed=True, status_description="Accepted"
            ),
        ]
        gr = GradingResult(total=1, passed=1, results=results)
        d = gr.to_dict()
        assert d["total"] == 1
        assert d["passed"] == 1
        assert d["all_passed"] is True
        assert d["score_percent"] == 100.0
        assert len(d["results"]) == 1
        assert d["results"][0]["passed"] is True
