import React, { useEffect, useState, useRef } from 'react';
import { Mermaid } from './Mermaid';

declare global {
  interface Window {
    katex?: any;
  }
}

interface MathTextProps {
  text: string;
  className?: string;
}

export const MathText: React.FC<MathTextProps> = ({ text, className = '' }) => {
  if (!text) return null;

  // Split text by fenced code blocks so Mermaid and text-based fallback diagrams render cleanly.
  const parts = text.split(/(```[\w-]*[\s\S]*?```)/g);

  return (
    <div className={className}>
      {parts.map((part, idx) => {
        if (part.startsWith('```mermaid') && part.endsWith('```')) {
          const chart = part.replace(/^```mermaid\s*/i, '').replace(/```$/, '').trim();
          return <Mermaid key={idx} chart={chart} />;
        }

        if (part.startsWith('```') && part.endsWith('```')) {
          const codeBlock = part.replace(/^```[\w-]*\s*/i, '').replace(/```$/, '').trim();
          return (
            <pre key={idx} className="my-3 overflow-x-auto rounded-lg border border-academic-card bg-academic-black/80 p-3 text-[11px] leading-relaxed text-academic-cream/90 whitespace-pre-wrap font-mono">
              <code>{codeBlock}</code>
            </pre>
          );
        }
        
        // Otherwise render standard math text
        return <MathTextInner key={idx} text={part} />;
      })}
    </div>
  );
};

const MathTextInner: React.FC<{ text: string }> = ({ text }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [katexAvailable, setKatexAvailable] = useState(!!window.katex);

  useEffect(() => {
    if (window.katex) {
      setKatexAvailable(true);
      return;
    }

    // Poll to check if KaTeX becomes available
    const interval = setInterval(() => {
      if (window.katex) {
        setKatexAvailable(true);
        console.log('[MathText] KaTeX detected via polling!');
        clearInterval(interval);
      }
    }, 100);

    // Timeout after 5 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = parseAndRenderMath(text);
    }
  }, [text, katexAvailable]);

  return <div ref={containerRef} className="inline" />;
};

function parseAndRenderMath(text: string): string {
  const katex = window.katex;
  
  if (!katex) {
    // If KaTeX is not loaded yet, return standard formatted bold text
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br />');
  }

  let html = text;

  // Normalize delimiters to simplify regex matching:
  // Convert \[ ... \] to $$ ... $$ (block math)
  html = html.replace(/\\\[\s*([\s\S]*?)\s*\\\]/g, '$$$$$1$$$$');
  html = html.replace(/\\\\\[\s*([\s\S]*?)\s*\\\\\]/g, '$$$$$1$$$$');
  
  // Convert \( ... \) to $ ... $ (inline math)
  html = html.replace(/\\\(\s*([\s\S]*?)\s*\\\)/g, '$$$1$$');
  html = html.replace(/\\\\\(\s*([\s\S]*?)\s*\\\\\)/g, '$$$1$$');

  // If the entire text contains LaTeX math commands but no math delimiters,
  // wrap it in block delimiters so that raw formulas are rendered.
  const hasLaTeXCommands = /\\(mathbf|mathcal|frac|sum|left|right|lambda|alpha|beta|theta|gamma|sigma|mu|partial|nabla|vec|det|sin|cos|tan|log|ln|infty|cdot|times)/.test(html);
  const hasDelimiters = html.includes('$');
  
  if (hasLaTeXCommands && !hasDelimiters) {
    html = `$$${html}$$`;
  }

  // 1. Process block math $$ ... $$
  const blockRegex = /\$\$\s*([\s\S]*?)\s*\$\$/g;
  html = html.replace(blockRegex, (match, math) => {
    try {
      const rendered = katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
      return `<div class="katex-display-container my-3 overflow-x-auto w-full flex justify-center">${rendered}</div>`;
    } catch (err) {
      console.error('KaTeX block error:', err);
      return match;
    }
  });

  // 2. Process inline math $ ... $
  const inlineRegex = /\$\s*([\s\S]*?)\s*\$/g;
  html = html.replace(inlineRegex, (match, math) => {
    if (!math.trim()) return match;
    try {
      return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
    } catch (err) {
      console.error('KaTeX inline error:', err);
      return match;
    }
  });

  // 3. Format Markdown bold tags **text** -> <strong>text</strong>
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  return html;
}
