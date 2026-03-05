import React, { useState } from 'react';
import type { Term } from '../../types';
import { ReviewContent } from './ReviewRenderer';

interface ReviewNote {
  back?: string;
  memoryAid?: string;
}

interface FlashcardProps {
  term: Term;
  review?: ReviewNote | null;
}

export const Flashcard: React.FC<FlashcardProps> = ({ term, review = null }) => {
  const [showBack, setShowBack] = useState(false);

  const backContent = review?.back ?? term.definition;
  const memoryAid = review?.memoryAid ?? term.example;

  return (
    <div className="flashcard" onClick={() => setShowBack(!showBack)}>
      <div className="flash-front">{term.term}</div>
      <div className={`flash-back ${showBack ? 'show' : ''}`}>
        {review?.back ? (
          <ReviewContent content={backContent} />
        ) : (
          <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text)' }}>{backContent}</p>
        )}
        {memoryAid && (
          <p style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(148,163,184,0.2)', color: 'var(--text)' }}>
            <strong style={{ color: '#fbbf24', fontSize: '17px' }}>💡 Memory Aid:</strong>
            <br />
            <span style={{ fontStyle: 'italic', color: 'var(--muted)', marginTop: 6, display: 'block', fontSize: '15px', fontWeight: '500' }}>" {memoryAid} "</span>
          </p>
        )}
      </div>
    </div>
  );
};
