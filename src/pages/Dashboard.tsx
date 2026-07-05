import React, { useState } from 'react';
import { useStudySphere } from '../context/StudySphereContext';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  Flame, 
  GraduationCap, 
  ArrowRight, 
  FileText, 
  MessageSquare, 
  Network, 
  TrendingUp, 
  CalendarDays,
  PlayCircle
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { 
    documents, 
    activeDoc, 
    setActiveDoc, 
    username,
    setUsername,
    onboardingComplete,
    setOnboardingComplete,
    studyTime,
    weeklyHours
  } = useStudySphere();

  const navigate = useNavigate();
  const [nameInput, setNameInput] = useState('');

  const trimmedName = nameInput.trim();
  const isNameInputValid = trimmedName.length > 0 && trimmedName.length <= 40;

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNameInputValid) {
      setUsername(trimmedName);
      setOnboardingComplete?.(true);
    }
  };

  const totalTrackedHours = weeklyHours.reduce((sum, entry) => sum + entry.hours, 0);
  const maxHours = Math.max(...weeklyHours.map(d => d.hours), 1);
  const streakDays = weeklyHours.filter(entry => entry.hours > 0).length;
  const totalHoursDisplay = (studyTime / 3600).toFixed(1);
  const latestIndex = weeklyHours.length - 1;
  const yesterdayHours = weeklyHours[latestIndex - 1]?.hours ?? 0;
  const todayHours = weeklyHours[latestIndex]?.hours ?? 0;
  const hourDelta = todayHours - yesterdayHours;

  const stats = [
    { 
      label: 'Intellective Hours', 
      value: `${totalHoursDisplay} Hrs`, 
      desc: `${hourDelta >= 0 ? '+' : ''}${hourDelta.toFixed(1)}h since yesterday`, 
      icon: Clock, 
      color: 'text-academic-gold bg-academic-gold/5 border-academic-gold/15' 
    },
    { 
      label: 'Study Session Streak', 
      value: `${streakDays} Days`, 
      desc: 'Active learning streak', 
      icon: Flame, 
      color: 'text-academic-crimson-bright bg-academic-crimson/10 border-academic-crimson/20' 
    },
    { 
      label: 'Cataloged Codices', 
      value: `${documents.length} Files`, 
      desc: documents.length ? 'Active bibliography' : 'No material uploaded', 
      icon: BookOpen, 
      color: 'text-academic-emerald-bright bg-academic-emerald/10 border-academic-emerald/20' 
    },
    { 
      label: 'Quizzes Completed', 
      value: '6 Completed', 
      desc: '88% Average Accuracy', 
      icon: GraduationCap, 
      color: 'text-cyan-400 bg-cyan-950/20 border-cyan-500/20' 
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {!onboardingComplete ? (
        <div className="max-w-md mx-auto my-12 animate-fade-in text-left">
          <div className="bg-academic-paper border border-academic-card p-8 rounded-2xl space-y-6 shadow-2xl gold-glow relative overflow-hidden">
            {/* Ambient gold glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-academic-gold/5 blur-[50px] rounded-full pointer-events-none" />
            
            <div className="w-16 h-16 rounded-full bg-academic-card border border-academic-gold/30 flex items-center justify-center mx-auto shadow-lg text-academic-gold text-2xl animate-pulse">
              👋
            </div>

            <div className="space-y-2 text-center">
              <h3 className="font-serif text-xl font-bold text-academic-cream">Welcome to StudySphere AI</h3>
              <p className="text-xs text-academic-text-muted font-serif">
                Before we begin... What should we call you?
              </p>
            </div>

            <form onSubmit={handleOnboardingSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left font-mono text-[10px]">
                <label className="text-academic-text-muted uppercase">SCHOLAR USERNAME</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-academic-black border border-academic-card hover:border-academic-gold/30 focus:border-academic-gold text-academic-cream rounded-lg px-4 py-3 text-sm focus:outline-none transition-all font-sans"
                  maxLength={40}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!isNameInputValid}
                className="w-full py-3 bg-academic-gold hover:bg-academic-gold-muted text-academic-black disabled:opacity-40 disabled:cursor-not-allowed font-sans font-bold text-xs tracking-wider rounded-lg shadow-md transition-all cursor-pointer border-0"
              >
                Continue
              </button>
            </form>
          </div>
        </div>
      ) : (
        <>
          {/* Greetings block */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-academic-cream">
            Good evening, {username} 👋
          </h2>
          <p className="text-sm text-academic-text-muted mt-1 font-serif">
            Welcome back to the archives. Your active focus is tethered to <span className="text-academic-gold font-sans font-medium">{activeDoc ? activeDoc.name : 'no material'}</span>.
          </p>
        </div>

        <button
          onClick={() => navigate('/upload')}
          className="self-start md:self-auto px-4 py-2 bg-academic-gold hover:bg-academic-gold-muted text-academic-black font-sans font-bold text-xs tracking-wider rounded-lg flex items-center gap-2 shadow-md transition-all cursor-pointer"
        >
          Catalog New Material
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Stats Matrix Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx}
              className="bg-academic-paper border border-academic-card p-5 rounded-xl flex items-center justify-between gold-glow"
            >
              <div className="space-y-1.5">
                <span className="text-xs text-academic-text-muted font-medium font-sans block">{stat.label}</span>
                <span className="text-2xl font-serif font-bold text-academic-cream block">{stat.value}</span>
                <span className="text-[10px] font-mono text-academic-text-muted/80 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-academic-gold/70" />
                  {stat.desc}
                </span>
              </div>
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Dashboard Core Row: Analytics Chart and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Progress custom Chart */}
        <div className="lg:col-span-2 bg-academic-paper border border-academic-card p-6 rounded-xl flex flex-col justify-between gold-glow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-serif text-lg font-bold text-academic-cream">Weekly Intellectual Output</h3>
              <p className="text-xs text-academic-text-muted mt-0.5">Time logged conducting readings and answering exams</p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-academic-card text-[10px] font-mono text-academic-gold">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>JULY 01 - JULY 07</span>
            </div>
          </div>

          {/* Elegant responsive custom SVG Chart */}
          <div className="h-48 w-full flex items-end justify-between px-2 pt-4">
            {weeklyHours.map((data, idx) => {
              const heightPercent = (data.hours / maxHours) * 80; // Scale to 80% max
              return (
                <div key={idx} className="flex flex-col items-center flex-1 group">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-academic-black border border-academic-gold/30 px-2 py-0.5 rounded text-[10px] font-mono text-academic-gold mb-2 pointer-events-none shadow-xl transform -translate-y-1">
                    {data.hours.toFixed(1)}h
                  </div>
                  {/* Bar */}
                  <div className="w-10 rounded-t-md bg-academic-card border border-academic-card/80 group-hover:border-academic-gold/50 group-hover:bg-gradient-to-t group-hover:from-academic-gold/10 group-hover:to-academic-gold/30 transition-all cursor-pointer relative flex justify-center overflow-hidden" style={{ height: `${Math.max(heightPercent, 8)}%` }}>
                    <div className="absolute bottom-0 w-full h-1 bg-academic-gold" />
                  </div>
                  {/* Label */}
                  <span className="text-[10px] font-mono text-academic-text-muted mt-3 uppercase tracking-wider">{data.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Launchpad Buttons */}
        <div className="bg-academic-paper border border-academic-card p-6 rounded-xl flex flex-col justify-between gold-glow">
          <div>
            <h3 className="font-serif text-lg font-bold text-academic-cream">Study Launchpad</h3>
            <p className="text-xs text-academic-text-muted mt-0.5">Quickly deploy cognitive learning instances</p>
          </div>

          <div className="space-y-3 my-4">
            <button
              onClick={() => navigate('/chat')}
              className="w-full flex items-center justify-between p-3.5 rounded-lg bg-academic-dark hover:bg-academic-card border border-academic-card hover:border-academic-gold/30 text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-academic-gold/5 border border-academic-gold/25 rounded-md text-academic-gold group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-academic-cream">Scholarly Chat</h4>
                  <p className="text-[10px] text-academic-text-muted">Query active papers</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-academic-text-muted group-hover:text-academic-gold group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              onClick={() => navigate('/study-modes')}
              className="w-full flex items-center justify-between p-3.5 rounded-lg bg-academic-dark hover:bg-academic-card border border-academic-card hover:border-academic-gold/30 text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/5 border border-cyan-500/20 rounded-md text-cyan-400 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-academic-cream">Study Mode Hub</h4>
                  <p className="text-[10px] text-academic-text-muted">Deploy quiz, flashcard, or visual learning</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-academic-text-muted group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              onClick={() => navigate('/map')}
              className="w-full flex items-center justify-between p-3.5 rounded-lg bg-academic-dark hover:bg-academic-card border border-academic-card hover:border-academic-gold/30 text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-academic-emerald/10 border border-academic-emerald/20 rounded-md text-academic-emerald-bright group-hover:scale-105 transition-transform">
                  <Network className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-academic-cream">Knowledge Map</h4>
                  <p className="text-[10px] text-academic-text-muted">Traverse node connections</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-academic-text-muted group-hover:text-academic-emerald-bright group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>

          <div className="text-[10px] font-mono text-center text-academic-text-muted/60 bg-academic-black/50 py-1.5 px-2 rounded border border-academic-card/30">
            Select a document below to swap focus
          </div>
        </div>
      </div>

      {/* Catalog Bibliography Matrix */}
      <div className="bg-academic-paper border border-academic-card p-6 rounded-xl gold-glow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-serif text-lg font-bold text-academic-cream">Cataloged Bibliography</h3>
            <p className="text-xs text-academic-text-muted mt-0.5">Active scholarly resources, research drafts, and slide collections</p>
          </div>
          <span className="text-[10px] font-mono bg-academic-card text-academic-cream px-3 py-1 rounded-full border border-academic-card">
            {documents.length} Materials Tethered
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => {
            const isActive = activeDoc?.id === doc.id;
            return (
              <div 
                key={doc.id}
                onClick={() => setActiveDoc(doc)}
                className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-44 ${
                  isActive 
                    ? 'bg-academic-gold/5 border-academic-gold/30 ring-1 ring-academic-gold/10' 
                    : 'bg-academic-dark/60 border-academic-card hover:border-academic-gold/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`p-2.5 rounded-lg border ${isActive ? 'bg-academic-gold/10 border-academic-gold/30 text-academic-gold' : 'bg-academic-paper border-academic-card text-academic-text-muted'}`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-serif text-sm font-bold text-academic-cream truncate">{doc.name}</h4>
                      <p className="text-[10px] font-mono text-academic-text-muted/80 mt-1">
                        {doc.size} • {doc.pageCount} Pages • Uploaded {doc.uploadDate}
                      </p>
                    </div>
                  </div>

                  {doc.status === 'processing' ? (
                    <span className="px-2 py-0.5 text-[9px] font-mono text-academic-gold bg-academic-gold/10 border border-academic-gold/20 rounded animate-pulse">
                      Analyzing...
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[9px] font-mono text-academic-emerald-bright bg-academic-emerald/15 border border-academic-emerald/30 rounded">
                      Processed
                    </span>
                  )}
                </div>

                {/* Concepts list tags */}
                <div className="flex flex-wrap gap-1.5 my-3">
                  {doc.concepts?.slice(0, 3).map((concept, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-academic-black border border-academic-card/50 text-[9px] font-mono text-academic-text-muted">
                      {concept}
                    </span>
                  ))}
                  {doc.concepts && doc.concepts.length > 3 && (
                    <span className="px-1.5 py-0.5 rounded bg-academic-black border border-academic-card/50 text-[9px] font-mono text-academic-gold">
                      +{doc.concepts.length - 3} More
                    </span>
                  )}
                </div>

                {/* Card footer buttons */}
                <div className="flex items-center justify-between border-t border-academic-card/40 pt-3 mt-1">
                  <span className="text-[10px] font-mono text-academic-text-muted/80">
                    {isActive ? '● Currently Engaged' : 'Click to Engage'}
                  </span>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDoc(doc);
                        navigate('/viewer');
                      }}
                      className="text-[10px] font-mono font-bold text-academic-gold hover:text-academic-cream transition-colors flex items-center gap-1"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      Read
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDoc(doc);
                        navigate('/study-modes');
                      }}
                      className="text-[10px] font-mono font-bold text-academic-text-muted hover:text-academic-cream transition-colors"
                    >
                      Study
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
        </>
      )}
    </div>
  );
};
