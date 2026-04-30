import React, { useMemo } from 'react';
import { paperKeyTerms, paper2Comparisons } from '../../data/paperKeyTerms';
import type { PaperKeyTerm, PaperName } from '../../data/paperKeyTerms';

const paperNames: PaperName[] = ['Paper 1', 'Paper 2'];

type ComparisonItem = {
  leftLabel: string;
  leftText: string;
  rightLabel: string;
  rightText: string;
  similarities: string[];
  differences: string[];
};

export const PaperKeyTerms: React.FC = () => {
  const termsByPaper = useMemo(() => {
    const result: Record<PaperName, Record<string, Record<string, PaperKeyTerm[]>>> = {
      'Paper 1': {},
      'Paper 2': {}
    };

    paperKeyTerms.forEach((term) => {
      const unitGroup = result[term.paper];
      if (!unitGroup[term.unit]) {
        unitGroup[term.unit] = {};
      }
      if (!unitGroup[term.unit][term.section]) {
        unitGroup[term.unit][term.section] = [];
      }
      unitGroup[term.unit][term.section].push(term);
    });

    return result;
  }, []);

  return (
    <div className="paper-terms-container">
      <div className="paper-terms-header">
        <h2>Paper 1 & Paper 2 Key Terms</h2>
        <p>
          Key terms definitions aligned with the CIE IGCSE 0478 syllabus and mark scheme keywords.
          Paper 1 and Paper 2 definitions are organised by unit and section for quick review.
        </p>
      </div>

      {paperNames.map((paperName) => (
        <section key={paperName} className="paper-terms-section">
          <h3>{paperName}</h3>
          <div className="paper-terms-notice">
            Definitions are based on official syllabus language and paper keywords.
          </div>

          {Object.entries(termsByPaper[paperName]).map(([unit, sections]) => (
            <div key={unit} className="paper-unit-block">
              <div className="paper-unit-title">{unit}</div>

              {Object.entries(sections).map(([section, terms]) => (
                <div key={section} className="paper-section-block">
                  <div className="paper-section-title">{section}</div>
                  <div className="paper-terms-grid">
                    {terms.map((term) => (
                      <div key={`${paperName}-${unit}-${section}-${term.term}`} className="paper-term-card">
                        <div className="paper-term-name">{term.term}</div>
                        <div className="paper-term-definition">{term.definition}</div>
                        {term.keywords?.length ? (
                          <div className="paper-term-keywords">
                            {term.keywords.map((keyword, idx) => (
                              <span key={idx} className="keyword-pill">{keyword}</span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {paperName === 'Paper 2' && paper2Comparisons[unit] ? (
                <div className="comparison-section">
                  <div className="comparison-title">Unit {unit.replace('Unit ', '')} comparison notes</div>
                  <div className="comparison-grid">
                    {paper2Comparisons[unit].map((item, idx) => (
                      <div key={idx} className="comparison-card">
                        <div className="comparison-card-content">
                          <div className="comparison-item">
                            <div className="comparison-item-label">{item.leftLabel}</div>
                            <div className="comparison-item-text">{item.leftText}</div>
                          </div>
                          <div className="comparison-item">
                            <div className="comparison-item-label">{item.rightLabel}</div>
                            <div className="comparison-item-text">{item.rightText}</div>
                          </div>
                        </div>
                        <div className="comparison-list-section">
                          <div className="comparison-list-block">
                            <div className="comparison-list-heading">Similarities</div>
                            <ul>
                              {item.similarities.map((point, pointIdx) => (
                                <li key={pointIdx}>{point}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="comparison-list-block differences-block">
                            <div className="comparison-list-heading">Differences</div>
                            <ul>
                              {item.differences.map((point, pointIdx) => (
                                <li key={pointIdx}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
};
