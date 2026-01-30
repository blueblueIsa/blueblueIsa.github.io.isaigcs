import React, { useState, useEffect, useRef } from 'react';
import { qaData } from '../../data/qa';
import { units } from '../../data/units';
import { QACard } from '../../components/shared/QACard';
import { useSearchParams, useLocation } from 'react-router-dom';
import { parseQAUrl, buildQAPath } from './qaUrl.ts';
import type { Question } from '../../types';

export const QAView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const parsed = parseQAUrl(location.pathname, location.search);

  const [selectedUnitId, setSelectedUnitId] = useState<string>(parsed.unit || units[0].id);
  const [selectedTopic, setSelectedTopic] = useState<string>(parsed.topic || '');
  const [keyword, setKeyword] = useState<string>(parsed.q || '');
  const kwOnly: string = parsed.kw || searchParams.get('kw') || '';

  // Dev/E2E-only: allow runtime override of QA data via `window.__QA_DATA_OVERRIDE`.
  // Set value like: window.__QA_DATA_OVERRIDE = { 'cs-3': { 'Memory': [ { question: '...', answer: '', keywords: ['...'] } ] } };
  // This override is intentionally restricted to non-production builds to avoid
  // accidental data changes in production environments.
  const effectiveQaData = (import.meta.env.MODE !== 'production' && typeof (globalThis as any).__QA_DATA_OVERRIDE !== 'undefined') ? (globalThis as any).__QA_DATA_OVERRIDE : qaData;
  const unitQA = effectiveQaData[selectedUnitId] || {};
  const topics = Object.keys(unitQA);
  const hasTopicData = selectedTopic && Array.isArray(unitQA[selectedTopic]) && (unitQA[selectedTopic]!.length > 0);
  const sourceQuestions = hasTopicData ? (unitQA[selectedTopic] || []) : Object.values(unitQA).flat();
  const filteredQuestions = sourceQuestions.filter((q: Question) => {
    const k = keyword.trim().toLowerCase();
    const kw = kwOnly.trim().toLowerCase();
    if (kw) {
      const inKeywordsStrict = Array.isArray(q.keywords) && q.keywords.some((w: string) => w.toLowerCase() === kw);
      if (inKeywordsStrict) return true;
      // fallback: fuzzy text match when no strict keywords
      const terms = kw.split(/\s+/).filter(x => x.length > 1);
      const fuzzyQuestionHit = terms.some(t => q.question.toLowerCase().includes(t));
      if (fuzzyQuestionHit) return true;
      return false;
    }
    if (!k) return true;
    const inText = q.question.toLowerCase().includes(k) || q.answer.toLowerCase().includes(k);
    const inKeywords = Array.isArray(q.keywords) && q.keywords.some((w: string) => w.toLowerCase().includes(k));
    return inText || inKeywords;
  });

  useEffect(() => {
    if (import.meta.env.MODE !== 'production') {
      const sample = sourceQuestions.slice(0, 5).map((q: Question) => q.question);
      console.debug('[QAView] selectedUnitId', selectedUnitId, 'keyword', keyword, 'sourceCount', sourceQuestions.length, 'filteredCount', filteredQuestions.length, 'sample', sample);
    }
  }, [selectedUnitId, keyword, sourceQuestions, filteredQuestions]);

  React.useEffect(() => {
    if (selectedTopic && !hasTopicData) {
      setSelectedTopic('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUnitId]);

  // Refs and readiness marker for E2E/tests: set qaReady when the keyword input and
  // the QA list have been rendered. This is a dev/test-only helper and will be
  // present only when not in production.
  const kwRef = useRef<HTMLInputElement | null>(null);
  const qaRef = useRef<HTMLDivElement | null>(null);
  const [qaReady, setQaReady] = useState(false);

  useEffect(() => {
    // If both elements exist and there are questions rendered, mark ready.
    const hasInput = !!kwRef.current;
    const hasCards = !!(qaRef.current && qaRef.current.children && qaRef.current.children.length > 0);
    const ready = hasInput && hasCards;
    if (import.meta.env.MODE !== 'production') {
      if (ready && !qaReady) console.debug('[QAView] QA ready: input and cards attached');
      if (!ready && qaReady) console.debug('[QAView] QA not ready yet');
    }
    setQaReady(ready);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredQuestions.length, keyword, selectedUnitId, selectedTopic]);

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

  // If navigated from a term's "Related Q&A" button (keyword present), scroll to the first matching question
  useEffect(() => {
    if (!keyword) return; // nothing to focus on
    if (!Array.isArray(filteredQuestions) || filteredQuestions.length === 0) return;

    // Wait for DOM to update then find first matching .qa-card and scroll/focus it
    const raf = requestAnimationFrame(() => {
      try {
        const list = Array.from(document.querySelectorAll('.qa-card')) as HTMLElement[];
        if (list.length === 0) return;
        const lower = keyword.trim().toLowerCase();
        let el: HTMLElement | undefined = list.find(l => (l.textContent || '').toLowerCase().includes(lower));
        if (!el) el = list[0];
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // focus so screen readers jump to it
        el.focus();
      } catch (e) { /* swallow DOM errors in non-browser env */ }
    });

    return () => cancelAnimationFrame(raf);
  }, [keyword, filteredQuestions]);

  return (
    <div>
      <div className="content-header">
        <div className="header-main">
          <h1>Past Paper Q&A</h1>
          <p className="muted">Practice with questions from 2023–2025 IGCSE papers.</p>
        </div>

        <div className="filters">
          <input 
            ref={kwRef}
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

      <div
        className="qa"
        ref={qaRef}
        data-testid={import.meta.env.MODE !== 'production' && qaReady ? 'qa-ready' : undefined}
      >
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((q: Question, i: number) => (
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
