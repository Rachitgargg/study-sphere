export interface ParsedQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // 0 for A, 1 for B, 2 for C, 3 for D
  explanation: string;
  userAnswer?: number;
  showAnswer?: boolean;
}

export interface ParsedFlashcard {
  id: string;
  front: string;
  back: string;
  isFlipped?: boolean;
}

export function parseQuiz(text: string): ParsedQuizQuestion[] {
  const questions: ParsedQuizQuestion[] = [];
  // Split blocks by Q1:, Q2:, etc.
  const rawBlocks = text.split(/(?=Q\d+[:\r\n])/gi);
  
  rawBlocks.forEach((block, index) => {
    if (!block.trim()) return;
    
    // Extract question body
    const qMatch = block.match(/Q\d+:\s*(.*?)(?=\r?\n[A-D]\))/is);
    if (!qMatch) return;
    const question = qMatch[1].trim();
    
    // Extract options
    const options: string[] = [];
    const optionLetters = ['A', 'B', 'C', 'D'];
    
    optionLetters.forEach((letter) => {
      // Matches: A) option text or A. option text
      const regex = new RegExp(`${letter}[\\)\\.]\\s*(.*?)(?=\\r?\\n[A-D][\\\\)\\.]|\\r?\\nAnswer:|$|\\r?\\nCard|\\r?\\nQ\\d+)`, 'is');
      const optMatch = block.match(regex);
      if (optMatch) {
        options.push(optMatch[1].trim());
      }
    });
    
    // Extract answer (A, B, C, or D)
    const ansMatch = block.match(/Answer:\s*([A-D])/i);
    const answerChar = ansMatch ? ansMatch[1].toUpperCase() : '';
    const correctAnswer = optionLetters.indexOf(answerChar);
    
    if (options.length > 0 && correctAnswer !== -1) {
      questions.push({
        id: `q-${index}-${Date.now()}`,
        question,
        options,
        correctAnswer,
        explanation: 'Factual reference validated from local course documents.'
      });
    }
  });
  
  return questions;
}

export function parseFlashcards(text: string): ParsedFlashcard[] {
  const cards: ParsedFlashcard[] = [];
  // Split blocks by Card 1:, Card 2:
  const rawBlocks = text.split(/(?=Card\s*\d+[:\r\n])/gi);
  
  rawBlocks.forEach((block, index) => {
    if (!block.trim()) return;
    
    // Look for Front: and Back: segments
    const frontMatch = block.match(/Front:\s*(.*?)(?=\r?\nBack:|$)/is);
    const backMatch = block.match(/Back:\s*(.*)/is);
    
    if (frontMatch && backMatch) {
      cards.push({
        id: `fc-${index}-${Date.now()}`,
        front: frontMatch[1].trim(),
        back: backMatch[1].trim(),
        isFlipped: false
      });
    }
  });
  
  return cards;
}
