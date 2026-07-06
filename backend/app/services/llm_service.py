"""
LLM service for StudySphere AI.
Integrates Groq API to perform context-grounded response generation (RAG) supporting streaming and multiple study modes.
"""
import re
from groq import AsyncGroq
from app.core.config import settings
from app.services.prompt_templates import SYSTEM_PROMPTS
from typing import List, Dict, Any, AsyncGenerator

class LLMService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model_name = settings.GROQ_MODEL
        
        # Check if the API key is set and is not a default placeholder string
        is_key_configured = self.api_key and self.api_key != "your_groq_api_key_here"
        
        if is_key_configured:
            # Enforce client-level request timeout of 15 seconds
            self.client = AsyncGroq(api_key=self.api_key, timeout=15.0)
            print(f"[LLMService] Initialized Groq client with model: {self.model_name}")
        else:
            self.client = None
            print("[LLMService] WARNING: GROQ_API_KEY is not configured. Running in fallback mode.")

    async def generate_answer(self, query: str, context_chunks: List[Dict[str, Any]], mode: str = "chat") -> str:
        """
        Generates a context-grounded response using the Groq API (Non-streaming).
        The formatting and style is driven by the requested study mode.
        """
        if not self.client:
            return (
                "Fallback Mode: Groq API Key is not configured. "
                "Please add a valid GROQ_API_KEY to your .env file to enable AI answers."
            )
            
        if not context_chunks:
            return "No relevant information found in documents."
            
        # Formulate formatted context block
        context_texts = []
        for i, chunk in enumerate(context_chunks):
            source = chunk["metadata"]["source_file"]
            context_texts.append(f"Context Source [{source}]:\n{chunk['text']}")
            
        context_str = "\n\n".join(context_texts)
        
        # Select the system prompt according to the study mode
        system_prompt = SYSTEM_PROMPTS.get(mode, SYSTEM_PROMPTS["chat"])
        
        # Formulate count instructions if requested in the query
        count_match = re.search(r"exactly\s+(\d+)\s+(?:questions|flashcards|cards)", query, re.IGNORECASE)
        if count_match:
            count_val = count_match.group(1)
            if mode == "quiz":
                system_prompt += f"\nImportant Instruction: You MUST generate exactly {count_val} multiple-choice quiz questions (Q1 through Q{count_val}) for this response."
            elif mode == "flashcards":
                system_prompt += f"\nImportant Instruction: You MUST generate exactly {count_val} flashcards (Card 1 through Card {count_val}) for this response."
        
        user_prompt = (
            f"User Query / Instruction: {query}\n\n"
            f"Context Chunks:\n"
            f"{context_str}"
        )
        
        try:
            chat_completion = await self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                model=self.model_name,
                temperature=0.1,  # Keep temperature low for deterministic factual adherence
            )
            return chat_completion.choices[0].message.content.strip()
        except Exception as e:
            return f"Error communicating with the LLM API: {str(e)}"

    async def generate_answer_stream(
        self, query: str, context_chunks: List[Dict[str, Any]], mode: str = "chat"
    ) -> AsyncGenerator[str, None]:
        """
        Generates a context-grounded response using the Groq API (Streaming).
        Yields text tokens as they become available from the API.
        """
        if not self.client:
            yield (
                "Fallback Mode: Groq API Key is not configured. "
                "Please add a valid GROQ_API_KEY to your .env file to enable AI answers."
            )
            return
            
        if not context_chunks:
            yield "No relevant information found in documents."
            return
            
        context_texts = []
        for i, chunk in enumerate(context_chunks):
            source = chunk["metadata"]["source_file"]
            context_texts.append(f"Context Source [{source}]:\n{chunk['text']}")
            
        context_str = "\n\n".join(context_texts)
        
        system_prompt = SYSTEM_PROMPTS.get(mode, SYSTEM_PROMPTS["chat"])
        
        # Formulate count instructions if requested in the query
        count_match = re.search(r"exactly\s+(\d+)\s+(?:questions|flashcards|cards)", query, re.IGNORECASE)
        if count_match:
            count_val = count_match.group(1)
            if mode == "quiz":
                system_prompt += f"\nImportant Instruction: You MUST generate exactly {count_val} multiple-choice quiz questions (Q1 through Q{count_val}) for this response."
            elif mode == "flashcards":
                system_prompt += f"\nImportant Instruction: You MUST generate exactly {count_val} flashcards (Card 1 through Card {count_val}) for this response."
        
        user_prompt = (
            f"User Query / Instruction: {query}\n\n"
            f"Context Chunks:\n"
            f"{context_str}"
        )
        
        try:
            stream = await self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                model=self.model_name,
                temperature=0.1,
                stream=True
            )
            async for chunk in stream:
                token = chunk.choices[0].delta.content
                if token:
                    yield token
        except Exception as e:
            yield f"Error communicating with the LLM API: {str(e)}"

# Singleton instance
llm_service = LLMService()
