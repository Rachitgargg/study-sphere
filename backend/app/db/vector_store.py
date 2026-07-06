"""
Vector store service for StudySphere AI.
Integrates persistent ChromaDB storage and cloud-based embedding API services.
"""
import os
from typing import List, Dict, Any
from app.core.config import settings
from app.services.embedding_service import embedding_service

class VectorStore:
    def __init__(self):
        # Use an absolute path for the vector database directory
        self.db_path = os.path.abspath(settings.VECTOR_DB_DIR)
        self.persistent = True
        self._client = None
        self._collection = None
        self._query_cache = {}
        self._migration_done = False
        print(f"[VectorStore] Initialized at db path: {self.db_path}")

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
    def collection_name(self) -> str:
        provider = settings.detected_provider
        model = settings.detected_model.replace("/", "_").replace("-", "_")
        return f"studysphere_{provider}_{model}"

    @property
    def collection(self):
        if self._collection is None:
            name = self.collection_name
            print(f"[VectorStore] Initializing ChromaDB collection: {name}")
            self._collection = self.client.get_or_create_collection(
                name=name,
                metadata={"hnsw:space": "cosine"} # Use cosine similarity
            )
        return self._collection

    async def _check_and_migrate(self):
        try:
            # Check if old collections exist
            collections = [c.name for c in self.client.list_collections()]
            target_name = self.collection_name
            
            for old_name in ["studysphere_chunks", "studysphere_gemini_gemini_embedding_2"]:
                if old_name in collections and old_name != target_name:
                    old_collection = self.client.get_collection(name=old_name)
                    results = old_collection.get(include=["documents", "metadatas"])
                    if results and "documents" in results and results["documents"]:
                        documents = results["documents"]
                        metadatas = results["metadatas"]
                        
                        print(f"[VectorStore] Migration started from '{old_name}' to '{target_name}'. Found {len(documents)} existing chunks.")
                        
                        chunks_to_migrate = []
                        for i in range(len(documents)):
                            meta = metadatas[i]
                            chunks_to_migrate.append({
                                "text": documents[i],
                                "chunk_id": int(meta.get("chunk_id", i)),
                                "metadata": {
                                    "source_file": meta.get("source_file", "unknown"),
                                    "start_index": int(meta.get("start_index", 0)),
                                    "end_index": int(meta.get("end_index", 0))
                                }
                            })
                        
                        # Prevent recursive migration loop by setting flag first
                        self._migration_done = True
                        await self._add_documents_internal(chunks_to_migrate)
                        print(f"[VectorStore] Successfully migrated {len(documents)} chunks to new collection: {target_name}.")
                        
                        self.client.delete_collection(old_name)
                        print(f"[VectorStore] Deleted old '{old_name}' collection.")
                    else:
                        self.client.delete_collection(old_name)
                        print(f"[VectorStore] Deleted empty old '{old_name}' collection.")
            
            self._migration_done = True
        except Exception as e:
            print(f"[VectorStore] Error during migration: {str(e)}")
            # Even if migration fails, mark it done to prevent infinite loops / constant failures
            self._migration_done = True

    async def add_documents(self, chunks: List[Dict[str, Any]]) -> bool:
        """
        Generates embeddings for document chunks and inserts/updates them in ChromaDB.
        Runs migration if necessary before adding documents.
        """
        if not self._migration_done:
            await self._check_and_migrate()
        return await self._add_documents_internal(chunks)

    async def _add_documents_internal(self, chunks: List[Dict[str, Any]]) -> bool:
        if not chunks:
            return True
            
        ids = []
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
            # Generate embeddings via the cloud embedding service
            embeddings = await embedding_service.get_embeddings(texts_to_embed)
            
            # Insert into ChromaDB collection
            self.collection.add(
                ids=ids,
                embeddings=embeddings,
                documents=documents,
                metadatas=metadatas
            )
            print(f"[VectorStore] Indexed {len(chunks)} chunks in ChromaDB (collection: {self.collection_name}).")
            return True
        except Exception as e:
            print(f"[VectorStore] Error indexing documents: {str(e)}")
            raise e

    async def _get_query_embedding(self, query: str) -> List[float]:
        """Compute query embedding, cached for performance."""
        if query in self._query_cache:
            return self._query_cache[query]
            
        embedding = await embedding_service.get_query_embedding(query)
        
        # Simple cache eviction if it grows too large
        if len(self._query_cache) >= 128:
            # Remove the oldest cached item (FIFO)
            self._query_cache.pop(next(iter(self._query_cache)))
            
        self._query_cache[query] = embedding
        return embedding

    async def search(self, query: str, k: int = 5, source_file: str = None) -> List[Dict[str, Any]]:
        """
        Embeds the search query and retrieves the top-k most semantically relevant chunks.
        """
        if not query:
            return []
            
        if not self._migration_done:
            await self._check_and_migrate()
            
        try:
            # Embed the query (utilizes async local cache)
            query_embedding = await self._get_query_embedding(query)
            
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
                distances = results["distances"][0] if "distances" in results else [1.0] * len(ids)
                
                for i in range(len(ids)):
                    # Distance is cosine distance (0 to 2). Score = 1.0 - distance
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

# Singleton instance
vector_store = VectorStore()
