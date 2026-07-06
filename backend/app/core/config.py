import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "StudySphere AI API"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    
    # Uploads config
    UPLOAD_DIR: str = "uploads"
    
    # RAG Settings (for future use)
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama3-70b-8192"
    EMBEDDING_MODEL_NAME: str = "sentence-transformers/all-MiniLM-L6-v2"
    VECTOR_DB_DIR: str = "vector_db"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Instantiate settings
settings = Settings()
