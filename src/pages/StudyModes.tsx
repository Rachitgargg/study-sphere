import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudySphere } from '../context/StudySphereContext';
import { 
  Award, 
  BookOpen, 
  Mic, 
  HelpCircle, 
  Sparkles, 
  ArrowRight,
  BookMarked,
  FileText
} from 'lucide-react';

export const StudyModes: React.FC = () => {
  const navigate = useNavigate();
  const { activeDoc, flashcards, quizzes } = useStudySphere();

  const modes = [
    {
      id: 'learn',
      title: 'Learn Mode',
      tagline: 'Structured Syllabus',
      desc: 'Transforms your materials into structured learning chapters. Introduces vocabulary, guides reading, and reviews key takeaways incrementally.',
      icon: BookOpen,
      path: '/learn',
      color: 'border-academic-gold bg-academic-gold/5 text-academic-gold',
      badge: 'Highly Recommended'
    },
    {
      id: 'summary',
      title: 'Summary Mode',
      tagline: 'Linguistic Digest',
      desc: 'Generates detailed, multi-level academic briefs. Switch between bullet lists, detailed reviews, or formal theorems and equations summaries.',
      icon: BookMarked,
      path: '/summary',
      color: 'border-emerald-500/20 bg-emerald-950/10 text-academic-emerald-bright',
      badge: 'Reference Ready'
    },
    {
      id: 'quiz',
      title: 'Quiz Mode',
      tagline: 'Knowledge Verification',
      desc: 'Generates interactive multiple-choice tests. Calculates scores, marks grading patterns, and produces deep mathematical explanations.',
      icon: HelpCircle,
      path: '/quiz',
      color: 'border-cyan-500/20 bg-cyan-950/10 text-cyan-400',
      badge: `${quizzes.length} Exercises`
    },
    {
      id: 'flashcards',
      title: 'Flashcard Mode',
      tagline: 'Spaced Retrieval',
      desc: 'Deploys an active recall study deck with beautiful double-sided flipping cards. Review concepts and rank difficulty to schedule reviews.',
      icon: Award,
      path: '/flashcards',
      color: 'border-purple-500/20 bg-purple-950/10 text-purple-400',
      badge: `${flashcards.length} Cards Available`
    },
    {
      id: 'viva',
      title: 'Viva Mode',
      tagline: 'Oral Examination Board',
      desc: 'Simulates intense academic oral exams. An examiner presents open-ended research questions, prompts for spoken/text answers, and scores keywords.',
      icon: Mic,
      path: '/viva',
      color: 'border-academic-crimson/30 bg-academic-crimson/5 text-academic-crimson-bright',
      badge: 'Simulated Voice board'
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-academic-cream">
            Study Mode Hub
          </h2>
          <p className="text-sm text-academic-text-muted mt-1 font-serif">
            Deploy cognitive routines against your active bibliographies to reinforce concepts.
          </p>
        </div>

        {activeDoc && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-academic-black/50 border border-academic-card text-xs">
            <FileText className="w-4 h-4 text-academic-gold" />
            <span className="text-academic-text-muted">Target:</span>
            <span className="font-bold text-academic-cream truncate max-w-[150px]">{activeDoc.name}</span>
          </div>
        )}
      </div>

      {/* Grid of modes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <div 
              key={mode.id}
              className="bg-academic-paper border border-academic-card p-6 rounded-2xl flex flex-col justify-between hover:border-academic-gold/25 transition-all group gold-glow"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl border ${mode.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 text-[9px] font-mono rounded bg-academic-black border border-academic-card/50 text-academic-text-muted uppercase tracking-wider">
                    {mode.badge}
                  </span>
                </div>

                <div className="mt-5 space-y-1">
                  <span className="text-[10px] font-mono tracking-widest text-academic-gold uppercase">{mode.tagline}</span>
                  <h3 className="font-serif text-xl font-bold text-academic-cream group-hover:text-academic-gold transition-colors">
                    {mode.title}
                  </h3>
                  <p className="text-xs text-academic-text-muted leading-relaxed pt-2">
                    {mode.desc}
                  </p>
                </div>
              </div>

              <div className="border-t border-academic-card/40 pt-4 mt-6 flex items-center justify-between">
                <span className="text-[10px] font-mono text-academic-text-muted">
                  Requires 1 active codex
                </span>
                
                <button
                  onClick={() => navigate(mode.path)}
                  className="px-4 py-2 bg-academic-card hover:bg-academic-gold hover:text-academic-black text-academic-cream rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 border border-academic-card/80 hover:border-transparent transition-all cursor-pointer"
                >
                  Deploy Mode
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Tips */}
      <div className="p-5 rounded-xl bg-academic-dark border border-academic-card/60 flex items-center gap-4">
        <div className="w-8 h-8 rounded bg-academic-gold/5 flex items-center justify-center border border-academic-gold/20 flex-shrink-0">
          <Sparkles className="w-4 h-4 text-academic-gold" />
        </div>
        <p className="text-xs text-academic-text-muted leading-relaxed font-serif">
          <strong className="text-academic-cream">Tip for Scholars</strong>: Start with **Learn Mode** to digest materials linearly, reinforce with **Flashcards** for retrieval testing, and finally test your limits using the spoken **Viva Mode**.
        </p>
      </div>
    </div>
  );
};
