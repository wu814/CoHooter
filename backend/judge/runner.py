"""Grading orchestration using Judge0."""

from typing import Optional

from .client import Judge0Client, STATUS_ACCEPTED, SubmissionResult
from .models import GradingResult, TestCase, TestCaseResult


def _build_final_script(user_code: str, test_input: str) -> str:
    """Apply the 'code sandwich' strategy - wrap user code with print statement.

    User code is combined with a print statement that captures the return value.

    Example:
        user_code: "def solution(a, b): return a + b"
        test_input: "solution(10, 5)"

        Result:
            def solution(a, b): return a + b
            print(solution(10, 5))
    """
    return f"{user_code}\nprint({test_input})"


def _evaluate_single(
    client: Judge0Client,
    user_code: str,
    test_case: TestCase,
) -> TestCaseResult:
    """Run a single test case and return the result."""
    final_script = _build_final_script(user_code, test_case.input)

    try:
        result: SubmissionResult = client.submit_and_wait(
            source_code=final_script,
            expected_output=test_case.expected,
        )

        actual_output: Optional[str] = None
        if result.stdout is not None:
            actual_output = result.stdout.strip()

        # A test passes only when status_id == 3 (Accepted)
        # AND stdout.strip() == expected.strip()
        expected_stripped = str(test_case.expected).strip()
        passed = (
            result.status_id == STATUS_ACCEPTED
            and actual_output == expected_stripped
        )

        # Collect error message if any
        error_message: Optional[str] = None
        if result.stderr:
            error_message = result.stderr
        elif result.compile_output:
            error_message = result.compile_output

        return TestCaseResult(
            input=test_case.input,
            expected=test_case.expected,
            actual_output=actual_output,
            passed=passed,
            status_description=result.status_description,
            error_message=error_message,
        )

    except TimeoutError as e:
        return TestCaseResult(
            input=test_case.input,
            expected=test_case.expected,
            actual_output=None,
            passed=False,
            status_description="Timeout",
            error_message=str(e),
        )
    except Exception as e:
        return TestCaseResult(
            input=test_case.input,
            expected=test_case.expected,
            actual_output=None,
            passed=False,
            status_description="Error",
            error_message=str(e),
        )


class GradingRunner:
    """Orchestrates grading of code submissions."""

    def __init__(self, client: Optional[Judge0Client] = None):
        self.client = client or Judge0Client()

    def grade_submission(
        self,
        user_code: str,
        test_cases: list[TestCase],
    ) -> GradingResult:
        """Grade a code submission against all test cases.

        Args:
            user_code: The student's submitted code.
            test_cases: List of test cases to run.

        Returns:
            GradingResult with total, passed count, and individual results.
        """
        if not test_cases:
            return GradingResult(total=0, passed=0, results=[])

        results: list[TestCaseResult] = []
        passed_count = 0

        for test_case in test_cases:
            result = _evaluate_single(self.client, user_code, test_case)
            results.append(result)
            if result.passed:
                passed_count += 1

        return GradingResult(
            total=len(test_cases),
            passed=passed_count,
            results=results,
        )
