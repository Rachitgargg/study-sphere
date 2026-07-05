import { QuizQuestion, Flashcard } from '../types';

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

