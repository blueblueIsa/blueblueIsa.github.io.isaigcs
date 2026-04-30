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
      <mark key={idx} className="definition-highlight comparison-highlight">
        {part}
      </mark>
    ) : (
      <span key={idx}>{part}</span>
    );
  });
};

const renderDefinitionText = (text: string, keywords: string[] = []) => {
  const fragments = text
    .split(';')
    .map((fragment) => fragment.trim())
    .filter(Boolean);

  if (fragments.length <= 1) {
    return <p>{highlightDefinition(text, keywords)}</p>;
  }

  return (
    <ul className="paper-definition-sublist">
      {fragments.map((fragment, idx) => (
        <li key={idx}>{highlightDefinition(fragment, keywords)}</li>
      ))}
    </ul>
  );
};

const renderComparisonText = (text: string, keywords: string[] = []) => {
  const fragments = text
    .split(';')
    .map((fragment) => fragment.trim())
    .filter(Boolean);

  if (fragments.length <= 1) {
    return <p>{highlightDefinition(text, keywords)}</p>;
  }

  return (
    <ul className="comparison-sublist">
      {fragments.map((fragment, idx) => (
        <li key={idx}>{highlightDefinition(fragment, keywords)}</li>
      ))}
    </ul>
  );
};

const unitComparisons: Record<
  number,
  Array<{
    leftLabel: string;
    leftText: string;
    rightLabel: string;
    rightText: string;
    similarities: string[];
    differences: string[];
  }>
> = {
  1: [
    {
      leftLabel: 'Binary',
      leftText: 'Base-2 number system using 0 and 1; longer but simple for digital circuits.',
      rightLabel: 'Hexadecimal',
      rightText: 'Base-16 system using 0–9 and A–F; shorter representation because 1 hex digit = 4 bits.',
      similarities: [
        'Both are positional number systems used to represent data in computing.',
        'Both are common in digital systems and data encoding.',
      ],
      differences: [
        'Binary uses only 0 and 1; hexadecimal uses 16 symbols (0–9, A–F).',
        'Binary representation is longer; hexadecimal is more compact.',
      ],
    },
    {
      leftLabel: 'ASCII',
      leftText: 'A 7-bit or 8-bit character set with limited symbols; common for English text.',
      rightLabel: 'Unicode',
      rightText: 'A larger character set supporting many languages and emojis; uses more storage.',
      similarities: [
        'Both are character encoding schemes mapping characters to binary codes.',
        'Both are used to store and transmit text data.',
      ],
      differences: [
        'ASCII supports only English characters and basic symbols.',
        'Unicode supports many languages, scripts, and emojis.',
      ],
    },
    {
      leftLabel: 'Lossy compression',
      leftText: 'Permanently removes data; cannot perfectly reconstruct the original.',
      rightLabel: 'Lossless compression',
      rightText: 'Reduces file size without losing data; original can be perfectly reconstructed.',
      similarities: [
        'Both reduce file size for storage or transmission.',
        'Both aim to make data more efficient to use.',
      ],
      differences: [
        'Lossy removes information and cannot restore the exact original.',
        'Lossless preserves all original data exactly.',
      ],
    },
  ],
  2: [
    {
      leftLabel: 'Serial transmission',
      leftText: 'Sends bits one at a time along a single wire; suitable for long distances.',
      rightLabel: 'Parallel transmission',
      rightText: 'Sends multiple bits at once along multiple wires; faster but best over short distances.',
      similarities: [
        'Both are methods of transmitting digital data between devices.',
        'Both require synchronization and error checking.',
      ],
      differences: [
        'Serial uses a single channel; parallel uses multiple channels.',
        'Parallel is faster over short distances but suffers from skew and interference.',
      ],
    },
    {
      leftLabel: 'Symmetric encryption',
      leftText: 'Uses one shared key for encryption and decryption; key must be kept secret.',
      rightLabel: 'Asymmetric encryption',
      rightText: 'Uses a public/private key pair; public key is shared while the private key remains secret.',
      similarities: [
        'Both scramble data to protect confidentiality.',
        'Both rely on keys to encrypt and decrypt information.',
      ],
      differences: [
        'Symmetric uses the same key for both encryption and decryption.',
        'Asymmetric uses different public and private keys.',
      ],
    },
  ],
  3: [
    {
      leftLabel: 'RAM',
      leftText: 'Volatile primary storage used for currently running programs and data; read/write.',
      rightLabel: 'ROM',
      rightText: 'Non-volatile primary storage used for permanent instructions such as firmware; usually read-only.',
      similarities: [
        'Both are types of primary memory directly accessed by the CPU.',
        'Both store data used by the computer during operation.',
      ],
      differences: [
        'RAM is volatile and loses data when power is off.',
        'ROM is non-volatile and keeps data when power is off.',
      ],
    },
    {
      leftLabel: 'CPU',
      leftText: 'Processes instructions and data using the fetch-decode-execute cycle.',
      rightLabel: 'Embedded system',
      rightText: 'A dedicated computer system built into a larger device for a specific task.',
      similarities: [
        'Both involve computing hardware and control of operations.',
        'Both can process instructions and run programs.',
      ],
      differences: [
        'A CPU is a general-purpose processor in a computer.',
        'An embedded system is designed for a single dedicated function.',
      ],
    },
  ],
  4: [
    {
      leftLabel: 'High-level language',
      leftText: 'Uses English-like statements, is portable and easier to debug.',
      rightLabel: 'Low-level language',
      rightText: 'Closer to machine code, often machine-dependent and more memory efficient.',
      similarities: [
        'Both are programming languages used to write software.',
        'Both are translated into machine code for the CPU to execute.',
      ],
      differences: [
        'High-level languages are easier to read and portable across systems.',
        'Low-level languages are closer to machine code and more hardware-specific.',
      ],
    },
    {
      leftLabel: 'Compiler',
      leftText: 'Translates whole code at once and produces an executable file.',
      rightLabel: 'Interpreter',
      rightText: 'Translates and executes code line by line, stopping at the first error.',
      similarities: [
        'Both translate programmer-written code into a form the computer can run.',
        'Both help find errors during program development.',
      ],
      differences: [
        'Compiler translates the entire program before running it.',
        'Interpreter translates and runs code one line at a time.',
      ],
    },
  ],
  5: [
    {
      leftLabel: 'Internet',
      leftText: 'The global network of interconnected computers and infrastructure.',
      rightLabel: 'World Wide Web',
      rightText: 'A collection of websites and web pages accessed over the internet.',
      similarities: [
        'Both are used to access information and services online.',
        'Both rely on networking protocols to communicate.',
      ],
      differences: [
        'The internet is the physical network infrastructure.',
        'The World Wide Web is a service that runs over the internet.',
      ],
    },
    {
      leftLabel: 'Session cookie',
      leftText: 'Temporary cookie stored in RAM and deleted when the browser closes.',
      rightLabel: 'Persistent cookie',
      rightText: 'Stored on secondary storage and remains until it expires or is deleted.',
      similarities: [
        'Both are cookies used by websites to store information about the user.',
        'Both help improve browsing by remembering data between requests.',
      ],
      differences: [
        'Session cookies are temporary and removed when the browser closes.',
        'Persistent cookies remain on disk until they expire or are deleted.',
      ],
    },
  ],
  6: [
    {
      leftLabel: 'Robot',
      leftText: 'A programmable machine with mechanical structure and actuators.',
      rightLabel: 'Automated system',
      rightText: 'A system that operates without continuous human intervention; may not have moving parts.',
      similarities: [
        'Both can operate automatically based on sensors or programmed rules.',
        'Both use computing logic to make decisions.',
      ],
      differences: [
        'A robot usually has mechanical movement and physical parts.',
        'An automated system may be software-based and not move physically.',
      ],
    },
    {
      leftLabel: 'Artificial Intelligence (AI)',
      leftText: 'Simulation of intelligent behaviour with the ability to learn and adapt.',
      rightLabel: 'Machine learning',
      rightText: 'A type of AI that adapts processes or data automatically based on experience.',
      similarities: [
        'Both involve making computers behave in intelligent ways.',
        'Both use data and rules to make decisions.',
      ],
      differences: [
        'AI is a broad field covering many intelligent techniques.',
        'Machine learning is a specific approach where systems learn from data.',
      ],
    },
  ],
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

  const comparisons = unitComparisons[unit.number] ?? [];

  return (
    <div className="paper-terms-view paper-terms-table-view">
      <div className="content-header">
        <div className="header-main">
          <h1>Unit {unit.number} · {unit.title}</h1>
          <p className="muted">Key terms aligned to syllabus topics and mark scheme keywords.</p>
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
                        <td>{renderDefinitionText(term.definition, term.keywords)}</td>
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

        {comparisons.length > 0 && (
          <div className="comparison-section">
            <h2 className="comparison-title">Key Term Comparisons</h2>
            <div className="comparison-grid">
              {comparisons.map((comparison, idx) => (
                <div key={idx} className="comparison-card">
                  <div className="comparison-card-content">
                    <div className="comparison-item">
                      <div className="comparison-item-label">{comparison.leftLabel}</div>
                      <div className="comparison-item-text">
                        {renderComparisonText(comparison.leftText, [comparison.leftLabel, comparison.rightLabel])}
                      </div>
                    </div>
                    <div className="comparison-item">
                      <div className="comparison-item-label">{comparison.rightLabel}</div>
                      <div className="comparison-item-text">
                        {renderComparisonText(comparison.rightText, [comparison.leftLabel, comparison.rightLabel])}
                      </div>
                    </div>
                  </div>
                  <div className="comparison-list-section">
                    <div className="comparison-list-block">
                      <div className="comparison-list-heading">Similarities</div>
                      <ul>
                        {comparison.similarities.map((item, idx2) => (
                          <li key={idx2}>{renderComparisonText(item, [comparison.leftLabel, comparison.rightLabel])}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="comparison-list-block differences-block">
                      <div className="comparison-list-heading">Differences</div>
                      <ul>
                        {comparison.differences.map((item, idx2) => (
                          <li key={idx2}>{renderComparisonText(item, [comparison.leftLabel, comparison.rightLabel])}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
};
