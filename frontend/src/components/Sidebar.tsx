import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStudySphere } from '../context/StudySphereContext';
import { 
  BookOpen, 
  MessageSquare, 
  Layers, 
  GitBranch, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  UploadCloud, 
  GraduationCap,
  Sparkles,
  FileText,
  Trash2,
  Brain
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    documents, 
    activeDoc, 
    setActiveDoc, 
    removeDocument,
    isSidebarOpen, 
    setIsSidebarOpen 
  } = useStudySphere();

  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Layers },
    { name: 'Upload Materials', path: '/upload', icon: UploadCloud },
    { name: 'AI Chat Client', path: '/chat', icon: MessageSquare },
    { name: 'Study Hub', path: '/study-modes', icon: GraduationCap },
    { name: 'Knowledge Map', path: '/map', icon: GitBranch },
    { name: 'System Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside 
      className={`bg-black/40 backdrop-blur-xl border-r border-white/10 text-gray-200 h-full flex flex-col transition-all duration-300 z-30 ${
        isSidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Brand Logo & Header */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => navigate('/')}
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group">
            <Brain className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col animate-fade-in">
              <span className="font-sans text-md font-bold tracking-wide text-white flex items-center gap-1">
                StudySphere <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1 rounded">AI</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">Nocturnal Scholar v1.0</span>
            </div>
          )}
        </div>
        
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1.5 rounded-md hover:bg-academic-card text-academic-text-muted hover:text-academic-cream transition-colors"
          title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Primary Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        {isSidebarOpen && (
          <p className="text-[10px] font-mono tracking-widest text-academic-text-muted/60 uppercase px-3 mb-2">
            Academic Archives
          </p>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg font-sans text-sm transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-academic-card text-academic-cream border-l-2 border-academic-gold shadow-[0_0_15px_rgba(212,175,55,0.04)] font-medium' 
                    : 'text-academic-text-muted hover:text-academic-cream hover:bg-academic-card/40'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-105" />
              {isSidebarOpen && <span className="truncate">{item.name}</span>}
              {!isSidebarOpen && (
                <div className="absolute left-16 bg-academic-black text-academic-cream border border-academic-card text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl">
                  {item.name}
                </div>
              )}
            </NavLink>
          );
        })}

        {/* Muted line separator */}
        <div className="h-px bg-academic-card/50 my-6" />

        {/* Active Archive Materials */}
        {isSidebarOpen ? (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between px-3">
              <span className="text-[10px] font-mono tracking-widest text-academic-text-muted/60 uppercase">
                Active Materials
              </span>
              <span className="text-[10px] font-mono text-academic-gold bg-academic-gold/5 px-1.5 py-0.5 rounded border border-academic-gold/10">
                {documents.length} Codices
              </span>
            </div>
            
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {documents.length === 0 ? (
                <div className="text-xs text-academic-text-muted/50 px-3 py-2 italic font-serif">
                  No codices cataloged yet.
                </div>
              ) : (
                documents.map((doc) => {
                  const isSelected = activeDoc?.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setActiveDoc(doc)}
                      className={`group flex items-center justify-between w-full text-left px-3 py-2 rounded-md transition-all duration-150 cursor-pointer ${
                        isSelected 
                          ? 'bg-academic-gold/10 text-academic-gold border border-academic-gold/20' 
                          : 'text-academic-text-muted hover:text-academic-cream hover:bg-academic-card/20 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <FileText className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-academic-gold' : 'text-academic-text-muted'}`} />
                        <span className="text-xs truncate font-sans">{doc.name}</span>
                      </div>
                      
                      {doc.status === 'processing' ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-academic-gold animate-pulse flex-shrink-0 ml-1" title="Analyzing..." />
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeDocument(doc.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-academic-crimson-bright rounded text-academic-text-muted/70 transition-all ml-1"
                          title="Archive Document"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-7 h-7 rounded-full border border-academic-card flex items-center justify-center text-academic-text-muted/40 font-mono text-[10px]">
              {documents.length}
            </div>
          </div>
        )}
      </nav>

      {/* Active Document Status Footer */}
      {isSidebarOpen && activeDoc && (
        <div className="p-4 border-t border-academic-card/50 bg-academic-black/40 font-serif">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-academic-emerald-bright shadow-[0_0_8px_rgba(45,106,79,0.5)] flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-mono text-academic-text-muted leading-tight uppercase tracking-wider">Tethered Codex</p>
              <h4 className="text-xs font-semibold text-academic-cream truncate mt-0.5" title={activeDoc.name}>
                {activeDoc.name}
              </h4>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
