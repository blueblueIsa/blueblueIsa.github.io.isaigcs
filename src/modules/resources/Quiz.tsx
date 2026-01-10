import React, { useEffect, useMemo, useState } from 'react';
import { units } from '../../data/units';
import { FillInQuestion } from './FillInQuestion';

type QItem = {
  question: string;
  answer?: string;
  type: 'short_answer' | 'fill_in' | string;
  id?: string;
  blanks?: string[];
  marks?: number;
};

const STORAGE_KEY = 'bb_quiz_progress_v1';

export const Quiz: React.FC = () => {
  // load questions derived from unit terms (flattened across units)
  const questions: QItem[] = useMemo(() => {
    return units.flatMap(u => (u.terms || []).map((t, idx) => ({
      id: `${u.id}-${idx}`,
      question: `Define: ${t.term}`,
      answer: t.definition || t.example || '',
      type: 'short_answer' as const,
      marks: 1,
    })));
  }, []);

  const [index, setIndex] = useState(0);
  const [revealedMap, setRevealedMap] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'list' | 'paginated'>('list');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setIndex(parsed.index || 0);
        setRevealedMap(parsed.revealedMap || {});
      }
    } catch (_) { /* ignore */ }
  }, []);

  useEffect(() => {
    const payload = { index, revealedMap };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [index, revealedMap]);

  const toggleReveal = (id?: string) => {
    const key = id || questions[0]?.id!;
    setRevealedMap(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // reveal state is stored in revealedMap

  if (questions.length === 0) return <div className="quiz">No questions available.</div>;

  return (
    <div className="quiz">
      <div className="quiz-header">
        <div className="quiz-meta">{viewMode === 'paginated' ? `Question ${index + 1} of ${questions.length}` : `${questions.length} questions`}</div>
        <div className="quiz-controls">
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setViewMode('list')} aria-pressed={viewMode === 'list'}>List view</button>
            <button onClick={() => setViewMode('paginated')} aria-pressed={viewMode === 'paginated'}>Paginated</button>
          </div>
          {viewMode === 'paginated' && (
            <div style={{ marginLeft: 12 }}>
              <button onClick={() => setIndex(i => Math.max(0, i - 1))} disabled={index === 0}>Prev</button>
              <button onClick={() => setIndex(i => Math.min(questions.length - 1, i + 1))} disabled={index === questions.length - 1}>Next</button>
            </div>
          )}
        </div>
      </div>

      <div className="quiz-body" style={{ marginTop: 12 }}>
        {viewMode === 'list' ? (
          <div className="quiz-list">
            {questions.map(qItem => (
              <div key={qItem.id} className="question short-answer" style={{ marginBottom: 12 }}>
                {qItem.type === 'fill_in' ? (
                  <FillInQuestion
                    id={qItem.id!}
                    prompt={qItem.question}
                    blanks={qItem.blanks || []}
                    reveal={!!revealedMap[qItem.id!]}
                    onRevealToggle={() => setRevealedMap(prev => ({ ...prev, [qItem.id!]: !prev[qItem.id!] }))}
                  />
                ) : (
                  <>
                    <div className="prompt">{qItem.question}</div>
                    <div style={{ marginTop: 8 }}>
                      <button onClick={() => setRevealedMap(prev => ({ ...prev, [qItem.id!]: !prev[qItem.id!] }))}>Show answer</button>
                    </div>
                    {revealedMap[qItem.id!] && (
                      <div className="answer" style={{ marginTop: 8 }}><strong>Answer:</strong> {qItem.answer}</div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          (() => {
            const q = questions[index];
            return q.type === 'fill_in' ? (
              <FillInQuestion
                id={q.id!}
                prompt={q.question}
                blanks={q.blanks || []}
                reveal={!!revealedMap[q.id!]}
                onRevealToggle={() => setRevealedMap(prev => ({ ...prev, [q.id!]: !prev[q.id!] }))}
              />
            ) : (
              <div className="question short-answer">
                <div className="prompt">{q.question}</div>
                <div style={{ marginTop: 8 }}>
                  <button onClick={() => setRevealedMap(prev => ({ ...prev, [q.id!]: !prev[q.id!] }))}>Show answer</button>
                </div>
                {revealedMap[q.id!] && (
                  <div className="answer" style={{ marginTop: 8 }}><strong>Answer:</strong> {q.answer}</div>
                )}
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
};
