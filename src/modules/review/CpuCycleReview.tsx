import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { units } from '../../data/units';

interface DiagramComponent {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

type BusName = 'address' | 'data' | 'control';

const diagramComponents: DiagramComponent[] = [
  { id: 'CU', label: 'CU', x: 170, y: 80, width: 140, height: 80 },
  { id: 'ALU', label: 'ALU', x: 170, y: 190, width: 140, height: 80 },
  { id: 'MAR', label: 'MAR', x: 360, y: 80, width: 160, height: 32 },
  { id: 'MDR', label: 'MDR', x: 360, y: 120, width: 160, height: 32 },
  { id: 'PC', label: 'PC', x: 360, y: 160, width: 160, height: 32 },
  { id: 'ACC', label: 'ACC', x: 360, y: 200, width: 160, height: 32 },
  { id: 'CIR', label: 'CIR', x: 360, y: 240, width: 160, height: 32 },
  { id: 'RAM', label: 'RAM', x: 655, y: 40, width: 70, height: 240 },
];

const instructionExample = 'ADD 05';

const cycleSteps = [
  {
    title: 'Fetch',
    action: 'The address of the instruction ADD 05 is copied from the Program Counter to the Memory Address Register.',
    components: ['PC', 'MAR'],
    buses: ['address'] as BusName[],
  },
  {
    title: 'Fetch',
    action: 'The address in the Memory Address Register is sent to memory and the instruction is fetched into the Memory Data Register on the Data Bus.',
    components: ['MAR', 'RAM', 'MDR'],
    buses: ['address', 'data'] as BusName[],
  },
  {
    title: 'Decode',
    action: 'The instruction in the Memory Data Register is copied into the Current Instruction Register for decoding.',
    components: ['MDR', 'CIR'],
    buses: ['control'] as BusName[],
  },
  {
    title: 'Decode',
    action: 'The Control Unit decodes ADD 05 in the Current Instruction Register and issues control signals on the Control Bus.',
    components: ['CU', 'CIR'],
    buses: ['control'] as BusName[],
  },
  {
    title: 'Execute',
    action: 'The Arithmetic Logic Unit performs the addition and the result is prepared for the Accumulator.',
    components: ['ALU'],
    buses: ['data'] as BusName[],
  },
  {
    title: 'Store',
    action: 'The Accumulator stores the result of the executed ADD 05 instruction.',
    components: ['ACC'],
    buses: [] as BusName[],
  },
];

export const CpuCycleReview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const unit = units.find(u => u.id === id);
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    if (stepIndex >= cycleSteps.length - 1) return;

    const timer = window.setTimeout(() => {
      setStepIndex(prev => {
        const next = Math.min(prev + 1, cycleSteps.length - 1);
        if (next === cycleSteps.length - 1) {
          setPlaying(false);
        }
        return next;
      });
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [playing, stepIndex]);

  if (!unit) {
    return <Navigate to={`/unit/${units[0].id}`} replace />;
  }

  if (unit.id !== 'cs-3') {
    return <Navigate to={`/review/unit/${unit.id}`} replace />;
  }

  const currentStep = cycleSteps[stepIndex];
  const isLastStep = stepIndex === cycleSteps.length - 1;

  const highlightComponent = (id: string) => currentStep.components.includes(id);
  const highlightBus = (bus: BusName) => currentStep.buses.includes(bus);

  const handleStop = () => setPlaying(false);
  const handleResume = () => setPlaying(true);
  const handlePrevious = () => {
    setStepIndex(prev => Math.max(prev - 1, 0));
    setPlaying(false);
  };
  const handleNext = () => {
    setStepIndex(prev => Math.min(prev + 1, cycleSteps.length - 1));
    setPlaying(false);
  };
  const handleRestart = () => {
    setStepIndex(0);
    setPlaying(true);
  };

  return (
    <div className="content-header">
      <div className="header-main">
        <h1>CPU FDE Cycle · Unit {unit.number} Review</h1>
        <p className="muted">Automatic instruction cycle playback traces the real instruction <strong>{instructionExample}</strong> and highlights which component and bus is active at each step.</p>
      </div>

      <div className="cpu-cycle-review">
        <div className="cpu-review-grid">
          <section className="cpu-diagram-panel">
            <div className="cpu-controls">
              <button className="subpage-button" onClick={() => navigate(`/review/unit/${unit.id}`)}>
                ← Back to Review
              </button>
              <button className="subpage-button" onClick={handlePrevious} disabled={stepIndex === 0}>
                ◀ Previous
              </button>
              <button className="subpage-button" onClick={handleNext} disabled={isLastStep}>
                Next ▶
              </button>
              <button className="subpage-button" onClick={handleStop} disabled={!playing}>
                ■ Stop
              </button>
              <button className="subpage-button" onClick={handleResume} disabled={playing || isLastStep}>
                ▶ Resume
              </button>
              <button className="subpage-button secondary" onClick={handleRestart}>
                ↻ Restart
              </button>
            </div>

            <div className="cpu-canvas">
              <svg className="cpu-diagram-svg" viewBox="0 0 730 320" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <marker id="arrow-small" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                    <polygon points="0 0, 8 4, 0 8" fill="#6b7280" />
                  </marker>
                  <marker id="arrow-large" markerWidth="12" markerHeight="12" refX="11" refY="6" orient="auto">
                    <polygon points="0 0, 12 6, 0 12" fill="#6b7280" />
                  </marker>
                </defs>

                <rect x="10" y="40" width="130" height="240" fill="rgba(251,191,36,0.08)" stroke="#fbbf24" strokeWidth="2" rx="8" />
                <text x="75" y="25" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#92400e">MEMORY</text>
                <text x="75" y="70" textAnchor="middle" fontSize="11" fill="#b45309">Instruction Store</text>
                <rect x="655" y="40" width="70" height="240" fill="rgba(248,113,113,0.12)" stroke="#ef4444" strokeWidth="2" rx="8" />
                <text x="690" y="70" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#b91c1c">RAM</text>

                <path d="M320 70 L655 70" fill="none" stroke={highlightBus('control') ? '#4b5563' : '#6b7280'} strokeWidth={highlightBus('control') ? 6 : 4} strokeLinecap="round" markerEnd="url(#arrow-large)" />
                <text x="490" y="55" textAnchor="middle" fontSize="10" fill="#374151">Control Bus</text>
                <path d="M520 140 L655 140" fill="none" stroke={highlightBus('address') ? '#f59e0b' : '#fbbf24'} strokeWidth={highlightBus('address') ? 6 : 4} strokeLinecap="round" markerEnd="url(#arrow-large)" />
                <text x="585" y="132" textAnchor="middle" fontSize="10" fill="#b45309">Address Bus</text>
                <path d="M520 170 L655 170" fill="none" stroke={highlightBus('data') ? '#2563eb' : '#3b82f6'} strokeWidth={highlightBus('data') ? 6 : 4} strokeLinecap="round" markerEnd="url(#arrow-large)" />
                <text x="585" y="162" textAnchor="middle" fontSize="10" fill="#1e40af">Data Bus</text>

                <rect x="140" y="30" width="510" height="250" fill="none" stroke="#7c3aed" strokeWidth="3" rx="26" />
                <text x="395" y="28" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#6d28d9">CPU</text>
                <rect x="350" y="60" width="170" height="220" fill="rgba(59,130,246,0.08)" stroke="#3b82f6" strokeWidth="1" rx="16" />
                <text x="435" y="76" textAnchor="middle" fontSize="10" fontWeight="700" fill="#1e40af">Registers</text>

                {diagramComponents.map(comp => (
                  <g key={comp.id}>
                    <rect
                      x={comp.x}
                      y={comp.y}
                      width={comp.width}
                      height={comp.height}
                      rx="6"
                      fill={highlightComponent(comp.id) ? 'rgba(59,130,246,0.45)' : 'rgba(255,255,255,0.95)'}
                      stroke={highlightComponent(comp.id) ? '#2563eb' : '#94a3b8'}
                      strokeWidth="2"
                    />
                    <text x={comp.x + comp.width / 2} y={comp.y + comp.height / 2 + 4} textAnchor="middle" fontSize="10" fill={highlightComponent(comp.id) ? '#0f172a' : '#111827'}>
                      {comp.label}
                    </text>
                  </g>
                ))}

              </svg>
            </div>
          </section>

            <section className="cpu-flowchart">
            <h2>Instruction Cycle Playback</h2>
            <div className="cpu-step-summary">
              <div className="cpu-step-title">Stage: {currentStep.title}</div>
              <div className="cpu-step-action">{currentStep.action}</div>
              <div className="cpu-step-meta">
                <span>Example instruction: {instructionExample}</span>
                <span>Active components: {currentStep.components.join(', ')}</span>
                <span>Active buses: {currentStep.buses.length ? currentStep.buses.map(b => b === 'address' ? 'Address Bus' : b === 'data' ? 'Data Bus' : 'Control Bus').join(', ') : 'None'}</span>
              </div>
              {isLastStep && !playing && <div className="cpu-step-finish">Instruction cycle complete.</div>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CpuCycleReview;
