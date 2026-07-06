from pydantic import BaseModel, Field
from typing import List, Optional

class HealthCheck(BaseModel):
    """Schema for API health status."""
    status: str
    version: str = "1.0.0"

class UploadResponse(BaseModel):
    """Schema for document upload response."""
    file_id: str
    filename: str
    chunks_created: int
    preview_chunks: List[str] = Field(default_factory=list, description="A preview of the first few generated chunks")
    vector_db_status: str = Field(default="stored", description="Status of vector database indexing")
    chunks_indexed: bool = Field(default=True, description="Whether the chunks were successfully indexed")

class ChatRequest(BaseModel):
    """Schema for chat queries."""
    message: str = Field(..., description="The user's query/message")
    document_ids: Optional[List[str]] = Field(default=None, description="Optional list of document IDs to use as context")
    mode: str = Field(default="chat", description="The study mode to use for answering (e.g., chat, summary, quiz, flashcards, viva, revision)")
    stream: Optional[bool] = Field(default=False, description="Whether to stream the response token-by-token")

class RetrievedChunk(BaseModel):
    """Schema for a retrieved text chunk."""
    chunk_id: int
    text: str
    metadata: dict
    score: float

class ChatResponse(BaseModel):
    """Schema for chat responses."""
    answer: str
    mode: str = Field(..., description="The study mode used for generating the answer")
    retrieved_context: List[RetrievedChunk] = Field(default_factory=list, description="Top relevant context chunks")
    sources: List[str] = Field(default_factory=list, description="Source documents or snippets used for context")
