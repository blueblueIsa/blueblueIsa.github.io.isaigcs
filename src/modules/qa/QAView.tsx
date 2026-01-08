import React, { useState, useEffect } from 'react';
import { qaData } from '../../data/qa';
import { units } from '../../data/units';
import { QACard } from '../../components/shared/QACard';
import { useSearchParams, useLocation } from 'react-router-dom';
import { parseQAUrl, buildQAPath } from './qaUrl.ts';

export const QAView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const parsed = parseQAUrl(location.pathname, location.search);

  const [selectedUnitId, setSelectedUnitId] = useState<string>(parsed.unit || units[0].id);
  const [selectedTopic, setSelectedTopic] = useState<string>(parsed.topic || '');
  const [keyword, setKeyword] = useState<string>(parsed.q || '');
  const kwOnly: string = parsed.kw || searchParams.get('kw') || '';

  const unitQA = qaData[selectedUnitId] || {};
  const topics = Object.keys(unitQA);
  const hasTopicData = selectedTopic && Array.isArray(unitQA[selectedTopic]) && (unitQA[selectedTopic]!.length > 0);
  const sourceQuestions = hasTopicData ? (unitQA[selectedTopic] || []) : Object.values(unitQA).flat();
  const filteredQuestions = sourceQuestions.filter(q => {
    const k = keyword.trim().toLowerCase();
    const kw = kwOnly.trim().toLowerCase();
    if (kw) {
      const inKeywordsStrict = Array.isArray(q.keywords) && q.keywords.some(w => w.toLowerCase() === kw);
      if (inKeywordsStrict) return true;
      // fallback: fuzzy text match when no strict keywords
      const terms = kw.split(/\s+/).filter(x => x.length > 1);
      const fuzzyQuestionHit = terms.some(t => q.question.toLowerCase().includes(t));
      if (fuzzyQuestionHit) return true;
      return false;
    }
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

  // Sync state when URL (path or search) changes
  useEffect(() => {
    const p = parseQAUrl(location.pathname, location.search);
    if (p.unit && p.unit !== selectedUnitId) {
      setSelectedUnitId(p.unit);
    }
    if ((p.topic || '') !== selectedTopic) {
      setSelectedTopic(p.topic || '');
    }
    if ((p.q || '') !== keyword) {
      setKeyword(p.q || '');
    }
    // kw handled via searchParams
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  // Update browser URL to path-based format when filters change (avoid infinite loops)
  useEffect(() => {
    // build path using path-based format, preserve kw in query
    const target = buildQAPath({ unit: selectedUnitId, topic: (selectedTopic && hasTopicData) ? selectedTopic : undefined, q: keyword || undefined, kw: kwOnly || undefined });
    const current = `${location.pathname}${location.search}`;
    if (current !== target) {
      // use replace to avoid polluting history
      window.history.replaceState({}, '', target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUnitId, selectedTopic, keyword, kwOnly, hasTopicData]);

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
