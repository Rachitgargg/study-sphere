import React, { useState } from 'react';
import { useStudySphere } from '../context/StudySphereContext';
import { useNavigate } from 'react-router-dom';
import { MathText } from '../components/MathText';
import { sendChatMessage } from '../lib/api';
import { parseFlashcards } from '../lib/parsers';
import { 
  ArrowLeft, 
  RotateCw, 
  Check, 
  HelpCircle, 
  Award, 
  ChevronRight, 
  ChevronLeft,
  Sparkles
} from 'lucide-react';

export const Flashcards: React.FC = () => {
  const { flashcards, setFlashcards, updateFlashcardDifficulty, activeDoc } = useStudySphere();
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Settings states for custom counts
  const [flashcardCount, setFlashcardCount] = useState('15');
  const [customFlashcardCount, setCustomFlashcardCount] = useState('');
  const [isCustomFlashcard, setIsCustomFlashcard] = useState(false);

  const docName = activeDoc ? activeDoc.name : 'No active document';

  const handleGenerate = async () => {
    if (!activeDoc) return;
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const finalCount = isCustomFlashcard ? Math.max(1, Math.min(50, parseInt(customFlashcardCount) || 15)) : parseInt(flashcardCount);
      let prompt = `Generate a set of study flashcards containing exactly ${finalCount} cards based on the provided document contexts. `;
      prompt += `Distribute the cards across different concepts and avoid repeated wording or repeated concepts within the same deck. `;
      prompt += `Maintain the strict formatting of 'Card 1:\nFront: [Question/Concept]\nBack: [Brief, precise explanation/answer]'.`;
      const result = await sendChatMessage(prompt, 'flashcards');
      const parsed = parseFlashcards(result.answer);
      if (parsed && parsed.length > 0) {
        setFlashcards(parsed);
        setCurrentIdx(0);
      } else {
        setGenerationError('No flashcards could be generated from the document content. Try again.');
      }
    } catch (err: any) {
      console.error('[Flashcards] generate error:', err);
      setGenerationError(err.message || 'System connection failure. Check backend server.');
    } finally {
      setIsGenerating(false);
    }
  };

  const activeCard = (flashcards && flashcards.length > 0) 
    ? (flashcards[currentIdx] || flashcards[0]) 
    : null;

  const handleDifficultySelect = (difficulty: 'easy' | 'medium' | 'hard') => {
    if (!activeCard) return;
    updateFlashcardDifficulty(activeCard.id, difficulty);
    setIsFlipped(false);
    
    // Auto advance after short delay
    setTimeout(() => {
      if (flashcards && currentIdx < flashcards.length - 1) {
        setCurrentIdx(prev => prev + 1);
      } else {
        // Loop back to start
        setCurrentIdx(0);
      }
    }, 200);
  };

  const handleNext = () => {
    if (!flashcards || flashcards.length === 0) return;
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIdx < flashcards.length - 1) {
        setCurrentIdx(prev => prev + 1);
      }
    }, 150);
  };

  const handlePrev = () => {
    if (!flashcards || flashcards.length === 0) return;
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIdx > 0) {
        setCurrentIdx(prev => prev - 1);
      }
    }, 150);
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4 font-serif">
        <div className="w-12 h-12 rounded-full border-2 border-academic-gold border-t-transparent animate-spin mx-auto" />
        <h3 className="font-serif text-lg font-bold text-academic-cream">Generating Flashcard Deck...</h3>
        <p className="text-xs text-academic-text-muted max-w-xs mx-auto leading-relaxed">
          StudySphere AI is performing deep linguistic layout analysis to parse terminology structures.
        </p>
      </div>
    );
  }

  if (!flashcards || flashcards.length === 0 || !activeCard) {
    return (
      <div className="space-y-6 max-w-xl mx-auto py-12">
        <div className="bg-academic-paper border border-academic-card p-8 rounded-2xl text-center space-y-6 gold-glow">
          <div className="w-16 h-16 rounded-full bg-academic-card border border-academic-gold/30 flex items-center justify-center mx-auto shadow-lg text-academic-gold">
            <Award className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif text-xl font-bold text-academic-cream">No flashcards could be generated.</h3>
            <p className="text-xs text-academic-text-muted font-serif max-w-sm mx-auto leading-relaxed">
              Generate a custom study deck directly from your active bibliography document.
            </p>
          </div>
          
          {generationError && (
            <p className="text-xs text-academic-crimson-bright font-mono bg-academic-crimson/10 border border-academic-crimson/20 p-2 rounded">
              {generationError}
            </p>
          )}

          {activeDoc ? (
            <div className="space-y-6">
              <div className="space-y-4 max-w-xs mx-auto font-sans text-xs">
                <div className="flex flex-col gap-2 items-start text-left">
                  <span className="text-academic-text-muted font-bold block">Number of Flashcards</span>
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
                    className="w-full bg-academic-black border border-academic-card text-academic-cream px-3 py-2.5 rounded-lg focus:outline-none focus:border-academic-gold cursor-pointer"
                  >
                    <option value="5">5 Flashcards</option>
                    <option value="10">10 Flashcards</option>
                    <option value="15">15 Flashcards</option>
                    <option value="20">20 Flashcards</option>
                    <option value="custom">Custom Number...</option>
                  </select>
                </div>

                {isCustomFlashcard && (
                  <div className="space-y-1.5 text-left animate-fade-in">
                    <span className="text-academic-text-muted font-bold block">Custom Count (1-50)</span>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={customFlashcardCount}
                      onChange={(e) => setCustomFlashcardCount(e.target.value)}
                      className="w-full bg-academic-black border border-academic-card text-academic-cream px-3 py-2.5 rounded-lg focus:outline-none focus:border-academic-gold text-center"
                      placeholder="Enter 1 to 50"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={handleGenerate}
                disabled={isCustomFlashcard && (!customFlashcardCount || parseInt(customFlashcardCount) < 1 || parseInt(customFlashcardCount) > 50)}
                className="px-6 py-2.5 bg-academic-gold hover:bg-academic-gold-muted text-academic-black font-sans font-bold text-xs tracking-wider rounded-lg shadow-md transition-all cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Generate Study Deck
              </button>
            </div>
          ) : (
            <p className="text-xs text-academic-text-muted italic">
              Please register and select an active codex document to generate flashcards.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-academic-card/40 pb-4">
        <button
          onClick={() => navigate('/study-modes')}
          className="flex items-center gap-1.5 text-xs text-academic-text-muted hover:text-academic-cream font-mono transition-colors border-0 bg-transparent cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Hub
        </button>

        <span className="text-[10px] font-mono bg-academic-card px-3 py-1 rounded text-academic-gold border border-academic-gold/15 flex items-center gap-1">
          <Award className="w-3.5 h-3.5" />
          Flashcards Active • {currentIdx + 1}/{flashcards.length} Cards Reviewing
        </span>
      </div>

      <div className="flex flex-col items-center space-y-8">
        <div className="text-center">
          <span className="text-[10px] font-mono text-academic-gold uppercase tracking-widest block">Spaced Repetitive Recall</span>
          <h2 className="font-serif text-2xl font-bold text-academic-cream mt-1">Syllabus Index Decks</h2>
          <p className="text-xs text-academic-text-muted mt-1 font-serif">
            Click the card to pivot or flip. Cites from <span className="text-academic-gold font-sans font-medium">{docName}</span>.
          </p>
        </div>

        {/* 3D Flippable Card Perspective Box */}
        <div className="w-full max-w-xl h-80 perspective-1000 select-none">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className={`relative w-full h-full transition-transform duration-500 transform-style-3d cursor-pointer ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* FRONT OF THE CARD */}
            <div className="absolute inset-0 w-full h-full backface-hidden bg-academic-paper border-2 border-academic-card rounded-2xl p-8 flex flex-col justify-between shadow-2xl gold-glow">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-academic-gold uppercase tracking-wider bg-academic-gold/5 px-2.5 py-0.5 rounded border border-academic-gold/10">
                  {activeCard.category || 'Concept'}
                </span>
                <HelpCircle className="w-4 h-4 text-academic-text-muted/50" />
              </div>

              {/* Central text */}
              <div className="text-center my-auto px-4">
                <div className="font-serif text-lg md:text-xl font-medium text-academic-cream leading-relaxed">
                  <MathText text={activeCard.front || ''} className="inline-block text-center w-full" />
                </div>
              </div>

              {/* Flipping prompt */}
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-academic-text-muted hover:text-academic-gold transition-colors">
                <RotateCw className="w-3 h-3 text-academic-gold/60" />
                <span>FLIP CARD FOR ANSWER</span>
              </div>
            </div>

            {/* BACK OF THE CARD */}
            <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-academic-card border-2 border-academic-gold/20 rounded-2xl p-8 flex flex-col justify-between shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-academic-emerald-bright uppercase tracking-wider bg-academic-emerald/10 px-2.5 py-0.5 rounded border border-academic-emerald/20">
                  ANSWER COGNITION
                </span>
                <span className="text-[10px] font-mono text-academic-text-muted">
                  Category: {activeCard.category || 'Concept'}
                </span>
              </div>

              {/* Central answer text with linebreaks support */}
              <div className="my-auto px-2 overflow-y-auto max-h-48 scrollbar-thin">
                <div className="font-sans text-xs md:text-sm text-academic-cream/90 leading-relaxed whitespace-pre-wrap">
                  <MathText text={activeCard.back || ''} className="inline-block w-full text-left" />
                </div>
              </div>

              {/* Flipping prompt back */}
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-academic-text-muted">
                <RotateCw className="w-3 h-3 text-academic-gold/50" />
                <span>CLICK TO PIVOT BACK</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation / Flip controls */}
        <div className="w-full max-w-xl flex items-center justify-between gap-4">
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="p-2.5 bg-academic-paper border border-academic-card hover:border-academic-gold/30 rounded-xl text-academic-text-muted hover:text-academic-cream disabled:opacity-30 disabled:cursor-not-allowed transition-all border-solid cursor-pointer"
            title="Previous Card"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* If flipped, show difficulty grading triggers */}
          {isFlipped ? (
            <div className="flex-1 flex gap-2 animate-fade-in">
              <button
                onClick={() => handleDifficultySelect('easy')}
                className="flex-1 py-2.5 bg-academic-emerald/10 hover:bg-academic-emerald text-academic-cream hover:text-academic-black border border-academic-emerald/30 hover:border-transparent text-xs font-sans font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                Easy
              </button>
              <button
                onClick={() => handleDifficultySelect('medium')}
                className="flex-1 py-2.5 bg-academic-gold/15 hover:bg-academic-gold text-academic-cream hover:text-academic-black border border-academic-gold/25 hover:border-transparent text-xs font-sans font-bold rounded-xl transition-all cursor-pointer"
              >
                Medium
              </button>
              <button
                onClick={() => handleDifficultySelect('hard')}
                className="flex-1 py-2.5 bg-academic-crimson/10 hover:bg-academic-crimson-bright text-academic-cream border border-academic-crimson/30 hover:border-transparent text-xs font-sans font-bold rounded-xl transition-all cursor-pointer"
              >
                Hard
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsFlipped(true)}
              className="flex-1 py-2.5 bg-academic-gold/10 hover:bg-academic-gold text-academic-gold hover:text-academic-black border border-academic-gold/20 hover:border-transparent text-xs font-sans font-bold rounded-xl transition-all border-solid cursor-pointer"
            >
              Flip Card (Reveal)
            </button>
          )}

          <button
            onClick={handleNext}
            disabled={currentIdx === (flashcards?.length || 1) - 1}
            className="p-2.5 bg-academic-paper border border-academic-card hover:border-academic-gold/30 rounded-xl text-academic-text-muted hover:text-academic-cream disabled:opacity-30 disabled:cursor-not-allowed transition-all border-solid cursor-pointer"
            title="Next Card"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Custom 3D CSS utilities injected inside a style block for absolute robustness and complete performance safety */}
        <style>{`
          .perspective-1000 {
            perspective: 1000px;
          }
          .transform-style-3d {
            transform-style: preserve-3d;
          }
          .backface-hidden {
            backface-visibility: hidden;
          }
          .rotate-y-180 {
            transform: rotateY(180deg);
          }
        `}</style>

        {/* Tip */}
        <div className="w-full max-w-xl bg-academic-paper border border-academic-card/80 p-4 rounded-xl flex items-start gap-3 text-xs text-academic-text-muted">
          <Sparkles className="w-4 h-4 text-academic-gold mt-0.5 flex-shrink-0" />
          <span>
            <strong className="text-academic-cream font-sans">Spaced Recall Method:</strong> Rate card difficulty after flipping. Rating cards as "Hard" schedules them to recur more frequently in the active cognitive buffer.
          </span>
        </div>
      </div>
    </div>
  );
};
