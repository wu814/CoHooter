"""Submission endpoint for code grading."""

from flask import Blueprint, request, jsonify, current_app

from backend.judge import GradingRunner, TestCase
from backend.judge.client import Judge0Client

submission_bp = Blueprint("submission", __name__)


@submission_bp.route("/api/submit", methods=["POST"])
def submit():
    """Handle code submission and return grading results.

    Request JSON:
    {
        "user_code": "def solution(a, b): return a + b",
        "username": "student_name",
        "session_id": "room_id",
        "test_cases": [
            {"input": "solution(10, 5)", "expected": "15"}
        ]
    }

    Response:
        GradingResult as JSON with total, passed, all_passed, score_percent, results[]
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "No JSON data provided"}), 400

    user_code = data.get("user_code")
    username = data.get("username")
    session_id = data.get("session_id")
    test_cases_data = data.get("test_cases", [])

    if not user_code:
        return jsonify({"error": "user_code is required"}), 400

    if not test_cases_data:
        return jsonify({"error": "test_cases is required"}), 400

    # Convert test case dicts to TestCase objects
    test_cases = [
        TestCase(input=tc["input"], expected=tc["expected"])
        for tc in test_cases_data
    ]

    # Run grading
    runner = GradingRunner()
    result = runner.grade_submission(user_code, test_cases)
    result_dict = result.to_dict()

    # Emit Socket.io event if socketio is available
    socketio = current_app.extensions.get("socketio")
    if socketio and session_id:
        socketio.emit(
            "grading_result",
            {
                "username": username,
                "result": result_dict,
            },
            room=session_id,
        )

    return jsonify(result_dict)


@submission_bp.route("/api/run", methods=["POST"])
def run():
    """Execute code without grading.

    Request JSON:
    {
        "user_code": "print('hello world')",
        "stdin": ""
    }

    Response:
    {
        "stdout": "hello world\n",
        "stderr": null,
        "status": "Accepted",
        "time": "0.01",
        "memory": 1234
    }
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "No JSON data provided"}), 400

    user_code = data.get("user_code")
    stdin = data.get("stdin", "")

    if not user_code:
        return jsonify({"error": "user_code is required"}), 400

    client = Judge0Client()

    try:
        result = client.run_code(user_code, stdin)
    except TimeoutError as e:
        return jsonify({"error": str(e)}), 504

    return jsonify({
        "stdout": result.stdout,
        "stderr": result.stderr,
        "status": result.status_description,
        "time": result.time,
        "memory": result.memory,
    })
