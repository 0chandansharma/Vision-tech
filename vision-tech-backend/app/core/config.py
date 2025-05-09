# app/core/config.py
from typing import Any, Dict, List, Optional, Union
import secrets
from pydantic import BaseSettings, PostgresDsn, validator

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    # 60 minutes * 24 hours * 8 days = 8 days
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    
    # CORS settings
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

    # Database settings
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "visiontech"
    SQLALCHEMY_DATABASE_URI: Optional[str] = None

    # MongoDB settings
    MONGODB_URL: str = "mongodb://localhost:27017/"
    MONGODB_DB: str = "visiontech"
    
    # Storage settings
    STORAGE_TYPE: str = "local"  # 'local', 's3', 'azure'
    LOCAL_STORAGE_PATH: str = "./storage"
    
    # AI model settings
    YOLO_MODEL_PATH: str = "./models/yolov8n.pt"
    MODEL_CONFIDENCE_THRESHOLD: float = 0.25
    
    # Video processing settings
    MAX_UPLOAD_SIZE: int = 5_000_000_000  # 5GB
    ALLOWED_VIDEO_EXTENSIONS: List[str] = ["mp4", "avi", "mov", "mkv"]
    
    # Project settings
    PROJECT_NAME: str = "Vision Tech Platform"
    
    # Validator for database URI
    @validator("SQLALCHEMY_DATABASE_URI", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        return f"postgresql://{values.get('POSTGRES_USER')}:{values.get('POSTGRES_PASSWORD')}@{values.get('POSTGRES_SERVER')}/{values.get('POSTGRES_DB')}"

    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()