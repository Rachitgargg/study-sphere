import React, { useState, useEffect } from 'react';
import { useStudySphere } from '../context/StudySphereContext';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Book, 
  ChevronDown, 
  Calendar, 
  User, 
  BookOpen, 
  Wifi, 
  Flame,
  Clock
} from 'lucide-react';

export const TopNavigation: React.FC = () => {
  const { 
    documents, 
    activeDoc, 
    setActiveDoc, 
    searchQuery, 
    setSearchQuery,
    username,
    academicLevel
  } = useStudySphere();

  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-black/20 border-b border-white/5 h-16 flex items-center justify-between px-6 z-20 backdrop-blur-md sticky top-0">
      {/* Search Bar / Query Interface */}
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          <input
            type="text"
            placeholder="Search your knowledge..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-sans"
          />
        </div>
      </div>

      {/* Center/Right Items */}
      <div className="flex items-center gap-6">
        {/* Document Selector Dropdown */}
        {documents.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-academic-black/50 border border-academic-card/50 hover:bg-academic-card/40 hover:border-academic-gold/20 text-xs font-serif text-academic-cream transition-all"
            >
              <Book className="w-3.5 h-3.5 text-academic-gold" />
              <span className="max-w-[150px] truncate">{activeDoc ? activeDoc.name : 'Select Codex'}</span>
              <ChevronDown className="w-3 h-3 text-academic-text-muted" />
            </button>

            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsDropdownOpen(false)} 
                />
                <div className="absolute right-0 mt-1.5 w-64 bg-academic-paper border border-academic-card rounded-lg shadow-2xl z-50 p-1 divide-y divide-academic-card/50">
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-academic-text-muted/60">
                    Tether to Material
                  </div>
                  <div className="py-1 max-h-60 overflow-y-auto">
                    {documents.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => {
                          setActiveDoc(doc);
                          setIsDropdownOpen(false);
                        }}
                        className={`flex items-start gap-2.5 w-full text-left px-3 py-2 rounded-md text-xs transition-colors ${
                          activeDoc?.id === doc.id 
                            ? 'bg-academic-gold/15 text-academic-gold' 
                            : 'text-academic-text-muted hover:bg-academic-card/50 hover:text-academic-cream'
                        }`}
                      >
                        <BookOpen className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{doc.name}</p>
                          <p className="text-[10px] font-mono text-academic-text-muted/70 mt-0.5">
                            {doc.pageCount} Pages • {doc.size}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate('/viewer');
                      }}
                      className="w-full text-center py-1.5 hover:bg-academic-gold/10 hover:text-academic-gold text-[11px] text-academic-text-muted font-sans font-medium rounded transition-colors block"
                    >
                      Open in Document Viewer ↗
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* System telemetry / time */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-academic-text-muted/80">
          <div className="flex items-center gap-1.5 bg-academic-black/30 border border-academic-card/30 px-2.5 py-1 rounded-md">
            <Clock className="w-3.5 h-3.5 text-academic-gold/70" />
            <span>{timeString || '--:--'}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-academic-emerald/10 border border-academic-emerald/20 text-academic-cream/90 px-2.5 py-1 rounded-md">
            <Wifi className="w-3 h-3 text-academic-emerald-bright animate-pulse" />
            <span>AI Core Ready</span>
          </div>
        </div>

        {/* User Profile Hub */}
        <div className="flex items-center gap-3 border-l border-white/10 pl-6">
          <div className="flex flex-col text-right">
            <span className="font-sans text-xs font-semibold text-white leading-none">{username}</span>
            <span className="font-mono text-[9px] text-slate-400 mt-1 leading-none truncate max-w-[130px]" title={academicLevel}>
              {academicLevel}
            </span>
          </div>
          <div className="w-9 h-9 rounded-full border-2 border-indigo-500/50 p-0.5 overflow-hidden flex-shrink-0">
            <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
