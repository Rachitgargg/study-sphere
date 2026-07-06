"""
Service for splitting documents into chunks.
Implements a custom recursive character text splitter similar to LangChain's RecursiveCharacterTextSplitter.
"""
from typing import List, Dict, Any

class TextSplitterService:
    def __init__(self, chunk_size: int = 800, chunk_overlap: int = 150):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        # Standard dividers ordered by priority of keeping content grouped together
        self.separators = ["\n\n", "\n", " ", ""]

    def split_text(self, text: str, source_file: str = "unknown") -> List[Dict[str, Any]]:
        """
        Splits the input text into chunks of documents.
        Returns a list of dictionaries with chunk_id, text, and start/end character indices.
        """
        if not text:
            return []
            
        raw_chunks = self._split_recursive(text, self.separators)
        
        chunks = []
        current_search_idx = 0
        
        for idx, chunk_text in enumerate(raw_chunks):
            # Find the position of this chunk in the original text
            start_index = text.find(chunk_text, current_search_idx)
            if start_index == -1:
                # Fallback to search from beginning if search pointer gets out of sync
                start_index = text.find(chunk_text)
            
            if start_index != -1:
                end_index = start_index + len(chunk_text)
                # Increment the search pointer to just after the start of this match
                current_search_idx = start_index + 1
            else:
                start_index = 0
                end_index = 0
                
            chunks.append({
                "chunk_id": idx + 1,
                "text": chunk_text,
                "metadata": {
                    "source_file": source_file,
                    "start_index": start_index,
                    "end_index": end_index
                }
            })
            
        return chunks

    def _split_recursive(self, text: str, separators: List[str]) -> List[str]:
        """Recursively splits the text using the list of separators."""
        final_chunks = []
        
        # Pick the most appropriate separator present in the text
        separator = separators[-1] if separators else ""
        new_separators = []
        for i, sep in enumerate(separators):
            if sep == "":
                separator = sep
                new_separators = separators[i+1:]
                break
            if sep in text:
                separator = sep
                new_separators = separators[i+1:]
                break

        # Split text using the selected separator
        if separator != "":
            splits = text.split(separator)
        else:
            splits = list(text)

        # Merge splits into chunks that fit within chunk_size
        good_splits = [s for s in splits if s != ""]
        current_doc = []
        total_len = 0
        
        for s in good_splits:
            s_len = len(s)
            
            # If a single split item is larger than chunk_size, split it recursively
            if s_len > self.chunk_size:
                if current_doc:
                    merged = self._merge_splits(current_doc, separator)
                    final_chunks.extend(merged)
                    current_doc = []
                    total_len = 0
                
                if new_separators:
                    recursive_splits = self._split_recursive(s, new_separators)
                    final_chunks.extend(recursive_splits)
                else:
                    # Slice it character by character as fallback
                    start = 0
                    while start < len(s):
                        end = start + self.chunk_size
                        final_chunks.append(s[start:end])
                        start += self.chunk_size - self.chunk_overlap
                        if start >= len(s) or self.chunk_size <= self.chunk_overlap:
                            break
            else:
                sep_len = len(separator) if current_doc else 0
                if total_len + s_len + sep_len > self.chunk_size:
                    # Merge current_doc and add to chunks
                    merged = self._merge_splits(current_doc, separator)
                    final_chunks.extend(merged)
                    
                    # Compute the overlapping content to seed the next chunk
                    overlap_doc = []
                    overlap_len = 0
                    for prev_s in reversed(current_doc):
                        prev_s_len = len(prev_s)
                        prev_sep_len = len(separator) if overlap_doc else 0
                        if overlap_len + prev_s_len + prev_sep_len <= self.chunk_overlap:
                            overlap_doc.insert(0, prev_s)
                            overlap_len += prev_s_len + prev_sep_len
                        else:
                            break
                    current_doc = overlap_doc
                    total_len = overlap_len
                
                current_doc.append(s)
                total_len += s_len + (len(separator) if len(current_doc) > 1 else 0)

        # Add any remaining text
        if current_doc:
            merged = self._merge_splits(current_doc, separator)
            final_chunks.extend(merged)

        return final_chunks

    def _merge_splits(self, doc_splits: List[str], separator: str) -> List[str]:
        """Helper to join splits back with the separator."""
        merged = separator.join(doc_splits).strip()
        return [merged] if merged else []
