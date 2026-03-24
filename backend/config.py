"""Environment configuration for CoHooter backend."""

import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env file from the backend directory
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)


class Config:
    """Application configuration loaded from environment variables."""

    # Judge0 API Provider: "rapid" or "self-hosted"
    JUDGE0_PROVIDER: str = os.getenv("JUDGE0_PROVIDER", "rapid")

    # RapidAPI Key (when provider is "rapid")
    JUDGE0_RAPID_API_KEY: str = os.getenv("JUDGE0_RAPID_API_KEY", "")

    # Self-hosted URL (when provider is "self-hosted")
    JUDGE0_BASE_URL: str = os.getenv("JUDGE0_BASE_URL", "http://localhost:2358")

    # Resource limits
    JUDGE0_CPU_LIMIT: float = float(os.getenv("JUDGE0_CPU_LIMIT", "5"))
    JUDGE0_MEMORY_LIMIT: int = int(os.getenv("JUDGE0_MEMORY_LIMIT", "128000"))

    # Flask
    FLASK_SECRET_KEY: str = os.getenv("FLASK_SECRET_KEY", "dev-secret-key")
