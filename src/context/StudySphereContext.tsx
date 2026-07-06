import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Document, ChatMessage, QuizQuestion, Flashcard } from '../types';
import { mockDocuments, mockFlashcards, mockQuizQuestions } from '../lib/mockData';

interface AddDocumentInput {
  name: string;
  size: string;
  type: 'pdf' | 'docx' | 'txt' | 'pptx';
  id?: string;
  status?: 'processed' | 'processing';
  concepts?: string[];
  pageCount?: number;
}

interface StudySphereContextType {
  documents: Document[];
  addDocument: (doc: AddDocumentInput) => void;
  removeDocument: (id: string) => void;
  activeDoc: Document | null;
  setActiveDoc: (doc: Document | null) => void;
  updateDocumentSummary?: (id: string, summary: string) => void;
  chatMessages: ChatMessage[];
  addChatMessage: (
    role: 'user' | 'assistant',
    content: string,
    mode?: string,
    retrieved_context?: any[],
    sources?: string[],
    error?: boolean
  ) => void;
  updateLastChatMessage: (
    content: string,
    error?: boolean,
    retrieved_context?: any[],
    sources?: string[]
  ) => void;
  clearChat: () => void;
  quizzes: QuizQuestion[];
  submitQuizAnswer: (questionId: string, answerIndex: number) => void;
  resetQuiz: () => void;
  flashcards: Flashcard[];
  updateFlashcardDifficulty: (id: string, difficulty: 'easy' | 'medium' | 'hard') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  username: string;
  setUsername: (name: string) => void;
  academicLevel: string;
  setAcademicLevel: (level: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  onboardingComplete: boolean;
  setOnboardingComplete: (complete: boolean) => void;
  resetOnboarding: () => void;
  
  // Real-time tracking
  studyTime: number;
  weeklyHours: { day: string; hours: number }[];
  incrementStudyTime: (seconds: number) => void;
  resetStats: () => void;
  visualLearning: string;
  setVisualLearning: (content: string) => void;
  setQuizzes: React.Dispatch<React.SetStateAction<QuizQuestion[]>>;
  setFlashcards: React.Dispatch<React.SetStateAction<Flashcard[]>>;
}

const defaultWeeklyHours = [
  { day: 'Mon', hours: 0 },
  { day: 'Tue', hours: 0 },
  { day: 'Wed', hours: 0 },
  { day: 'Thu', hours: 0 },
  { day: 'Fri', hours: 0 },
  { day: 'Sat', hours: 0 },
  { day: 'Sun', hours: 0 }
];

const StudySphereContext = createContext<StudySphereContextType | undefined>(undefined);

export const StudySphereProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial states from localStorage or empty defaults
  const [documents, setDocuments] = useState<Document[]>(() => {
    const saved = localStorage.getItem('study_sphere_documents');
    return saved ? JSON.parse(saved) : mockDocuments;
  });
  
  const [activeDoc, setActiveDoc] = useState<Document | null>(() => {
    const saved = localStorage.getItem('study_sphere_active_doc');
    return saved ? JSON.parse(saved) : (mockDocuments[0] || null);
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('study_sphere_chat_messages');
    return saved ? JSON.parse(saved) : [];
  });

  const [quizzes, setQuizzes] = useState<QuizQuestion[]>(() => {
    const savedDoc = localStorage.getItem('study_sphere_active_doc');
    const parsedDoc = savedDoc ? JSON.parse(savedDoc) : null;
    const docId = parsedDoc ? parsedDoc.id : (mockDocuments[0]?.id || '');
    return docId === 'doc-1' ? mockQuizQuestions : [];
  });

  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    const savedDoc = localStorage.getItem('study_sphere_active_doc');
    const parsedDoc = savedDoc ? JSON.parse(savedDoc) : null;
    const docId = parsedDoc ? parsedDoc.id : (mockDocuments[0]?.id || '');
    return docId === 'doc-1' ? mockFlashcards : [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [username, setUsername] = useState<string>(() => {
    const savedName = localStorage.getItem('name');
    return savedName ? savedName : 'Alex';
  });

  // Sessions map state
  const [sessions, setSessions] = useState<{ [docId: string]: any }>(() => {
    const saved = localStorage.getItem('study_sphere_sessions');
    return saved ? JSON.parse(saved) : {};
  });

  // visualLearning content state
  const [visualLearning, setVisualLearning] = useState<string>('');
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(() => {
    const savedOnboarding = localStorage.getItem('onboardingComplete');
    return savedOnboarding === 'true';
  });
  const [academicLevel, setAcademicLevel] = useState('Graduate (Computer Science)');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Study stats states
  const [studyTime, setStudyTime] = useState<number>(() => {
    const saved = localStorage.getItem('study_sphere_study_time');
    return saved ? parseInt(saved) : 0;
  });

  const [weeklyHours, setWeeklyHours] = useState<{ day: string; hours: number }[]>(() => {
    const saved = localStorage.getItem('study_sphere_weekly_hours');
    return saved ? JSON.parse(saved) : defaultWeeklyHours;
  });

  // Keep localStorage updated when lists change
  useEffect(() => {
    localStorage.setItem('study_sphere_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('study_sphere_active_doc', activeDoc ? JSON.stringify(activeDoc) : '');
  }, [activeDoc]);

  useEffect(() => {
    localStorage.setItem('study_sphere_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('name', username);
  }, [username]);

  useEffect(() => {
    localStorage.setItem('onboardingComplete', String(onboardingComplete));
  }, [onboardingComplete]);

  useEffect(() => {
    if (!activeDoc && documents.length > 0) {
      setActiveDoc(documents[0]);
    }
  }, [documents, activeDoc]);

  const isLoadingSessionRef = useRef(false);

  // Load session when activeDoc changes
  useEffect(() => {
    if (activeDoc) {
      isLoadingSessionRef.current = true;
      const session = sessions[activeDoc.id];
      if (session) {
        setChatMessages(session.chatHistory || []);
        setQuizzes(session.quizzes || []);
        setFlashcards(session.flashcards || []);
        setVisualLearning(session.visualLearning || '');
        if (session.summaries && session.summaries !== activeDoc.summary) {
          setDocuments(prev => prev.map(doc => {
            if (doc.id === activeDoc.id) {
              return { ...doc, summary: session.summaries };
            }
            return doc;
          }));
        }
      } else {
        // If it's the default mock document, load the mock data
        if (activeDoc.id === 'doc-1') {
          setChatMessages([]);
          setQuizzes(mockQuizQuestions);
          setFlashcards(mockFlashcards);
          setVisualLearning(
            "Here is a flowchart mapping the continuous optimization parameter flow:\n\n" +
            "```mermaid\n" +
            "graph TD\n" +
            "A[Active Codex PDF] -->|Linguistic Analysis| B[Feature Matrix X]\n" +
            "B -->|Parameter Dot Product| C[Linear Model prediction: w^T x + b]\n" +
            "C -->|Compute Contours| D[Convex Loss bowl J]\n" +
            "D -->|Derivative Slopes| E[Stochastic Gradient Descent]\n" +
            "E -->|Weight Regularization| F[Generalized Generalization Bounds]\n" +
            "```\n\n" +
            "### Key Visual Components\n" +
            "• **Feature Matrix X**: Represents input vectors.\n" +
            "• **Convex Loss Bowl J**: Mathematical function guaranteeing a global minimum.\n" +
            "• **Stochastic Gradient Descent**: Step-by-step optimization path."
          );
        } else {
          // Initialize a fresh empty session
          setChatMessages([]);
          setQuizzes([]);
          setFlashcards([]);
          setVisualLearning('');
        }
      }
      setTimeout(() => {
        isLoadingSessionRef.current = false;
      }, 0);
    }
  }, [activeDoc?.id]);

  // Synchronize state changes to sessions map
  useEffect(() => {
    if (activeDoc && !isLoadingSessionRef.current) {
      setSessions(prev => ({
        ...prev,
        [activeDoc.id]: {
          ...(prev[activeDoc.id] || {
            documentId: activeDoc.id,
            filename: activeDoc.name,
            chatHistory: [],
            summaries: activeDoc.summary || '',
            quizzes: [],
            flashcards: [],
            visualLearning: '',
            revision: ''
          }),
          chatHistory: chatMessages
        }
      }));
    }
  }, [chatMessages, activeDoc?.id]);

  useEffect(() => {
    if (activeDoc && !isLoadingSessionRef.current) {
      setSessions(prev => ({
        ...prev,
        [activeDoc.id]: {
          ...(prev[activeDoc.id] || {
            documentId: activeDoc.id,
            filename: activeDoc.name,
            chatHistory: [],
            summaries: activeDoc.summary || '',
            quizzes: [],
            flashcards: [],
            visualLearning: '',
            revision: ''
          }),
          quizzes: quizzes
        }
      }));
    }
  }, [quizzes, activeDoc?.id]);

  useEffect(() => {
    if (activeDoc && !isLoadingSessionRef.current) {
      setSessions(prev => ({
        ...prev,
        [activeDoc.id]: {
          ...(prev[activeDoc.id] || {
            documentId: activeDoc.id,
            filename: activeDoc.name,
            chatHistory: [],
            summaries: activeDoc.summary || '',
            quizzes: [],
            flashcards: [],
            visualLearning: '',
            revision: ''
          }),
          flashcards: flashcards
        }
      }));
    }
  }, [flashcards, activeDoc?.id]);

  useEffect(() => {
    if (activeDoc && !isLoadingSessionRef.current) {
      setSessions(prev => ({
        ...prev,
        [activeDoc.id]: {
          ...(prev[activeDoc.id] || {
            documentId: activeDoc.id,
            filename: activeDoc.name,
            chatHistory: [],
            summaries: activeDoc.summary || '',
            quizzes: [],
            flashcards: [],
            visualLearning: '',
            revision: ''
          }),
          visualLearning: visualLearning
        }
      }));
    }
  }, [visualLearning, activeDoc?.id]);

  useEffect(() => {
    if (activeDoc && activeDoc.summary && !isLoadingSessionRef.current) {
      setSessions(prev => ({
        ...prev,
        [activeDoc.id]: {
          ...(prev[activeDoc.id] || {
            documentId: activeDoc.id,
            filename: activeDoc.name,
            chatHistory: [],
            summaries: activeDoc.summary || '',
            quizzes: [],
            flashcards: [],
            visualLearning: '',
            revision: ''
          }),
          summaries: activeDoc.summary
        }
      }));
    }
  }, [activeDoc?.summary, activeDoc?.id]);

  // Increment study time and log fraction to current day
  const incrementStudyTime = (secs: number) => {
    setStudyTime(prev => {
      const newTime = prev + secs;
      localStorage.setItem('study_sphere_study_time', String(newTime));
      return newTime;
    });

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDayName = days[new Date().getDay()];

    setWeeklyHours(prev => {
      const newHours = prev.map(d => {
        if (d.day === currentDayName) {
          return { ...d, hours: parseFloat((d.hours + secs / 3600).toFixed(5)) };
        }
        return d;
      });
      localStorage.setItem('study_sphere_weekly_hours', JSON.stringify(newHours));
      return newHours;
    });
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible' && activeDoc) {
        incrementStudyTime(1);
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [activeDoc]);

  // Reset all stats completely
  const resetStats = () => {
    localStorage.removeItem('study_sphere_study_time');
    localStorage.removeItem('study_sphere_weekly_hours');
    localStorage.removeItem('study_sphere_documents');
    localStorage.removeItem('study_sphere_active_doc');
    localStorage.removeItem('study_sphere_chat_messages');
    setStudyTime(0);
    setWeeklyHours(defaultWeeklyHours);
    setDocuments([]);
    setActiveDoc(null);
    setChatMessages([]);
    setQuizzes([]);
    setFlashcards([]);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('onboardingComplete');
    localStorage.removeItem('name');
    setUsername('Alex');
    setOnboardingComplete(false);
  };

  // Document actions
  const addDocument = (newDoc: AddDocumentInput) => {
    const doc: Document = {
      ...newDoc,
      id: newDoc.id || `doc-${Date.now()}`,
      uploadDate: 'Just now',
      status: newDoc.status || 'processing'
    };
    setDocuments(prev => [doc, ...prev]);

    // Simulate processing completion only if status is processing
    if (doc.status === 'processing') {
      setTimeout(() => {
        setDocuments(prev => 
          prev.map(d => d.id === doc.id ? { ...d, status: 'processed' } : d)
        );
      }, 5000);
    }
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    if (activeDoc?.id === id) {
      setActiveDoc(null);
    }
  };

  const updateDocumentSummary = (id: string, summary: string) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, summary } : d));
    if (activeDoc?.id === id) {
      setActiveDoc(prev => prev ? { ...prev, summary } : null);
    }
  };

  // Chat actions
  const addChatMessage = (
    role: 'user' | 'assistant',
    content: string,
    mode?: string,
    retrieved_context?: any[],
    sources?: string[],
    error?: boolean
  ) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role,
      content,
      timestamp: 'Just now',
      mode,
      retrieved_context,
      sources,
      error
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const updateLastChatMessage = (
    content: string,
    error?: boolean,
    retrieved_context?: any[],
    sources?: string[]
  ) => {
    setChatMessages(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      if (last.role !== 'assistant') return prev;
      const copy = [...prev];
      copy[copy.length - 1] = {
        ...last,
        content,
        error: error !== undefined ? error : last.error,
        retrieved_context: retrieved_context !== undefined ? retrieved_context : last.retrieved_context,
        sources: sources !== undefined ? sources : last.sources
      };
      return copy;
    });
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
        updateLastChatMessage,
        clearChat,
        quizzes,
        submitQuizAnswer,
        resetQuiz,
        flashcards,
        updateFlashcardDifficulty,
        searchQuery,
        setSearchQuery,
        username,
        setUsername,
        academicLevel,
        setAcademicLevel,
        isSidebarOpen,
        setIsSidebarOpen,
        studyTime,
        weeklyHours,
        incrementStudyTime,
        resetStats,
        setQuizzes,
        setFlashcards,
        updateDocumentSummary,
        onboardingComplete,
        setOnboardingComplete,
        resetOnboarding,
        visualLearning,
        setVisualLearning
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
