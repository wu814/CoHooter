"""Flask application with Socket.IO for CoHooter."""

from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO, join_room

from backend.config import Config
from backend.routes import submission_bp

# Initialize Flask app
app = Flask(__name__)
app.config["SECRET_KEY"] = Config.FLASK_SECRET_KEY

# Enable CORS for frontend origins
CORS(app, origins=["http://localhost:5173", "http://localhost:3000"])

# Initialize Socket.IO
socketio = SocketIO(app, cors_allowed_origins="*")

# Register blueprints
app.register_blueprint(submission_bp)


@app.route("/health")
def health():
    """Health check endpoint."""
    return {"status": "ok"}


@socketio.on("join")
def on_join(data):
    """Handle client joining a session room."""
    session_id = data.get("session_id")
    if session_id:
        join_room(session_id)


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
