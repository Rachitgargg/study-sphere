import React, { useState } from 'react';
import { useStudySphere } from '../context/StudySphereContext';
import { useNavigate } from 'react-router-dom';
import { 
  Settings as SettingsIcon, 
  User, 
  BookOpen, 
  HelpCircle, 
  Sliders, 
  RotateCcw, 
  CheckCircle,
  Database,
  Cpu
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { 
    username, 
    setUsername, 
    academicLevel, 
    setAcademicLevel,
    clearChat,
    resetQuiz,
    resetViva
  } = useStudySphere();

  const navigate = useNavigate();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [citationStyle, setCitationStyle] = useState('IEEE');
  const [studyTarget, setStudyTarget] = useState(4); // daily hours

  const saveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('Configurations applied to scholar portal successfully!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const fullSystemReset = () => {
    if (confirm("Are you sure you want to reset all progress, archived chat client transcripts, and custom documents?")) {
      clearChat();
      resetQuiz();
      resetViva();
      setUsername('Alex');
      setAcademicLevel('Graduate (Computer Science)');
      setSuccessMsg('Archives and databases restored to default templates.');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="font-serif text-3xl font-bold tracking-tight text-academic-cream">
          System Settings
        </h2>
        <p className="text-sm text-academic-text-muted mt-1 font-serif">
          Calibrate user identities, daily study hours, and academic extraction engines.
        </p>
      </div>

      <form onSubmit={saveSettings} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Profile & Target Fields */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-academic-paper border border-academic-card p-6 rounded-xl space-y-5 gold-glow">
            <h3 className="font-serif text-md font-bold text-academic-cream flex items-center gap-2 pb-3 border-b border-academic-card/50">
              <User className="w-4.5 h-4.5 text-academic-gold" />
              Scholar Profile
            </h3>

            {successMsg && (
              <div className="bg-academic-emerald/10 border border-academic-emerald/30 text-academic-cream px-4 py-2.5 rounded text-xs animate-fade-in flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-academic-emerald-bright" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-1.5 text-left">
                <label className="text-academic-text-muted">SCHOLAR USERNAME</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-academic-black border border-academic-card rounded-lg px-4 py-2.5 text-academic-cream focus:outline-none focus:border-academic-gold/40"
                  required
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-academic-text-muted">DISCIPLINE LEVEL</label>
                <input
                  type="text"
                  value={academicLevel}
                  onChange={(e) => setAcademicLevel(e.target.value)}
                  className="w-full bg-academic-black border border-academic-card rounded-lg px-4 py-2.5 text-academic-cream focus:outline-none focus:border-academic-gold/40"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono text-left pt-2">
              <label className="text-academic-text-muted uppercase">Daily Study Goal: {studyTarget} Hours</label>
              <input
                type="range"
                min="1"
                max="10"
                value={studyTarget}
                onChange={(e) => setStudyTarget(Number(e.target.value))}
                className="w-full h-1.5 bg-academic-black rounded-lg appearance-none cursor-pointer accent-academic-gold border border-academic-card"
              />
              <div className="flex justify-between text-[10px] text-academic-text-muted/60 mt-1">
                <span>1 HOUR (LIGHT REVIEW)</span>
                <span>10 HOURS (PhD DISSERTATION DEFENSE)</span>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-academic-gold hover:bg-academic-gold-muted text-academic-black font-sans font-bold text-xs tracking-wider rounded-lg transition-all cursor-pointer"
              >
                Apply Profile changes
              </button>
            </div>
          </div>

          {/* Engine configurations block */}
          <div className="bg-academic-paper border border-academic-card p-6 rounded-xl space-y-5 gold-glow">
            <h3 className="font-serif text-md font-bold text-academic-cream flex items-center gap-2 pb-3 border-b border-academic-card/50">
              <Cpu className="w-4.5 h-4.5 text-academic-gold" />
              Cognitive Extraction Specs
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-1.5 text-left">
                <label className="text-academic-text-muted">COGNITIVE MODEL MODEL</label>
                <select className="w-full bg-academic-black border border-academic-card rounded-lg px-3 py-2.5 text-academic-cream focus:outline-none focus:border-academic-gold/40 cursor-pointer">
                  <option>Gemini 2.5 Flash (Syllabus Default)</option>
                  <option>Gemini 2.5 Pro (Heavy Theoretical Formulas)</option>
                  <option>Claude 3.5 Sonnet (Draft Summarizer)</option>
                </select>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-academic-text-muted">CITATION INDEX STANDARD</label>
                <select 
                  value={citationStyle}
                  onChange={(e) => setCitationStyle(e.target.value)}
                  className="w-full bg-academic-black border border-academic-card rounded-lg px-3 py-2.5 text-academic-cream focus:outline-none focus:border-academic-gold/40 cursor-pointer"
                >
                  <option value="IEEE">IEEE Reference style</option>
                  <option value="APA">APA Academic Referencing</option>
                  <option value="Harvard">Harvard Bibliographical style</option>
                  <option value="Chicago">Chicago Manual notes</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Reset & Administrative Database */}
        <div className="space-y-4">
          <div className="bg-academic-paper border border-academic-card p-5 rounded-xl space-y-4 gold-glow">
            <div className="flex items-center gap-2 text-academic-cream">
              <Database className="w-4.5 h-4.5 text-academic-crimson-bright" />
              <h4 className="font-serif text-xs font-bold uppercase tracking-widest">
                System Administration
              </h4>
            </div>
            
            <p className="text-xs text-academic-text-muted leading-relaxed font-serif">
              Perform structural maintenance operations. Resets erase cached active sessions, quiz performance graphs, and local PDF chunk nodes.
            </p>

            <button
              type="button"
              onClick={fullSystemReset}
              className="w-full py-2.5 bg-academic-crimson/10 hover:bg-academic-crimson-bright border border-academic-crimson/30 hover:border-transparent text-academic-cream font-sans font-bold text-xs tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Full System Reset
            </button>
          </div>

          <div className="bg-academic-paper border border-academic-card p-5 rounded-xl text-xs text-academic-text-muted space-y-1 font-serif">
            <span className="font-sans font-bold text-academic-cream block">Sovereign Encryption:</span>
            <p className="leading-relaxed">
              StudySphere AI operates offline under a simulation model. No API credentials, files, or transcript logs are transmitted or stored remotely.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
