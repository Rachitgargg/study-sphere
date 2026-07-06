const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface UploadResponse {
  file_id: string;
  filename: string;
  chunks_created: number;
  preview_chunks: string[];
  vector_db_status: string;
  chunks_indexed: boolean;
}

export interface RetrievedChunk {
  chunk_id: number;
  text: string;
  metadata: {
    source_file: string;
    start_index: number;
    end_index: number;
  };
  score: number;
}

export interface ChatResponse {
  answer: string;
  mode: string;
  retrieved_context: RetrievedChunk[];
  sources: string[];
}

export async function uploadDocument(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errText = 'Failed to upload document';
    try {
      const errJson = await response.json();
      errText = errJson.detail || errText;
    } catch {
      try {
        errText = await response.text() || errText;
      } catch {}
    }
    throw new Error(errText);
  }

  return response.json();
}

export async function sendChatMessage(
  message: string, 
  mode: string, 
  activeDocName?: string
): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      message, 
      mode, 
      stream: false,
      document_ids: activeDocName ? [activeDocName] : undefined
    }),
  });

  if (!response.ok) {
    let errText = 'Failed to fetch AI response';
    try {
      const errJson = await response.json();
      errText = errJson.detail || errText;
    } catch {
      try {
        errText = await response.text() || errText;
      } catch {}
    }
    throw new Error(errText);
  }

  return response.json();
}

export async function sendChatMessageStream(
  message: string,
  mode: string,
  activeDocName: string | undefined,
  onContext: (context: { retrieved_context: RetrievedChunk[]; sources: string[] }) => void,
  onToken: (token: string) => void,
  onError: (error: Error) => void,
  onComplete: () => void
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        message, 
        mode, 
        stream: true,
        document_ids: activeDocName ? [activeDocName] : undefined
      }),
    });

    if (!response.ok) {
      let errText = 'Failed to transmit stream';
      try {
        const errJson = await response.json();
        errText = errJson.detail || errText;
      } catch {
        try {
          errText = await response.text() || errText;
        } catch {}
      }
      throw new Error(errText);
    }

    if (!response.body) {
      throw new Error('Readable stream not supported.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.type === 'context') {
            onContext({
              retrieved_context: parsed.retrieved_context,
              sources: parsed.sources,
            });
          } else if (parsed.type === 'token') {
            onToken(parsed.content);
          }
        } catch (e) {
          console.warn('JSON parsing error in stream block:', e, line);
        }
      }
    }
    onComplete();
  } catch (err: any) {
    onError(err);
  }
}
