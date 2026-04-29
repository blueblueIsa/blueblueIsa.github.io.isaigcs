import React, { useState } from 'react';
import type { Term } from '../../types';
import { ReviewContent } from './ReviewRenderer';

interface ReviewNote {
  back?: string;
  memoryAid?: string;
  diagram?: string;
  animation?: string;
}

interface FlashcardProps {
  term: Term;
  review?: ReviewNote | null;
}

const ReviewAnimation: React.FC<{ type: string }> = ({ type }) => {
  if (type === 'fde-cycle') {
    return (
      <div className="review-animation fde-cycle">
        <div className="phase-box">Fetch</div>
        <div className="phase-box">Decode</div>
        <div className="phase-box">Execute</div>
        <div className="phase-bar" />
        <p className="review-animation-text">Fetch → Decode → Execute repeats in CPU control cycle.</p>
      </div>
    );
  }

  if (type === 'dns-resolution') {
    return (
      <div className="review-animation dns-resolution">
        <div className="dns-path">URL → Resolver → Root → TLD → Auth DNS → IP</div>
        <div className="dns-dot" />
        <p className="review-animation-text">DNS Request flow from browser to authoritatives and back.</p>
      </div>
    );
  }

  if (type === 'phasing-process') {
    return (
      <div className="review-animation phasing-process">
        <div className="phase-pill">Fetch</div>
        <div className="phase-pill">Decode</div>
        <div className="phase-pill">Execute</div>
        <p className="review-animation-text">CPU phasing shows sequential stage transitions.</p>
      </div>
    );
  }

  return <p className="review-animation-text">No animation available.</p>;
};

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
        )}        {review?.diagram && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(148,163,184,0.2)' }}>
            <strong style={{ color: '#3b82f6', fontSize: '16px' }}>🧩 Diagram:</strong>
            <pre style={{ marginTop: 8, whiteSpace: 'pre-wrap', background: 'rgba(243,244,246,0.95)', borderRadius: '8px', padding: '10px', fontSize: '13px', color: 'var(--text)' }}>
              {review.diagram}
            </pre>
          </div>
        )}
        {review?.animation && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(148,163,184,0.2)' }}>
            <strong style={{ color: '#ec4899', fontSize: '16px' }}>🎬 Animation:</strong>
            <div style={{ marginTop: 10 }}>
              <ReviewAnimation type={review.animation} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
