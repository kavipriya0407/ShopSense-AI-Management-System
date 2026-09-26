import os
from typing import List
from pydantic_settings import BaseSettings

_BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_DEFAULT_DB = os.path.join(_BASE_DIR, "shopsense.db").replace("\\", "/")

class Settings(BaseSettings):
    PROJECT_NAME: str = "ShopSense"
    PROJECT_TAGLINE: str = "AI-Powered Multi-Vendor E-Commerce Analytics Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "shopsense-super-secret-jwt-key-2026-secure-token")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{_DEFAULT_DB}")
    
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@shopsense.com")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "ShopSense@123")
    ENABLE_ADMIN_DEMO: bool = os.getenv("ENABLE_ADMIN_DEMO", "true").lower() in ("true", "1", "yes")
    
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "https://shopsense-ai-management-platform.vercel.app",
    ]

    @property
    def has_ai_key(self) -> bool:
        return bool(self.GEMINI_API_KEY or self.OPENAI_API_KEY)

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"

settings = Settings()
