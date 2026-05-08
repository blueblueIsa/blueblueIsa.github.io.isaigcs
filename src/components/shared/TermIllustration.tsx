import React from 'react';

type IllustrationType =
  | 'AND'
  | 'OR'
  | 'NOT'
  | 'NAND'
  | 'NOR'
  | 'XOR'
  | 'truth-table'
  | 'logic-circuit'
  | 'logic-expression'
  | 'flowchart'
  | 'sql';

interface TermIllustrationProps {
  type?: IllustrationType;
  example?: string;
}

// Standard logic gate SVG paths based on IEEE/IEC symbols
const renderLogicGateSvg = (type: string) => {
  switch (type) {
    case 'NOT':
      return (
        <svg className="term-illustration-svg" viewBox="0 0 120 80" role="img" aria-label="NOT gate">
          {/* Triangle */}
          <path d="M 20 20 L 20 60 L 50 40 Z" fill="none" stroke="#2563eb" strokeWidth="2" />
          {/* Input line */}
          <line x1="5" y1="40" x2="20" y2="40" stroke="#2563eb" strokeWidth="2" />
          {/* Output line with bubble */}
          <line x1="50" y1="40" x2="65" y2="40" stroke="#2563eb" strokeWidth="2" />
          <circle cx="72" cy="40" r="6" fill="none" stroke="#2563eb" strokeWidth="2" />
        </svg>
      );
    case 'AND':
      return (
        <svg className="term-illustration-svg" viewBox="0 0 120 80" role="img" aria-label="AND gate">
          {/* Input lines */}
          <line x1="5" y1="25" x2="30" y2="25" stroke="#2563eb" strokeWidth="2" />
          <line x1="5" y1="55" x2="30" y2="55" stroke="#2563eb" strokeWidth="2" />
          {/* AND gate body: flat left, curved right */}
          <path d="M 30 15 L 30 65 Q 60 65 60 40 Q 60 15 30 15 Z" fill="none" stroke="#2563eb" strokeWidth="2" />
          {/* Output */}
          <line x1="60" y1="40" x2="85" y2="40" stroke="#2563eb" strokeWidth="2" />
        </svg>
      );
    case 'OR':
      return (
        <svg className="term-illustration-svg" viewBox="0 0 120 80" role="img" aria-label="OR gate">
          {/* Input lines */}
          <line x1="5" y1="25" x2="22" y2="25" stroke="#2563eb" strokeWidth="2" />
          <line x1="5" y1="55" x2="22" y2="55" stroke="#2563eb" strokeWidth="2" />
          {/* Curved input lines */}
          <path d="M 22 15 Q 28 15 28 25 M 22 65 Q 28 65 28 55" fill="none" stroke="#2563eb" strokeWidth="2" />
          {/* OR gate body: curved left, pointed right */}
          <path d="M 28 15 Q 48 15 65 40 Q 48 65 28 65 L 35 65 Q 55 65 72 40 Q 55 15 35 15 Z" fill="none" stroke="#2563eb" strokeWidth="2" />
          {/* Output */}
          <line x1="72" y1="40" x2="90" y2="40" stroke="#2563eb" strokeWidth="2" />
        </svg>
      );
    case 'NAND':
      return (
        <svg className="term-illustration-svg" viewBox="0 0 120 80" role="img" aria-label="NAND gate">
          {/* Input lines */}
          <line x1="5" y1="25" x2="30" y2="25" stroke="#2563eb" strokeWidth="2" />
          <line x1="5" y1="55" x2="30" y2="55" stroke="#2563eb" strokeWidth="2" />
          {/* AND gate body */}
          <path d="M 30 15 L 30 65 Q 55 65 55 40 Q 55 15 30 15 Z" fill="none" stroke="#2563eb" strokeWidth="2" />
          {/* Bubble */}
          <circle cx="63" cy="40" r="6" fill="none" stroke="#2563eb" strokeWidth="2" />
          {/* Output */}
          <line x1="55" y1="40" x2="57" y2="40" stroke="#2563eb" strokeWidth="2" />
          <line x1="69" y1="40" x2="85" y2="40" stroke="#2563eb" strokeWidth="2" />
        </svg>
      );
    case 'NOR':
      return (
        <svg className="term-illustration-svg" viewBox="0 0 120 80" role="img" aria-label="NOR gate">
          {/* Input lines */}
          <line x1="5" y1="25" x2="18" y2="25" stroke="#2563eb" strokeWidth="2" />
          <line x1="5" y1="55" x2="18" y2="55" stroke="#2563eb" strokeWidth="2" />
          {/* Curved input lines */}
          <path d="M 18 15 Q 23 15 23 25 M 18 65 Q 23 65 23 55" fill="none" stroke="#2563eb" strokeWidth="2" />
          {/* NOR gate body: curved left, pointed right */}
          <path d="M 23 15 Q 40 15 55 40 Q 40 65 23 65 L 30 65 Q 50 65 65 40 Q 50 15 30 15 Z" fill="none" stroke="#2563eb" strokeWidth="2" />
          {/* Bubble (inversion circle) */}
          <circle cx="72" cy="40" r="6" fill="none" stroke="#2563eb" strokeWidth="2" />
          {/* Output line */}
          <line x1="65" y1="40" x2="66" y2="40" stroke="#2563eb" strokeWidth="2" />
          <line x1="78" y1="40" x2="95" y2="40" stroke="#2563eb" strokeWidth="2" />
        </svg>
      );
    case 'XOR':
      return (
        <svg className="term-illustration-svg" viewBox="0 0 120 80" role="img" aria-label="XOR gate">
          {/* Input lines */}
          <line x1="5" y1="25" x2="18" y2="25" stroke="#2563eb" strokeWidth="2" />
          <line x1="5" y1="55" x2="18" y2="55" stroke="#2563eb" strokeWidth="2" />
          {/* Double curved input lines (XOR indicator) */}
          <path d="M 18 15 Q 22 15 22 25 M 18 65 Q 22 65 22 55" fill="none" stroke="#2563eb" strokeWidth="2" />
          <path d="M 20 15 Q 24 15 24 25 M 20 65 Q 24 65 24 55" fill="none" stroke="#2563eb" strokeWidth="2" />
          {/* XOR gate body: curved left, pointed right */}
          <path d="M 26 15 Q 45 15 60 40 Q 45 65 26 65 L 32 65 Q 52 65 68 40 Q 52 15 32 15 Z" fill="none" stroke="#2563eb" strokeWidth="2" />
          {/* Output */}
          <line x1="68" y1="40" x2="90" y2="40" stroke="#2563eb" strokeWidth="2" />
        </svg>
      );
    default:
      return null;
  }
};

const gateLabel: Record<IllustrationType, string> = {
  AND: 'AND gate',
  OR: 'OR gate',
  NOT: 'NOT gate',
  NAND: 'NAND gate',
  NOR: 'NOR gate',
  XOR: 'XOR gate',
  'truth-table': 'Truth table',
  'logic-circuit': 'Logic circuit',
  'logic-expression': 'Logic expression',
  flowchart: 'Flowchart legend',
  sql: 'SQL example',
};

const renderGate = (type: IllustrationType) => {
  return renderLogicGateSvg(type);
};

const renderTruthTable = () => (
  <table className="term-illustration-table" aria-label="Truth table example">
    <thead>
      <tr>
        <th>A</th>
        <th>B</th>
        <th>Out</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>0</td>
        <td>0</td>
        <td>0</td>
      </tr>
      <tr>
        <td>0</td>
        <td>1</td>
        <td>1</td>
      </tr>
      <tr>
        <td>1</td>
        <td>0</td>
        <td>1</td>
      </tr>
      <tr>
        <td>1</td>
        <td>1</td>
        <td>0</td>
      </tr>
    </tbody>
  </table>
);

const renderLogicCircuit = () => (
  <div className="term-illustration-circuit">
    <svg className="term-illustration-svg" viewBox="0 0 500 280" role="img" aria-label="Logic circuit example: X = (A AND B) XOR (B OR NOT C)">
      {/* Input labels on left */}
      <text x="10" y="50" fontSize="14" fontWeight="600" fill="#334155">A</text>
      <text x="10" y="130" fontSize="14" fontWeight="600" fill="#334155">B</text>
      <text x="10" y="210" fontSize="14" fontWeight="600" fill="#334155">C</text>

      {/* Input lines */}
      <line x1="25" y1="50" x2="60" y2="50" stroke="#334155" strokeWidth="2" />
      <line x1="25" y1="130" x2="60" y2="130" stroke="#334155" strokeWidth="2" />
      <line x1="25" y1="210" x2="60" y2="210" stroke="#334155" strokeWidth="2" />

      {/* NOT gate (C) - top of middle section */}
      <line x1="60" y1="210" x2="85" y2="210" stroke="#334155" strokeWidth="2" />
      <path d="M 85 195 L 85 225 L 110 210 Z" fill="none" stroke="#2563eb" strokeWidth="2" />
      <circle cx="117" cy="210" r="5" fill="none" stroke="#2563eb" strokeWidth="2" />
      <line x1="122" y1="210" x2="140" y2="210" stroke="#334155" strokeWidth="2" />

      {/* AND gate (A AND B) - left middle */}
      <line x1="60" y1="50" x2="120" y2="50" stroke="#334155" strokeWidth="2" />
      <line x1="60" y1="50" x2="120" y2="70" stroke="#334155" strokeWidth="2" />
      <line x1="60" y1="130" x2="120" y2="130" stroke="#334155" strokeWidth="2" />
      <line x1="60" y1="130" x2="120" y2="110" stroke="#334155" strokeWidth="2" />
      {/* AND gate body */}
      <path d="M 120 60 L 120 120 Q 155 120 155 90 Q 155 60 120 60 Z" fill="none" stroke="#2563eb" strokeWidth="2" />
      <line x1="155" y1="90" x2="180" y2="90" stroke="#334155" strokeWidth="2" />

      {/* OR gate (B OR NOT C) - right middle */}
      <line x1="140" y1="130" x2="160" y2="145" stroke="#334155" strokeWidth="2" />
      <line x1="140" y1="210" x2="160" y2="195" stroke="#334155" strokeWidth="2" />
      {/* OR gate body */}
      <path d="M 160 135 Q 175 135 200 165 Q 175 195 160 195 L 168 195 Q 188 195 210 165 Q 188 135 168 135 Z" fill="none" stroke="#2563eb" strokeWidth="2" />
      <line x1="210" y1="165" x2="240" y2="165" stroke="#334155" strokeWidth="2" />

      {/* XOR gate (final) - right side */}
      <line x1="180" y1="90" x2="250" y2="130" stroke="#334155" strokeWidth="2" />
      <line x1="240" y1="165" x2="250" y2="150" stroke="#334155" strokeWidth="2" />
      {/* XOR gate body with double curve indicator */}
      <path d="M 260 120 Q 280 120 310 140 Q 280 160 260 160 L 268 160 Q 288 160 318 140 Q 288 120 268 120 Z" fill="none" stroke="#2563eb" strokeWidth="2" />
      <path d="M 258 120 Q 273 120 273 130 M 258 160 Q 273 160 273 150" fill="none" stroke="#2563eb" strokeWidth="2" />
      <line x1="318" y1="140" x2="360" y2="140" stroke="#334155" strokeWidth="2" />

      {/* Output label */}
      <text x="370" y="145" fontSize="14" fontWeight="600" fill="#334155">X</text>
    </svg>
  </div>
);

const renderFlowchart = () => (
  <div className="term-illustration-flowchart">
    {/* Flow line */}
    <div className="flowchart-symbol">
      <svg viewBox="0 0 100 40" className="term-illustration-svg" aria-hidden="true">
        <line x1="10" y1="20" x2="80" y2="20" stroke="#2563eb" strokeWidth="2" />
        <polygon points="80,20 70,15 75,20 70,25" fill="#2563eb" />
      </svg>
      <span>Flow line</span>
    </div>

    {/* Process */}
    <div className="flowchart-symbol">
      <svg viewBox="0 0 100 60" className="term-illustration-svg" aria-hidden="true">
        <rect x="15" y="10" width="70" height="40" rx="4" fill="none" stroke="#2563eb" strokeWidth="2" />
      </svg>
      <span>Process</span>
    </div>

    {/* Subroutine */}
    <div className="flowchart-symbol">
      <svg viewBox="0 0 100 60" className="term-illustration-svg" aria-hidden="true">
        <rect x="15" y="10" width="70" height="40" rx="4" fill="none" stroke="#2563eb" strokeWidth="2" />
        <line x1="22" y1="10" x2="22" y2="50" stroke="#2563eb" strokeWidth="2" />
        <line x1="78" y1="10" x2="78" y2="50" stroke="#2563eb" strokeWidth="2" />
      </svg>
      <span>Subroutine</span>
    </div>

    {/* Input/Output */}
    <div className="flowchart-symbol">
      <svg viewBox="0 0 100 60" className="term-illustration-svg" aria-hidden="true">
        <path d="M 30 15 L 75 15 L 60 45 L 15 45 Z" fill="none" stroke="#2563eb" strokeWidth="2" />
      </svg>
      <span>Input/Output</span>
    </div>

    {/* Decision */}
    <div className="flowchart-symbol">
      <svg viewBox="0 0 100 60" className="term-illustration-svg" aria-hidden="true">
        <polygon points="50,10 85,30 50,50 15,30" fill="none" stroke="#2563eb" strokeWidth="2" />
      </svg>
      <span>Decision</span>
    </div>

    {/* Terminator */}
    <div className="flowchart-symbol">
      <svg viewBox="0 0 100 60" className="term-illustration-svg" aria-hidden="true">
        <path d="M 25 15 Q 15 15 15 30 Q 15 45 25 45 L 75 45 Q 85 45 85 30 Q 85 15 75 15 Z" fill="none" stroke="#2563eb" strokeWidth="2" />
      </svg>
      <span>Terminator</span>
    </div>
  </div>
);

const renderSql = (example?: string) => (
  <pre className="term-illustration-code">
    <code>{example ?? 'SELECT column FROM table WHERE condition;'}</code>
  </pre>
);

const renderIllustration = (type: IllustrationType, example?: string) => {
  switch (type) {
    case 'AND':
    case 'OR':
    case 'NOT':
    case 'NAND':
    case 'NOR':
    case 'XOR':
      return renderGate(type);
    case 'truth-table':
      return renderTruthTable();
    case 'logic-circuit':
      return renderLogicCircuit();
    case 'logic-expression':
      return (
        <pre className="term-illustration-code">
          <code>{example ?? 'A AND (B OR C)'}</code>
        </pre>
      );
    case 'flowchart':
      return renderFlowchart();
    case 'sql':
      return renderSql(example);
    default:
      return null;
  }
};

export const TermIllustration: React.FC<TermIllustrationProps> = ({ type, example }) => {
  if (!type) {
    return null;
  }

  return (
    <div className="term-illustration">
      <div className="term-illustration-label">{gateLabel[type]}</div>
      {renderIllustration(type, example)}
    </div>
  );
};
