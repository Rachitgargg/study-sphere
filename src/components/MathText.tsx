import React, { useEffect, useState, useRef } from 'react';

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

  return <div ref={containerRef} className={className} />;
};

function parseAndRenderMath(text: string): string {
  console.log('[MathText] parseAndRenderMath input:', text);
  const katex = window.katex;
  console.log('[MathText] KaTeX available in parser:', !!katex);
  
  if (!katex) {
    // If KaTeX is not loaded yet, return standard formatted bold text
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br />');
  }

  let html = text;

  // 1. Process block math $$ ... $$
  const blockRegex = /\$\$\s*([\s\S]*?)\s*\$\$/g;
  html = html.replace(blockRegex, (match, math) => {
    try {
      console.log('[MathText] Rendering block math:', math);
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
    // Prevent empty or whitespace matches
    if (!math.trim()) return match;
    try {
      console.log('[MathText] Rendering inline math:', math);
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
