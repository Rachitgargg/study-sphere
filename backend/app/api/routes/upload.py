import os
import uuid
import time
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.models.schemas import UploadResponse
from app.core.config import settings
from app.services.file_loader import FileLoaderService
from app.services.text_splitter import TextSplitterService
from app.db.vector_store import vector_store

router = APIRouter()

# Configure logger integrated with Uvicorn error/info stream
logger = logging.getLogger("uvicorn.error")

# Instantiate services
file_loader = FileLoaderService()
text_splitter = TextSplitterService()

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}

@router.post("", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """
    Upload a document (PDF, DOCX, TXT), save it locally, extract its text,
    clean it, split it into chunks, index the chunks into the vector store,
    and return the chunk details and indexing status.
    """
    start_time = time.time()
    filename = file.filename
    _, ext = os.path.splitext(filename)
    
    logger.info(f"[Upload] Received file: {filename} (Extension: {ext})")
    
    if ext.lower() not in ALLOWED_EXTENSIONS:
        logger.warning(f"[Upload] File extension not supported: {ext}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # Generate unique file ID and save path
    file_id = str(uuid.uuid4())
    unique_filename = f"{file_id}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    # 1. Save file locally
    try:
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        logger.info(f"[Upload] Saved file locally: {file_path} ({len(content)} bytes)")
    except Exception as e:
        logger.error(f"[Upload] Failed to save file locally: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file locally: {str(e)}"
        )
    
    # 2. Extract and clean text using file_loader
    loader_start = time.time()
    try:
        cleaned_text = file_loader.load_file(file_path)
        loader_duration = time.time() - loader_start
        logger.info(f"[Upload] Extracted text from document in {loader_duration:.4f}s. Extracted {len(cleaned_text)} characters.")
    except Exception as e:
        logger.error(f"[Upload] Text extraction failed: {str(e)}")
        # Cleanup uploaded file if text extraction fails
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
        
    # 3. Split into chunks using text_splitter
    splitter_start = time.time()
    try:
        chunks = text_splitter.split_text(cleaned_text, source_file=filename)
        splitter_duration = time.time() - splitter_start
        logger.info(f"[Upload] Fragmented text into {len(chunks)} chunks in {splitter_duration:.4f}s.")
    except Exception as e:
        logger.error(f"[Upload] Chunk partitioning failed: {str(e)}")
        # Cleanup uploaded file if chunking fails
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to partition text into chunks: {str(e)}"
        )
        
    # 4. Save chunks to Vector Store (ChromaDB + Cloud Embeddings)
    db_start = time.time()
    try:
        await vector_store.add_documents(chunks)
        db_duration = time.time() - db_start
        logger.info(f"[Upload] Indexed document chunks in vector database in {db_duration:.4f}s.")
    except Exception as e:
        logger.error(f"[Upload] Database vector indexing failed: {str(e)}")
        # Cleanup uploaded file if vector indexing fails
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to index document chunks into vector database: {str(e)}"
        )
        
    total_duration = time.time() - start_time
    logger.info(f"[Upload] Complete file processing and indexing finished in {total_duration:.4f}s.")
    
    # Extract the texts of the first 3 chunks for previewing
    preview_texts = [chunk["text"] for chunk in chunks[:3]]
    
    return UploadResponse(
        file_id=file_id,
        filename=filename,
        chunks_created=len(chunks),
        preview_chunks=preview_texts,
        vector_db_status="stored",
        chunks_indexed=True
    )
