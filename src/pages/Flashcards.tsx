import React, { useState } from 'react';
import { useStudySphere } from '../context/StudySphereContext';
import { useNavigate } from 'react-router-dom';
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
  const { flashcards, updateFlashcardDifficulty, activeDoc } = useStudySphere();
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const activeCard = flashcards[currentIdx] || flashcards[0];
  const docName = activeDoc ? activeDoc.name : 'Machine Learning Foundations.pdf';

  const handleDifficultySelect = (difficulty: 'easy' | 'medium' | 'hard') => {
    updateFlashcardDifficulty(activeCard.id, difficulty);
    setIsFlipped(false);
    
    // Auto advance after short delay
    setTimeout(() => {
      if (currentIdx < flashcards.length - 1) {
        setCurrentIdx(prev => prev + 1);
      } else {
        // Loop back to start
        setCurrentIdx(0);
      }
    }, 200);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIdx < flashcards.length - 1) {
        setCurrentIdx(prev => prev + 1);
      }
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIdx > 0) {
        setCurrentIdx(prev => prev - 1);
      }
    }, 150);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-academic-card/40 pb-4">
        <button
          onClick={() => navigate('/study-modes')}
          className="flex items-center gap-1.5 text-xs text-academic-text-muted hover:text-academic-cream font-mono transition-colors"
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
                  {activeCard.category}
                </span>
                <HelpCircle className="w-4 h-4 text-academic-text-muted/50" />
              </div>

              {/* Central text */}
              <div className="text-center my-auto px-4">
                <p className="font-serif text-lg md:text-xl font-medium text-academic-cream leading-relaxed">
                  {activeCard.front}
                </p>
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
                  Category: {activeCard.category}
                </span>
              </div>

              {/* Central answer text with linebreaks support */}
              <div className="my-auto px-2 overflow-y-auto max-h-48 scrollbar-thin">
                <p className="font-sans text-xs md:text-sm text-academic-cream/90 leading-relaxed whitespace-pre-wrap">
                  {activeCard.back}
                </p>
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
            className="p-2.5 bg-academic-paper border border-academic-card hover:border-academic-gold/30 rounded-xl text-academic-text-muted hover:text-academic-cream disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Previous Card"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* If flipped, show difficulty grading triggers */}
          {isFlipped ? (
            <div className="flex-1 flex gap-2 animate-fade-in">
              <button
                onClick={() => handleDifficultySelect('easy')}
                className="flex-1 py-2.5 bg-academic-emerald/10 hover:bg-academic-emerald text-academic-cream hover:text-academic-black border border-academic-emerald/30 hover:border-transparent text-xs font-sans font-bold rounded-xl transition-all flex items-center justify-center gap-1"
              >
                Easy
              </button>
              <button
                onClick={() => handleDifficultySelect('medium')}
                className="flex-1 py-2.5 bg-academic-gold/15 hover:bg-academic-gold text-academic-cream hover:text-academic-black border border-academic-gold/25 hover:border-transparent text-xs font-sans font-bold rounded-xl transition-all"
              >
                Medium
              </button>
              <button
                onClick={() => handleDifficultySelect('hard')}
                className="flex-1 py-2.5 bg-academic-crimson/10 hover:bg-academic-crimson-bright text-academic-cream border border-academic-crimson/30 hover:border-transparent text-xs font-sans font-bold rounded-xl transition-all"
              >
                Hard
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsFlipped(true)}
              className="flex-1 py-2.5 bg-academic-gold/10 hover:bg-academic-gold text-academic-gold hover:text-academic-black border border-academic-gold/20 hover:border-transparent text-xs font-sans font-bold rounded-xl transition-all"
            >
              Flip Card (Reveal)
            </button>
          )}

          <button
            onClick={handleNext}
            disabled={currentIdx === flashcards.length - 1}
            className="p-2.5 bg-academic-paper border border-academic-card hover:border-academic-gold/30 rounded-xl text-academic-text-muted hover:text-academic-cream disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
