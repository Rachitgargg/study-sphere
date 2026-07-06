from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.api import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend for StudySphere AI - Supporting document uploads and RAG capabilities",
    version="1.0.0",
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include aggregate router
app.include_router(api_router)

@app.get("/")
async def root():
    return {
        "message": f"Welcome to the {settings.APP_NAME} API. Visit /docs for interactive documentation."
    }
