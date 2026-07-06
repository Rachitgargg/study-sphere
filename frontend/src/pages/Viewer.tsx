import React, { useState } from 'react';
import { useStudySphere } from '../context/StudySphereContext';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  BookOpen, 
  Copy, 
  Sparkles, 
  Check,
  FileText
} from 'lucide-react';

export const Viewer: React.FC = () => {
  const { activeDoc } = useStudySphere();
  const navigate = useNavigate();
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(4);
  const [searchWord, setSearchWord] = useState('regularization');
  const [isCopied, setIsCopied] = useState(false);

  const docName = activeDoc ? activeDoc.name : 'Chapter 4 Notes.pdf';
  const totalPages = activeDoc?.pageCount || 12;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 70));

  const copyCitation = () => {
    navigator.clipboard.writeText(`Citation: Section 3.2, Page ${currentPage} of "${docName}" (StudySphere AI Catalog)`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  const outlines = [
    { title: '1. Introduction to Model Parameters', page: 1 },
    { title: '2. empirical Risk Minimizers', page: 3 },
    { title: '3. Loss Topologies & Convex Bowls', page: 5 },
    { title: '4. Constrained Regularization Bounds', page: 8 },
    { title: '5. Empirical Convergences & Rates', page: 11 }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header action menu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-academic-card/40 pb-4 gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-xs text-academic-text-muted hover:text-academic-cream font-mono transition-colors self-start"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Archives
        </button>

        {/* Toolbar menu controls */}
        <div className="flex flex-wrap items-center gap-4 bg-academic-paper border border-academic-card/80 p-1 rounded-lg text-xs font-mono text-academic-text-muted">
          <div className="flex items-center gap-1 border-r border-academic-card/50 pr-4 pl-2">
            <button 
              onClick={handleZoomOut} 
              className="p-1 hover:text-academic-cream rounded hover:bg-academic-card"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-academic-cream text-center w-12">{zoom}%</span>
            <button 
              onClick={handleZoomIn} 
              className="p-1 hover:text-academic-cream rounded hover:bg-academic-card"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1 border-r border-academic-card/50 pr-4">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 hover:text-academic-cream rounded hover:bg-academic-card disabled:opacity-30"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-academic-cream">PAGE {currentPage} OF {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1 hover:text-academic-cream rounded hover:bg-academic-card disabled:opacity-30"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={copyCitation}
            className="flex items-center gap-1.5 py-1 px-2.5 rounded hover:bg-academic-card text-academic-cream font-sans font-medium transition-all"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-academic-emerald-bright" /> : <Copy className="w-3.5 h-3.5 text-academic-gold" />}
            <span>{isCopied ? 'Citation Copied!' : 'Copy Citation'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Index/Outline sidebar */}
        <div className="lg:col-span-1 bg-academic-paper border border-academic-card rounded-xl p-4 h-fit space-y-4">
          <div className="border-b border-academic-card/50 pb-3">
            <h3 className="font-serif text-xs font-bold uppercase tracking-widest text-academic-text-muted">
              Document Outline
            </h3>
            <p className="text-[10px] font-mono text-academic-gold mt-1 truncate" title={docName}>
              {docName}
            </p>
          </div>

          <div className="space-y-1">
            {outlines.map((ot, idx) => {
              const isActive = currentPage >= ot.page && (idx === outlines.length - 1 || currentPage < outlines[idx + 1].page);
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(ot.page)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors font-serif leading-snug flex items-center justify-between ${
                    isActive 
                      ? 'bg-academic-gold/10 text-academic-gold' 
                      : 'hover:bg-academic-card/50 text-academic-text-muted hover:text-academic-cream'
                  }`}
                >
                  <span className="truncate pr-4">{ot.title}</span>
                  <span className="font-mono text-[9px] text-academic-text-muted/80">p.{ot.page}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Interactive Reading Viewport */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-academic-paper border border-academic-card rounded-xl p-6 md:p-12 min-h-[500px] flex flex-col justify-between shadow-2xl relative gold-glow">
            {/* Decorative binding holes representing a classic academic folder binder */}
            <div className="absolute top-0 bottom-0 left-4 w-3 flex flex-col justify-around py-12 opacity-30">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-academic-black border border-academic-card" />
              ))}
            </div>

            {/* Simulated Paper Sheets */}
            <div className="space-y-6 pl-8 flex-1 select-text selection:bg-academic-gold/20 font-serif">
              <div className="border-b border-academic-card/30 pb-4 flex justify-between text-[10px] font-mono text-academic-text-muted">
                <span>SECTION 3.2: GRADIENT OPTIMIZATION BOUNDS</span>
                <span>PAGE {currentPage}</span>
              </div>

              {/* Text paragraph */}
              <div 
                className="space-y-6 text-sm md:text-base text-academic-cream/90 leading-relaxed transition-all duration-200"
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
              >
                <p>
                  Under typical operating metrics, parameters are calibrated using stochastic update matrices. Because calculating gradients across massive high-frequency coordinate spaces is computationally expensive, we estimate the cost slope using randomized mini-batches.
                </p>

                <p className="bg-academic-gold/5 border border-academic-gold/20 p-4 rounded-lg text-sm italic font-serif my-4">
                  "Under L1 regularization limits, the optimization cost contours represent a diamond polyhedron boundary, whereas L2 configurations form smooth hyperspherical constraints."
                </p>

                <p>
                  To balance parameter limits, the regularization penalty $\lambda$ regulates the capacity of weights. Lasso structures drive minor coefficients directly to <span className="bg-academic-gold/20 border border-academic-gold/40 px-1 rounded font-bold text-academic-cream">zero</span>, creating sparse feature selections. Ridge structures decay parameters smoothly, preserving minor details.
                </p>
              </div>
            </div>

            {/* Document footer references */}
            <div className="border-t border-academic-card/30 pt-4 mt-8 flex items-center justify-between text-[10px] font-mono text-academic-text-muted">
              <span>Cataloged Draft Identifier: SS-D-{totalPages}X</span>
              <span>StudySphere AI OCR Reader v1.0</span>
            </div>
          </div>

          {/* Quick AI Help block */}
          <div className="bg-academic-dark border border-academic-card/80 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-academic-gold/15 flex items-center justify-center border border-academic-gold/20 text-academic-gold">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-academic-cream font-sans">Scholarly AI Companion</h4>
                <p className="text-[10px] text-academic-text-muted">Inquire about the active page contents in the chat client.</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/chat')}
              className="px-4 py-2 bg-academic-gold hover:bg-academic-gold-muted text-academic-black text-xs font-sans font-bold rounded-lg transition-all cursor-pointer"
            >
              Consult Assistant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
