"""Tests for judge/runner.py - Requires Judge0 running."""

import pytest
from backend.judge.runner import GradingRunner, _build_final_script
from backend.judge.models import TestCase


class TestBuildFinalScript:
    def test_simple_function(self):
        user_code = "def solution(a, b): return a + b"
        test_input = "solution(10, 5)"
        result = _build_final_script(user_code, test_input)
        expected = "def solution(a, b): return a + b\nprint(solution(10, 5))"
        assert result == expected

    def test_multiline_function(self):
        user_code = """def solution(s):
    return s[::-1]"""
        test_input = "solution('hello')"
        result = _build_final_script(user_code, test_input)
        assert "print(solution('hello'))" in result
        assert "def solution(s):" in result


@pytest.fixture
def runner():
    return GradingRunner()


@pytest.mark.integration
class TestGradingRunner:
    """Integration tests requiring Judge0 to be running."""

    def test_all_passing_submission(self, runner):
        """Test submission where all test cases pass."""
        user_code = "def solution(a, b): return a + b"
        test_cases = [
            TestCase(input="solution(10, 5)", expected="15"),
            TestCase(input="solution(0, 0)", expected="0"),
            TestCase(input="solution(-3, 3)", expected="0"),
        ]
        result = runner.grade_submission(user_code, test_cases)
        assert result.total == 3
        assert result.passed == 3
        assert result.all_passed is True
        assert result.score_percent == 100.0

    def test_partial_failure(self, runner):
        """Test submission where some test cases fail."""
        user_code = "def solution(a, b): return a + b + 1"  # Intentionally wrong
        test_cases = [
            TestCase(input="solution(10, 5)", expected="15"),  # Fails (returns 16)
            TestCase(input="solution(-1, 0)", expected="0"),   # Passes
        ]
        result = runner.grade_submission(user_code, test_cases)
        assert result.total == 2
        assert result.passed == 1
        assert result.all_passed is False
        assert result.score_percent == 50.0

    def test_empty_test_cases(self, runner):
        """Test submission with no test cases."""
        user_code = "def solution(): pass"
        test_cases = []
        result = runner.grade_submission(user_code, test_cases)
        assert result.total == 0
        assert result.passed == 0
        assert result.all_passed is False
        assert result.score_percent == 0.0

    def test_syntax_error_in_code(self, runner):
        """Test submission with syntax error."""
        user_code = "def solution(a, b): return a +"  # Syntax error
        test_cases = [
            TestCase(input="solution(1, 2)", expected="3"),
        ]
        result = runner.grade_submission(user_code, test_cases)
        assert result.total == 1
        assert result.passed == 0
        assert result.all_passed is False
        assert result.results[0].passed is False
