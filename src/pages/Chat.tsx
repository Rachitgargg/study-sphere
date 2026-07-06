import React, { useState, useRef, useEffect } from 'react';
import { useStudySphere } from '../context/StudySphereContext';
import { sendChatMessageStream } from '../lib/api';
import { parseQuiz, parseFlashcards, ParsedQuizQuestion, ParsedFlashcard } from '../lib/parsers';
import { MathText } from '../components/MathText';
import { 
  MessageSquare, 
  Send, 
  BookOpen, 
  Sparkles, 
  Trash2, 
  Compass, 
  ChevronRight, 
  FileText,
  Clock,
  Layers,
  GraduationCap,
  RotateCcw,
  Network,
  Info
} from 'lucide-react';

// Helper to format bold markdown tags
function formatBold(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

// Custom Renderer for Quiz Mode (MCQ rendering with toggles)
const QuizRenderer: React.FC<{ content: string }> = ({ content }) => {
  const [questions, setQuestions] = useState<ParsedQuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (content) {
      setQuestions(parseQuiz(content));
    } else {
      setQuestions([]);
    }
  }, [content]);

  if (!content || questions.length === 0) {
    return <div className="whitespace-pre-wrap">{content || ''}</div>;
  }

  return (
    <div className="space-y-5 my-2 p-4 bg-academic-black/40 border border-academic-card/75 rounded-xl">
      <h4 className="font-serif text-xs font-bold text-academic-gold flex items-center gap-1.5 border-b border-academic-card/30 pb-2 tracking-wider uppercase">
        <Sparkles className="w-3.5 h-3.5" /> Interactive Evaluation Quiz
      </h4>
      {(questions || []).map((q, qIdx) => (
        <div key={q.id || qIdx} className="space-y-3 pb-3 border-b border-academic-card/30 last:border-b-0 last:pb-0">
          <p className="font-semibold text-academic-cream text-xs">{qIdx + 1}. {q?.question || ''}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(q?.options || []).map((opt, optIdx) => {
              const isSelected = userAnswers[qIdx] === optIdx;
              const optionLetters = ['A', 'B', 'C', 'D'];
              return (
                <button
                  key={optIdx}
                  onClick={() => setUserAnswers(prev => ({ ...prev, [qIdx]: optIdx }))}
                  className={`px-3 py-2 rounded-lg text-left text-xs transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-academic-cream font-semibold'
                      : 'bg-white/5 border-transparent text-academic-text-muted hover:bg-white/10 hover:text-academic-cream hover:border-academic-card/30'
                  }`}
                >
                  <span className="font-mono text-academic-gold mr-1 font-bold">{optionLetters[optIdx] || ''})</span> {opt || ''}
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-2">
            <button
              onClick={() => setShowAnswers(prev => ({ ...prev, [qIdx]: !prev[qIdx] }))}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-mono transition-colors border-0 bg-transparent cursor-pointer"
            >
              {showAnswers[qIdx] ? 'Hide Answer Key' : 'Reveal Answer Key'}
            </button>
            {userAnswers[qIdx] !== undefined && (
              <span className={`text-[10px] font-mono font-bold ${
                userAnswers[qIdx] === q.correctAnswer ? 'text-academic-emerald-bright' : 'text-academic-crimson-bright'
              }`}>
                {userAnswers[qIdx] === q.correctAnswer ? '✓ Correct selection' : '✗ Incorrect selection'}
              </span>
            )}
          </div>
          {showAnswers[qIdx] && (
            <div className="bg-academic-gold/5 border border-academic-gold/15 rounded-lg p-3 text-[11px] font-mono text-academic-cream leading-relaxed animate-fade-in">
              <span className="text-academic-gold font-bold">Answer: </span>
              {['A', 'B', 'C', 'D'][q.correctAnswer] || ''} ({q?.options?.[q.correctAnswer] || ''})
              <p className="mt-1 text-[10px] text-academic-text-muted italic">Reference: {q?.explanation || ''}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Custom Renderer for Flashcards Mode (Flippable Card Carousel)
const FlashcardRenderer: React.FC<{ content: string }> = ({ content }) => {
  const [cards, setCards] = useState<ParsedFlashcard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (content) {
      setCards(parseFlashcards(content));
    } else {
      setCards([]);
    }
    setCurrentIdx(0);
    setFlipped(false);
  }, [content]);

  if (!content || cards.length === 0) {
    return <div className="whitespace-pre-wrap">{content || ''}</div>;
  }

  const currentCard = cards[currentIdx] || cards[0];
  if (!currentCard) return null;

  return (
    <div className="my-3 space-y-3 max-w-sm mx-auto">
      <div 
        onClick={() => setFlipped(!flipped)}
        className="w-full h-44 bg-academic-black/50 border border-academic-card/80 hover:border-academic-gold/30 rounded-xl cursor-pointer shadow-lg relative flex flex-col items-center justify-center p-5 text-center select-none overflow-hidden transition-all duration-300"
      >
        <div className="absolute top-2 right-3 text-[8px] font-mono text-academic-text-muted/60 uppercase tracking-widest">
          Click to Flip Card
        </div>
        
        {!flipped ? (
          <div className="animate-fade-in space-y-1">
            <span className="text-[9px] text-academic-gold font-mono uppercase tracking-widest font-bold">FRONT SIDE</span>
            <p className="text-xs font-semibold text-academic-cream leading-relaxed">{currentCard.front || ''}</p>
          </div>
        ) : (
          <div className="animate-fade-in space-y-1">
            <span className="text-[9px] text-indigo-400 font-mono uppercase tracking-widest font-bold">BACK SIDE</span>
            <p className="text-xs font-serif text-academic-cream leading-relaxed">{currentCard.back || ''}</p>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between px-2">
        <button
          disabled={currentIdx === 0}
          onClick={() => {
            setCurrentIdx(prev => prev - 1);
            setFlipped(false);
          }}
          className="text-[10px] font-mono text-academic-text-muted hover:text-academic-cream disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer border-0 bg-transparent"
        >
          ← Previous
        </button>
        <span className="text-[10px] font-mono text-academic-text-muted">
          Card {currentIdx + 1} of {cards.length}
        </span>
        <button
          disabled={currentIdx === cards.length - 1}
          onClick={() => {
            setCurrentIdx(prev => prev + 1);
            setFlipped(false);
          }}
          className="text-[10px] font-mono text-academic-text-muted hover:text-academic-cream disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer border-0 bg-transparent"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

// Custom Renderer for Visual Learning Mode
const VisualLearningRenderer: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="space-y-3 my-2 p-4 bg-academic-black/40 border border-academic-card/85 rounded-xl font-serif text-left">
      <h4 className="font-serif text-xs font-bold text-academic-gold border-b border-academic-card/30 pb-2 flex items-center gap-1.5 tracking-wider uppercase">
        <Network className="w-4 h-4" /> Visual Learning Diagram
      </h4>
      <div className="space-y-2 font-sans">
        <MathText text={content || ''} className="w-full inline-block" />
      </div>
    </div>
  );
};

// Custom Renderer for Summary Mode (concise key bullets)
const SummaryRenderer: React.FC<{ content: string }> = ({ content }) => {
  const lines = (content || '').split('\n');
  return (
    <div className="space-y-3 my-2 p-4 bg-academic-black/40 border border-academic-card/85 rounded-xl font-serif">
      <h4 className="font-serif text-xs font-bold text-academic-gold border-b border-academic-card/30 pb-2 flex items-center gap-1.5 tracking-wider uppercase">
        <FileText className="w-3.5 h-3.5" /> Conceptual Summary
      </h4>
      <div className="space-y-2">
        {lines.map((line, idx) => {
          if (!line.trim()) return null;
          if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
            const cleanLine = line.replace(/^[\*\-\s]+/, '');
            return (
              <div key={idx} className="flex items-start gap-2 text-xs leading-relaxed text-academic-cream/80 font-sans">
                <span className="text-academic-gold mt-1">•</span>
                <span dangerouslySetInnerHTML={{ __html: formatBold(cleanLine) }} />
              </div>
            );
          }
          return (
            <p 
              key={idx} 
              className="text-xs leading-relaxed text-academic-cream/80 font-sans" 
              dangerouslySetInnerHTML={{ __html: formatBold(line) }} 
            />
          );
        })}
      </div>
    </div>
  );
};

// Custom Renderer for Revision Mode (exam notes highlighting math and terms)
const RevisionRenderer: React.FC<{ content: string }> = ({ content }) => {
  const lines = (content || '').split('\n');
  return (
    <div className="space-y-3 my-2 p-4 bg-academic-black/40 border border-academic-card/85 rounded-xl font-serif">
      <h4 className="font-serif text-xs font-bold text-academic-gold border-b border-academic-card/30 pb-2 flex items-center gap-1.5 tracking-wider uppercase">
        <BookOpen className="w-3.5 h-3.5" /> Condensed Revision Sheets
      </h4>
      <div className="space-y-2">
        {lines.map((line, idx) => {
          if (!line.trim()) return null;
          const isFormula = line.includes('$$') || line.includes('$') || line.includes('=') || line.includes('\\');
          return (
            <p 
              key={idx} 
              className={`text-xs leading-relaxed p-1.5 rounded font-sans ${
                isFormula 
                  ? 'bg-academic-gold/5 border border-academic-gold/15 text-academic-gold font-mono text-[11px]' 
                  : 'text-academic-cream/80'
              }`}
              dangerouslySetInnerHTML={{ __html: formatBold(line) }} 
            />
          );
        })}
      </div>
    </div>
  );
};

export const Chat: React.FC = () => {
  const { 
    chatMessages, 
    addChatMessage, 
    updateLastChatMessage,
    clearChat, 
    activeDoc, 
    documents,
    setActiveDoc 
  } = useStudySphere();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<string>('chat');
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Settings states for custom counts
  const [quizSize, setQuizSize] = useState('10');
  const [customQuizSize, setCustomQuizSize] = useState('');
  const [isCustomQuiz, setIsCustomQuiz] = useState(false);

  const [flashcardCount, setFlashcardCount] = useState('15');
  const [customFlashcardCount, setCustomFlashcardCount] = useState('');
  const [isCustomFlashcard, setIsCustomFlashcard] = useState(false);

  const samplePrompts = [
    'Explain the primary concept in this document.',
    'Formulate a 3-bullet core summary of this text.',
    'Create a set of practice questions on this study guide.',
    'Generate flashcards for the key terminology.'
  ];

  // Auto-scroll on new messages
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatMessages, isTyping]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    addChatMessage('user', textToSend);
    setInput('');
    setIsTyping(true);

    // Format query with session history connections to ensure concept diversity
    let augmentedMessage = textToSend;
    if (mode === 'quiz') {
      const pastQuestions = chatMessages
        .filter(m => m.mode === 'quiz' && m.role === 'assistant')
        .map(m => m.content)
        .join('\n');
      if (pastQuestions) {
        const qMatches = pastQuestions.match(/(?:Q\d+|Question\s*\d+)[\s\S]*?(?=\r?\n\s*[A-D][\)\.]|$)/gi) || [];
        const uniqueQNames = Array.from(new Set(qMatches.map(q => q.replace(/^(?:Q\d+|Question\s*\d+)\s*[:\.]?\s*/i, '').trim().substring(0, 50)))).slice(0, 10);
        if (uniqueQNames.length > 0) {
          augmentedMessage += `\nPreviously generated questions/topics in this session: [${uniqueQNames.join(', ')}]. Do NOT repeat these topics or ask identical questions.`;
        }
      }
    } else if (mode === 'flashcards') {
      const pastCards = chatMessages
        .filter(m => m.mode === 'flashcards' && m.role === 'assistant')
        .map(m => m.content)
        .join('\n');
      if (pastCards) {
        const fMatches = pastCards.match(/Front:\s*(.*?)(?=\r?\nBack:|$)/gi) || [];
        const uniqueFNames = Array.from(new Set(fMatches.map(f => f.replace(/^Front:\s*/i, '').trim().substring(0, 50)))).slice(0, 10);
        if (uniqueFNames.length > 0) {
          augmentedMessage += `\nPreviously generated card concepts/terms in this session: [${uniqueFNames.join(', ')}]. Do NOT repeat these definitions or terms.`;
        }
      }
    }

    // Append streaming placeholder assistant message to the context log
    addChatMessage('assistant', '', mode);

    let accumulatedAnswer = '';

    try {
      await sendChatMessageStream(
        augmentedMessage,
        mode,
        activeDoc?.name,
        (context) => {
          // OnContext callback: updates context preview source lists
          updateLastChatMessage('', false, context.retrieved_context, context.sources);
        },
        (token) => {
          // OnToken callback: appends character tokens
          accumulatedAnswer += token;
          updateLastChatMessage(accumulatedAnswer, false);
          setIsTyping(false); // Switch off loading typing indicators once tokens start arriving
        },
        (error) => {
          // OnError callback
          updateLastChatMessage(
            `Academic connection error: ${error.message || 'Stream interface disrupted.'} Please verify the FastAPI backend is running.`,
            true
          );
          setIsTyping(false);
        },
        () => {
          // OnComplete callback
          setIsTyping(false);
        }
      );
    } catch (err: any) {
      updateLastChatMessage(`Critical reasoning system failure: ${err.message || 'Unable to establish streaming pipeline.'}`, true);
      setIsTyping(false);
    }
  };

  const handleRetry = (msgIndex: number) => {
    // Retrieve the user query prior to this failed response
    let userPromptText = '';
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (chatMessages[i].role === 'user') {
        userPromptText = chatMessages[i].content;
        break;
      }
    }
    
    if (userPromptText) {
      handleSend(userPromptText);
    }
  };

  return (
    <div className="h-full w-full flex gap-6 max-w-7xl mx-auto overflow-hidden p-4 md:p-6">
      {/* Left Sidebar: Materials Selector for Chat Context */}
      <div className="w-64 hidden md:flex flex-col bg-academic-paper border border-academic-card/80 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 bg-academic-black/30 border-b border-academic-card/50 flex items-center justify-between">
          <span className="text-[11px] font-mono tracking-wider text-academic-text-muted uppercase">Tethered Bibliographies</span>
          <BookOpen className="w-3.5 h-3.5 text-academic-gold" />
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {documents.length === 0 ? (
            <div className="text-xs text-academic-text-muted/50 p-4 text-center italic font-serif">
              No materials registered.
            </div>
          ) : (
            documents.map((doc) => {
              const isSelected = activeDoc?.id === doc.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => setActiveDoc(doc)}
                  className={`w-full flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                    isSelected 
                      ? 'bg-academic-gold/15 text-academic-gold border border-academic-gold/15' 
                      : 'text-academic-text-muted hover:bg-academic-card/50 hover:text-academic-cream border border-transparent'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{doc.name}</p>
                    <p className="text-[9px] font-mono opacity-70 mt-0.5">{doc.pageCount} Pages • {doc.size}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
        
        {activeDoc && (
          <div className="p-4 border-t border-academic-card/50 bg-academic-black/20 text-[11px] text-academic-text-muted font-serif">
            <span className="font-semibold block text-academic-cream">Current Context Focus:</span>
            <p className="truncate mt-0.5 text-academic-gold">{activeDoc.name}</p>
          </div>
        )}
      </div>

      {/* Right Section: Conversational AI log */}
      <div className="flex-1 flex flex-col bg-academic-paper border border-academic-card rounded-xl overflow-hidden shadow-lg">
        {/* Chat header */}
        <div className="px-6 py-4 bg-academic-black/40 border-b border-academic-card/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-academic-card flex items-center justify-center border border-academic-gold/25 text-academic-gold shadow-md">
              <MessageSquare className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-bold text-academic-cream">Academic Chat Client</h3>
              <p className="text-[10px] font-mono text-academic-text-muted/90 flex items-center gap-1">
                <span>Active Target:</span> 
                <span className="text-academic-gold truncate max-w-[200px]" title={activeDoc ? activeDoc.name : 'All Material'}>
                  {activeDoc ? activeDoc.name : 'Global Catalog'}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-academic-card hover:border-academic-crimson/30 hover:bg-academic-crimson/5 text-xs text-academic-text-muted hover:text-academic-crimson-bright font-sans transition-all cursor-pointer"
            title="Archive Chat Session"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Transcripts</span>
          </button>
        </div>

        {/* Study Mode Selector Pills */}
        <div className="px-6 py-2.5 bg-academic-black/20 border-b border-academic-card/35 flex items-center overflow-x-auto gap-2">
          <span className="text-[10px] font-mono text-academic-text-muted/80 uppercase tracking-wider mr-2 flex-shrink-0">
            Study Mode:
          </span>
          {[
            { id: 'chat', label: 'Chat', icon: MessageSquare },
            { id: 'summary', label: 'Summary', icon: FileText },
            { id: 'quiz', label: 'Quiz', icon: Sparkles },
            { id: 'flashcards', label: 'Flashcards', icon: Layers },
            { id: 'visual_learning', label: 'Visual Learning', icon: Network },
            { id: 'revision', label: 'Revision', icon: BookOpen }
          ].map((item) => {
            const isSelected = mode === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => !isTyping && setMode(item.id)}
                disabled={isTyping}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-bold border transition-all flex-shrink-0 ${
                  isTyping ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                } ${
                  isSelected
                    ? 'bg-academic-gold/15 border-academic-gold text-academic-gold shadow-md'
                    : 'bg-white/5 border-transparent text-academic-text-muted hover:border-academic-card/35 hover:bg-academic-card/30 hover:text-academic-cream'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Chat message logger */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0 messages">
          {chatMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-4">
              <Compass className="w-10 h-10 text-academic-gold/40" />
              <h4 className="font-serif text-md text-academic-cream">Ask Your Active Codex</h4>
              <p className="text-xs text-academic-text-muted font-serif">
                Select a study mode above to configure responses, choose your context bibliography on the left sidebar, and input your question.
              </p>
            </div>
          ) : (
            chatMessages.map((msg, index) => (
              <div 
                key={msg.id}
                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role !== 'user' && (
                  <div className="w-8 h-8 rounded-full bg-academic-card border border-academic-gold/20 flex items-center justify-center text-academic-gold flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-academic-gold" />
                  </div>
                )}

                <div 
                  className={`max-w-[85%] rounded-xl p-4 text-sm font-sans ${
                    msg.role === 'user' 
                      ? 'bg-academic-gold/10 text-academic-cream border border-academic-gold/20 shadow-md' 
                      : msg.error
                      ? 'bg-academic-crimson/10 text-academic-cream border border-academic-crimson/35 shadow-md'
                      : 'bg-academic-dark text-academic-cream/90 border border-academic-card/80 shadow-md'
                  }`}
                >
                  <div className="leading-relaxed">
                    {msg.role === 'user' ? (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    ) : msg.mode === 'quiz' ? (
                      <QuizRenderer content={msg.content} />
                    ) : msg.mode === 'flashcards' ? (
                      <FlashcardRenderer content={msg.content} />
                    ) : msg.mode === 'visual_learning' ? (
                      <VisualLearningRenderer content={msg.content} />
                    ) : msg.mode === 'summary' ? (
                      <SummaryRenderer content={msg.content} />
                    ) : msg.mode === 'revision' ? (
                      <RevisionRenderer content={msg.content} />
                    ) : (
                      <MathText text={msg.content} className="whitespace-pre-wrap" />
                    )}
                  </div>

                  {/* Render retry button if request failed */}
                  {msg.error && (
                    <button
                      onClick={() => handleRetry(index)}
                      className="mt-3 flex items-center gap-1.5 px-3 py-1 text-xs border border-academic-crimson/30 hover:border-academic-gold/40 hover:bg-academic-gold/5 text-academic-cream rounded transition-all cursor-pointer font-mono"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Retry Request</span>
                    </button>
                  )}

                  {/* Render citations block with source and preview blocks */}
                  {msg.role === 'assistant' && msg.retrieved_context && msg.retrieved_context.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-academic-card/40 space-y-2">
                      <p className="text-[10px] font-mono text-academic-gold uppercase tracking-wider font-bold">
                        Theoretical Citations
                      </p>
                      <div className="flex flex-col gap-2">
                        {msg.retrieved_context.map((chunk: any, idx: number) => (
                          <div 
                            key={idx} 
                            className="text-[10px] bg-academic-black/50 border border-academic-card/60 rounded p-2 text-academic-cream/80 hover:border-academic-gold/30 hover:text-academic-cream transition-all flex flex-col gap-1 max-w-full"
                          >
                            <span className="font-mono text-academic-gold font-bold">
                              Source: {chunk.metadata?.source_file || 'unknown'} (chunk {chunk.chunk_id !== undefined ? chunk.chunk_id : idx})
                            </span>
                            <span className="text-[9px] text-academic-text-muted italic leading-snug line-clamp-2">
                              "{chunk.text}"
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className={`mt-2 text-[9px] font-mono text-academic-text-muted/65 flex items-center gap-1 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <Clock className="w-2.5 h-2.5" />
                    <span>{msg.timestamp}</span>
                    {msg.mode && msg.role === 'assistant' && (
                      <span className="bg-academic-card text-academic-gold border border-academic-gold/10 px-1 py-0.2 rounded capitalize text-[8px] ml-1.5">
                        Mode: {msg.mode}
                      </span>
                    )}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-academic-card border border-academic-gold/25 flex items-center justify-center text-academic-cream flex-shrink-0 font-mono text-xs font-semibold">
                    A
                  </div>
                )}
              </div>
            ))
          )}

          {isTyping && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 rounded-full bg-academic-card border border-academic-gold/20 flex items-center justify-center text-academic-gold flex-shrink-0">
                <Sparkles className="w-4 h-4 text-academic-gold animate-spin" />
              </div>
              <div className="bg-academic-dark text-academic-text-muted border border-academic-card/80 rounded-xl px-4 py-3 text-xs italic font-serif flex items-center gap-2">
                <span>The digital archivist is retrieving cited sections...</span>
                <span className="flex gap-1">
                  <span className="w-1 h-1 rounded-full bg-academic-gold animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-1 rounded-full bg-academic-gold animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1 rounded-full bg-academic-gold animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}


        </div>

        {/* Prompts suggest layout */}
        {chatMessages.length <= 1 && (
          <div className="px-6 py-3 bg-academic-black/30 border-t border-academic-card/30">
            <p className="text-[10px] font-mono text-academic-text-muted uppercase tracking-wider mb-2">Suggested Inquiries</p>
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p)}
                  className="text-left text-xs bg-academic-dark hover:bg-academic-card/80 border border-academic-card/80 hover:border-academic-gold/30 rounded-lg px-3 py-1.5 text-academic-text-muted hover:text-academic-cream transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{p}</span>
                  <ChevronRight className="w-3 h-3 text-academic-gold/50" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Study Mode Settings & Info Banners */}
        {mode === 'quiz' && (
          <div className="bg-academic-paper border border-academic-card p-4 rounded-xl mx-4 mb-3 gold-glow space-y-3 font-sans text-xs text-left animate-fade-in">
            <span className="font-serif font-bold text-academic-cream flex items-center gap-1.5 border-b border-academic-card/50 pb-2">
              <Sparkles className="w-4 h-4 text-academic-gold" />
              Quiz Settings
            </span>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-academic-text-muted">Number of Questions:</span>
                <select
                  value={isCustomQuiz ? 'custom' : quizSize}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'custom') {
                      setIsCustomQuiz(true);
                    } else {
                      setIsCustomQuiz(false);
                      setQuizSize(val);
                    }
                  }}
                  className="bg-academic-black border border-academic-card text-academic-cream px-2 py-1 rounded focus:outline-none focus:border-academic-gold cursor-pointer"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                  <option value="20">20</option>
                  <option value="custom">Custom Number</option>
                </select>
              </div>

              {isCustomQuiz && (
                <div className="flex items-center gap-2 animate-fade-in">
                  <span className="text-academic-text-muted">Count (1-50):</span>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={customQuizSize}
                    onChange={(e) => setCustomQuizSize(e.target.value)}
                    className="bg-academic-black border border-academic-card text-academic-cream px-2 py-1 rounded w-16 focus:outline-none focus:border-academic-gold text-center"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  const finalSize = isCustomQuiz ? Math.max(1, Math.min(50, parseInt(customQuizSize) || 10)) : parseInt(quizSize);
                  handleSend(`Generate exactly ${finalSize} quiz questions.`);
                }}
                disabled={isTyping || (isCustomQuiz && (!customQuizSize || parseInt(customQuizSize) < 1 || parseInt(customQuizSize) > 50))}
                className="sm:ml-auto px-4 py-1.5 bg-academic-gold hover:bg-academic-gold-muted text-academic-black font-sans font-bold text-xs tracking-wider rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-0"
              >
                Generate Quiz
              </button>
            </div>
          </div>
        )}

        {mode === 'flashcards' && (
          <div className="bg-academic-paper border border-academic-card p-4 rounded-xl mx-4 mb-3 gold-glow space-y-3 font-sans text-xs text-left animate-fade-in">
            <span className="font-serif font-bold text-academic-cream flex items-center gap-1.5 border-b border-academic-card/50 pb-2">
              <Layers className="w-4 h-4 text-academic-gold" />
              Flashcard Settings
            </span>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-academic-text-muted">Number of Flashcards:</span>
                <select
                  value={isCustomFlashcard ? 'custom' : flashcardCount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'custom') {
                      setIsCustomFlashcard(true);
                    } else {
                      setIsCustomFlashcard(false);
                      setFlashcardCount(val);
                    }
                  }}
                  className="bg-academic-black border border-academic-card text-academic-cream px-2 py-1 rounded focus:outline-none focus:border-academic-gold cursor-pointer"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                  <option value="20">20</option>
                  <option value="custom">Custom Number</option>
                </select>
              </div>

              {isCustomFlashcard && (
                <div className="flex items-center gap-2 animate-fade-in">
                  <span className="text-academic-text-muted">Count (1-50):</span>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={customFlashcardCount}
                    onChange={(e) => setCustomFlashcardCount(e.target.value)}
                    className="bg-academic-black border border-academic-card text-academic-cream px-2 py-1 rounded w-16 focus:outline-none focus:border-academic-gold text-center"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  const finalCount = isCustomFlashcard ? Math.max(1, Math.min(50, parseInt(customFlashcardCount) || 15)) : parseInt(flashcardCount);
                  handleSend(`Generate exactly ${finalCount} flashcards.`);
                }}
                disabled={isTyping || (isCustomFlashcard && (!customFlashcardCount || parseInt(customFlashcardCount) < 1 || parseInt(customFlashcardCount) > 50))}
                className="sm:ml-auto px-4 py-1.5 bg-academic-gold hover:bg-academic-gold-muted text-academic-black font-sans font-bold text-xs tracking-wider rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-0"
              >
                Generate Flashcards
              </button>
            </div>
          </div>
        )}

        {mode === 'learn' && (
          <div className="bg-indigo-950/20 border border-indigo-500/20 p-3 rounded-xl mx-4 mb-3 flex items-start gap-2.5 text-xs text-indigo-300 font-sans text-left animate-fade-in">
            <Info className="w-4.5 h-4.5 text-indigo-400 mt-0.5 flex-shrink-0" />
            <span>Learn Mode provides detailed explanations with examples and analogies.</span>
          </div>
        )}

        {mode === 'visual_learning' && (
          <div className="bg-indigo-950/20 border border-indigo-500/20 p-3 rounded-xl mx-4 mb-3 flex items-start gap-2.5 text-xs text-indigo-300 font-sans text-left animate-fade-in">
            <Info className="w-4.5 h-4.5 text-indigo-400 mt-0.5 flex-shrink-0" />
            <span>Visual Learning explains concepts using diagrams, flowcharts and structured visual representations.</span>
          </div>
        )}

        {/* Input area Form */}
        <div className="p-4 bg-black/20 border-t border-white/5">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex gap-3 items-center"
          >
            <input
              type="text"
              placeholder={activeDoc ? `Inquire in ${mode} mode about "${activeDoc.name}"...` : `Type your query for ${mode} mode...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-sans"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="w-11 h-11 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
              title="Transmit query"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default Chat;
