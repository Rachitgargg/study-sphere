import React, { useState } from 'react';
import { useStudySphere } from '../context/StudySphereContext';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Compass, 
  RotateCcw, 
  Award,
  Sparkles
} from 'lucide-react';

export const QuizMode: React.FC = () => {
  const { quizzes, submitQuizAnswer, resetQuiz, activeDoc } = useStudySphere();
  const navigate = useNavigate();
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const activeQuestion = quizzes[activeIdx] || quizzes[0];
  const docName = activeDoc ? activeDoc.name : 'Machine Learning Foundations.pdf';

  const handleOptionSelect = (idx: number) => {
    if (showExplanation) return; // Locked after submitting
    setSelectedOption(idx);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    submitQuizAnswer(activeQuestion.id, selectedOption);
    setShowExplanation(true);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowExplanation(false);

    if (activeIdx < quizzes.length - 1) {
      setActiveIdx(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleReset = () => {
    resetQuiz();
    setActiveIdx(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setQuizFinished(false);
  };

  // Calculate scores
  const answeredCount = quizzes.filter(q => q.userAnswer !== undefined).length;
  const correctCount = quizzes.filter(q => q.userAnswer !== undefined && q.userAnswer === q.correctAnswer).length;
  const percentage = Math.round((correctCount / quizzes.length) * 100) || 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
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
          <HelpCircle className="w-3.5 h-3.5" />
          Quiz Mode • Evaluation Active
        </span>
      </div>

      {!quizFinished ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left panel: Question Navigation */}
          <div className="md:col-span-1 bg-academic-paper border border-academic-card rounded-xl p-4 h-fit space-y-4 text-center">
            <h3 className="font-serif text-xs font-bold uppercase tracking-widest text-academic-text-muted">
              Quiz Navigation
            </h3>
            
            <div className="flex justify-center flex-wrap gap-2 py-2">
              {quizzes.map((q, idx) => {
                const isSelected = activeIdx === idx;
                const isAnswered = q.userAnswer !== undefined;
                const isCorrect = isAnswered && q.userAnswer === q.correctAnswer;
                
                let btnStyle = 'bg-academic-dark border-academic-card text-academic-text-muted hover:border-academic-gold/30';
                if (isSelected) {
                  btnStyle = 'bg-academic-gold/15 border-academic-gold text-academic-gold';
                } else if (isAnswered) {
                  btnStyle = isCorrect
                    ? 'bg-academic-emerald/10 border-academic-emerald-bright/40 text-academic-emerald-bright'
                    : 'bg-academic-crimson/10 border-academic-crimson-bright/40 text-academic-crimson-bright';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setActiveIdx(idx);
                      setSelectedOption(q.userAnswer ?? null);
                      setShowExplanation(q.userAnswer !== undefined);
                    }}
                    className={`w-9 h-9 rounded-lg border text-xs font-mono font-bold transition-all flex items-center justify-center ${btnStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-academic-card/50 pt-4 text-left text-[11px] text-academic-text-muted space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span>Completed:</span>
                <span className="text-academic-cream">{answeredCount} of {quizzes.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Material:</span>
                <span className="text-academic-gold truncate max-w-[100px] inline-block text-right" title={docName}>{docName}</span>
              </div>
            </div>
          </div>

          {/* Right panel: Active Question Card */}
          <div className="md:col-span-3 space-y-6">
            <div className="bg-academic-paper border border-academic-card p-6 md:p-8 rounded-xl gold-glow space-y-6">
              {/* Question heading */}
              <div className="border-b border-academic-card/50 pb-4">
                <span className="text-[10px] font-mono text-academic-gold uppercase tracking-widest block">
                  Question {activeIdx + 1} of {quizzes.length}
                </span>
                <h3 className="font-serif text-md md:text-lg font-bold text-academic-cream leading-snug mt-1.5">
                  {activeQuestion.question}
                </h3>
              </div>

              {/* Options list */}
              <div className="space-y-2.5">
                {activeQuestion.options.map((opt, oIdx) => {
                  const isSelected = selectedOption === oIdx;
                  const isUserAnswer = activeQuestion.userAnswer === oIdx;
                  const isCorrect = activeQuestion.correctAnswer === oIdx;
                  
                  let optStyle = 'border-academic-card hover:border-academic-gold/20 hover:bg-academic-card/20';
                  let checkStyle = 'border-academic-card';

                  if (showExplanation) {
                    if (isCorrect) {
                      optStyle = 'border-academic-emerald-bright bg-academic-emerald/10 text-academic-cream';
                      checkStyle = 'bg-academic-emerald-bright border-academic-emerald-bright text-academic-cream';
                    } else if (isUserAnswer && !isCorrect) {
                      optStyle = 'border-academic-crimson-bright bg-academic-crimson/10 text-academic-cream';
                      checkStyle = 'bg-academic-crimson-bright border-academic-crimson-bright text-academic-cream';
                    } else {
                      optStyle = 'border-academic-card opacity-50';
                    }
                  } else if (isSelected) {
                    optStyle = 'border-academic-gold bg-academic-gold/5';
                    checkStyle = 'border-academic-gold bg-academic-gold text-academic-black';
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleOptionSelect(oIdx)}
                      disabled={showExplanation}
                      className={`w-full p-4 rounded-xl border text-left text-xs md:text-sm font-sans transition-all flex items-start gap-3.5 ${optStyle}`}
                    >
                      <span className={`w-5 h-5 rounded border font-mono text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5 ${checkStyle}`}>
                        {showExplanation && isCorrect ? '✓' : showExplanation && isUserAnswer && !isCorrect ? '✗' : String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="leading-relaxed">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation section if answered */}
              {showExplanation && (
                <div className="bg-academic-dark border border-academic-card/80 p-5 rounded-xl space-y-2.5 animate-fade-in font-serif">
                  <span className="text-[10px] font-mono text-academic-gold uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Theoretical Explanation
                  </span>
                  <p className="text-xs text-academic-cream/80 leading-relaxed italic">
                    "{activeQuestion.explanation}"
                  </p>
                  <p className="text-[10px] font-mono text-academic-text-muted/80">
                    *Source context cited from active syllabus.*
                  </p>
                </div>
              )}

              {/* Submitting Actions footer */}
              <div className="border-t border-academic-card/40 pt-5 flex justify-between items-center">
                <span className="text-[10px] font-mono text-academic-text-muted">
                  Double check selections before submitting
                </span>

                {!showExplanation ? (
                  <button
                    onClick={handleSubmit}
                    disabled={selectedOption === null}
                    className="px-6 py-2.5 bg-academic-gold hover:bg-academic-gold-muted text-academic-black font-sans font-bold text-xs tracking-wider rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2.5 bg-academic-card hover:bg-academic-gold hover:text-academic-black text-academic-cream hover:border-transparent border border-academic-card font-sans font-bold text-xs tracking-wider rounded-lg transition-all cursor-pointer"
                  >
                    {activeIdx === quizzes.length - 1 ? 'Finish Quiz' : 'Next Question'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Quiz Completed Page Summary view */
        <div className="bg-academic-paper border border-academic-card rounded-2xl p-8 max-w-xl mx-auto text-center space-y-6 gold-glow animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-academic-card border border-academic-gold/30 flex items-center justify-center mx-auto shadow-lg text-academic-gold">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-widest text-academic-gold uppercase">Evaluation Terminated</span>
            <h3 className="font-serif text-2xl font-bold text-academic-cream">Academic Assessment Complete</h3>
            <p className="text-xs text-academic-text-muted font-serif">
              A comprehensive digest has been logged to your weekly scholar stats.
            </p>
          </div>

          {/* Beautiful Dial Dial Circle */}
          <div className="relative w-36 h-36 mx-auto flex items-center justify-center border-4 border-academic-card rounded-full shadow-inner bg-academic-black/50">
            <div className="text-center">
              <span className="text-3xl font-serif font-bold text-academic-cream block">{percentage}%</span>
              <span className="text-[9px] font-mono text-academic-text-muted tracking-wider uppercase mt-1 block">ACCURACY</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-academic-dark p-4 rounded-xl text-xs font-mono border border-academic-card/50">
            <div className="text-left">
              <span className="text-academic-text-muted">Total Questions:</span>
              <p className="text-academic-cream font-bold mt-1 text-sm">{quizzes.length}</p>
            </div>
            <div className="text-left border-l border-academic-card/50 pl-4">
              <span className="text-academic-text-muted">Correct Answers:</span>
              <p className="text-academic-emerald-bright font-bold mt-1 text-sm">{correctCount}</p>
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-3 bg-academic-card hover:bg-academic-card/80 text-academic-cream border border-academic-card/80 hover:border-academic-gold/30 rounded-lg text-xs font-sans font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset & Retake
            </button>
            <button
              onClick={() => navigate('/study-modes')}
              className="flex-1 px-4 py-3 bg-academic-gold hover:bg-academic-gold-muted text-academic-black rounded-lg text-xs font-sans font-bold transition-all cursor-pointer"
            >
              Back to Hub
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
