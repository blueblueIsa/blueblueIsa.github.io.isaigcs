import React, { useMemo, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { units } from '../../data/units';
import { paperKeyTerms } from '../../data/paperKeyTerms';
import '../../styles/resources.scss';

const highlightDefinition = (definition: string, keywords: string[] = []) => {
  const uniqueKeywords = Array.from(new Set(keywords.filter(Boolean))).sort((a, b) => b.length - a.length);
  if (!uniqueKeywords.length) {
    return definition;
  }

  const pattern = uniqueKeywords.map((keyword) => keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const regex = new RegExp(`\\b(${pattern})\\b`, 'gi');
  const parts = definition.split(regex);

  return parts.map((part, idx) => {
    const matched = uniqueKeywords.find((keyword) => keyword.toLowerCase() === part.toLowerCase());
    return matched ? (
      <mark key={idx} className="definition-highlight">
        {part}
      </mark>
    ) : (
      <span key={idx}>{part}</span>
    );
  });
};

export const UnitPaperTerms: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const unit = units.find((u) => u.id === id);

  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');

  if (!unit) {
    return <Navigate to={`/unit/${units[0].id}`} replace />;
  }

  const unitTerms = useMemo(
    () => paperKeyTerms.filter((term) => term.unit === `Unit ${unit.number}` && term.paper === 'Paper 1'),
    [unit.number]
  );

  const sections = useMemo(() => {
    return Array.from(new Set(unitTerms.map((term) => term.section))).sort();
  }, [unitTerms]);

  const filteredTerms = useMemo(() => {
    const q = search.trim().toLowerCase();
    return unitTerms.filter((term) => {
      const matchesSection = !sectionFilter || term.section === sectionFilter;
      if (!matchesSection) return false;

      if (!q) return true;
      return (
        term.term.toLowerCase().includes(q) ||
        term.definition.toLowerCase().includes(q) ||
        term.section.toLowerCase().includes(q) ||
        term.keywords?.some((keyword) => keyword.toLowerCase().includes(q))
      );
    });
  }, [unitTerms, search, sectionFilter]);

  return (
    <div className="paper-terms-view paper-terms-table-view">
      <div className="content-header">
        <div className="header-main">
          <h1>Unit {unit.number} · {unit.title}</h1>
          <p className="muted">Paper 1 / Paper 2 key terms aligned to syllabus topics and mark scheme keywords.</p>
        </div>

        <div className="filters">
          <input
            type="text"
            placeholder="Search syllabus topic, term, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}>
            <option value="">All syllabus topics</option>
            {sections.map((section) => (
              <option key={section} value={section}>{section}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="paper-terms-container">
        <section className="paper-terms-section">
          {filteredTerms.length === 0 ? (
            <div className="paper-empty-state">
              No matching terms for this filter.
            </div>
          ) : (
            Array.from(
              filteredTerms.reduce((acc, term) => {
                if (!acc.has(term.section)) acc.set(term.section, []);
                acc.get(term.section)!.push(term);
                return acc;
              }, new Map<string, typeof filteredTerms>())
            ).map(([section, terms]) => (
              <div key={section} className="paper-section-block">
                <div className="paper-section-title">{section}</div>
                <table className="paper-terms-table">
                  <thead>
                    <tr>
                      <th>Key Term</th>
                      <th>Definition</th>
                      <th>Keywords</th>
                    </tr>
                  </thead>
                  <tbody>
                    {terms.map((term) => (
                      <tr key={term.term}>
                        <td className="term-cell">{term.term}</td>
                        <td>{highlightDefinition(term.definition, term.keywords)}</td>
                        <td>
                          {term.keywords?.map((keyword, idx) => (
                            <span key={idx} className="keyword-pill">{keyword}</span>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
};
