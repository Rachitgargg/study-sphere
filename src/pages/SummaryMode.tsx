import React, { useState } from 'react';
import { useStudySphere } from '../context/StudySphereContext';
import { useNavigate } from 'react-router-dom';
import { MathText } from '../components/MathText';
import { sendChatMessage } from '../lib/api';
import { 
  ArrowLeft, 
  FileText, 
  Layers, 
  BookMarked, 
  Maximize, 
  Share2, 
  Bookmark, 
  TrendingUp,
  Brain,
  Sparkles
} from 'lucide-react';

export const SummaryMode: React.FC = () => {
  const { activeDoc, updateDocumentSummary } = useStudySphere();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'brief' | 'comprehensive' | 'theorems'>('brief');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const docTitle = activeDoc ? activeDoc.name : 'No active document';
  const docConcepts = activeDoc?.concepts || ['Vector DB', 'SentenceTransformers', 'ChromaDB'];

  const handleGenerate = async () => {
    if (!activeDoc || !updateDocumentSummary) return;
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const prompt = `Generate a structured conceptual summary of this document. Focus on key ideas, equations, and main definitions using clear formatting.`;
      const result = await sendChatMessage(prompt, 'summary');
      if (result.answer) {
        updateDocumentSummary(activeDoc.id, result.answer);
      } else {
        setGenerationError('Failed to generate summary content from document. Try again.');
      }
    } catch (err: any) {
      console.error('[SummaryMode] generate error:', err);
      setGenerationError(err.message || 'System connection failure. Check backend server.');
    } finally {
      setIsGenerating(false);
    }
  };

  const briefContent = {
    title: 'Executive Digest',
    bullets: [
      'Models continuous relationships between feature representations and outputs using parameter weights ($w$) and biases ($b$). Optimization attempts to minimize error functions.',
      'Gradient Descent utilizes derivatives of cost landscapes to iteratively adjust weights toward a global minimum. Stochastic versions trade batch precision for computation speed.',
      'Regularization introduces complex boundaries to penalize massive weights. L1 norm drives elements to zero (sparsity), while L2 smooths weight distributions.'
    ],
    summary: 'In short, the active bibliography investigates the optimization of continuous parameters under constraints. It details how empirical risks are calculated, and how gradient steps and regularization penalties are configured to optimize generalized accuracy on unseen test data.'
  };

  const comprehensiveContent = [
    {
      section: 'Section I: Theoretical Foundations of Linear Maps',
      text: 'The text begins by detailing the foundational model of prediction, projecting a feature space mapping into linear target variables. Linear predictions form the basis of more complex topologies, such as Neural Networks. By projecting features via weighted combinations, the optimizer isolates continuous gradients across the parameter space.'
    },
    {
      section: 'Section II: Derivatives & Steepest Paths of Descent',
      text: 'To minimize the convex loss bowl, the optimizer utilizes derivative steps. Stochastic formulations compute updates over tiny random batches, introducing high volatility but protecting the model from getting stuck in shallow saddle configurations. Incorporating a momentum component carries over prior velocity vectors to accelerate progress along narrow valleys.'
    },
    {
      section: 'Section III: Constraints & Generalization regularizers',
      text: 'Unchecked, parameters expand to fit high-frequency dataset noise. The document details regularized losses that constrain mathematical capacities. Lasso boundaries represent polyhedron diamonds forcing coefficients to zero. Ridge creates spherical boundaries dampening parameters uniformly.'
    }
  ];

  const theoremsContent = [
    {
      name: 'Theorem 1: Least Squares Convexity Guarantee',
      formulation: 'J(\\mathbf{w}, b) = \\frac{1}{2N} \\sum_{i=1}^N \\left( \\mathbf{w}^T \\mathbf{x}^{(i)} + b - y^{(i)} \\right)^2',
      implication: 'Because the Hessian matrix of this cost function is positive semi-definite across all domains, the cost topology is strictly convex. This ensures any local minimum is globally optimal.'
    },
    {
      name: 'Theorem 2: L1 Norm Sparsity Minimization (Lasso)',
      formulation: 'L_{L1}(\\mathbf{w}) = \\mathcal{E}_{D}(\\mathbf{w}) + \\lambda \\sum_{j=1}^D |w_j|',
      implication: 'The absolute penalty term creates singular sharp points on the axes. The cost contours are geometrically forced to intersect at these singular points, collapsing irrelevant parameters to absolute zero.'
    }
  ];

  const isDefaultDoc = activeDoc?.id === 'doc-1';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-academic-card/40 pb-4">
        <button
          onClick={() => navigate('/study-modes')}
          className="flex items-center gap-1.5 text-xs text-academic-text-muted hover:text-academic-cream font-mono transition-colors border-0 bg-transparent cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Hub
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="p-1.5 rounded bg-academic-card border border-academic-card text-academic-text-muted hover:text-academic-cream text-xs font-mono transition-colors border-solid cursor-pointer"
            title="Download Abstract"
          >
            Export abstract
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Summary Meta & Concepts */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-academic-paper border border-academic-card p-5 rounded-xl space-y-4 gold-glow">
            <div className="w-10 h-10 rounded bg-academic-gold/5 flex items-center justify-center border border-academic-gold/20 text-academic-gold">
              <BookMarked className="w-5 h-5" />
            </div>
            
            <div>
              <p className="text-[10px] font-mono tracking-widest text-academic-gold uppercase">Scholarly Summary</p>
              <h3 className="font-serif text-lg font-bold text-academic-cream mt-1 truncate" title={docTitle}>
                {docTitle}
              </h3>
              <p className="text-xs text-academic-text-muted mt-1 leading-relaxed font-serif">
                {isDefaultDoc || activeDoc?.summary ? 'Automatic linguistic extraction generated successfully.' : 'Abstract not generated yet.'}
              </p>
            </div>

            <div className="border-t border-academic-card/50 pt-4 space-y-3">
              <span className="text-[10px] font-mono tracking-wider text-academic-text-muted uppercase">Extracted Terms</span>
              <div className="flex flex-wrap gap-1.5">
                {(docConcepts || []).map((conc, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-academic-black border border-academic-card text-[10px] font-mono text-academic-text-muted">
                    {conc}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-academic-paper border border-academic-card p-5 rounded-xl space-y-3 gold-glow">
            <h4 className="font-serif text-xs font-bold text-academic-cream uppercase tracking-widest">
              Linguistic Analysis Specs
            </h4>
            <div className="text-[11px] font-mono text-academic-text-muted space-y-1.5">
              <div className="flex justify-between">
                <span>Reading Difficulty:</span>
                <span className="text-academic-gold">Advanced (Postgrad)</span>
              </div>
              <div className="flex justify-between">
                <span>Core Theme Index:</span>
                <span className="text-academic-cream">Optimization Maps</span>
              </div>
              <div className="flex justify-between">
                <span>Key Equations:</span>
                <span className="text-academic-cream">{isDefaultDoc ? '2 Extracted' : activeDoc?.summary ? 'Formulas Integrated' : '0 Extracted'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Dynamic / Mock Summary Area */}
        <div className="lg:col-span-2 space-y-6">
          {isGenerating ? (
            <div className="bg-academic-paper border border-academic-card p-8 rounded-xl min-h-[400px] flex flex-col items-center justify-center text-center space-y-4 font-serif gold-glow">
              <div className="w-12 h-12 rounded-full border-2 border-academic-gold border-t-transparent animate-spin mx-auto" />
              <h3 className="font-serif text-lg font-bold text-academic-cream">Analyzing Codex Abstract...</h3>
              <p className="text-xs text-academic-text-muted max-w-xs mx-auto leading-relaxed font-sans">
                Generating hierarchical semantic summaries and parsing mathematical bounds from index context.
              </p>
            </div>
          ) : isDefaultDoc ? (
            /* Render Mock Tabbed Reader for Default Doc */
            <div className="space-y-6">
              {/* Tabs header */}
              <div className="flex bg-academic-paper border border-academic-card p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('brief')}
                  className={`flex-1 text-center py-2 text-xs font-sans font-bold rounded-lg transition-colors border-0 cursor-pointer ${
                    activeTab === 'brief' 
                      ? 'bg-academic-card text-academic-gold' 
                      : 'text-academic-text-muted hover:text-academic-cream bg-transparent'
                  }`}
                >
                  Brief Digest
                </button>
                <button
                  onClick={() => setActiveTab('comprehensive')}
                  className={`flex-1 text-center py-2 text-xs font-sans font-bold rounded-lg transition-colors border-0 cursor-pointer ${
                    activeTab === 'comprehensive' 
                      ? 'bg-academic-card text-academic-gold' 
                      : 'text-academic-text-muted hover:text-academic-cream bg-transparent'
                  }`}
                >
                  Comprehensive
                </button>
                <button
                  onClick={() => setActiveTab('theorems')}
                  className={`flex-1 text-center py-2 text-xs font-sans font-bold rounded-lg transition-colors border-0 cursor-pointer ${
                    activeTab === 'theorems' 
                      ? 'bg-academic-card text-academic-gold' 
                      : 'text-academic-text-muted hover:text-academic-cream bg-transparent'
                  }`}
                >
                  Theorems & Formulas
                </button>
              </div>

              {/* Active summary area */}
              <div className="bg-academic-paper border border-academic-card p-6 md:p-8 rounded-xl min-h-[400px] gold-glow animate-fade-in">
                {activeTab === 'brief' && (
                  <div className="space-y-6 font-serif">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-academic-cream">{briefContent.title}</h3>
                      <div className="h-px bg-academic-card/50 my-3" />
                    </div>

                    <div className="space-y-4">
                      {briefContent.bullets.map((bullet, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-academic-cream/80 leading-relaxed font-sans">
                          <span className="text-academic-gold mt-1">•</span>
                          <span className="flex-1"><MathText text={bullet} className="inline" /></span>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-academic-text-muted leading-relaxed border-t border-academic-card/40 pt-4 italic">
                      "{briefContent.summary}"
                    </p>
                  </div>
                )}

                {activeTab === 'comprehensive' && (
                  <div className="space-y-6 font-serif">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-academic-cream">Comprehensive Monograph Review</h3>
                      <div className="h-px bg-academic-card/50 my-3" />
                    </div>

                    <div className="space-y-5">
                      {comprehensiveContent.map((section, i) => (
                        <div key={i} className="space-y-2">
                          <h4 className="font-serif text-xs font-bold text-academic-gold uppercase tracking-wider">{section.section}</h4>
                          <p className="text-xs text-academic-cream/80 leading-relaxed font-sans">{section.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'theorems' && (
                  <div className="space-y-8">
                    {theoremsContent.map((th, i) => (
                      <div key={i} className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-academic-gold" />
                          <h4 className="font-serif text-sm font-bold text-academic-cream">{th.name}</h4>
                        </div>

                        <div className="bg-academic-black border border-academic-card p-4 rounded-lg flex items-center justify-center text-center select-text selection:bg-academic-gold/20 w-full overflow-x-auto">
                          <MathText text={th.formulation} className="text-academic-gold text-xs font-mono" />
                        </div>

                        <p className="text-xs text-academic-text-muted leading-relaxed font-serif pl-6">
                          <strong className="text-academic-cream font-sans">Semantic Implication:</strong> {th.implication}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : activeDoc?.summary ? (
            /* Render dynamic custom RAG summary */
            <div className="bg-academic-paper border border-academic-card p-6 md:p-8 rounded-xl min-h-[400px] gold-glow animate-fade-in space-y-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-academic-cream">Linguistic Abstract Digest</h3>
                <p className="text-[10px] font-mono text-academic-text-muted mt-0.5">GENERATED BY AI RESEARCH REASONING</p>
                <div className="h-px bg-academic-card/50 my-3" />
              </div>
              <div className="font-sans text-xs md:text-sm text-academic-cream/90 leading-relaxed whitespace-pre-wrap select-text selection:bg-academic-gold/20">
                <MathText text={activeDoc.summary} className="w-full inline-block" />
              </div>
            </div>
          ) : (
            /* Render Generate placeholder for user uploaded documents */
            <div className="bg-academic-paper border border-academic-card p-8 rounded-xl min-h-[400px] flex flex-col items-center justify-center text-center space-y-6 gold-glow">
              <div className="w-16 h-16 rounded-full bg-academic-card border border-academic-gold/30 flex items-center justify-center mx-auto shadow-lg text-academic-gold">
                <BookMarked className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-xl font-bold text-academic-cream">No summary generated yet.</h3>
                <p className="text-xs text-academic-text-muted font-serif max-w-sm mx-auto leading-relaxed">
                  Generate a structured conceptual overview and mathematical brief directly from your custom document.
                </p>
              </div>

              {generationError && (
                <p className="text-xs text-academic-crimson-bright font-mono bg-academic-crimson/10 border border-academic-crimson/20 p-2 rounded">
                  {generationError}
                </p>
              )}

              {activeDoc ? (
                <button
                  onClick={handleGenerate}
                  className="px-6 py-2.5 bg-academic-gold hover:bg-academic-gold-muted text-academic-black font-sans font-bold text-xs tracking-wider rounded-lg shadow-md transition-all cursor-pointer border-0"
                >
                  Generate Summary
                </button>
              ) : (
                <p className="text-xs text-academic-text-muted italic">
                  Select a registered document to generate summaries.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
