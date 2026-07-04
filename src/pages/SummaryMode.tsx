import React, { useState } from 'react';
import { useStudySphere } from '../context/StudySphereContext';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Layers, 
  BookMarked, 
  Maximize, 
  Share2, 
  Bookmark, 
  TrendingUp,
  Brain
} from 'lucide-react';

export const SummaryMode: React.FC = () => {
  const { activeDoc } = useStudySphere();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'brief' | 'comprehensive' | 'theorems'>('brief');

  const docTitle = activeDoc ? activeDoc.name : 'Machine Learning Foundations.pdf';
  const docConcepts = activeDoc?.concepts || ['Convexity', 'Stochastic Gradient Descent', 'L1/L2 Weights Penalty'];

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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-academic-card/40 pb-4">
        <button
          onClick={() => navigate('/study-modes')}
          className="flex items-center gap-1.5 text-xs text-academic-text-muted hover:text-academic-cream font-mono transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Hub
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="p-1.5 rounded bg-academic-card border border-academic-card text-academic-text-muted hover:text-academic-cream text-xs font-mono transition-colors"
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
                Automatic linguistic extraction generated successfully.
              </p>
            </div>

            <div className="border-t border-academic-card/50 pt-4 space-y-3">
              <span className="text-[10px] font-mono tracking-wider text-academic-text-muted uppercase">Extracted Terms</span>
              <div className="flex flex-wrap gap-1.5">
                {docConcepts.map((conc, i) => (
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
                <span className="text-academic-cream">4 Extracted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Tabbed Summaries Reader */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs header */}
          <div className="flex bg-academic-paper border border-academic-card p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('brief')}
              className={`flex-1 text-center py-2 text-xs font-sans font-bold rounded-lg transition-colors ${
                activeTab === 'brief' 
                  ? 'bg-academic-card text-academic-gold' 
                  : 'text-academic-text-muted hover:text-academic-cream'
              }`}
            >
              Brief Digest
            </button>
            <button
              onClick={() => setActiveTab('comprehensive')}
              className={`flex-1 text-center py-2 text-xs font-sans font-bold rounded-lg transition-colors ${
                activeTab === 'comprehensive' 
                  ? 'bg-academic-card text-academic-gold' 
                  : 'text-academic-text-muted hover:text-academic-cream'
              }`}
            >
              Comprehensive
            </button>
            <button
              onClick={() => setActiveTab('theorems')}
              className={`flex-1 text-center py-2 text-xs font-sans font-bold rounded-lg transition-colors ${
                activeTab === 'theorems' 
                  ? 'bg-academic-card text-academic-gold' 
                  : 'text-academic-text-muted hover:text-academic-cream'
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

                <ul className="space-y-4 text-sm text-academic-cream/90 leading-relaxed">
                  {briefContent.bullets.map((b, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="text-academic-gold mt-1.5 flex-shrink-0 font-bold">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="p-4 bg-academic-dark border border-academic-card/50 rounded-xl mt-6">
                  <span className="text-[10px] font-mono text-academic-gold uppercase tracking-wider block mb-1">Synthesized Abstract</span>
                  <p className="text-xs text-academic-text-muted leading-relaxed font-sans">{briefContent.summary}</p>
                </div>
              </div>
            )}

            {activeTab === 'comprehensive' && (
              <div className="space-y-6 font-serif">
                {comprehensiveContent.map((sec, i) => (
                  <div key={i} className="space-y-2">
                    <h4 className="font-serif text-sm font-bold text-academic-gold">{sec.section}</h4>
                    <p className="text-sm text-academic-cream/90 leading-relaxed pl-4 border-l border-academic-card/80">
                      {sec.text}
                    </p>
                  </div>
                ))}
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

                    <div className="bg-academic-black border border-academic-card p-4 rounded-lg flex items-center justify-center text-center select-text selection:bg-academic-gold/20">
                      <code className="font-mono text-xs text-academic-gold tracking-wide leading-relaxed">
                        {th.formulation}
                      </code>
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
      </div>
    </div>
  );
};
