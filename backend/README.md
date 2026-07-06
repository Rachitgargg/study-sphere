# StudySphere AI Backend

Production-ready FastAPI backend designed to support document indexing, search, and a Retrieval Augmented Generation (RAG) system for studying files.

## Project Structure

```
backend/
├── app/
│   ├── main.py                  # Entrypoint
│   ├── api/
│   │   ├── routes/
│   │   │   ├── health.py        # /health endpoint
│   │   │   ├── upload.py        # /upload endpoint (PDF, DOCX, TXT)
│   │   │   ├── chat.py          # /chat endpoint
│   │   │   └── api.py           # Endpoint aggregator
│   │   └── api.py
│   ├── core/
│   │   └── config.py            # Settings from environment config
│   ├── services/
│   │   ├── file_loader.py       # Placeholders for document loaders
│   │   └── text_splitter.py     # Placeholders for RecursiveCharacterTextSplitter
│   ├── db/
│   │   └── vector_store.py      # Placeholders for ChromaDB and Embeddings
│   └── models/
│       └── schemas.py           # Pydantic request & response models
├── requirements.txt             # Python packages
├── .env                         # Configurations
└── README.md
```

## Setup & Running

### 1. Prerequisites
Ensure you have Python 3.9+ installed.

### 2. Create and Activate Virtual Environment
From the `backend/` directory:
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Environment Variables
Create a `.env` file in the `backend/` directory (or use the existing one):
```env
APP_NAME="StudySphere AI API"
DEBUG=True
PORT=8000
HOST="0.0.0.0"

# Future RAG & LLM Integration Configs
GROQ_API_KEY="your_groq_api_key_here"
EMBEDDING_MODEL_NAME="sentence-transformers/all-MiniLM-L6-v2"
VECTOR_DB_DIR="vector_db"
UPLOAD_DIR="uploads"
```

### 5. Start the Application
Run the uvicorn development server:
```bash
uvicorn app.main:app --reload
```
By default, the server runs on `http://127.0.0.1:8000`.

## Interactive API Documentation
Once the server is running, you can access the OpenAPI interactive documentation:
- Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- ReDoc: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

## API Endpoints

### 1. Health Check
*   **Endpoint**: `GET /health`
*   **Response**:
    ```json
    {
      "status": "healthy",
      "version": "1.0.0"
    }
    ```

### 2. Upload Document
*   **Endpoint**: `POST /upload`
*   **Payload**: Multipart Form-Data with key `file` (accepts `.pdf`, `.docx`, `.txt`)
*   **Response**:
    ```json
    {
      "file_id": "uuid-string-here",
      "filename": "original_filename.pdf",
      "message": "File uploaded successfully"
    }
    ```
*   **Behavior**: Saved locally to the path defined in the environment variable `UPLOAD_DIR`.

### 3. Chat with Documents
*   **Endpoint**: `POST /chat`
*   **Payload**:
    ```json
    {
      "message": "What is the summary of this document?",
      "document_ids": ["uuid-string-here"]
    }
    ```
*   **Response**:
    ```json
    {
      "answer": "This is a placeholder response",
      "sources": []
    }
    ```
