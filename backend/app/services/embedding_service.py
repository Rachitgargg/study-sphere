import httpx
import logging
import time
from typing import List
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

class EmbeddingService:
    def __init__(self):
        self.provider = "gemini"
        self.model = settings.detected_model
        self._client = None

    @property
    def client(self) -> httpx.AsyncClient:
        if self._client is None:
            # Enforce client-level request timeout of 20 seconds
            self._client = httpx.AsyncClient(timeout=20.0)
        return self._client

    async def get_embeddings(self, texts: List[str], task_type: str = "RETRIEVAL_DOCUMENT") -> List[List[float]]:
        if not texts:
            return []

        gemini_api_key = settings.GEMINI_API_KEY
        if not gemini_api_key:
            logger.error("[EmbeddingService] GEMINI_API_KEY is missing in settings.")
            raise ValueError("GEMINI_API_KEY is not configured in environment variables.")

        # Construct request URL and headers
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:batchEmbedContents"
        headers = {
            "x-goog-api-key": gemini_api_key,
            "Content-Type": "application/json"
        }

        # Build requests payload for batchEmbedContents
        requests_payload = []
        for text in texts:
            requests_payload.append({
                "model": f"models/{self.model}",
                "content": {
                    "parts": [{"text": text}]
                },
                "taskType": task_type,
                "outputDimensionality": 768
            })

        payload = {
            "requests": requests_payload
        }

        logger.info(f"[EmbeddingService] Embedding request started. Provider: gemini, Model: {self.model}, Chunks: {len(texts)}, TaskType: {task_type}")
        
        start_time = time.time()
        try:
            response = await self.client.post(url, headers=headers, json=payload)
            
            if response.status_code == 429:
                logger.error(f"[EmbeddingService] Rate limit error (429) from Gemini API: {response.text}")
                raise ValueError("Gemini API rate limit exceeded. Please try again in a few moments.")
                
            if response.status_code == 400:
                logger.error(f"[EmbeddingService] Bad Request (400) from Gemini API: {response.text}")
                raise ValueError(f"Gemini API Bad Request: {response.text}")
                
            if response.status_code == 403 or response.status_code == 401:
                logger.error(f"[EmbeddingService] Authentication/Authorization error ({response.status_code}) from Gemini API: {response.text}")
                raise ValueError("Invalid Gemini API key. Please check your configuration.")
                
            response.raise_for_status()
            
            data = response.json()
            
            if "embeddings" not in data:
                logger.error(f"[EmbeddingService] Unexpected Gemini response payload (missing 'embeddings'): {data}")
                raise ValueError("Failed to retrieve embeddings from Gemini response.")
                
            embeddings = [item["values"] for item in data["embeddings"]]
            
            duration = time.time() - start_time
            logger.info(f"[EmbeddingService] Embedding request completed in {duration:.4f}s. Provider: gemini, Model: {self.model}")
            return embeddings
            
        except httpx.TimeoutException as e:
            logger.error(f"[EmbeddingService] Timeout error connecting to Gemini API after 20 seconds: {str(e)}")
            raise ValueError(f"Gemini embedding service request timed out: {str(e)}")
        except httpx.HTTPStatusError as e:
            logger.error(f"[EmbeddingService] Gemini API error (Status {response.status_code}): {response.text}")
            raise ValueError(f"Gemini API returned error status {response.status_code}: {response.text}")
        except Exception as e:
            logger.error(f"[EmbeddingService] Unexpected error during embedding: {str(e)}")
            raise e

    async def get_query_embedding(self, text: str) -> List[float]:
        embeddings = await self.get_embeddings([text], task_type="RETRIEVAL_QUERY")
        if not embeddings:
            raise ValueError("Failed to generate embedding for query.")
        return embeddings[0]

    async def close(self):
        if self._client is not None:
            await self._client.aclose()
            self._client = None

# Singleton instance
embedding_service = EmbeddingService()
