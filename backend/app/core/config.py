import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "StudySphere AI API"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    
    # Uploads config
    UPLOAD_DIR: str = "uploads"
    
    # RAG Settings
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    
    # Cloud embedding API keys
    GEMINI_API_KEY: str = ""
    
    # Embedding settings
    EMBEDDING_PROVIDER: str = "gemini"
    EMBEDDING_MODEL_NAME: str = "gemini-embedding-001"
    
    VECTOR_DB_DIR: str = "vector_db"

    @property
    def detected_provider(self) -> str:
        return "gemini"

    @property
    def detected_model(self) -> str:
        model_name = self.EMBEDDING_MODEL_NAME
        if not model_name or "sentence-transformers" in model_name or "all-MiniLM" in model_name:
            return "gemini-embedding-001"
        return model_name

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Instantiate settings
settings = Settings()
