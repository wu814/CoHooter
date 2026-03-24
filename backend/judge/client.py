"""Judge0 client wrapper using official SDK."""

import time
import judge0
import httpx
from dataclasses import dataclass
from typing import Optional

from backend.config import Config


# Retry configuration for API timeouts
MAX_RETRIES = 3
RETRY_DELAY = 1.0  # seconds (base delay for exponential backoff)


# Judge0 status IDs (for compatibility with existing code)
STATUS_IN_QUEUE = 1
STATUS_PROCESSING = 2
STATUS_ACCEPTED = 3
STATUS_WRONG_ANSWER = 4
STATUS_TLE = 5
STATUS_COMPILATION_ERROR = 6
STATUS_RUNTIME_ERROR = 11


@dataclass
class SubmissionResult:
    """Result from a Judge0 submission."""

    status_id: int
    status_description: str
    stdout: Optional[str]
    stderr: Optional[str]
    compile_output: Optional[str]
    time: Optional[str]
    memory: Optional[int]


def _create_judge0_client():
    """Create Judge0 client based on configuration."""
    provider = Config.JUDGE0_PROVIDER.lower()

    if provider == "rapid":
        if not Config.JUDGE0_RAPID_API_KEY:
            raise ValueError("JUDGE0_RAPID_API_KEY is required for RapidAPI provider")
        return judge0.RapidJudge0CE(api_key=Config.JUDGE0_RAPID_API_KEY)

    elif provider == "self-hosted":
        return judge0.Client(Config.JUDGE0_BASE_URL)

    else:
        raise ValueError(f"Unknown JUDGE0_PROVIDER: {provider}. Use 'rapid' or 'self-hosted'")


class Judge0Client:
    """HTTP client for Judge0 API using official SDK."""

    def __init__(self):
        self._client = None

    def _get_client(self):
        """Lazy initialization of the Judge0 client."""
        if self._client is None:
            self._client = _create_judge0_client()
        return self._client

    def submit_and_wait(
        self,
        source_code: str,
        expected_output: Optional[str] = None,
        stdin: Optional[str] = None,
    ) -> SubmissionResult:
        """Submit code to Judge0 and wait until execution completes.

        Args:
            source_code: The Python code to execute.
            expected_output: Optional expected output for comparison.
            stdin: Optional standard input for the program.

        Returns:
            SubmissionResult with execution details.

        Raises:
            TimeoutError: If Judge0 API times out after all retry attempts.
        """
        client = self._get_client()

        last_error = None
        for attempt in range(MAX_RETRIES):
            try:
                # Use the SDK's run function (handles polling internally)
                result = judge0.run(
                    client=client,
                    source_code=source_code,
                    language=judge0.PYTHON,
                    cpu_time_limit=Config.JUDGE0_CPU_LIMIT,
                    memory_limit=Config.JUDGE0_MEMORY_LIMIT,
                )

                return SubmissionResult(
                    status_id=result.status.value,
                    status_description=result.status.name.replace("_", " ").title(),
                    stdout=result.stdout,
                    stderr=result.stderr,
                    compile_output=result.compile_output,
                    time=str(result.time) if result.time else None,
                    memory=result.memory,
                )

            except (httpx.ReadTimeout, httpx.TimeoutException) as e:
                last_error = e
                if attempt < MAX_RETRIES - 1:
                    # Exponential backoff: 1s, 2s, 3s...
                    time.sleep(RETRY_DELAY * (attempt + 1))
                continue

        # All retries failed
        raise TimeoutError(
            f"Judge0 API timed out after {MAX_RETRIES} attempts: {last_error}"
        )

    def run_code(
        self,
        source_code: str,
        stdin: Optional[str] = None,
    ) -> SubmissionResult:
        """Execute code and return result (no grading).

        Args:
            source_code: The Python code to execute.
            stdin: Optional standard input for the program.

        Returns:
            SubmissionResult with execution details.

        Raises:
            TimeoutError: If Judge0 API times out after all retry attempts.
        """
        client = self._get_client()

        last_error = None
        for attempt in range(MAX_RETRIES):
            try:
                result = judge0.run(
                    client=client,
                    source_code=source_code,
                    language=judge0.PYTHON,
                    stdin=stdin,
                    cpu_time_limit=Config.JUDGE0_CPU_LIMIT,
                    memory_limit=Config.JUDGE0_MEMORY_LIMIT,
                )

                return SubmissionResult(
                    status_id=result.status.value,
                    status_description=result.status.name.replace("_", " ").title(),
                    stdout=result.stdout,
                    stderr=result.stderr,
                    compile_output=result.compile_output,
                    time=str(result.time) if result.time else None,
                    memory=result.memory,
                )

            except (httpx.ReadTimeout, httpx.TimeoutException) as e:
                last_error = e
                if attempt < MAX_RETRIES - 1:
                    time.sleep(RETRY_DELAY * (attempt + 1))
                continue

        raise TimeoutError(
            f"Judge0 API timed out after {MAX_RETRIES} attempts: {last_error}"
        )

    def check_health(self) -> bool:
        """Check if Judge0 is reachable."""
        try:
            client = self._get_client()
            client.get_languages()
            return True
        except Exception:
            return False
