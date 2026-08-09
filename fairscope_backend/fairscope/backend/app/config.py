"""
Central configuration for FairScope backend.
Loads values from .env file.
"""
import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    database_url: str = "sqlite:///./fairscope.db"
    max_upload_size_mb: int = 25
    upload_dir: str = "uploads"

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()

# Make sure upload directory exists
def ensure_dirs():
    os.makedirs(settings.upload_dir, exist_ok=True)
