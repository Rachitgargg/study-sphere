import React, { useState, useRef, useEffect } from 'react';
import { useStudySphere } from '../context/StudySphereContext';
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
  ArrowRight
} from 'lucide-react';

export const Chat: React.FC = () => {
  const { 
    chatMessages, 
    addChatMessage, 
    clearChat, 
    activeDoc, 
    documents,
    setActiveDoc 
  } = useStudySphere();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    'Explain the primary theorem in this document.',
    'Formulate a 3-bullet core summary of this text.',
    'List the key mathematical equations and their variables.',
    'What are the core practical applications of this theory?'
  ];

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    addChatMessage('user', textToSend);
    setInput('');
    setIsTyping(true);

    // Simulate AI response based on document
    setTimeout(() => {
      let reply = '';
      const docName = activeDoc ? activeDoc.name : 'your uploaded documents';
      
      if (textToSend.toLowerCase().includes('summary') || textToSend.toLowerCase().includes('bullet')) {
        reply = `Certainly, scholar. Here is a high-level cognitive summary extracted from **${docName}**:

* **Core Premise**: The text outlines the foundational mathematical frameworks, detailing how constraints regulate complex optimizations in high-dimensional state spaces.
* **Algorithmic Convergence**: Progress is modulated by learning coefficients, showing a recursive tendency to stabilize around local minima.
* **Practical Limitations**: High dimensionality leads to noise-propagation, which is mitigated via structural decay coefficients (L1/L2 thresholds).

*Citation Index: See Chapter 1.2, Pages 4-6 of ${docName} for comprehensive derivations.*`;
      } else if (textToSend.toLowerCase().includes('theorem') || textToSend.toLowerCase().includes('equation')) {
        reply = `Based on the cataloged archives in **${docName}**, the central optimization model relies on the following structural function:

$$L(\\mathbf{w}) = \\mathcal{E}_{D}(\\mathbf{w}) + \\eta \\cdot \\Omega(\\mathbf{w})$$

Where:
* $L(\\mathbf{w})$ represents the global regularized loss profile.
* $\\mathcal{E}_{D}(\\mathbf{w})$ captures the empirical training errors.
* $\\eta$ represents the spectral weight decay tuning coefficient.
* $\\Omega(\\mathbf{w})$ signifies the penalization metric ($|\\mathbf{w}|_1$ or $||\\mathbf{w}||_2^2$).

*Citation Reference: Section 2.4, Page 11 of ${docName}.*`;
      } else {
        reply = `I have scanned the active corpus (**${docName}**) regarding your prompt: *"${textToSend}"*.

The semantic index suggests that this falls under our mapped academic topic. The document notes that parameters are calibrated iteratively, ensuring that gradient updates proceed along the steepest path of descent while observing strict boundaries.

Would you like me to formulate a customized set of mock exam questions or a flashcard list based on this particular topic to help lock in your understanding?`;
      }

      addChatMessage('assistant', reply);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="h-[calc(100vh-10rem)] max-w-7xl mx-auto flex gap-6">
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
                  className={`w-full flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-left text-xs transition-colors ${
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-academic-card hover:border-academic-crimson/30 hover:bg-academic-crimson/5 text-xs text-academic-text-muted hover:text-academic-crimson-bright font-sans transition-all"
            title="Archive Chat Session"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Transcripts</span>
          </button>
        </div>

        {/* Chat message logger */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chatMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-4">
              <Compass className="w-10 h-10 text-academic-gold/40" />
              <h4 className="font-serif text-md text-academic-cream">Ask Your Active Codex</h4>
              <p className="text-xs text-academic-text-muted">
                Input your scholarly question regarding formulas, summaries, and complex methodologies. The engine will retrieve precise context blocks to outline answers.
              </p>
            </div>
          ) : (
            chatMessages.map((msg) => (
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
                  className={`max-w-[80%] rounded-xl p-4 text-sm font-sans ${
                    msg.role === 'user' 
                      ? 'bg-academic-gold/10 text-academic-cream border border-academic-gold/20 shadow-md' 
                      : 'bg-academic-dark text-academic-cream/90 border border-academic-card/80 shadow-md'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </div>
                  
                  <div className={`mt-2 text-[9px] font-mono text-academic-text-muted/60 flex items-center gap-1 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <Clock className="w-2.5 h-2.5" />
                    <span>{msg.timestamp}</span>
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

          <div ref={scrollRef} />
        </div>

        {/* Prompts suggest layout */}
        {chatMessages.length <= 2 && (
          <div className="px-6 py-3 bg-academic-black/30 border-t border-academic-card/30">
            <p className="text-[10px] font-mono text-academic-text-muted uppercase tracking-wider mb-2">Suggested Inquiries</p>
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p)}
                  className="text-left text-xs bg-academic-dark hover:bg-academic-card/80 border border-academic-card/80 hover:border-academic-gold/30 rounded-lg px-3 py-1.5 text-academic-text-muted hover:text-academic-cream transition-all flex items-center gap-1.5"
                >
                  <span>{p}</span>
                  <ChevronRight className="w-3 h-3 text-academic-gold/50" />
                </button>
              ))}
            </div>
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
              placeholder={activeDoc ? `Inquire about "${activeDoc.name}"...` : "Choose a codex or inquire generally..."}
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
