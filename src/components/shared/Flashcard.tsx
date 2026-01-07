import React, { useState } from 'react';
import type { Term } from '../../types';

interface FlashcardProps {
  term: Term;
}

export const Flashcard: React.FC<FlashcardProps> = ({ term }) => {
  const [showBack, setShowBack] = useState(false);

  return (
    <div className="flashcard" onClick={() => setShowBack(!showBack)}>
      <div className="flash-front">{term.term}</div>
      <div className={`flash-back ${showBack ? 'show' : ''}`}>
        <p>{term.definition}</p>
        {term.example && <p><strong>Ex:</strong> {term.example}</p>}
      </div>
    </div>
  );
};
