"""Data models for code grading."""

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class TestCase:
    """A single test case with input expression and expected output."""

    input: str
    expected: str


@dataclass
class TestCaseResult:
    """Result of running a single test case."""

    input: str
    expected: str
    actual_output: Optional[str]
    passed: bool
    status_description: str
    error_message: Optional[str] = None


@dataclass
class GradingResult:
    """Aggregated result of grading all test cases."""

    total: int
    passed: int
    results: list[TestCaseResult] = field(default_factory=list)

    @property
    def all_passed(self) -> bool:
        """Return True if all test cases passed."""
        return self.total > 0 and self.passed == self.total

    @property
    def score_percent(self) -> float:
        """Return the percentage of test cases that passed."""
        if self.total == 0:
            return 0.0
        return (self.passed / self.total) * 100.0

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "total": self.total,
            "passed": self.passed,
            "all_passed": self.all_passed,
            "score_percent": self.score_percent,
            "results": [
                {
                    "input": r.input,
                    "expected": r.expected,
                    "actual_output": r.actual_output,
                    "passed": r.passed,
                    "status_description": r.status_description,
                    "error_message": r.error_message,
                }
                for r in self.results
            ],
        }
