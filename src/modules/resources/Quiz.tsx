import React, { useEffect, useMemo, useState } from 'react';
import paper1 from '../../data/papers/25paper1.json';
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
  // load sample paper questions
  const questions: QItem[] = useMemo(() => {
    return (paper1 as any[]).map((q, idx) => ({ ...q, id: q.id || `p1-${idx}` }));
  }, []);

  const [index, setIndex] = useState(0);
  const [revealedMap, setRevealedMap] = useState<Record<string, boolean>>({});

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

  const q = questions[index];
  if (!q) return <div className="quiz">No questions available.</div>;

  const toggleReveal = (id?: string) => {
    const key = id || q.id!;
    setRevealedMap(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // reveal state is stored in revealedMap (no local alias required)

  return (
    <div className="quiz">
      <div className="quiz-header">
        <div className="quiz-meta">Question {index + 1} of {questions.length} • {q.marks || 1} mark{q.marks === 1 ? '' : 's'}</div>
        <div className="quiz-controls">
          <button onClick={() => setIndex(i => Math.max(0, i - 1))} disabled={index === 0}>Prev</button>
          <button onClick={() => setIndex(i => Math.min(questions.length - 1, i + 1))} disabled={index === questions.length - 1}>Next</button>
        </div>
      </div>

      <div className="quiz-body" style={{ marginTop: 12 }}>
        {q.type === 'fill_in' ? (
          <FillInQuestion
            id={q.id!}
            prompt={q.question}
            blanks={q.blanks || []}
            reveal={!!revealedMap[q.id!]}
            onRevealToggle={() => toggleReveal(q.id)}
          />
        ) : (
          <div className="question short-answer">
            <div className="prompt">{q.question}</div>
            <div style={{ marginTop: 8 }}>
              <button onClick={() => toggleReveal(q.id)}>Show answer</button>
            </div>
            {revealedMap[q.id!] && (
              <div className="answer" style={{ marginTop: 8 }}><strong>Answer:</strong> {q.answer}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
