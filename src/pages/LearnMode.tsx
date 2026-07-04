import React, { useState } from 'react';
import { useStudySphere } from '../context/StudySphereContext';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle, 
  Bookmark, 
  ChevronRight, 
  HelpCircle,
  Award,
  Sparkles
} from 'lucide-react';

export const LearnMode: React.FC = () => {
  const { activeDoc } = useStudySphere();
  const navigate = useNavigate();
  const [currentChapter, setCurrentChapter] = useState(0);
  const [completedChapters, setCompletedChapters] = useState<number[]>([0]);

  const chapters = [
    {
      title: 'Linear Regression and the Optimization Loss',
      duration: '15 mins',
      concepts: ['Empirical Error', 'Feature Vectors', 'Least Squares'],
      content: `### 1.1 The Objective of Regression
Linear regression seeks to establish a continuous mathematical mapping between an $D$-dimensional input feature vector $\\mathbf{x} \\in \\mathbb{R}^D$ and a scalar target variable $y \\in \\mathbb{R}$. The hypothesis is defined by parameter weights $\\mathbf{w}$ and a bias offset $b$:

$$h_{\\mathbf{w}, b}(\\mathbf{x}) = \\mathbf{w}^T \\mathbf{x} + b = \\sum_{j=1}^D w_j x_j + b$$

### 1.2 Defining the Cost Topology
To train our parameters, we must establish a performance metric. The standard Least Squares cost function evaluates the aggregate squared deviations across $N$ training samples:

$$J(\\mathbf{w}, b) = \\frac{1}{2N} \\sum_{i=1}^N \\left( h_{\\mathbf{w}, b}(\\mathbf{x}^{(i)}) - y^{(i)} \\right)^2$$

This formulation yields a **convex** optimization bowl. This convexity guarantees that any local derivative minimum is mathematically equivalent to the absolute global minimum, simplifying our optimization paths.`,
      vocab: [
        { term: 'Convexity', def: 'A geometric property where any line segment drawn between two points on a curve lies on or above the curve.' },
        { term: 'Empirical Loss', def: 'The average error calculated directly across the sample training dataset.' }
      ],
      takeaway: 'Linear models form the foundation of predictive networks. Convex cost topologies guarantee that simple gradient solvers will converge to optimal weights without being trapped.'
    },
    {
      title: 'Convex Cost Shapes & Stochastic Gradient Descent',
      duration: '20 mins',
      concepts: ['Gradient Vectors', 'Learning Rate', 'SGD Velocity'],
      content: `### 2.1 The Gradient Field
To find the bottom of our loss bowl $J(\\mathbf{w})$, we evaluate the derivative vector with respect to each parameter. The gradient vector $\\nabla_{\\mathbf{w}} J(\\mathbf{w})$ indicates the direction of steepest ascent:

$$\\nabla_{\\mathbf{w}} J(\\mathbf{w}) = \\frac{1}{N} \\sum_{i=1}^N \\left( \\mathbf{w}^T \\mathbf{x}^{(i)} - y^{(i)} \\right) \\mathbf{x}^{(i)}$$

### 2.2 Updating Parameters
Under Gradient Descent, we update parameters in the opposite direction of the gradient, scaled by a learning rate $\\alpha > 0$:

$$\\mathbf{w} \\leftarrow \\mathbf{w} - \\alpha \\nabla_{\\mathbf{w}} J(\\mathbf{w})$$

In Stochastic Gradient Descent (SGD), rather than evaluating the sum over all $N$ data points, we approximate the gradient using a single randomized sample. This introduces high optimization noise, but allows real-time updates and helps jump over small saddle points.`,
      vocab: [
        { term: 'Learning Rate (α)', def: 'A hyperparameter controlling the size of step taken towards a minimum during gradient iterations.' },
        { term: 'Saddle Point', def: 'A point in a function where derivatives are zero but is not a local maximum or minimum.' }
      ],
      takeaway: 'Batch gradient descent is accurate but slow on large datasets. Stochastic updates introduce noise but provide immense speed-ups.'
    },
    {
      title: 'Regularization Boundaries (L1 Lasso vs L2 Ridge)',
      duration: '18 mins',
      concepts: ['Overfitting', 'Weight Decay', 'Diamond Boundaries'],
      content: `### 3.1 Overfitting and Complexity
As models gain features, they tend to overfit—memorizing high-frequency training noise instead of underlying physics. To restrain this, we add a complexity penalty to our objective loss.

### 3.2 Regularization Mechanics
1. **L1 Regularization (Lasso)**: Adds the sum of absolute weight magnitudes:
   $$J_{L1}(\\mathbf{w}) = J(\\mathbf{w}) + \\lambda \\sum_{j=1}^D |w_j|$$
   Due to the diamond contour shape of L1, the loss often hits exact zeroes on the axes, eliminating irrelevant features.

2. **L2 Regularization (Ridge)**: Adds the squared magnitude sum:
   $$J_{L2}(\\mathbf{w}) = J(\\mathbf{w}) + \\frac{\\lambda}{2} \\sum_{j=1}^D w_j^2$$
   This creates a smooth circular constraint, distributing weights evenly and preventing individual weights from dominating.`,
      vocab: [
        { term: 'Regularization (λ)', def: 'The addition of penalty variables to a loss function to prevent overfitting.' },
        { term: 'Feature Sparsity', def: 'The property where many weight parameters drop to absolute zero, leaving only a few key features.' }
      ],
      takeaway: 'Use L1 Lasso when you have high-dimensional datasets and want automated feature selection. Use L2 Ridge for general stability.'
    }
  ];

  const handleCompleteChapter = () => {
    if (!completedChapters.includes(currentChapter)) {
      setCompletedChapters(prev => [...prev, currentChapter]);
    }
    // Advance to next chapter if available
    if (currentChapter < chapters.length - 1) {
      setCurrentChapter(prev => prev + 1);
    }
  };

  const activeChapterData = chapters[currentChapter] || chapters[0];
  const docTitle = activeDoc ? activeDoc.name : 'Machine Learning Foundations.pdf';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top action header */}
      <div className="flex items-center justify-between border-b border-academic-card/40 pb-4">
        <button
          onClick={() => navigate('/study-modes')}
          className="flex items-center gap-1.5 text-xs text-academic-text-muted hover:text-academic-cream font-mono transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Hub
        </button>

        <span className="text-[10px] font-mono bg-academic-card px-3 py-1 rounded text-academic-gold border border-academic-gold/15 flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5" />
          Learn Mode Active • {completedChapters.length}/{chapters.length} Modules Mastered
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left pane chapter navigation */}
        <div className="lg:col-span-1 bg-academic-paper border border-academic-card rounded-xl p-4 h-fit space-y-4">
          <div className="border-b border-academic-card/50 pb-3">
            <h3 className="font-serif text-xs font-bold uppercase tracking-widest text-academic-text-muted">
              Course Syllabus
            </h3>
            <p className="text-[10px] font-mono text-academic-gold mt-1 truncate" title={docTitle}>
              {docTitle}
            </p>
          </div>

          <div className="space-y-2">
            {chapters.map((ch, idx) => {
              const isSelected = currentChapter === idx;
              const isCompleted = completedChapters.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentChapter(idx)}
                  className={`w-full text-left p-3 rounded-lg text-xs transition-all border ${
                    isSelected 
                      ? 'bg-academic-gold/15 border-academic-gold/20 text-academic-gold' 
                      : 'bg-academic-dark/40 border-academic-card hover:border-academic-card/80 text-academic-text-muted hover:text-academic-cream'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] text-academic-text-muted">MODULE {idx + 1}</span>
                    {isCompleted && <CheckCircle className="w-3.5 h-3.5 text-academic-emerald-bright" />}
                  </div>
                  <h4 className="font-serif font-bold mt-1.5 leading-snug line-clamp-2">
                    {ch.title}
                  </h4>
                  <div className="flex gap-2 mt-2">
                    <span className="px-1.5 py-0.5 rounded bg-academic-black text-[9px] font-mono text-academic-text-muted">
                      {ch.duration}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right pane active learning content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-academic-paper border border-academic-card rounded-xl p-6 md:p-8 space-y-6 gold-glow">
            {/* Module header */}
            <div className="border-b border-academic-card/40 pb-5">
              <span className="text-[10px] font-mono text-academic-gold uppercase tracking-widest">
                Active Chapter Mastery • Module {currentChapter + 1}
              </span>
              <h2 className="font-serif text-2xl font-bold text-academic-cream mt-1">
                {activeChapterData.title}
              </h2>
              <div className="flex flex-wrap gap-2 mt-3">
                {activeChapterData.concepts.map((conc, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-academic-black border border-academic-card text-[9px] font-mono text-academic-text-muted">
                    {conc}
                  </span>
                ))}
              </div>
            </div>

            {/* Markdown reading text */}
            <div className="font-sans text-sm text-academic-cream/90 leading-relaxed space-y-6 font-serif select-text selection:bg-academic-gold/20">
              {activeChapterData.content.split('\n\n').map((para, i) => {
                if (para.startsWith('###')) {
                  return (
                    <h3 key={i} className="font-serif text-lg font-bold text-academic-gold pt-3 border-l-2 border-academic-gold pl-3">
                      {para.replace('###', '').trim()}
                    </h3>
                  );
                }
                return (
                  <p key={i} className="whitespace-pre-line">
                    {para}
                  </p>
                );
              })}
            </div>

            {/* Takeaway callout */}
            <div className="p-4 bg-academic-emerald/15 border border-academic-emerald/30 rounded-xl space-y-1 font-serif">
              <h4 className="text-xs font-bold text-academic-cream flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-academic-gold" />
                Key Scholarly Insight
              </h4>
              <p className="text-xs text-academic-cream/80 italic leading-relaxed pt-1 pl-5">
                "{activeChapterData.takeaway}"
              </p>
            </div>

            {/* Complete module button action */}
            <div className="border-t border-academic-card/40 pt-6 flex items-center justify-between">
              <span className="text-xs text-academic-text-muted">
                {completedChapters.includes(currentChapter) 
                  ? '✓ Module already completed' 
                  : 'Complete this block to record progress'}
              </span>

              <button
                onClick={handleCompleteChapter}
                className="px-6 py-2.5 bg-academic-gold hover:bg-academic-gold-muted text-academic-black font-sans font-bold text-xs tracking-wider rounded-lg flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                Mark Chapter Complete
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Academic Key Terms sidebar/footer inside the layout */}
          <div className="bg-academic-paper border border-academic-card p-6 rounded-xl gold-glow">
            <h4 className="font-serif text-xs font-bold uppercase tracking-widest text-academic-gold mb-4 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Tethered Lexicon (Key Terms)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeChapterData.vocab.map((v, i) => (
                <div key={i} className="bg-academic-dark border border-academic-card/50 p-4 rounded-lg">
                  <span className="text-xs font-bold text-academic-cream font-mono">{v.term}</span>
                  <p className="text-[11px] text-academic-text-muted mt-1 leading-relaxed">{v.def}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
