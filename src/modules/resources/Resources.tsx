import React, { useState } from 'react';
import { Quiz } from './Quiz';
import { units } from '../../data/units';
import '../../styles/resources.scss';

export const Resources: React.FC = () => {
  const [viewMode, setViewMode] = useState<'definitions' | 'quiz'>('definitions');
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

  const toggleUnitExpanded = (unitId: string) => {
    const newExpanded = new Set(expandedUnits);
    if (newExpanded.has(unitId)) {
      newExpanded.delete(unitId);
    } else {
      newExpanded.add(unitId);
    }
    setExpandedUnits(newExpanded);
  };

  const expandAllUnits = () => {
    setExpandedUnits(new Set(units.map((u) => u.id)));
  };

  const collapseAllUnits = () => {
    setExpandedUnits(new Set());
  };

  return (
    <div className="resources-container">
      <h1 style={{ marginTop: 0 }}>Resources</h1>

      <div className="resources-tabs">
        <button
          className={`tab-btn ${viewMode === 'definitions' ? 'active' : ''}`}
          onClick={() => setViewMode('definitions')}
        >
          Definitions by Unit
        </button>
        <button className={`tab-btn ${viewMode === 'quiz' ? 'active' : ''}`} onClick={() => setViewMode('quiz')}>
          Interactive Quiz
        </button>
      </div>

      {viewMode === 'definitions' ? (
        <div className="definitions-view">
          <div className="definitions-controls">
            <button className="btn-secondary" onClick={expandAllUnits}>
              Expand All
            </button>
            <button className="btn-secondary" onClick={collapseAllUnits}>
              Collapse All
            </button>
          </div>

          <div className="definitions-list">
            {units.map((unit) => (
              <div key={unit.id} className="unit-section">
                <button
                  className="unit-header"
                  onClick={() => toggleUnitExpanded(unit.id)}
                >
                  <span className="unit-number">{unit.number}</span>
                  <div className="unit-info">
                    <h3>{unit.title}</h3>
                    <p className="unit-group">{unit.group}</p>
                  </div>
                  <span className="term-count">{unit.terms?.length || 0} terms</span>
                  <span className={`expand-icon ${expandedUnits.has(unit.id) ? 'expanded' : ''}`}>
                    ▼
                  </span>
                </button>

                {expandedUnits.has(unit.id) && unit.terms && (
                  <div className="unit-content">
                    {/* Group terms by topic */}
                    {(() => {
                      const topicGroups: Record<string, typeof unit.terms> = {};
                      unit.terms.forEach((term) => {
                        const topic = term.topic || 'General';
                        if (!topicGroups[topic]) {
                          topicGroups[topic] = [];
                        }
                        topicGroups[topic].push(term);
                      });

                      return Object.entries(topicGroups).map(([topic, topicTerms]) => (
                        <div key={topic} className="topic-group">
                          <h4 className="topic-title">{topic}</h4>
                          <div className="terms-grid">
                            {topicTerms.map((term, idx) => (
                              <div key={idx} className="term-card">
                                <div className="term-name">{term.term}</div>
                                <div className="term-definition">{term.definition}</div>
                                {term.example && (
                                  <div className="term-example">
                                    <strong>Example:</strong> {term.example}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="quiz-view">
          <p className="quiz-intro">Try the interactive quiz area — practice short-answer questions derived from all units.</p>
          <React.Suspense fallback={<div>Loading quiz…</div>}>
            <Quiz />
          </React.Suspense>
        </div>
      )}
    </div>
  );
};
