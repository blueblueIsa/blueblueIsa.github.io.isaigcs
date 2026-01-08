const React = require('react');
const { useState, useEffect } = React;
const paper = require('../../data/papers/25paper1.json');

const STORAGE_KEY = 'bb_quiz_progress_v1';

function TestQuiz() {
  const questions = paper.map((q, idx) => ({ ...q, id: q.id || `p1-${idx}` }));
  const [index, setIndex] = useState(0);
  const [revealedMap, setRevealedMap] = useState({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setIndex(parsed.index || 0);
        setRevealedMap(parsed.revealedMap || {});
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ index, revealedMap })); } catch (_) {}
  }, [index, revealedMap]);

  const q = questions[index];
  const reveal = !!revealedMap[q.id];
  const toggleReveal = () => setRevealedMap(prev => ({ ...prev, [q.id]: !prev[q.id] }));

  return React.createElement('div', { className: 'quiz' }, [
    React.createElement('div', { key: 'meta' }, `Question ${index + 1} of ${questions.length}`),
    React.createElement('div', { key: 'controls' }, [
      React.createElement('button', { key: 'prev', onClick: () => setIndex(i => Math.max(0, i - 1)), 'aria-label': 'Prev' }, 'Prev'),
      React.createElement('button', { key: 'next', onClick: () => setIndex(i => Math.min(questions.length - 1, i + 1)), 'aria-label': 'Next' }, 'Next')
    ]),
    React.createElement('div', { key: 'body' }, (
      q.type === 'fill_in'
        ? React.createElement('div', { key: 'fill' }, [
            React.createElement('div', { key: 'prompt' }, q.question),
            React.createElement('div', { key: 'blanks' }, q.blanks.map((b, i) => React.createElement('button', {
              key: i,
              role: 'button',
              'aria-label': `Blank ${i + 1} of ${q.blanks.length}`,
              onClick: toggleReveal,
              onKeyDown: (e) => { if (e && (e.key === 'Enter' || e.key === ' ')) toggleReveal(); }
            }, reveal ? b : '____'))),
            React.createElement('button', { key: 'reveal', onClick: toggleReveal, 'aria-expanded': reveal }, reveal ? 'Hide answers' : 'Show answers')
          ])
        : React.createElement('div', { key: 'short' }, [
            React.createElement('div', { key: 'prompt' }, q.question),
            React.createElement('button', { key: 'reveal', onClick: toggleReveal, 'aria-expanded': reveal }, reveal ? 'Hide answer' : 'Show answer'),
            reveal && React.createElement('div', { key: 'a' }, `Answer: ${q.answer}`)
          ])
    ))
  ]);
}

module.exports = { TestQuiz };
