import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Unique counter to generate unique SVG IDs for mermaid.render
let mermaidIdCounter = 0;

export const Mermaid: React.FC<{ chart: string }> = ({ chart }) => {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);
  const elementId = useRef(`mermaid-chart-${mermaidIdCounter++}`);

  useEffect(() => {
    setError(false);
    setSvg(null);

    // Initialize mermaid with dark academic theme variables
    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
        logLevel: 'error',
        themeVariables: {
          background: '#0D0E15',
          primaryColor: '#1B1E2B',
          primaryTextColor: '#F5F2EB',
          lineColor: '#D4AF37',
          secondaryColor: '#1F1A24',
          tertiaryColor: '#142129'
        }
      });
    } catch (err) {
      console.error('Mermaid initialize failed:', err);
    }

    const renderChart = async () => {
      try {
        const cleanChart = chart.trim();
        const { svg: renderedSvg } = await mermaid.render(elementId.current, cleanChart);
        setSvg(renderedSvg);
      } catch (err) {
        console.error('Mermaid render failed:', err);
        setError(true);
      }
    };

    renderChart();
  }, [chart]);

  if (error) {
    // Graceful fallback to raw code block
    return (
      <pre className="bg-academic-black border border-academic-card p-4 rounded-lg overflow-x-auto text-[10px] text-academic-text-muted font-mono leading-relaxed select-text selection:bg-academic-gold/20">
        <code>{chart}</code>
      </pre>
    );
  }

  if (!svg) {
    return (
      <div className="flex items-center justify-center p-6 bg-academic-black/30 border border-academic-card rounded-lg h-24 text-[10px] font-mono text-academic-text-muted">
        <div className="w-4 h-4 rounded-full border border-academic-gold border-t-transparent animate-spin mr-2" />
        Rendering Diagram Mappings...
      </div>
    );
  }

  return (
    <div 
      className="bg-academic-black border border-academic-card p-4 rounded-lg flex justify-center overflow-x-auto w-full select-none"
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
};
