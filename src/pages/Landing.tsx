import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  ArrowRight, 
  BookOpen, 
  Sparkles, 
  Network, 
  Mic, 
  Award,
  ShieldCheck
} from 'lucide-react';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  const coreFeatures = [
    {
      title: 'Scholarly Chat Client',
      desc: 'Query your materials with automatic page citations. Explore theorems with context-aware references.',
      icon: BookOpen,
    },
    {
      title: 'Synthesized Study Hubs',
      desc: 'Instantly compile materials into custom summaries, interactive flashcards, or grading quizzes.',
      icon: Award,
    },
    {
      title: 'Neural Knowledge Graphs',
      desc: 'Visualize dynamic maps linking your separate PDFs, chapters, and academic concepts together.',
      icon: Network,
    },
    {
      title: 'Oral Viva Examiner',
      desc: 'Simulate high-stakes university oral boards with an interactive, spoken-feedback examiner engine.',
      icon: Mic,
    }
  ];

  return (
    <div className="bg-academic-black text-white min-h-screen flex flex-col justify-between relative overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Decorative background glow elements for Frosted Glass theme */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[130px] rounded-full -mr-48 -mt-48 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[130px] rounded-full -ml-48 -mb-48 pointer-events-none z-0" />

      {/* Header bar */}
      <header className="max-w-7xl mx-auto w-full px-6 md:px-12 py-6 flex items-center justify-between border-b border-white/5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-sans text-md font-bold tracking-tight text-white">StudySphere</span>
            <span className="text-[9px] font-mono text-slate-400 tracking-widest uppercase">The Sovereign Academy</span>
          </div>
        </div>

        <button 
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 text-xs font-mono tracking-wider text-indigo-400 hover:text-white hover:bg-indigo-500/10 rounded-xl border border-indigo-500/20 hover:border-indigo-500/50 transition-all"
        >
          Enter Academy
        </button>
      </header>

      {/* Main hero section */}
      <main className="max-w-7xl mx-auto w-full px-6 md:px-12 py-12 md:py-24 flex-1 flex flex-col lg:flex-row items-center gap-16 relative z-10">
        {/* Left column text */}
        <div className="flex-1 space-y-8 text-left max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400 font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Introducing Nocturnal Academic Suite</span>
          </div>

          <h1 className="font-sans text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
            Turn Raw Documents <br />
            into <span className="text-indigo-400 italic">Active Tutors</span>.
          </h1>

          <p className="text-slate-400 text-base md:text-lg leading-relaxed">
            StudySphere AI is an elegant, dark-academic workspace designed to synthesize complex textbook PDFs, research papers, and lecture slides into personalized study masterclasses. 
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold text-sm tracking-wider rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
            >
              Initialize Study Session
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/upload')}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-sans font-semibold text-sm tracking-wide rounded-xl border border-white/10 transition-all cursor-pointer"
            >
              Catalog Materials
            </button>
          </div>

          <div className="flex items-center gap-6 pt-4 text-xs font-mono text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Zero client data sharing</span>
            </div>
            <div className="w-1 h-1 bg-white/10 rounded-full" />
            <div>
              <span>Fully Local Simulation</span>
            </div>
          </div>
        </div>

        {/* Right column: Beautiful Feature Showcase Grid */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {coreFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx}
                className="bg-white/5 hover:bg-white/10 border border-white/10 p-6 rounded-2xl transition-all group backdrop-blur-md"
              >
                <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center border border-white/5 mb-4 group-hover:border-indigo-500/30 transition-all">
                  <Icon className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="font-sans text-md font-bold text-white group-hover:text-indigo-400 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 md:px-12 py-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-xs font-mono text-slate-500 relative z-10">
        <div>
          © 2026 StudySphere. Preserving academic rigor in the digital age.
        </div>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#privacy" className="hover:text-indigo-400 transition-colors">Scholarly Codex Policy</a>
          <a href="#terms" className="hover:text-indigo-400 transition-colors">Academy Charters</a>
        </div>
      </footer>
    </div>
  );
};
