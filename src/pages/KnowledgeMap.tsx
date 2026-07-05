import React, { useState } from 'react';
import { useStudySphere } from '../context/StudySphereContext';
import { useNavigate } from 'react-router-dom';
import { 
  GitBranch, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const KnowledgeMap: React.FC = () => {
  const { documents, setActiveDoc } = useStudySphere();
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Gather dynamic nodes and links based on the actual list of cataloged documents
  const nodes: { id: string; label: string; type: 'document' | 'concept' }[] = [];
  const links: { source: string; target: string }[] = [];
  const nodeCoords: { [key: string]: { x: number; y: number } } = {};

  const docsList = documents || [];

  docsList.forEach((doc, docIdx) => {
    // Parent document node
    nodes.push({
      id: doc.id,
      label: doc.name,
      type: 'document'
    });

    // Space out parent document nodes in an elliptical pattern on the 500x350 grid
    const docAngle = (docIdx * 2 * Math.PI) / Math.max(docsList.length, 1);
    const docX = 250 + 130 * Math.cos(docAngle);
    const docY = 175 + 75 * Math.sin(docAngle);
    nodeCoords[doc.id] = { x: docX, y: docY };

    // Get concepts associated with this document, default to generic review titles if empty
    const concepts = doc.concepts && doc.concepts.length > 0
      ? doc.concepts
      : ['Abstract Concepts', 'Foundations', 'Methodologies'];

    concepts.forEach((concept, conceptIdx) => {
      // Unique concept node ID keyed to document to support clustering
      const conceptId = `c-${doc.id}-${concept.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

      // Insert concept satellite node
      nodes.push({
        id: conceptId,
        label: concept,
        type: 'concept'
      });

      // Space out child concepts around their parent document node
      const conceptAngle = docAngle + ((conceptIdx + 1) * 2 * Math.PI) / (concepts.length + 1) - Math.PI / 4;
      const conceptX = docX + 45 * Math.cos(conceptAngle);
      const conceptY = docY + 35 * Math.sin(conceptAngle);

      nodeCoords[conceptId] = {
        x: Math.max(30, Math.min(470, conceptX)),
        y: Math.max(30, Math.min(320, conceptY))
      };

      // Add parent-child link
      links.push({
        source: doc.id,
        target: conceptId
      });
    });
  });

  // Cross-link duplicate concepts across different documents to form cross-document paths
  const conceptNodes = nodes.filter(n => n.type === 'concept');
  conceptNodes.forEach((nodeA, idxA) => {
    conceptNodes.forEach((nodeB, idxB) => {
      if (idxA < idxB && nodeA.label.toLowerCase() === nodeB.label.toLowerCase()) {
        links.push({
          source: nodeA.id,
          target: nodeB.id
        });
      }
    });
  });

  const activeNodeId = selectedNode || (nodes[0]?.id || null);
  const activeNodeData = nodes.find(n => n.id === activeNodeId) || nodes[0] || { id: '', label: 'No node selected', type: 'concept' };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId);
  };

  // Helper: Find connected nodes
  const connectedNodeIds = activeNodeId
    ? links
        .filter(l => l.source === activeNodeId || l.target === activeNodeId)
        .map(l => (l.source === activeNodeId ? l.target : l.source))
    : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="font-serif text-3xl font-bold tracking-tight text-academic-cream">
          Concept Knowledge Map
        </h2>
        <p className="text-sm text-academic-text-muted mt-1 font-serif">
          Visualize semantic paths and cross-document mathematical connections.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Map Visual Canvas */}
        <div className="lg:col-span-2 bg-academic-paper border border-academic-card rounded-xl p-4 flex flex-col justify-between h-[480px] relative overflow-hidden gold-glow">
          <div className="absolute top-4 left-4 z-10 flex gap-4 text-[10px] font-mono text-academic-text-muted">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-academic-gold" />
              <span>CODIX (DOC)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-academic-cream border border-academic-card" />
              <span>CONCEPT</span>
            </span>
          </div>

          <div className="absolute top-4 right-4 z-10 text-[10px] font-mono text-academic-gold bg-academic-gold/5 border border-academic-gold/10 rounded px-2 py-0.5 animate-pulse">
            Interactive Topology Map
          </div>

          {/* Interactive SVG Network Graph */}
          <div className="w-full h-full flex items-center justify-center pt-8">
            {nodes.length > 0 ? (
              <svg 
                viewBox="0 0 500 350" 
                className="w-full h-full select-none animate-fade-in"
              >
                <defs>
                  <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* DRAW CONNECTIONS (LINES) */}
                {links.map((link, idx) => {
                  const sCoord = nodeCoords[link.source];
                  const tCoord = nodeCoords[link.target];
                  if (!sCoord || !tCoord) return null;

                  const isHighlight = activeNodeId === link.source || activeNodeId === link.target;
                  return (
                    <line
                      key={idx}
                      x1={sCoord.x}
                      y1={sCoord.y}
                      x2={tCoord.x}
                      y2={tCoord.y}
                      stroke={isHighlight ? '#D4AF37' : '#1B1E2B'}
                      strokeWidth={isHighlight ? '1.5' : '0.8'}
                      strokeDasharray={isHighlight ? '' : '2,2'}
                      className="transition-all duration-300"
                    />
                  );
                })}

                {/* DRAW NODES */}
                {nodes.map((node) => {
                  const coord = nodeCoords[node.id];
                  if (!coord) return null;

                  const isSelected = activeNodeId === node.id;
                  const isAdjacent = connectedNodeIds.includes(node.id);
                  const isDoc = node.type === 'document';

                  let nodeColor = isDoc ? '#D4AF37' : '#8E95A5';
                  let radius = isDoc ? 7 : 4.5;
                  let strokeColor = 'transparent';
                  let strokeWidth = '0';

                  if (isSelected) {
                    strokeColor = '#F5F2EB';
                    strokeWidth = '1.5';
                    radius = isDoc ? 9 : 6.5;
                  } else if (isAdjacent) {
                    strokeColor = '#D4AF37';
                    strokeWidth = '1';
                  }

                  return (
                    <g 
                      key={node.id}
                      onClick={() => handleNodeClick(node.id)}
                      className="cursor-pointer group"
                    >
                      {/* Glow backdrop for selected */}
                      {isSelected && (
                        <circle
                          cx={coord.x}
                          cy={coord.y}
                          r={radius + 12}
                          fill="url(#glow)"
                          className="animate-pulse"
                        />
                      )}

                      {/* Main node dot */}
                      <circle
                        cx={coord.x}
                        cy={coord.y}
                        r={radius}
                        fill={nodeColor}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        className="transition-all duration-200"
                      />

                      {/* Muted tiny label if document or selected */}
                      {(isDoc || isSelected) && (
                        <text
                          x={coord.x}
                          y={coord.y - (radius + 4)}
                          fill={isSelected ? '#F5F2EB' : '#8E95A5'}
                          fontSize="6"
                          fontFamily="monospace"
                          textAnchor="middle"
                          className="transition-colors pointer-events-none tracking-tight"
                        >
                          {node.label.split('.')[0].substring(0, 15)}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            ) : (
              <div className="text-center font-serif space-y-2 text-academic-text-muted my-auto">
                <Sparkles className="w-8 h-8 text-academic-gold mx-auto animate-pulse" />
                <p className="text-xs">No documents indexed in catalog.</p>
              </div>
            )}
          </div>

          <div className="p-3 bg-academic-black/50 rounded-lg text-[10px] font-mono text-academic-text-muted/80 text-center">
            Click any coordinate dot to lock focus and load context abstracts
          </div>
        </div>

        {/* Right Side: Selected Node Detail Summary Card */}
        <div className="space-y-4">
          <div className="bg-academic-paper border border-academic-card p-6 rounded-xl min-h-[320px] flex flex-col justify-between gold-glow animate-fade-in">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-academic-gold/5 border border-academic-gold/20 rounded-lg text-academic-gold">
                  <GitBranch className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="text-[9px] font-mono text-academic-gold tracking-widest uppercase">
                    {activeNodeData.type === 'document' ? 'Bibliography Source' : 'Linguistic Node Concept'}
                  </span>
                  <h3 className="font-serif text-md font-bold text-academic-cream leading-snug">
                    {activeNodeData.label}
                  </h3>
                </div>
              </div>

              <div className="h-px bg-academic-card/50 my-2" />

              <div className="space-y-2 font-serif">
                <span className="text-[10px] font-mono text-academic-text-muted uppercase tracking-wider block">Context Abstract</span>
                {activeNodeData.type === 'document' ? (
                  <p className="text-xs text-academic-cream/80 leading-relaxed italic text-left">
                    "This document contains foundational theories regarding {activeNodeData.label.split('.')[0]}. It has been fully processed and cataloged into {connectedNodeIds.length} concept mappings."
                  </p>
                ) : (
                  <p className="text-xs text-academic-cream/80 leading-relaxed italic text-left">
                    "A critical concept mapped from the study archives. This topic forms the mathematical or semantic backbone of linear optimization and model restraint."
                  </p>
                )}
              </div>

              {/* Connections list */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-mono text-academic-text-muted uppercase tracking-wider block text-left">Connected Nodes</span>
                <div className="flex flex-wrap gap-1.5">
                  {connectedNodeIds.length > 0 ? (
                    connectedNodeIds.map((cId) => {
                      const cNode = nodes.find(n => n.id === cId);
                      if (!cNode) return null;
                      return (
                        <button
                          key={cId}
                          onClick={() => setSelectedNode(cId)}
                          className="px-2 py-0.5 rounded bg-academic-black border border-academic-card/50 hover:border-academic-gold/20 text-[9px] font-mono text-academic-text-muted hover:text-academic-cream transition-colors cursor-pointer"
                        >
                          {cNode.label.split('.')[0].substring(0, 18)}
                        </button>
                      );
                    })
                  ) : (
                    <span className="text-[10px] font-mono text-academic-text-muted italic">No adjacent connections</span>
                  )}
                </div>
              </div>
            </div>

            {/* If node is a document, allow setting as active */}
            {activeNodeData.type === 'document' && (
              <div className="border-t border-academic-card/40 pt-4 mt-6 flex justify-end">
                <button
                  onClick={() => {
                    const matchedDoc = docsList.find(d => d.id === activeNodeData.id || d.name === activeNodeData.label);
                    if (matchedDoc) {
                      setActiveDoc(matchedDoc);
                      navigate('/dashboard');
                    }
                  }}
                  className="px-4 py-2 bg-academic-card hover:bg-academic-gold hover:text-academic-black text-academic-cream border border-academic-card/80 hover:border-transparent rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  Engage Material
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-academic-paper border border-academic-card p-5 rounded-xl gold-glow">
            <h4 className="font-serif text-xs font-bold text-academic-cream uppercase tracking-widest mb-3">
              Knowledge Map Index
            </h4>
            <div className="text-[11px] font-mono text-academic-text-muted space-y-2">
              <div className="flex justify-between">
                <span>Total Nodes:</span>
                <span className="text-academic-cream">{nodes.length} Mapped</span>
              </div>
              <div className="flex justify-between">
                <span>Syllabus Clusters:</span>
                <span className="text-academic-gold">{docsList.length} Sectors</span>
              </div>
              <div className="flex justify-between">
                <span>Cross-doc Links:</span>
                <span className="text-academic-cream">{links.length} Connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
