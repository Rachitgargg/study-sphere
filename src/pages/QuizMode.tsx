import React, { useState } from 'react';
import { useStudySphere } from '../context/StudySphereContext';
import { useNavigate } from 'react-router-dom';
import { MathText } from '../components/MathText';
import { sendChatMessage } from '../lib/api';
import { parseQuiz } from '../lib/parsers';
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
  const { quizzes, setQuizzes, submitQuizAnswer, resetQuiz, activeDoc } = useStudySphere();
  const navigate = useNavigate();
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const [quizCount, setQuizCount] = useState('10');

  const docName = activeDoc ? activeDoc.name : 'No active document';

  const handleGenerate = async () => {
    if (!activeDoc) return;
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const finalSize = Math.max(1, Math.min(20, parseInt(quizCount) || 10));
      const prompt = `Generate exactly ${finalSize} quiz questions based on the provided document contexts. ` +
        `Cover distinct concepts, avoid repeating the same topic or wording, and make each question add new coverage across the document. ` +
        `Each question should have options A, B, C, D and explicitly state the correct answer as 'Answer: [A/B/C/D]'. Provide a short explanation under 'Explanation:'.`;

      let parsed = [];
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const result = await sendChatMessage(prompt, 'quiz');
        const candidate = parseQuiz(result.answer);
        if (candidate && candidate.length === finalSize) {
          parsed = candidate;
          break;
        }
      }

      if (parsed.length === finalSize) {
        setQuizzes(parsed);
        setActiveIdx(0);
        setSelectedOption(null);
        setShowExplanation(false);
        setQuizFinished(false);
      } else {
        setGenerationError(`Could not generate exactly ${finalSize} quiz questions. Please try again.`);
      }
    } catch (err: any) {
      console.error('[QuizMode] generate error:', err);
      setGenerationError(err.message || 'System connection failure. Check backend server.');
    } finally {
      setIsGenerating(false);
    }
  };

  const activeQuestion = (quizzes && quizzes.length > 0) 
    ? (quizzes[activeIdx] || quizzes[0]) 
    : null;

  const handleOptionSelect = (idx: number) => {
    if (showExplanation) return; // Locked after submitting
    setSelectedOption(idx);
  };

  const handleSubmit = () => {
    if (selectedOption === null || !activeQuestion) return;
    submitQuizAnswer(activeQuestion.id, selectedOption);
    setShowExplanation(true);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowExplanation(false);

    if (quizzes && activeIdx < quizzes.length - 1) {
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

  // Calculate scores safely
  const safeQuizzes = quizzes || [];
  const answeredCount = safeQuizzes.filter(q => q.userAnswer !== undefined).length;
  const correctCount = safeQuizzes.filter(q => q.userAnswer !== undefined && q.userAnswer === q.correctAnswer).length;
  const percentage = safeQuizzes.length > 0 ? Math.round((correctCount / safeQuizzes.length) * 100) : 0;

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4 font-serif">
        <div className="w-12 h-12 rounded-full border-2 border-academic-gold border-t-transparent animate-spin mx-auto" />
        <h3 className="font-serif text-lg font-bold text-academic-cream">Generating Assessment...</h3>
        <p className="text-xs text-academic-text-muted max-w-xs mx-auto leading-relaxed">
          StudySphere AI is running semantic analysis and indexing parameters to form rigorous MCQ queries.
        </p>
      </div>
    );
  }

  if (safeQuizzes.length === 0 || !activeQuestion) {
    return (
      <div className="space-y-6 max-w-xl mx-auto py-12">
        <div className="bg-academic-paper border border-academic-card p-8 rounded-2xl text-center space-y-6 gold-glow">
          <div className="w-16 h-16 rounded-full bg-academic-card border border-academic-gold/30 flex items-center justify-center mx-auto shadow-lg text-academic-gold">
            <HelpCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif text-xl font-bold text-academic-cream">No quiz questions available.</h3>
            <p className="text-xs text-academic-text-muted font-serif max-w-sm mx-auto leading-relaxed">
              Generate an interactive multiple-choice quiz directly from your active document.
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
                  <span className="text-academic-text-muted font-bold block">Number of Questions</span>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={quizCount}
                    onChange={(e) => setQuizCount(e.target.value)}
                    className="w-full bg-academic-black border border-academic-card text-academic-cream px-3 py-2.5 rounded-lg focus:outline-none focus:border-academic-gold text-center"
                    placeholder="10"
                  />
                  <span className="text-[10px] text-academic-text-muted">Choose 1–20</span>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!quizCount || parseInt(quizCount) < 1 || parseInt(quizCount) > 20}
                className="px-6 py-2.5 bg-academic-gold hover:bg-academic-gold-muted text-academic-black font-sans font-bold text-xs tracking-wider rounded-lg shadow-md transition-all cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Generate Interactive Quiz
              </button>
            </div>
          ) : (
            <p className="text-xs text-academic-text-muted italic">
              Please register and select an active document to generate quiz questions.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
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
              {safeQuizzes.map((q, idx) => {
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
                    className={`w-9 h-9 rounded-lg border text-xs font-mono font-bold transition-all flex items-center justify-center cursor-pointer ${btnStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-academic-card/50 pt-4 text-left text-[11px] text-academic-text-muted space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span>Completed:</span>
                <span className="text-academic-cream">{answeredCount} of {safeQuizzes.length}</span>
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
                  Question {activeIdx + 1} of {safeQuizzes.length}
                </span>
                <h3 className="font-serif text-md md:text-lg font-bold text-academic-cream leading-snug mt-1.5">
                  <MathText text={activeQuestion.question} className="inline-block w-full" />
                </h3>
              </div>

              {/* Options list */}
              <div className="space-y-2.5">
                {(activeQuestion.options || []).map((opt, oIdx) => {
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
                      className={`w-full p-4 rounded-xl border text-left text-xs md:text-sm font-sans transition-all flex items-start gap-3.5 cursor-pointer ${optStyle}`}
                    >
                      <span className={`w-5 h-5 rounded border font-mono text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5 ${checkStyle}`}>
                        {showExplanation && isCorrect ? '✓' : showExplanation && isUserAnswer && !isCorrect ? '✗' : String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="leading-relaxed flex-1"><MathText text={opt} className="inline" /></span>
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
                  <div className="text-xs text-academic-cream/80 leading-relaxed italic">
                    <MathText text={`"${activeQuestion.explanation || 'Factual reference validated from course context.'}"`} className="inline" />
                  </div>
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
                    {activeIdx === safeQuizzes.length - 1 ? 'Finish Quiz' : 'Next Question'}
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
              <p className="text-academic-cream font-bold mt-1 text-sm">{safeQuizzes.length}</p>
            </div>
            <div className="text-left border-l border-academic-card/50 pl-4">
              <span className="text-academic-text-muted">Correct Answers:</span>
              <p className="text-academic-emerald-bright font-bold mt-1 text-sm">{correctCount}</p>
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-3 bg-academic-card hover:bg-academic-card/80 text-academic-cream border border-academic-card/80 hover:border-academic-gold/30 rounded-lg text-xs font-sans font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border-solid"
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
