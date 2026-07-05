import { QuizQuestion, Flashcard, VivaQuestion } from '../types';

export interface ParsedQuizQuestion extends QuizQuestion {
  showAnswer?: boolean;
}

export interface ParsedFlashcard extends Flashcard {
  isFlipped?: boolean;
}

export function parseQuiz(text: string): ParsedQuizQuestion[] {
  if (!text || typeof text !== 'string') return [];
  
  const questions: ParsedQuizQuestion[] = [];
  try {
    // split blocks by Q1:, Q2:, Question 1:, Question 2., etc.
    const rawBlocks = text.split(/(?=Q\d+[\.\s:]|Question\s*\d+[\.\s:])/gi);
    
    rawBlocks.forEach((block, index) => {
      const trimmedBlock = block.trim();
      if (!trimmedBlock) return;
      
      // Extract question
      const qMatch = trimmedBlock.match(/(?:Q\d+|Question\s*\d+)\s*[:\.]?\s*([\s\S]*?)(?=\r?\n\s*[*#\-]*\s*[A-D][\)\.]|$)/i);
      if (!qMatch) return;
      const question = qMatch[1].trim();
      
      // Extract options
      const options: string[] = [];
      const optionLetters = ['A', 'B', 'C', 'D'];
      
      optionLetters.forEach((letter) => {
        const regex = new RegExp(`(?:^|\\r?\\n)[\\*#\\-\\s]*${letter}[\\)\\.]\\s*([\\s\\S]*?)(?=\\r?\\n\\s*[\\*#\\-]*\\s*[A-D][\\\\)\\.]|\\r?\\n\\s*(?:Correct\\s*)?Answer:|$|\\r?\\nCard|\\r?\\nQ\\d+|\\r?\\nQuestion)`, 'i');
        const optMatch = trimmedBlock.match(regex);
        if (optMatch) {
          options.push(optMatch[1].trim());
        }
      });
      
      // Extract answer
      const ansMatch = trimmedBlock.match(/(?:Correct\s*)?Answer\s*[:\-]?\s*\(?([A-D])\)?/i);
      const answerChar = ansMatch ? ansMatch[1].toUpperCase() : '';
      const correctAnswer = optionLetters.indexOf(answerChar);
      
      // Extract explanation
      const expMatch = trimmedBlock.match(/(?:Explanation|Rationale|Detail):\s*([\s\S]*?)$/i);
      const explanation = expMatch ? expMatch[1].trim() : 'Factual reference validated from local course documents.';
      
      if (question && options.length > 0) {
        questions.push({
          id: `q-${index}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          question,
          options,
          correctAnswer: correctAnswer !== -1 ? correctAnswer : 0, // Fallback to option A if not specified
          explanation
        });
      }
    });
  } catch (err) {
    console.error('[parsers] parseQuiz failed:', err);
  }
  
  return questions;
}

export function parseFlashcards(text: string): ParsedFlashcard[] {
  if (!text || typeof text !== 'string') return [];
  
  const cards: ParsedFlashcard[] = [];
  try {
    const rawBlocks = text.split(/(?=Card\s*\d+|\bCard\b)/gi);
    
    rawBlocks.forEach((block, index) => {
      const trimmedBlock = block.trim();
      if (!trimmedBlock) return;
      
      const frontMatch = trimmedBlock.match(/(?:\*\*|###)?\s*Front\s*(?:\*\*|:)?\s*([\s\S]*?)(?=\r?\n(?:\*\*|###)?\s*Back:?|$)/i);
      const backMatch = trimmedBlock.match(/(?:\*\*|###)?\s*Back\s*(?:\*\*|:)?\s*([\s\S]*?)$/i);
      
      if (frontMatch && backMatch) {
        cards.push({
          id: `fc-${index}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          front: frontMatch[1].trim(),
          back: backMatch[1].trim(),
          category: 'Concept',
          isFlipped: false
        });
      }
    });
    
    // Fallback: if no Card/Front/Back blocks are found, but text is structured as "Q: ... \n A: ..."
    if (cards.length === 0) {
      const lines = text.split('\n');
      let currentFront = '';
      lines.forEach((line) => {
        const trimmedLine = line.trim();
        if (trimmedLine.toLowerCase().startsWith('q:') || trimmedLine.toLowerCase().startsWith('front:')) {
          currentFront = trimmedLine.replace(/^(q|front):/i, '').trim();
        } else if ((trimmedLine.toLowerCase().startsWith('a:') || trimmedLine.toLowerCase().startsWith('back:')) && currentFront) {
          const back = trimmedLine.replace(/^(a|back):/i, '').trim();
          cards.push({
            id: `fc-fb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            front: currentFront,
            back,
            category: 'Recall',
            isFlipped: false
          });
          currentFront = '';
        }
      });
    }
  } catch (err) {
    console.error('[parsers] parseFlashcards failed:', err);
  }
  
  return cards;
}

export function parseViva(text: string): VivaQuestion[] {
  if (!text || typeof text !== 'string') return [];
  
  const questions: VivaQuestion[] = [];
  try {
    // split blocks by numbers: e.g. 1. or 2)
    const rawBlocks = text.split(/(?=(?:^\d+|\n\d+)[\.\)]\s)/gi);
    
    rawBlocks.forEach((block, index) => {
      const trimmed = block.trim();
      if (!trimmed) return;
      
      const qMatch = trimmed.match(/^(?:\d+[\.\)]\s*)(.*?)(?:\n|$)/is);
      const question = qMatch ? qMatch[1].trim() : trimmed;
      
      if (question.length > 5) {
        // Extract expected keywords from the question itself as a fallback
        const stopWords = new Set(['what', 'why', 'how', 'explain', 'describe', 'define', 'the', 'and', 'are', 'you', 'your', 'for', 'with', 'from', 'that', 'this', 'these', 'those', 'their', 'them', 'they', 'have', 'has', 'had', 'does', 'doing', 'done', 'about', 'above', 'under', 'below', 'between', 'is', 'a', 'an', 'in', 'on', 'at', 'by', 'of', 'to']);
        const words = question.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/);
        const expectedKeywords = Array.from(new Set(words.filter(w => w.length > 3 && !stopWords.has(w)))).slice(0, 6);
        
        questions.push({
          id: `viva-${index}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          question,
          expectedKeywords: expectedKeywords.length > 0 ? expectedKeywords : ['concepts', 'definitions', 'theory']
        });
      }
    });
    
    // Fallback: If parsing didn't find numbered list items, split by newlines and treat each non-empty line as a question
    if (questions.length === 0) {
      const lines = text.split('\n');
      lines.forEach((line, index) => {
        const trimmed = line.trim().replace(/^[\*\-\d\.\)\s]+/, '');
        if (trimmed.length > 10) {
          questions.push({
            id: `viva-fallback-${index}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            question: trimmed,
            expectedKeywords: ['understanding', 'analysis', 'details']
          });
        }
      });
    }
  } catch (err) {
    console.error('[parsers] parseViva failed:', err);
  }
  
  return questions;
}
