import React from 'react';
import type { Term } from '../../types';

interface TermCardProps {
  term: Term;
  onViewQA?: (keyword: string) => void;
}

export const TermCard: React.FC<TermCardProps> = ({ term, onViewQA }) => {
  return (
    <div className="term-card">
      <h3 className="term-title">{term.term}</h3>
      <p className="term-def">{term.definition}</p>
      
      {term.example && (
        <pre className="qa-code" style={{ marginTop: 8 }}><code>{String(term.example)}</code></pre>
      )}
      
      {term.misconception && (
        <div className="detail" style={{ color: '#b91c1c' }}>
          <span className="detail-label">⚠️ </span>
          {term.misconception}
        </div>
      )}
      
      {term.contrast && (
        <div className="detail" style={{ color: '#047857' }}>
          <span className="detail-label">⚡ </span>
          {term.contrast}
        </div>
      )}
      
      <div className="detail" style={{ fontSize: '11px', marginTop: '8px', opacity: 0.6 }}>
        {term.topic}
      </div>
      {onViewQA && (
        <div style={{ marginTop: 10 }}>
          <button
            className="confusions-toggle"
            data-term={term.term}
            data-testid={`related-qa-${term.term.replace(/\s+/g, '-').toLowerCase()}`}
            aria-label={`Related Q and A for ${term.term}`}
            onClick={(e) => {
              try { (e.currentTarget as HTMLElement).setAttribute('data-clicked', '1'); } catch (err) {}
              onViewQA(term.term);
            }}
          >
            Related Q&A
          </button>
        </div>
      )}
    </div>
  );
};
