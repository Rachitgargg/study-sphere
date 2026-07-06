"""
Vector store service for StudySphere AI.
Integrates persistent ChromaDB storage and HuggingFace SentenceTransformers embeddings.
"""
import os
import functools
from typing import List, Dict, Any
from app.core.config import settings

class VectorStore:
    def __init__(self):
        # Use an absolute path for the vector database directory
        self.db_path = os.path.abspath(settings.VECTOR_DB_DIR)
        self.persistent = True
        self._client = None
        self._collection = None
        self._model = None
        print(f"[VectorStore] Placeholder initialized at db path: {self.db_path}")

    @property
    def client(self):
        if self._client is None:
            import chromadb
            if not os.path.exists(self.db_path):
                os.makedirs(self.db_path, exist_ok=True)

            if not os.path.isdir(self.db_path):
                raise RuntimeError(f"Vector DB path exists but is not a directory: {self.db_path}")

            # Ensure the vector storage directory is writable
            if not os.access(self.db_path, os.W_OK):
                try:
                    os.chmod(self.db_path, 0o775)
                except Exception:
                    pass

            self.persistent = os.access(self.db_path, os.W_OK)
            if self.persistent:
                try:
                    self._client = chromadb.PersistentClient(path=self.db_path)
                except Exception as e:
                    print(f"[VectorStore] Persistent client failed: {e}")
                    self.persistent = False

            if not self.persistent:
                print(f"[VectorStore] Persistent path not writable at {self.db_path}. Falling back to in-memory vector store.")
                self._client = chromadb.Client()
        return self._client

    @property
    def collection(self):
        if self._collection is None:
            self._collection = self.client.get_or_create_collection(
                name="studysphere_chunks",
                metadata={"hnsw:space": "cosine"} # Use cosine similarity
            )
        return self._collection

    @property
    def model(self):
        if self._model is None:
            print(f"[VectorStore] Lazy loading SentenceTransformer model: {settings.EMBEDDING_MODEL_NAME}...")
            from sentence_transformers import SentenceTransformer
            self._model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
            print(f"[VectorStore] Loaded model: {settings.EMBEDDING_MODEL_NAME}")
        return self._model

    def add_documents(self, chunks: List[Dict[str, Any]]) -> bool:
        """
        Generates embeddings for document chunks and inserts/updates them in ChromaDB.
        Each chunk is stored with its text, id, and source metadata.
        """
        if not chunks:
            return True
            
        ids = []
        embeddings = []
        documents = []
        metadatas = []
        texts_to_embed = []
        
        for chunk in chunks:
            source_file = chunk["metadata"]["source_file"]
            chunk_id = chunk["chunk_id"]
            
            # Formulate a unique ID for the vector store
            unique_id = f"{source_file}_{chunk_id}"
            
            ids.append(unique_id)
            documents.append(chunk["text"])
            
            # Populate flat metadata structure (ChromaDB requirement)
            metadatas.append({
                "source_file": source_file,
                "start_index": chunk["metadata"]["start_index"],
                "end_index": chunk["metadata"]["end_index"],
                "chunk_id": chunk_id
            })
            
            texts_to_embed.append(chunk["text"])
            
        try:
            # Generate embeddings locally
            # encode returns a numpy array, which is converted to list of floats
            embeddings = self.model.encode(texts_to_embed).tolist()
            
            # Insert into ChromaDB collection
            self.collection.add(
                ids=ids,
                embeddings=embeddings,
                documents=documents,
                metadatas=metadatas
            )
            print(f"[VectorStore] Indexed {len(chunks)} chunks in ChromaDB.")
            return True
        except Exception as e:
            print(f"[VectorStore] Error indexing documents: {str(e)}")
            raise e

    @functools.lru_cache(maxsize=128)
    def _get_query_embedding(self, query: str) -> List[float]:
        """Compute query embedding, cached for performance."""
        return self.model.encode(query).tolist()

    def search(self, query: str, k: int = 5, source_file: str = None) -> List[Dict[str, Any]]:
        """
        Embeds the search query and retrieves the top-k most semantically relevant chunks.
        """
        if not query:
            return []
            
        try:
            # Embed the query (utilizes local LRU cache)
            query_embedding = self._get_query_embedding(query)
            
            where_clause = None
            if source_file:
                where_clause = {"source_file": source_file}
                
            # Query ChromaDB collection
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=k,
                where=where_clause
            )
            
            formatted_results = []
            if results and "ids" in results and results["ids"] and len(results["ids"][0]) > 0:
                ids = results["ids"][0]
                documents = results["documents"][0]
                metadatas = results["metadatas"][0]
                # Cosine distance (0.0 to 2.0). Score = 1.0 - distance to estimate similarity score
                distances = results["distances"][0] if "distances" in results else [1.0] * len(ids)
                
                for i in range(len(ids)):
                    # Distance is L2/cosine distance.
                    # With cosine distance, 0 means identical, 1 means orthogonal.
                    # We return the score directly or normalize it. Let's return similarity score (1.0 - distance)
                    score = 1.0 - distances[i]
                    
                    formatted_results.append({
                        "chunk_id": int(metadatas[i]["chunk_id"]),
                        "text": documents[i],
                        "metadata": {
                            "source_file": metadatas[i]["source_file"],
                            "start_index": int(metadatas[i]["start_index"]),
                            "end_index": int(metadatas[i]["end_index"])
                        },
                        "score": round(float(score), 4)
                    })
                    
            return formatted_results
        except Exception as e:
            print(f"[VectorStore] Error during similarity search: {str(e)}")
            return []

# Singleton instance to prevent multiple model loads
vector_store = VectorStore()
