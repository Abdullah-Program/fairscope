"""
Central configuration for FairScope backend.
Loads values from .env file.
"""
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    groq_api_key: str = os.getenv("GROQ_API_KEY", "")
    groq_model: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./fairscope.db")
    max_upload_size_mb: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "25"))
    upload_dir: str = "uploads"

    class Config:
        env_file = ".env"


settings = Settings()

# Make sure upload directory exists
os.makedirs(settings.upload_dir, exist_ok=True)
