import React, { useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { units } from '../../data/units';
import { unitReviews } from '../../data/unitReviews';
import { Flashcard } from '../../components/shared/Flashcard';
import { ReviewContent } from '../../components/shared/ReviewRenderer';
import { Shuffle, BookOpen, Layers } from 'lucide-react';

export const UnitReview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const unit = units.find(u => u.id === id);
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'flashcards'>('flashcards');
  const [flashcardIndex, setFlashcardIndex] = useState(0);

  if (!unit) {
    return <Navigate to={`/unit/${units[0].id}`} replace />;
  }

  const review = unitReviews[unit.id];

  if (!review?.terms) {
    return (
      <div className="content-header">
        <div className="header-main">
          <h1>Magic Rhyme Cards · Unit {unit.number} · {unit.title}</h1>
          <p className="muted">{unit.description}</p>
        </div>
        <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)' }}>
          No Magic Rhyme Cards available for this unit.
        </div>
      </div>
    );
  }

  const reviewTerms = Object.keys(review.terms);
  const currentTerm = reviewTerms[flashcardIndex % reviewTerms.length];

  return (
    <div>
      <div className="content-header">
        <div className="header-main">
          <h1>Magic Rhyme Cards · Unit {unit.number} · {unit.title}</h1>
          <p className="muted">{unit.description}</p>
        </div>

        <div className="filters">
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
            {unit.id === 'cs-3' && (
              <button
                onClick={() => navigate(`/cards/unit/${unit.id}/cpu-cycle`)}
                className="confusions-toggle"
                title="CPU FDE Cycle"
                style={{ fontSize: '13px', padding: '8px 10px' }}
              >
                CPU FDE Cycle
              </button>
            )}
            <button onClick={() => setViewMode('list')} className="confusions-toggle" title="List View">
              <BookOpen size={16} />
            </button>
            <button onClick={() => setViewMode('flashcards')} className="confusions-toggle" title="Flashcards">
              <Layers size={16} />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div style={{ padding: '20px' }}>
          <h2 style={{ marginBottom: 8, color: 'var(--text)', fontSize: '22px', fontWeight: '700' }}>📖 Overview</h2>
          <p style={{ whiteSpace: 'pre-wrap', marginBottom: 32, color: 'var(--muted)', lineHeight: '1.7', fontSize: '14px' }}>
            {review?.overview ?? 'No overview available for this unit.'}
          </p>

          <h3 style={{ marginBottom: 18, color: 'var(--text)', fontSize: '20px', fontWeight: '700', letterSpacing: '0.3px' }}>✨ Magic Rhyme Cards</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '16px'
          }}>
            {Object.entries(review.terms).map(([term, note]) => (
              <div
                key={term}
                style={{
                  border: '1px solid rgba(148,163,184,0.1)',
                  padding: '20px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(16,185,129,0.04) 100%)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(59,130,246,0.15)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,130,246,0.3)';
                  (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(16,185,129,0.08) 100%)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(148,163,184,0.1)';
                  (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(16,185,129,0.04) 100%)';
                }}
              >
                <h4 style={{
                  margin: '0 0 14px 0',
                  color: '#fbbf24',
                  fontSize: '17px',
                  fontWeight: '700'
                }}>
                  {term}
                </h4>
                <ReviewContent content={note.back} />
                {note.memoryAid && (
                  <p style={{
                    marginTop: 14,
                    paddingTop: 14,
                    borderTop: '1px solid rgba(148,163,184,0.2)',
                    fontStyle: 'italic',
                    color: 'var(--muted)',
                    fontWeight: '500',
                    margin: '16px 0 0 0',
                    fontSize: '15px'
                  }}>
                    💡 <strong style={{ color: '#10b981' }}>"{note.memoryAid}"</strong>
                  </p>
                )}                {note.diagram && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(148,163,184,0.2)' }}>
                    <strong style={{ color: '#3b82f6' }}>🧩 Diagram</strong>
                    <pre style={{ whiteSpace: 'pre-wrap', background: 'rgba(243,244,246,0.95)', borderRadius: '8px', padding: '10px', marginTop: 8, fontSize: '13px' }}>
                      {note.diagram}
                    </pre>
                  </div>
                )}
                {note.animation && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(148,163,184,0.2)' }}>
                    <strong style={{ color: '#ec4899' }}>🎬 Animation</strong>
                    <p style={{ margin: '8px 0 0 0' }}>
                      <a href={note.animation} target="_blank" rel="noreferrer" style={{ color: '#ec4899', textDecoration: 'underline' }}>
                        View animation resource
                      </a>
                    </p>
                  </div>
                )}              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flashcards" style={{ padding: '20px' }}>
          {reviewTerms.length > 0 ? (
            <div style={{ maxWidth: '750px', margin: '0 auto', width: '100%' }}>
              <div style={{
                textAlign: 'center',
                marginBottom: 28,
                paddingBottom: 16,
                borderBottom: '1px solid rgba(148,163,184,0.08)'
              }}>
                <div style={{
                  background: 'rgba(59,130,246,0.12)',
                  color: '#3b82f6',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  display: 'inline-block',
                  fontWeight: '600',
                  marginBottom: 12,
                  fontSize: '14px',
                  border: '1px solid rgba(59,130,246,0.2)'
                }}>
                  {flashcardIndex % reviewTerms.length + 1} / {reviewTerms.length}
                </div>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: '14px' }}>
                  Click card to flip • Use buttons to navigate
                </p>
              </div>

              <Flashcard
                term={{ term: currentTerm, topic: 'Review', definition: '' }}
                review={review.terms[currentTerm]}
              />

              <div className="flash-controls" style={{
                justifyContent: 'center',
                marginTop: '28px',
                gap: '12px',
                display: 'flex',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => setFlashcardIndex(Math.max(0, flashcardIndex - 1))}
                  disabled={flashcardIndex === 0}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid rgba(148,163,184,0.1)',
                    background: flashcardIndex === 0 ? 'rgba(148,163,184,0.08)' : 'transparent',
                    color: flashcardIndex === 0 ? 'var(--muted)' : 'var(--text)',
                    cursor: flashcardIndex === 0 ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    fontSize: '14px',
                    opacity: flashcardIndex === 0 ? 0.5 : 1,
                    transition: 'all 0.2s ease'
                  }}
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setFlashcardIndex(flashcardIndex + 1)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid rgba(59,130,246,0.3)',
                    background: 'rgba(59,130,246,0.12)',
                    color: '#3b82f6',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Next →
                </button>
                <button
                  onClick={() => setFlashcardIndex(Math.floor(Math.random() * reviewTerms.length))}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid rgba(16,185,129,0.3)',
                    background: 'rgba(16,185,129,0.12)',
                    color: '#10b981',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Shuffle size={16} />
                  Random
                </button>
              </div>

              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(148,163,184,0.1)',
                    color: 'var(--text)',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                >
                  📖 View All Terms
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
              No review terms available for this unit.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UnitReview;
