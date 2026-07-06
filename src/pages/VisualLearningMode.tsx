import React, { useState } from 'react';
import { useStudySphere } from '../context/StudySphereContext';
import { useNavigate } from 'react-router-dom';
import { MathText } from '../components/MathText';
import { sendChatMessage } from '../lib/api';
import { 
  ArrowLeft, 
  Network,
  Info
} from 'lucide-react';

export const VisualLearningMode: React.FC = () => {
  const { activeDoc, visualLearning, setVisualLearning } = useStudySphere();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const docName = activeDoc ? activeDoc.name : 'No active document';

  const handleGenerate = async () => {
    if (!activeDoc) return;
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const prompt = (
        `Generate a detailed visual learning artifact for the active document that includes one or more of the following: ` +
        `a Mermaid diagram, a text flowchart, a concept map, a process diagram, a timeline, a hierarchy diagram, ` +
        `a decision tree, or a comparison table. Prefer Mermaid for node-link structures and use a fenced text or ascii block ` +
        `for fallback flowcharts when Mermaid is not appropriate. Keep the output educational, concise, and directly tied to the document context.`
      );
      const result = await sendChatMessage(prompt, 'visual_learning', activeDoc?.name);
      if (result.answer) {
        setVisualLearning(result.answer);
      } else {
        setGenerationError('Failed to generate visual mappings from context. Try again.');
      }
    } catch (err: any) {
      console.error('[VisualLearningMode] generate error:', err);
      setGenerationError(err.message || 'System connection failure. Check backend server.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-academic-card/40 pb-4">
        <button
          onClick={() => navigate('/study-modes')}
          className="flex items-center gap-1.5 text-xs text-academic-text-muted hover:text-academic-cream font-mono transition-colors border-0 bg-transparent cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Hub
        </button>

        <span className="text-[10px] font-mono bg-academic-card px-3 py-1 rounded text-academic-gold border border-academic-gold/15 flex items-center gap-1">
          <Network className="w-3.5 h-3.5" />
          Visual Learning Mode Active
        </span>
      </div>

      {/* Info Banner */}
      <div className="bg-indigo-950/20 border border-indigo-500/20 p-4 rounded-xl flex items-start gap-3 text-xs text-indigo-300 font-sans">
        <Info className="w-4.5 h-4.5 text-indigo-400 mt-0.5 flex-shrink-0" />
        <span>
          <strong>Visual Learning Mode:</strong> Visual Learning explains concepts using diagrams, flowcharts and structured visual representations.
        </span>
      </div>

      {isGenerating ? (
        <div className="bg-academic-paper border border-academic-card p-8 rounded-xl min-h-[350px] flex flex-col items-center justify-center text-center space-y-4 font-serif gold-glow">
          <div className="w-12 h-12 rounded-full border-2 border-academic-gold border-t-transparent animate-spin mx-auto" />
          <h3 className="font-serif text-lg font-bold text-academic-cream">Compiling Diagrams & Graphs...</h3>
          <p className="text-xs text-academic-text-muted max-w-xs mx-auto leading-relaxed font-sans">
            StudySphere AI is running layout indexers to draw semantic paths and flowchart entities.
          </p>
        </div>
      ) : visualLearning ? (
        <div className="bg-academic-paper border border-academic-card p-6 md:p-8 rounded-xl min-h-[400px] gold-glow animate-fade-in space-y-6">
          <div>
            <h3 className="font-serif text-lg font-bold text-academic-cream">Linguistic Diagram Mapping</h3>
            <p className="text-[10px] font-mono text-academic-text-muted mt-0.5">COMPILED RELATIONSHIP SCHEMATIC</p>
            <div className="h-px bg-academic-card/50 my-3" />
          </div>
          
          <div className="font-sans text-xs md:text-sm text-academic-cream/90 leading-relaxed space-y-4 select-text selection:bg-academic-gold/20">
            <MathText text={visualLearning} className="w-full inline-block" />
          </div>

          <div className="border-t border-academic-card/40 pt-4 flex justify-between">
            <span className="text-[10px] font-mono text-academic-text-muted italic">
              Source: {docName}
            </span>
            {activeDoc && (
              <button
                onClick={handleGenerate}
                className="px-4 py-2 bg-academic-card hover:bg-academic-gold hover:text-academic-black text-academic-cream border border-academic-card/85 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer"
              >
                Regenerate Diagram
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Render Placeholder */
        <div className="bg-academic-paper border border-academic-card p-8 rounded-xl min-h-[350px] flex flex-col items-center justify-center text-center space-y-6 gold-glow">
          <div className="w-16 h-16 rounded-full bg-academic-card border border-academic-gold/30 flex items-center justify-center mx-auto shadow-lg text-academic-gold">
            <Network className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif text-xl font-bold text-academic-cream">No visual diagram generated.</h3>
            <p className="text-xs text-academic-text-muted font-serif max-w-sm mx-auto leading-relaxed">
              Compile process flows, concept maps, or timelines directly from your active course syllabus.
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
              Generate Diagrams
            </button>
          ) : (
            <p className="text-xs text-academic-text-muted italic">
              Select an active document to map visual diagrams.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
