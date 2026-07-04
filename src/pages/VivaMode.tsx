import React, { useState } from 'react';
import { useStudySphere } from '../context/StudySphereContext';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mic, 
  MicOff, 
  Sparkles, 
  Play, 
  Award, 
  CheckCircle, 
  HelpCircle,
  Volume2,
  ListFilter
} from 'lucide-react';

export const VivaMode: React.FC = () => {
  const { vivaQuestions, submitVivaAnswer, resetViva, activeDoc } = useStudySphere();
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [waveformNodes, setWaveformNodes] = useState<number[]>([10, 20, 15, 35, 50, 45, 20, 10, 15, 40, 60, 40, 20, 15, 30, 20, 10]);
  const [recordDuration, setRecordDuration] = useState(0);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeQuestion = vivaQuestions[currentIdx] || vivaQuestions[0];
  const docName = activeDoc ? activeDoc.name : 'Machine Learning Foundations.pdf';

  // Simulate audio recording timer
  let recordInterval: NodeJS.Timeout;
  const startRecording = () => {
    setIsRecording(true);
    setRecordDuration(0);
    
    // Simulate active waveform updates
    const interval = setInterval(() => {
      setRecordDuration(prev => {
        if (prev >= 15) {
          clearInterval(interval);
          stopRecordingSimulated();
          return 15;
        }
        return prev + 1;
      });

      // Randomized waveform heights
      setWaveformNodes(prev => prev.map(() => Math.floor(Math.random() * 80) + 10));
    }, 1000);

    recordInterval = interval;
  };

  const stopRecordingSimulated = () => {
    setIsRecording(false);
    clearInterval(recordInterval);
    
    // Auto fill simulated answer
    setTypedAnswer("Gradient Descent is an optimization solver that evaluates derivatives of cost landscapes. Stochastic Gradient Descent evaluates updates over single random training samples. This introduces optimization volatility but accelerates convergence on heavy datasets.");
  };

  const handleSubmitSpeech = () => {
    if (!typedAnswer.trim()) return;

    setIsSubmitting(true);

    // Simulate evaluator analyzing speech keywords & generating feedback sheet
    setTimeout(() => {
      const feedback = {
        score: 88,
        strengths: [
          'Accurate definition of gradient derivatives and loss slopes.',
          'Strong explanation of Stochastic volatility and batch differences.'
        ],
        gaps: [
          'Omitted mentioning step scale (learning rates).',
          'Could expand on local minima escaping properties.'
        ],
        suggestedAnswer: 'Gradient descent computes derivative slopes of objective loss bowls. Standard batch descent evaluates all N coordinates, which is computationally expensive. Stochastic versions compute on random isolated vectors, introducing noise velocity that bypasses saddle constraints.'
      };

      submitVivaAnswer(activeQuestion.id, 'user_audio_node_simulated.mp3', feedback);
      setIsSubmitting(false);
    }, 2000);
  };

  const handleReset = () => {
    resetViva();
    setTypedAnswer('');
    setRecordDuration(0);
  };

  const handleNext = () => {
    setTypedAnswer('');
    setRecordDuration(0);
    if (currentIdx < vivaQuestions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setCurrentIdx(0); // loop
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-academic-card/40 pb-4">
        <button
          onClick={() => navigate('/study-modes')}
          className="flex items-center gap-1.5 text-xs text-academic-text-muted hover:text-academic-cream font-mono transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Hub
        </button>

        <span className="text-[10px] font-mono bg-academic-card px-3 py-1 rounded text-academic-gold border border-academic-gold/15 flex items-center gap-1">
          <Mic className="w-3.5 h-3.5" />
          Viva Examiner Board • Board 04 Online
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Evelyn Vance Evaluator Info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-academic-paper border border-academic-card p-5 rounded-xl text-center space-y-4 gold-glow">
            {/* Dr. Evelyn Portrait Avatar mockup */}
            <div className="w-20 h-20 rounded-full bg-academic-black mx-auto border-2 border-academic-gold/30 flex items-center justify-center relative shadow-lg overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-academic-gold/20 via-academic-crimson/10 to-academic-emerald/10 flex items-center justify-center font-serif text-academic-gold text-2xl font-bold">
                EV
              </div>
            </div>

            <div>
              <h4 className="font-serif text-md font-bold text-academic-cream">Dr. Evelyn Vance</h4>
              <p className="text-[10px] font-mono text-academic-gold tracking-widest uppercase mt-0.5">CHAIR EXAMINER</p>
              <p className="text-xs text-academic-text-muted mt-2 font-serif italic">
                "We expect rigorous definitions, accurate variable citations, and a solid understanding of optimization bounds."
              </p>
            </div>

            <div className="border-t border-academic-card/50 pt-4 space-y-2 text-left font-mono text-[10px] text-academic-text-muted">
              <span className="font-semibold text-academic-cream">EXPECTED KEVWORDS:</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeQuestion.expectedKeywords.map((kw, i) => {
                  const isDetected = activeQuestion.feedback && Math.random() > 0.3;
                  return (
                    <span 
                      key={i} 
                      className={`px-2 py-0.5 rounded border ${
                        isDetected 
                          ? 'bg-academic-emerald/10 border-academic-emerald-bright/30 text-academic-emerald-bright' 
                          : 'bg-academic-black border-academic-card text-academic-text-muted/80'
                      }`}
                    >
                      {kw}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Microscopic Audio Console & Grading */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-academic-paper border border-academic-card rounded-xl p-6 md:p-8 space-y-6 gold-glow">
            {/* Evaluator Speech Bubble */}
            <div className="bg-academic-dark border border-academic-card p-5 rounded-xl space-y-3 font-serif relative">
              <div className="absolute top-[-8px] left-[30px] w-4 h-4 bg-academic-dark border-t border-l border-academic-card rotate-45" />
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-academic-gold">
                <Volume2 className="w-4 h-4 text-academic-gold" />
                <span>EXAMINER SPEECH DISPATCH</span>
              </div>
              <p className="text-sm text-academic-cream leading-relaxed">
                "{activeQuestion.question}"
              </p>
            </div>

            {/* If not evaluated, show microphone console */}
            {!activeQuestion.feedback ? (
              <div className="space-y-6">
                <div className="bg-academic-black border border-academic-card p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-4 min-h-[160px] relative overflow-hidden">
                  {/* Glowing amplitude lines */}
                  {isRecording ? (
                    <div className="flex items-center justify-center gap-1.5 h-16 w-full px-12">
                      {waveformNodes.map((h, i) => (
                        <div 
                          key={i} 
                          className="w-1.5 bg-academic-gold rounded-full transition-all duration-150"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center space-y-1 py-4">
                      <p className="text-xs text-academic-text-muted">Awaiting oral input transcript...</p>
                      {recordDuration > 0 && <p className="text-[10px] font-mono text-academic-gold">Transcript buffered successfully ({recordDuration}s)</p>}
                    </div>
                  )}

                  {/* Trigger buttons */}
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="px-6 py-3 bg-academic-crimson hover:bg-academic-crimson-bright text-academic-cream font-sans font-bold text-xs tracking-wider rounded-lg flex items-center gap-2.5 shadow-lg shadow-academic-crimson/15 transition-all cursor-pointer"
                    >
                      <Mic className="w-4 h-4" />
                      Initialize Oral Recording
                    </button>
                  ) : (
                    <button
                      onClick={stopRecordingSimulated}
                      className="px-6 py-3 bg-academic-gold hover:bg-academic-gold-muted text-academic-black font-sans font-bold text-xs tracking-wider rounded-lg flex items-center gap-2.5 shadow-lg shadow-academic-gold/15 transition-all animate-pulse cursor-pointer"
                    >
                      <MicOff className="w-4 h-4" />
                      Deactivate & Transcribe ({recordDuration}s)
                    </button>
                  )}
                </div>

                {/* If draft transcript buffered, allow reviewing and submitting */}
                {typedAnswer && (
                  <div className="space-y-3 animate-fade-in">
                    <span className="text-[10px] font-mono text-academic-text-muted uppercase tracking-wider block">Transcribed Text Preview</span>
                    <textarea
                      value={typedAnswer}
                      onChange={(e) => setTypedAnswer(e.target.value)}
                      className="w-full bg-academic-black border border-academic-card rounded-lg p-4 text-xs text-academic-cream leading-relaxed focus:outline-none focus:border-academic-gold/40 h-24"
                    />

                    <div className="flex justify-end">
                      <button
                        onClick={handleSubmitSpeech}
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-academic-gold hover:bg-academic-gold-muted text-academic-black font-sans font-bold text-xs tracking-wider rounded-lg transition-all cursor-pointer"
                      >
                        {isSubmitting ? 'Evaluating Dialectics...' : 'Submit Oral Transcript'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* EVALUATION FEEDBACK BOARD SHEET */
              <div className="space-y-6 animate-fade-in">
                {/* Score badge */}
                <div className="flex items-center justify-between bg-academic-dark border border-academic-card p-4 rounded-xl">
                  <div>
                    <span className="text-[9px] font-mono text-academic-text-muted uppercase">DIALECTIC GRADE</span>
                    <h4 className="font-serif text-lg font-bold text-academic-cream">Assessment Report</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-serif font-bold text-academic-gold">{activeQuestion.feedback.score}</span>
                    <span className="text-xs text-academic-text-muted font-mono">/100</span>
                  </div>
                </div>

                {/* Strengths and Gaps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-academic-emerald/5 border border-academic-emerald/20 rounded-xl space-y-2">
                    <span className="text-[10px] font-mono text-academic-emerald-bright uppercase tracking-wider block">Theoretical Strengths</span>
                    <ul className="text-xs text-academic-cream/80 space-y-2 leading-relaxed">
                      {activeQuestion.feedback.strengths.map((str, i) => (
                        <li key={i} className="flex gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-academic-emerald-bright mt-0.5 flex-shrink-0" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-academic-crimson/5 border border-academic-crimson/20 rounded-xl space-y-2">
                    <span className="text-[10px] font-mono text-academic-crimson-bright uppercase tracking-wider block">Conceptual Gaps</span>
                    <ul className="text-xs text-academic-cream/80 space-y-2 leading-relaxed">
                      {activeQuestion.feedback.gaps.map((gap, i) => (
                        <li key={i} className="flex gap-2">
                          <HelpCircle className="w-3.5 h-3.5 text-academic-crimson-bright mt-0.5 flex-shrink-0" />
                          <span>{gap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Suggested answer */}
                <div className="bg-academic-dark border border-academic-card p-5 rounded-xl space-y-2 font-serif">
                  <span className="text-[10px] font-mono text-academic-gold uppercase tracking-wider block">SUGGESTED SCHOLARLY PHRASING</span>
                  <p className="text-xs text-academic-cream/80 leading-relaxed italic">
                    "{activeQuestion.feedback.suggestedAnswer}"
                  </p>
                </div>

                {/* Footer Controls */}
                <div className="border-t border-academic-card/40 pt-4 flex justify-between">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-academic-card hover:bg-academic-card/80 text-academic-cream border border-academic-card rounded-lg text-xs font-sans font-bold transition-all cursor-pointer"
                  >
                    Reset Evaluator
                  </button>

                  <button
                    onClick={handleNext}
                    className="px-5 py-2 bg-academic-gold hover:bg-academic-gold-muted text-academic-black rounded-lg text-xs font-sans font-bold transition-all cursor-pointer"
                  >
                    Next Question
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
