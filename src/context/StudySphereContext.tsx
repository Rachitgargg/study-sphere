import React, { createContext, useContext, useState, useEffect } from 'react';
import { Document, ChatMessage, QuizQuestion, Flashcard, VivaQuestion } from '../types';
import { mockDocuments, mockChatMessages, mockQuizQuestions, mockFlashcards, mockVivaQuestions } from '../lib/mockData';

interface StudySphereContextType {
  documents: Document[];
  addDocument: (doc: Omit<Document, 'id' | 'uploadDate' | 'status'>) => void;
  removeDocument: (id: string) => void;
  activeDoc: Document | null;
  setActiveDoc: (doc: Document | null) => void;
  chatMessages: ChatMessage[];
  addChatMessage: (role: 'user' | 'assistant', content: string) => void;
  clearChat: () => void;
  quizzes: QuizQuestion[];
  submitQuizAnswer: (questionId: string, answerIndex: number) => void;
  resetQuiz: () => void;
  flashcards: Flashcard[];
  updateFlashcardDifficulty: (id: string, difficulty: 'easy' | 'medium' | 'hard') => void;
  vivaQuestions: VivaQuestion[];
  submitVivaAnswer: (id: string, answerAudio: string, feedback: any) => void;
  resetViva: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  username: string;
  setUsername: (name: string) => void;
  academicLevel: string;
  setAcademicLevel: (level: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

const StudySphereContext = createContext<StudySphereContextType | undefined>(undefined);

export const StudySphereProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [activeDoc, setActiveDoc] = useState<Document | null>(mockDocuments[0]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>(mockQuizQuestions);
  const [flashcards, setFlashcards] = useState<Flashcard[]>(mockFlashcards);
  const [vivaQuestions, setVivaQuestions] = useState<VivaQuestion[]>(mockVivaQuestions);
  const [searchQuery, setSearchQuery] = useState('');
  const [username, setUsername] = useState('Alex');
  const [academicLevel, setAcademicLevel] = useState('Graduate (Computer Science)');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Initialize active doc if null and docs are available
  useEffect(() => {
    if (!activeDoc && documents.length > 0) {
      setActiveDoc(documents[0]);
    }
  }, [documents, activeDoc]);

  // Document actions
  const addDocument = (newDoc: Omit<Document, 'id' | 'uploadDate' | 'status'>) => {
    const doc: Document = {
      ...newDoc,
      id: `doc-${Date.now()}`,
      uploadDate: 'Just now',
      status: 'processing' // Starts processing, then "processes" after a delay!
    };
    setDocuments(prev => [doc, ...prev]);

    // Simulate processing completion after 5 seconds
    setTimeout(() => {
      setDocuments(prev => 
        prev.map(d => d.id === doc.id ? { ...d, status: 'processed' } : d)
      );
    }, 5000);
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    if (activeDoc?.id === id) {
      setActiveDoc(null);
    }
  };

  // Chat actions
  const addChatMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role,
      content,
      timestamp: 'Just now'
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const clearChat = () => {
    setChatMessages([
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: 'Conversation archived. The digital transcripts have been reset. What other scholarly inquiries can I assist you with?',
        timestamp: 'Just now'
      }
    ]);
  };

  // Quiz actions
  const submitQuizAnswer = (questionId: string, answerIndex: number) => {
    setQuizzes(prev => 
      prev.map(q => q.id === questionId ? { ...q, userAnswer: answerIndex } : q)
    );
  };

  const resetQuiz = () => {
    setQuizzes(prev => prev.map(q => ({ ...q, userAnswer: undefined })));
  };

  // Flashcard actions
  const updateFlashcardDifficulty = (id: string, difficulty: 'easy' | 'medium' | 'hard') => {
    setFlashcards(prev => 
      prev.map(fc => fc.id === id ? { ...fc, difficulty, lastReviewed: 'Just now' } : fc)
    );
  };

  // Viva actions
  const submitVivaAnswer = (id: string, answerAudio: string, feedback: any) => {
    setVivaQuestions(prev => 
      prev.map(q => q.id === id ? { ...q, userAnswerAudio: answerAudio, feedback } : q)
    );
  };

  const resetViva = () => {
    setVivaQuestions(prev => prev.map(q => ({ ...q, userAnswerAudio: undefined, feedback: undefined })));
  };

  return (
    <StudySphereContext.Provider
      value={{
        documents,
        addDocument,
        removeDocument,
        activeDoc,
        setActiveDoc,
        chatMessages,
        addChatMessage,
        clearChat,
        quizzes,
        submitQuizAnswer,
        resetQuiz,
        flashcards,
        updateFlashcardDifficulty,
        vivaQuestions,
        submitVivaAnswer,
        resetViva,
        searchQuery,
        setSearchQuery,
        username,
        setUsername,
        academicLevel,
        setAcademicLevel,
        isSidebarOpen,
        setIsSidebarOpen
      }}
    >
      {children}
    </StudySphereContext.Provider>
  );
};

export const useStudySphere = () => {
  const context = useContext(StudySphereContext);
  if (context === undefined) {
    throw new Error('useStudySphere must be used within a StudySphereProvider');
  }
  return context;
};
