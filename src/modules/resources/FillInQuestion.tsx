import React from 'react';

interface FillInProps {
  id: string;
  prompt: string;
  blanks: string[]; // correct answers
  reveal: boolean;
  onRevealToggle: () => void;
}

export const FillInQuestion: React.FC<FillInProps> = ({ id, prompt, blanks, reveal, onRevealToggle }) => {
  return (
    <div className="question fill-in" aria-describedby={`q-${id}`}>
      <div className="prompt" id={`q-${id}`}>{prompt}</div>
      <div className="blanks" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
        {blanks.map((b, i) => (
          <div
            key={i}
            className={`blank ${reveal ? 'revealed' : ''}`}
            role="button"
            aria-label={`Blank ${i + 1} of ${blanks.length}`}
            aria-pressed={reveal}
            tabIndex={0}
            onClick={onRevealToggle}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRevealToggle(); } }}
          >
            {reveal ? <span className="answer">{b}</span> : <span className="placeholder">&nbsp;____&nbsp;</span>}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10 }}>
        <button
          className="reveal-btn"
          onClick={onRevealToggle}
          aria-controls={`q-${id}`}
          aria-expanded={reveal}
        >
          {reveal ? 'Hide answers' : 'Show answers'}
        </button>
      </div>
    </div>
  );
};
