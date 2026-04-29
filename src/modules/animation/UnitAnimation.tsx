import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { units } from '../../data/units';
import { unitAnimations } from '../../data/unitAnimations';

const FDEAnimation: React.FC<{ example?: { instruction: string; steps: string[] } }> = ({ example }) => {
  const [activeStep, setActiveStep] = useState(0);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const stages = [
    { 
      name: "FETCH: PC → MAR", 
      stageLabel: "📥 FETCH (address sent)",
      desc: "Program Counter (PC) holds address of next instruction. PC copies address to Memory Address Register (MAR) using address bus.",
      detail: "Control Unit signals read. MAR now contains the memory location to be accessed."
    },
    { 
      name: "FETCH: RAM → MDR", 
      stageLabel: "📥 FETCH (data to MDR)",
      desc: "MAR address sent to RAM. RAM places the instruction stored at that address onto the DATA BUS → Memory Data Register (MDR) receives it.",
      detail: "Data bus carries the actual instruction/opcode. MDR acts as temporary buffer."
    },
    { 
      name: "FETCH: MDR → CIR", 
      stageLabel: "📥 FETCH (instruction to CIR)",
      desc: "Instruction moves from MDR to Current Instruction Register (CIR) inside the Control Unit.",
      detail: "Now the instruction is ready to be decoded."
    },
    { 
      name: "DECODE", 
      stageLabel: "🔎 DECODE",
      desc: "Control Unit (CU) decodes the instruction inside CIR using the Instruction Set.",
      detail: "Instruction split into opcode (operation) and operand (data/address). CU determines which action to perform."
    },
    { 
      name: "EXECUTE: ALU operation", 
      stageLabel: "⚡ EXECUTE (ALU active)",
      desc: "Arithmetic Logic Unit (ALU) performs the required operation (add, subtract, compare, etc.).",
      detail: "If arithmetic or logic, ALU uses registers/values; result stored in Accumulator (ACC) if needed."
    },
    { 
      name: "EXECUTE: write-back / PC increment", 
      stageLabel: "✅ EXECUTE (complete)",
      desc: "Result written back to accumulator or memory (if store). Program Counter increments to next instruction address.",
      detail: "PC = PC + 1 (or next sequential address). Cycle repeats."
    }
  ];

  const drawDiagram = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rawCtx = canvas.getContext('2d');
    if (!rawCtx) return;
    const ctx = rawCtx;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background & grid light
    ctx.fillStyle = "#FDFAF2";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 0.5;
    for(let i=0;i<canvas.width;i+=30){
      ctx.beginPath();
      ctx.moveTo(i,0);
      ctx.lineTo(i,canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0,i);
      ctx.lineTo(canvas.width,i);
      ctx.stroke();
    }
    
    // CPU boundary
    ctx.fillStyle = "#F0F4FA";
    ctx.fillRect(50, 60, 650, 380);
    ctx.strokeStyle = "#2c3e66";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(50, 60, 650, 380);
    ctx.font = "bold 14px 'Segoe UI'";
    ctx.fillStyle = "#1f3b6b";
    ctx.fillText("CENTRAL PROCESSING UNIT (CPU)", 280, 50);
    
    // Control Unit (CU)
    ctx.fillStyle = "#E9F0F9";
    ctx.fillRect(70, 100, 180, 130);
    ctx.strokeStyle = "#3a6ea5";
    ctx.strokeRect(70, 100, 180, 130);
    ctx.fillStyle = "#1e4663";
    ctx.font = "bold 12px 'Segoe UI'";
    ctx.fillText("CONTROL UNIT (CU)", 115, 120);
    ctx.font = "10px monospace";
    ctx.fillStyle = "#2c3e66";
    ctx.fillText("decodes instructions", 85, 145);
    ctx.fillText("sends control signals", 85, 165);
    
    // ALU
    ctx.fillStyle = "#E9F0F9";
    ctx.fillRect(470, 100, 180, 100);
    ctx.strokeStyle = "#3a6ea5";
    ctx.strokeRect(470, 100, 180, 100);
    ctx.fillStyle = "#1e4663";
    ctx.font = "bold 12px 'Segoe UI'";
    ctx.fillText("ARITHMETIC LOGIC UNIT (ALU)", 490, 125);
    ctx.font = "10px monospace";
    ctx.fillText("calculations / logic", 510, 150);
    
    // Registers area
    ctx.fillStyle = "#fff2e0";
    ctx.fillRect(70, 260, 580, 150);
    ctx.fillStyle = "#806b42";
    ctx.font = "italic 11px";
    ctx.fillText("Registers (temporary storage)", 320, 255);
    
    // Register boxes
    drawRegister(90, 280, 90, 45, "PC", (activeStep === 0 || activeStep === 5));
    drawRegister(210, 280, 90, 45, "MAR", (activeStep === 0 || activeStep === 1));
    drawRegister(330, 280, 90, 45, "MDR", (activeStep === 1 || activeStep === 2));
    drawRegister(450, 280, 90, 45, "CIR", (activeStep === 2 || activeStep === 3));
    drawRegister(570, 280, 90, 45, "ACC", (activeStep === 4 || activeStep === 5));
    
    // RAM component
    ctx.fillStyle = "#E2E8F0";
    ctx.fillRect(620, 40, 100, 130);
    ctx.strokeStyle = "#8faaC0";
    ctx.strokeRect(620, 40, 100, 130);
    ctx.fillStyle = "#2c3e66";
    ctx.fillText("RAM", 655, 60);
    ctx.font = "9px monospace";
    ctx.fillStyle = "#3a5e7e";
    ctx.fillText("instructions", 632, 90);
    ctx.fillText("data", 632, 110);
    
    // Buses
    drawBusLine(300, 302, 620, 80, "#2b6f9e", (activeStep === 0 || activeStep === 1));
    drawBusLine(620, 90, 410, 302, "#2b6f9e", activeStep === 1);
    drawBusLine(410, 302, 280, 302, "#2b6f9e", activeStep === 2);
    drawBusLine(200, 325, 95, 325, "#b5651e", activeStep === 3);
    
    drawArrow(175, 302, 205, 302, "#3a7ca5", activeStep === 0);
    drawArrow(290, 325, 420, 325, "#2c9b6e", activeStep === 4);
    drawArrow(550, 280, 540, 220, "#2c9b6e", activeStep === 4);
    
    // Bus labels
    ctx.fillStyle = "#0077b6";
    ctx.font = "bold 9px monospace";
    ctx.fillText("ADDRESS BUS", 320, 50);
    ctx.fillText("DATA BUS", 460, 185);
    ctx.fillStyle = "#b5651e";
    ctx.fillText("CONTROL BUS", 80, 220);
    
    // Active instruction
    if(activeStep >= 2 && activeStep <= 5){
      ctx.fillStyle = "#2b4f6e";
      ctx.font = "italic 9px";
      ctx.fillText(`Instr: ${getMockInstruction()}`, 470, 395);
    }
    
    // Highlight CU during decode
    if(activeStep === 3){
      ctx.beginPath();
      ctx.rect(70,100,180,130);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#ffaa33";
      ctx.stroke();
    }
    if(activeStep === 4){
      ctx.beginPath();
      ctx.rect(470,100,180,100);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#ffaa33";
      ctx.stroke();
    }

    function drawRegister(x: number, y: number, w: number, h: number, label: string, highlight: boolean) {
      if(highlight){
        ctx.fillStyle = "#FFF3C9";
        ctx.shadowBlur = 6;
        ctx.shadowColor = "#f0b27a";
      } else {
        ctx.fillStyle = "#FCF6E8";
        ctx.shadowBlur = 0;
      }
      ctx.fillRect(x,y,w,h);
      ctx.strokeStyle = "#ad8b4c";
      ctx.strokeRect(x,y,w,h);
      ctx.fillStyle = "#2c3e66";
      ctx.font = "bold 12px monospace";
      ctx.fillText(label, x+35, y+28);
      ctx.font = "8px sans-serif";
      ctx.fillStyle = "#6f5b3e";
      if(label==="PC") ctx.fillText("next instr addr", x+12, y+42);
      if(label==="MAR") ctx.fillText("mem address", x+18, y+42);
      if(label==="MDR") ctx.fillText("data buffer", x+22, y+42);
      if(label==="CIR") ctx.fillText("current instr", x+22, y+42);
      if(label==="ACC") ctx.fillText("result", x+38, y+42);
      ctx.shadowBlur = 0;
    }
    
    function drawBusLine(x1: number, y1: number, x2: number, y2: number, color: string, active: boolean) {
      ctx.beginPath();
      ctx.moveTo(x1,y1);
      ctx.lineTo(x2,y2);
      ctx.lineWidth = active ? 4 : 2;
      ctx.strokeStyle = active ? color : "#bbccdd";
      ctx.stroke();
      if(active){
        const angle = Math.atan2(y2-y1, x2-x1);
        const arrowX = x2-8*Math.cos(angle);
        const arrowY = y2-8*Math.sin(angle);
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX-6*Math.sin(angle), arrowY+6*Math.cos(angle));
        ctx.lineTo(arrowX+6*Math.sin(angle), arrowY-6*Math.cos(angle));
        ctx.fillStyle = color;
        ctx.fill();
      }
    }
    
    function drawArrow(x1: number, y1: number, x2: number, y2: number, color: string, active: boolean) {
      ctx.beginPath();
      ctx.moveTo(x1,y1);
      ctx.lineTo(x2,y2);
      ctx.lineWidth = active ? 3 : 1.5;
      ctx.strokeStyle = active ? color : "#b0c4de";
      ctx.stroke();
      if(active){
        const angle = Math.atan2(y2-y1, x2-x1);
        const arrowX = x2-8*Math.cos(angle);
        const arrowY = y2-8*Math.sin(angle);
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX-5*Math.sin(angle), arrowY+5*Math.cos(angle));
        ctx.lineTo(arrowX+5*Math.sin(angle), arrowY-5*Math.cos(angle));
        ctx.fillStyle = color;
        ctx.fill();
      }
    }
  }, [activeStep]);

  React.useEffect(() => {
    drawDiagram();
  }, [drawDiagram]);

  const getMockInstruction = () => {
    if(activeStep === 2 || activeStep === 3) return "ADD R1, #5";
    if(activeStep === 4) return "ALU: ADD operation";
    if(activeStep === 5) return "Result → ACC, PC++";
    return "LOAD 0x4A";
  };

  const nextStep = () => {
    if (activeStep < stages.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const resetSteps = () => {
    setActiveStep(0);
  };

  const currentStage = stages[activeStep];

  return (
    <div className="fde-animation">
      <div className="fde-instruction">Instruction: {example?.instruction}</div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ flex: 2 }}>
          <canvas 
            ref={canvasRef} 
            width={750} 
            height={500} 
            style={{ 
              width: '100%', 
              height: 'auto', 
              maxWidth: '750px', 
              aspectRatio: '750/500',
              borderRadius: '1rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }} 
          />
          <div className="step-controls" style={{ display: 'flex', gap: '15px', justifyContent: 'center', margin: '20px 0 15px' }}>
            <button onClick={prevStep} disabled={activeStep === 0} style={{ background: '#4b6a9b', border: 'none', color: 'white', padding: '8px 20px', borderRadius: '60px', cursor: activeStep === 0 ? 'not-allowed' : 'pointer' }}>◀ PREVIOUS</button>
            <button onClick={nextStep} disabled={activeStep === stages.length - 1} style={{ background: '#2c3e66', border: 'none', color: 'white', padding: '8px 20px', borderRadius: '60px', cursor: activeStep === stages.length - 1 ? 'not-allowed' : 'pointer' }}>NEXT ▶</button>
            <button onClick={resetSteps} style={{ background: '#4b6a9b', border: 'none', color: 'white', padding: '8px 20px', borderRadius: '60px', cursor: 'pointer' }}>⟳ RESET</button>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span className="step-indicator" style={{ background: '#e9edf4', borderRadius: '60px', padding: '6px 14px', fontWeight: 'bold', display: 'inline-block', margin: '10px auto 0' }}>📍 {currentStage.name}</span>
          </div>
        </div>
        <div style={{ flex: 1, background: '#ffffffdd', borderRadius: '1rem', padding: '1rem', boxShadow: '0 8px 18px rgba(0,0,0,0.1)', color: '#1e293b' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, background: 'linear-gradient(135deg, #1f3b6b, #2b4c7c)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', marginBottom: '8px' }}>{currentStage.stageLabel}</div>
          <div style={{ fontWeight: 500, lineHeight: '1.4', color: '#374151' }}>{currentStage.detail}</div>
          <div style={{ background: '#eef3fc', padding: '14px 18px', borderRadius: '1rem', marginTop: '20px', borderLeft: '6px solid #2c3e66', color: '#1e293b' }}>
            💡 <strong style={{ color: '#1e293b' }}>What's happening?</strong><br />
            <span style={{ color: '#374151' }}>{currentStage.desc}</span>
          </div>
          <hr style={{ margin: '14px 0', borderColor: '#e5e7eb' }} />
          <div style={{ color: '#1e293b' }}><strong>📚 Key registers & components</strong></div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
            {activeStep === 0 && (
              <>
                <span style={{ background: '#1e2f5e', color: 'white', borderRadius: '40px', padding: '4px 12px', fontSize: '0.7rem', fontWeight: 600 }}>Program Counter (PC)</span>
                <span style={{ background: '#1e2f5e', color: 'white', borderRadius: '40px', padding: '4px 12px', fontSize: '0.7rem', fontWeight: 600 }}>Memory Address Register (MAR)</span>
                <span style={{ background: '#1e2f5e', color: 'white', borderRadius: '40px', padding: '4px 12px', fontSize: '0.7rem', fontWeight: 600 }}>Address Bus</span>
                <span style={{ background: '#1e2f5e', color: 'white', borderRadius: '40px', padding: '4px 12px', fontSize: '0.7rem', fontWeight: 600 }}>Control Unit</span>
              </>
            )}
            {activeStep === 1 && (
              <>
                <span style={{ background: '#1e2f5e', color: 'white', borderRadius: '40px', padding: '4px 12px', fontSize: '0.7rem', fontWeight: 600 }}>MAR → RAM</span>
                <span style={{ background: '#1e2f5e', color: 'white', borderRadius: '40px', padding: '4px 12px', fontSize: '0.7rem', fontWeight: 600 }}>Data Bus</span>
                <span style={{ background: '#1e2f5e', color: 'white', borderRadius: '40px', padding: '4px 12px', fontSize: '0.7rem', fontWeight: 600 }}>Memory Data Register (MDR)</span>
              </>
            )}
            {activeStep === 2 && (
              <>
                <span style={{ background: '#1e2f5e', color: 'white', borderRadius: '40px', padding: '4px 12px', fontSize: '0.7rem', fontWeight: 600 }}>MDR → CIR</span>
                <span style={{ background: '#1e2f5e', color: 'white', borderRadius: '40px', padding: '4px 12px', fontSize: '0.7rem', fontWeight: 600 }}>Current Instruction Register (CIR)</span>
                <span style={{ background: '#1e2f5e', color: 'white', borderRadius: '40px', padding: '4px 12px', fontSize: '0.7rem', fontWeight: 600 }}>Instruction loaded</span>
              </>
            )}
            {activeStep === 3 && (
              <>
                <span style={{ background: '#1e2f5e', color: 'white', borderRadius: '40px', padding: '4px 12px', fontSize: '0.7rem', fontWeight: 600 }}>Control Unit (CU)</span>
                <span style={{ background: '#1e2f5e', color: 'white', borderRadius: '40px', padding: '4px 12px', fontSize: '0.7rem', fontWeight: 600 }}>Decode</span>
                <span style={{ background: '#1e2f5e', color: 'white', borderRadius: '40px', padding: '4px 12px', fontSize: '0.7rem', fontWeight: 600 }}>Instruction Set</span>
                <span style={{ background: '#1e2f5e', color: 'white', borderRadius: '40px', padding: '4px 12px', fontSize: '0.7rem', fontWeight: 600 }}>Opcode / Operand</span>
              </>
            )}
            {activeStep === 4 && (
              <>
                <span style={{ background: '#1e2f5e', color: 'white', borderRadius: '40px', padding: '4px 12px', fontSize: '0.7rem', fontWeight: 600 }}>Arithmetic Logic Unit (ALU)</span>
                <span style={{ background: '#1e2f5e', color: 'white', borderRadius: '40px', padding: '4px 12px', fontSize: '0.7rem', fontWeight: 600 }}>Accumulator (ACC)</span>
                <span style={{ background: '#1e2f5e', color: 'white', borderRadius: '40px', padding: '4px 12px', fontSize: '0.7rem', fontWeight: 600 }}>Execute operation</span>
              </>
            )}
            {activeStep === 5 && (
              <>
                <span style={{ background: '#1e2f5e', color: 'white', borderRadius: '40px', padding: '4px 12px', fontSize: '0.7rem', fontWeight: 600 }}>Accumulator (ACC)</span>
                <span style={{ background: '#1e2f5e', color: 'white', borderRadius: '40px', padding: '4px 12px', fontSize: '0.7rem', fontWeight: 600 }}>Program Counter increment</span>
                <span style={{ background: '#1e2f5e', color: 'white', borderRadius: '40px', padding: '4px 12px', fontSize: '0.7rem', fontWeight: 600 }}>Cycle repeats</span>
                <span style={{ background: '#1e2f5e', color: 'white', borderRadius: '40px', padding: '4px 12px', fontSize: '0.7rem', fontWeight: 600 }}>Cache / performance</span>
              </>
            )}
          </div>
          <div style={{ marginTop: '16px', fontSize: '0.8rem', background: '#fff0cf', borderRadius: '20px', padding: '8px 12px', color: '#92400e' }}>
            ⚡ <strong style={{ color: '#92400e' }}>Performance factors:</strong> Clock speed ↑, more cores, bigger cache → faster FDE cycles.
          </div>
        </div>
      </div>
    </div>
  );
};

const TopicAnimation: React.FC<{ topic: any }> = ({ topic }) => {
  if (!topic) return null;

  if (topic.animationType === 'fde-cycle') {
    return <FDEAnimation example={topic.example} />;
  }

  return (
    <div className={`review-animation ${topic.animationType}`}>
      <p className="review-animation-text">{topic.summary}</p>
      <p className="review-animation-text">Flow: {topic.diagrams.join(' / ')}</p>
    </div>
  );
};

export const UnitAnimation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const unit = useMemo(() => units.find(u => u.id === id), [id]);
  const animation = useMemo(() => (id ? unitAnimations[id] : undefined), [id]);

  const topic = params.get('topic') || (animation ? Object.keys(animation.topics)[0] : '');

  if (!unit) {
    return <Navigate to={`/unit/${units[0].id}`} replace />;
  }

  if (!animation) {
    return (
      <div className="content-header">
        <div className="header-main">
          <h1>Animation · Unit {unit.number} · {unit.title}</h1>
          <p className="muted">No animation data available for this unit yet.</p>
        </div>
      </div>
    );
  }

  const topicInfo = animation.topics[topic];

  return (
    <div>
      <div className="content-header">
        <div className="header-main">
          <h1>Animation · Unit {unit.number} · {unit.title}</h1>
          <p className="muted">{animation.overview}</p>
        </div>
        <div className="filters" style={{ gap: '10px' }}>
          <button onClick={() => navigate(`/unit/${unit.id}`)}>Back to Unit</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', gap: 24, flexWrap: 'wrap' }}>
        <aside style={{ width: 240, minWidth: 240 }}>
          <div className="animation-sidebar" style={{
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{
              marginTop: 0,
              marginBottom: 16,
              color: 'var(--text)',
              fontSize: '18px',
              fontWeight: '700',
              letterSpacing: '0.5px'
            }}>
              📚 Topics
            </h3>
            {Object.keys(animation.topics).map(t => (
              <button
                key={t}
                onClick={() => navigate(`/animation/unit/${unit.id}?topic=${encodeURIComponent(t)}`)}
                style={{
                  width: '100%',
                  margin: '8px 0',
                  background: t === topic ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'transparent',
                  color: t === topic ? 'white' : 'var(--text)',
                  border: `1px solid ${t === topic ? '#3b82f6' : 'var(--border)'}`,
                  borderRadius: '10px',
                  textAlign: 'left',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  boxShadow: t === topic ? '0 2px 8px rgba(59, 130, 246, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (t !== topic) {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(59, 130, 246, 0.1)';
                    (e.currentTarget as HTMLElement).style.borderColor = '#3b82f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (t !== topic) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                  }
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </aside>

        <main style={{ flex: 1, minWidth: 320 }}>
          <div style={{
            marginBottom: 24,
            padding: '24px',
            borderRadius: '12px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{
              marginTop: 0,
              marginBottom: 12,
              color: 'var(--text)',
              fontSize: '24px',
              fontWeight: '700',
              letterSpacing: '0.5px'
            }}>
              {topicInfo?.title ?? 'Select a topic'}
            </h2>
            <p style={{
              marginBottom: 16,
              color: 'var(--muted)',
              fontSize: '16px',
              lineHeight: '1.6'
            }}>
              {topicInfo?.summary}
            </p>
            <div style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 191, 36, 0.05) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: 20
            }}>
              <strong style={{
                color: '#f59e0b',
                fontSize: '14px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                🔑 MS Keywords:
              </strong>
              <div style={{
                marginTop: 8,
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px'
              }}>
                {topicInfo?.msKeywords.map((kw, idx) => (
                  <span key={idx} style={{
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#f59e0b',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    border: '1px solid rgba(245, 158, 11, 0.3)'
                  }}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {topicInfo && (
            <div>
              <div style={{
                marginBottom: 24,
                padding: '20px',
                borderRadius: '12px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{
                  marginTop: 0,
                  marginBottom: 16,
                  color: 'var(--text)',
                  fontSize: '20px',
                  fontWeight: '700',
                  letterSpacing: '0.5px'
                }}>
                  🧩 Diagrams
                </h3>
                {topicInfo.diagrams.map((d, i) => (
                  <pre key={i} style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(16, 185, 129, 0.03) 100%)',
                    borderRadius: '10px',
                    padding: '16px',
                    whiteSpace: 'pre-wrap',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: 'var(--text)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    marginBottom: i < topicInfo.diagrams.length - 1 ? '12px' : '0',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                  }}>
                    {d}
                  </pre>
                ))}
              </div>

              <div style={{
                padding: '20px',
                borderRadius: '12px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{
                  marginTop: 0,
                  marginBottom: 16,
                  color: 'var(--text)',
                  fontSize: '20px',
                  fontWeight: '700',
                  letterSpacing: '0.5px'
                }}>
                  🎬 Animation
                </h3>
                <TopicAnimation topic={topicInfo} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UnitAnimation;
