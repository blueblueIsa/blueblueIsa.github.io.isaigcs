import React, { useState, useEffect } from 'react';
import { qaData } from '../../data/qa';
import { units } from '../../data/units';
import { QACard } from '../../components/shared/QACard';
import { useSearchParams } from 'react-router-dom';

export const QAView: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedUnitId, setSelectedUnitId] = useState<string>(searchParams.get('unit') || units[0].id);
  const [selectedTopic, setSelectedTopic] = useState<string>(searchParams.get('topic') || '');
  const [keyword, setKeyword] = useState<string>(searchParams.get('q') || '');

  const unitQA = qaData[selectedUnitId] || {};
  const topics = Object.keys(unitQA);
  const hasTopicData = selectedTopic && Array.isArray(unitQA[selectedTopic]) && (unitQA[selectedTopic]!.length > 0);
  const sourceQuestions = hasTopicData ? (unitQA[selectedTopic] || []) : Object.values(unitQA).flat();
  const filteredQuestions = sourceQuestions.filter(q => {
    const k = keyword.trim().toLowerCase();
    if (!k) return true;
    const inText = q.question.toLowerCase().includes(k) || q.answer.toLowerCase().includes(k);
    const inKeywords = Array.isArray(q.keywords) && q.keywords.some(w => w.toLowerCase().includes(k));
    return inText || inKeywords;
  });

  React.useEffect(() => {
    if (selectedTopic && !hasTopicData) {
      setSelectedTopic('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUnitId]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('unit', selectedUnitId);
    if (selectedTopic && hasTopicData) params.set('topic', selectedTopic);
    if (keyword) params.set('q', keyword);
    setSearchParams(params, { replace: true });
  }, [selectedUnitId, selectedTopic, keyword, setSearchParams, hasTopicData]);

  return (
    <div>
      <div className="content-header">
        <div className="header-main">
          <h1>Past Paper Q&A</h1>
          <p className="muted">Practice with questions from 2023–2025 IGCSE papers.</p>
        </div>

        <div className="filters">
          <input 
            type="text"
            placeholder="Keyword..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />
          <select 
            value={selectedUnitId} 
            onChange={e => {
              setSelectedUnitId(e.target.value);
              setSelectedTopic('');
              setKeyword('');
            }}
          >
            {units.map(u => (
              <option key={u.id} value={u.id}>Unit {u.number}: {u.title}</option>
            ))}
          </select>

          <select 
            value={selectedTopic} 
            onChange={e => setSelectedTopic(e.target.value)}
            disabled={topics.length === 0}
          >
            <option value="">All Topics</option>
            {topics.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="qa">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((q, i) => (
            <QACard key={i} question={q} />
          ))
        ) : (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
            No questions available for this selection yet.
          </div>
        )}
      </div>
    </div>
  );
};
