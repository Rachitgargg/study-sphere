import json
import time
import logging
from fastapi import APIRouter, status, HTTPException
from fastapi.responses import StreamingResponse
from app.models.schemas import ChatRequest, ChatResponse
from app.db.vector_store import vector_store
from app.services.llm_service import llm_service

router = APIRouter()

# Configure logger integrated with Uvicorn error/info stream
logger = logging.getLogger("uvicorn.error")

@router.post("", response_model=None)
async def chat(request: ChatRequest):
    """
    RAG Chat endpoint supporting both streaming and standard responses.
    Exposes document contexts and coordinates retrieval + reasoning layers.
    """
    start_time = time.time()
    logger.info(f"[Chat] Incoming query. Mode: {request.mode}, Length: {len(request.message)} chars, Stream: {request.stream}")
    
    # 1. Retrieve the top 5 relevant document chunks using isolated document filter
    retrieval_start = time.time()
    source_file = None
    if request.document_ids and len(request.document_ids) > 0:
        source_file = request.document_ids[0]
        
    try:
        retrieved_chunks = await vector_store.search(request.message, k=5, source_file=source_file)
    except Exception as e:
        logger.error(f"[Chat] Vector store search failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Semantic retrieval pipeline error: {str(e)}"
        )
    retrieval_duration = time.time() - retrieval_start
    
    # 2. Extract list of unique source filenames from matching metadata
    sources = list(set(
        chunk["metadata"]["source_file"]
        for chunk in retrieved_chunks
        if chunk.get("metadata") and chunk["metadata"].get("source_file")
    ))
    
    logger.info(
        f"[Chat] Retrieval complete in {retrieval_duration:.4f}s. "
        f"Retrieved {len(retrieved_chunks)} chunks from {len(sources)} unique source file(s): {sources}"
    )
    
    # Log top-k scores for auditability
    for i, chunk in enumerate(retrieved_chunks):
        logger.debug(f"  Chunk {i+1} (Source: {chunk['metadata']['source_file']}, Score: {chunk['score']:.4f})")

    # 3. Handle Streaming Response
    if request.stream:
        async def event_generator():
            # Send RAG context data as the first stream event
            yield json.dumps({
                "type": "context",
                "mode": request.mode,
                "retrieved_context": retrieved_chunks,
                "sources": sources
            }) + "\n"
            
            token_count = 0
            # Send tokens as they are emitted by Groq
            async for token in llm_service.generate_answer_stream(
                query=request.message, 
                context_chunks=retrieved_chunks, 
                mode=request.mode
            ):
                token_count += 1
                yield json.dumps({
                    "type": "token",
                    "content": token
                }) + "\n"
            
            total_duration = time.time() - start_time
            logger.info(f"[Chat] Streamed {token_count} tokens in {total_duration:.4f}s total.")
            
        return StreamingResponse(event_generator(), media_type="text/event-stream")

    # 4. Handle standard JSON Response (Non-streaming)
    else:
        completion_start = time.time()
        try:
            answer = await llm_service.generate_answer(
                query=request.message, 
                context_chunks=retrieved_chunks, 
                mode=request.mode
            )
        except Exception as e:
            logger.error(f"[Chat] LLM generation failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"AI reasoning completions engine failed: {str(e)}"
            )
        completion_duration = time.time() - completion_start
        total_duration = time.time() - start_time
        
        logger.info(
            f"[Chat] Non-streaming RAG loop finished. "
            f"Completion: {completion_duration:.4f}s, Total: {total_duration:.4f}s."
        )
        
        return ChatResponse(
            answer=answer,
            mode=request.mode,
            retrieved_context=retrieved_chunks,
            sources=sources
        )
