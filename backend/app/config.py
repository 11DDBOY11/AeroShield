"""Configuration settings for AeroShield AI backend."""

from typing import List, Union, Any
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
import json


class Settings(BaseSettings):
    """Application configuration settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_NAME: str = "AeroShield AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug_bool(cls, v: Any) -> bool:
        if isinstance(v, bool):
            return v
        if isinstance(v, str):
            val = v.strip().lower()
            if val in ("1", "true", "yes", "on", "debug"):
                return True
            return False
        return False

    # Security
    SECRET_KEY: str = "aeroshield-inversion-secure-key-2026-production"
    ALLOWED_HOSTS: List[str] = ["*"]
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    AI_RATE_LIMIT_PER_MINUTE: int = 15

    # External APIs
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"
    WAQI_API_TOKEN: str = ""
    OPENAQ_API_KEY: str = ""

    # Open-Meteo Air Quality & Weather Endpoints
    OPEN_METEO_AQ_URL: str = "https://air-quality-api.open-meteo.com/v1/air-quality"
    OPEN_METEO_WEATHER_URL: str = "https://api.open-meteo.com/v1/forecast"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["*"]


settings = Settings()
