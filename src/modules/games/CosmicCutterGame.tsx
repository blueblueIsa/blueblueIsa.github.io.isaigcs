import React, { useEffect, useRef, useState } from 'react';
import type { GameProps } from './types';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
}

interface EnergyOrb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  points: number;
  hit: boolean;
}

interface Bomb {
  x: number;
  y: number;
  vy: number;
  size: number;
  hit: boolean;
  damage: number;
}

export const CosmicCutterGame: React.FC<GameProps> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [gameActive, setGameActive] = useState(false);
  const [gameTime, setGameTime] = useState('0:00');
  const [sliceCount, setSliceCount] = useState(0);
  const [accuracy, setAccuracy] = useState('0%');
  const [particleSize, setParticleSize] = useState(6);
  const [particleSizeRange, setParticleSizeRange] = useState(2);
  const [powerUpSpeed, setPowerUpSpeed] = useState(0.6);
  const [showTrail, setShowTrail] = useState(true);
  const [gestureMode, setGestureMode] = useState(true);

  const gameStateRef = useRef({
    score: 0,
    combo: 1,
    sliceCount: 0,
    totalSwipes: 0,
    lastSliceTime: 0,
    gameActive: false,
    gameStartTime: 0,
    gameTimer: null as ReturnType<typeof setInterval> | null,
    particles: [] as Particle[],
    energyOrbs: [] as EnergyOrb[],
    bombs: [] as Bomb[],
    isSlicing: false,
    sliceTrail: [] as Array<{ x: number; y: number }>,
    handX: 0,
    handY: 0,
  });

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Mouse/Touch event handlers
    const handlePointerDown = (e: PointerEvent) => {
      if (!gameStateRef.current.gameActive) return;
      const rect = canvas.getBoundingClientRect();
      gameStateRef.current.isSlicing = true;
      gameStateRef.current.sliceTrail = [
        { x: e.clientX - rect.left, y: e.clientY - rect.top }
      ];
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      
      // Update hand position for gesture mode
      gameStateRef.current.handX = pos.x;
      gameStateRef.current.handY = pos.y;

      if (!gameStateRef.current.isSlicing || !gameStateRef.current.gameActive) return;
      
      gameStateRef.current.sliceTrail.push(pos);

      if (gameStateRef.current.sliceTrail.length > 30) {
        gameStateRef.current.sliceTrail.shift();
      }

      // Check for hits
      checkHits(pos);
    };

    const handlePointerUp = () => {
      gameStateRef.current.isSlicing = false;
      gameStateRef.current.sliceCount++;
      setSliceCount(gameStateRef.current.sliceCount);
      gameStateRef.current.totalSwipes++;

      // Calculate accuracy
      if (gameStateRef.current.totalSwipes > 0) {
        const acc = Math.round((gameStateRef.current.sliceCount / gameStateRef.current.totalSwipes) * 100);
        setAccuracy(`${acc}%`);
      }

      gameStateRef.current.sliceTrail = [];
    };

    const checkHits = (pos: { x: number; y: number }) => {
      for (let i = 0; i < gameStateRef.current.energyOrbs.length; i++) {
        const orb = gameStateRef.current.energyOrbs[i];
        if (orb.hit) continue;

        const dx = orb.x - pos.x;
        const dy = orb.y - pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < orb.size + 10) {
          orb.hit = true;
          gameStateRef.current.score += orb.points * gameStateRef.current.combo;
          setScore(gameStateRef.current.score);

          // Create explosion particles
          for (let j = 0; j < 20; j++) {
            gameStateRef.current.particles.push({
              x: orb.x,
              y: orb.y,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.5) * 8,
              size: Math.random() * 4 + 2,
              color: orb.color,
              life: 1,
            });
          }

          // Update combo
          const currentTime = Date.now();
          if (currentTime - gameStateRef.current.lastSliceTime < 1500) {
            gameStateRef.current.combo++;
          } else {
            gameStateRef.current.combo = 1;
          }
          gameStateRef.current.lastSliceTime = currentTime;
          setCombo(gameStateRef.current.combo);
        }
      }

      // Check bomb hits
      for (let i = 0; i < gameStateRef.current.bombs.length; i++) {
        const bomb = gameStateRef.current.bombs[i];
        if (bomb.hit) continue;

        const dx = bomb.x - pos.x;
        const dy = bomb.y - pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < bomb.size + 10) {
          bomb.hit = true;
          gameStateRef.current.score -= bomb.damage;
          if (gameStateRef.current.score < 0) gameStateRef.current.score = 0;
          setScore(gameStateRef.current.score);

          // Create red explosion particles for bomb
          for (let j = 0; j < 15; j++) {
            gameStateRef.current.particles.push({
              x: bomb.x,
              y: bomb.y,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.5) * 8,
              size: Math.random() * 4 + 2,
              color: '#ff3333',
              life: 1,
            });
          }

          // Reset combo on bomb hit
          gameStateRef.current.combo = 1;
          setCombo(1);
        }
      }
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);

    // Handle window resize
    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      // Clear canvas
      ctx.fillStyle = 'rgba(15, 20, 25, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw background gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'rgba(10, 10, 26, 0.05)');
      gradient.addColorStop(1, 'rgba(26, 26, 58, 0.05)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw energy orbs
      if (gameStateRef.current.gameActive) {
        for (let i = 0; i < gameStateRef.current.energyOrbs.length; i++) {
          const orb = gameStateRef.current.energyOrbs[i];
          orb.x += orb.vx * (powerUpSpeed / 0.6);
          orb.y += orb.vy * (powerUpSpeed / 0.6);

          if (!orb.hit) {
            ctx.fillStyle = orb.color;
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, orb.size, 0, Math.PI * 2);
            ctx.fill();

            // Add glow
            ctx.strokeStyle = orb.color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.5;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }

          // Remove if off-screen
          if (orb.x < -50 || orb.x > canvas.width + 50 || orb.y < -50 || orb.y > canvas.height + 50) {
            gameStateRef.current.energyOrbs.splice(i, 1);
            i--;
          }
        }

        // Update and draw bombs
        for (let i = 0; i < gameStateRef.current.bombs.length; i++) {
          const bomb = gameStateRef.current.bombs[i];
          bomb.y += bomb.vy * (powerUpSpeed / 0.6);

          if (!bomb.hit) {
            ctx.fillStyle = '#ff5555';
            ctx.beginPath();
            ctx.arc(bomb.x, bomb.y, bomb.size, 0, Math.PI * 2);
            ctx.fill();

            // Add warning glow
            ctx.strokeStyle = '#ff3333';
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.7;
            ctx.stroke();
            ctx.globalAlpha = 1;

            // Draw "X" on bomb
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(bomb.x - bomb.size / 2, bomb.y - bomb.size / 2);
            ctx.lineTo(bomb.x + bomb.size / 2, bomb.y + bomb.size / 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(bomb.x + bomb.size / 2, bomb.y - bomb.size / 2);
            ctx.lineTo(bomb.x - bomb.size / 2, bomb.y + bomb.size / 2);
            ctx.stroke();
          }

          // Remove if off-screen or hit
          if (bomb.y > canvas.height + 50) {
            gameStateRef.current.bombs.splice(i, 1);
            i--;
          }
        }

        // Randomly create new orbs
        if (Math.random() < 0.02) {
          const orbTypes = [
            { color: '#ff3366', points: 100 },
            { color: '#6ee7ff', points: 200 },
            { color: '#9966ff', points: 300 },
            { color: '#66ff99', points: 400 },
            { color: '#ff9900', points: 500 },
          ];
          const type = orbTypes[Math.floor(Math.random() * orbTypes.length)];
          gameStateRef.current.energyOrbs.push({
            x: Math.random() * canvas.width,
            y: -30,
            vx: (Math.random() - 0.5) * 2,
            vy: 2 + Math.random() * 2,
            size: 12,
            color: type.color,
            hit: false,
            points: type.points,
          });
        }

        // Randomly create bombs
        if (Math.random() < 0.005) {
          gameStateRef.current.bombs.push({
            x: Math.random() * canvas.width,
            y: -30,
            vy: 1.5 + Math.random() * 1,
            size: 10,
            hit: false,
            damage: 150,
          });
        }
      }

      // Draw particles
      for (let i = 0; i < gameStateRef.current.particles.length; i++) {
        const p = gameStateRef.current.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // gravity
        p.life -= 0.02;

        if (p.life <= 0) {
          gameStateRef.current.particles.splice(i, 1);
          i--;
        } else {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          ctx.beginPath();
          // Use particle size from state
          ctx.arc(p.x, p.y, (p.size * particleSize) / 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      // Draw slice trail
      if (gameStateRef.current.isSlicing && showTrail && gameStateRef.current.sliceTrail.length > 1) {
        ctx.strokeStyle = 'rgba(110, 231, 255, 0.8)';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(gameStateRef.current.sliceTrail[0].x, gameStateRef.current.sliceTrail[0].y);
        for (let i = 1; i < gameStateRef.current.sliceTrail.length; i++) {
          ctx.lineTo(gameStateRef.current.sliceTrail[i].x, gameStateRef.current.sliceTrail[i].y);
        }
        ctx.stroke();
      }

      // Draw hand cursor for gesture mode
      if (gestureMode && gameStateRef.current.gameActive) {
        ctx.fillStyle = 'rgba(110, 231, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(gameStateRef.current.handX, gameStateRef.current.handY, 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(110, 231, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(gameStateRef.current.handX, gameStateRef.current.handY, 15, 0, Math.PI * 2);
        ctx.stroke();
      }

      requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('resize', handleResize);
    };
  }, [showTrail, particleSize, gestureMode]);


  const handleStartGame = () => {
    if (gameStateRef.current.gameActive) {
      handlePauseGame();
    } else {
      gameStateRef.current.gameActive = true;
      gameStateRef.current.score = 0;
      gameStateRef.current.combo = 1;
      gameStateRef.current.sliceCount = 0;
      gameStateRef.current.totalSwipes = 0;
      gameStateRef.current.gameStartTime = Date.now();

      setGameActive(true);
      setScore(0);
      setCombo(1);
      setSliceCount(0);
      setAccuracy('0%');

      const timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - gameStateRef.current.gameStartTime) / 1000);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        setGameTime(`${mins}:${secs.toString().padStart(2, '0')}`);
      }, 1000);

      gameStateRef.current.gameTimer = timer;
    }
  };

  const handlePauseGame = () => {
    gameStateRef.current.gameActive = false;
    setGameActive(false);
    if (gameStateRef.current.gameTimer) {
      clearInterval(gameStateRef.current.gameTimer);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: 'calc(100vh - 100px)',
        background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 100%)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />

      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(110, 231, 255, 0.2)',
          border: '1px solid rgba(110, 231, 255, 0.4)',
          color: '#6ee7ff',
          padding: '10px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          zIndex: 10,
          fontSize: '14px',
          fontWeight: 600,
        }}
      >
        ← Back
      </button>

      {/* Game Stats */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(10, 15, 35, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid rgba(110, 231, 255, 0.2)',
          color: '#e5e7eb',
          minWidth: '200px',
          zIndex: 5,
        }}
      >
        <div style={{ marginBottom: '12px', fontSize: '14px' }}>
          <div style={{ color: '#9ca3af', marginBottom: '4px' }}>Score</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#6ee7ff' }}>{score}</div>
        </div>
        <div style={{ marginBottom: '12px', fontSize: '14px' }}>
          <div style={{ color: '#9ca3af', marginBottom: '4px' }}>Combo</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#6ee7ff' }}>x{combo}</div>
        </div>
        <div style={{ marginBottom: '12px', fontSize: '14px' }}>
          <div style={{ color: '#9ca3af', marginBottom: '4px' }}>Time</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#6ee7ff' }}>{gameTime}</div>
        </div>
        <div style={{ marginBottom: '12px', fontSize: '14px' }}>
          <div style={{ color: '#9ca3af', marginBottom: '4px' }}>Cuts</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#6ee7ff' }}>{sliceCount}</div>
        </div>
        <div style={{ fontSize: '14px' }}>
          <div style={{ color: '#9ca3af', marginBottom: '4px' }}>Accuracy</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#6ee7ff' }}>{accuracy}</div>
        </div>
      </div>

      {/* Control Panel */}
      <div
        style={{
          position: 'absolute',
          bottom: '30px',
          left: '20px',
          background: 'rgba(10, 15, 35, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid rgba(110, 231, 255, 0.2)',
          color: '#e5e7eb',
          zIndex: 5,
          minWidth: '220px',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <input
              type="checkbox"
              checked={showTrail}
              onChange={(e) => setShowTrail(e.target.checked)}
            />
            <span style={{ fontSize: '14px' }}>✨ Trail Effect</span>
          </label>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <input
              type="checkbox"
              checked={gestureMode}
              onChange={(e) => setGestureMode(e.target.checked)}
            />
            <span style={{ fontSize: '14px' }}>👆 Gesture Mode</span>
          </label>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '13px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>
            Particle Size: {particleSize}
          </label>
          <input
            type="range"
            min="3"
            max="12"
            step="1"
            value={particleSize}
            onChange={(e) => setParticleSize(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '13px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>
            Size Variation: {particleSizeRange}
          </label>
          <input
            type="range"
            min="0.5"
            max="4"
            step="0.5"
            value={particleSizeRange}
            onChange={(e) => setParticleSizeRange(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '13px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>
            Speed: {powerUpSpeed.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.3"
            max="2"
            step="0.1"
            value={powerUpSpeed}
            onChange={(e) => setPowerUpSpeed(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <button
          onClick={handleStartGame}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, rgba(110, 231, 255, 0.2), rgba(80, 120, 255, 0.2))',
            border: '1px solid rgba(110, 231, 255, 0.4)',
            color: '#6ee7ff',
            padding: '10px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            marginTop: '12px',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.background =
              'linear-gradient(135deg, rgba(110, 231, 255, 0.4), rgba(80, 120, 255, 0.4))';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.background =
              'linear-gradient(135deg, rgba(110, 231, 255, 0.2), rgba(80, 120, 255, 0.2))';
          }}
        >
          {gameActive ? '⏸ Pause' : '▶ Start Game'}
        </button>
      </div>

      {/* Instructions */}
      <div
        style={{
          position: 'absolute',
          bottom: '30px',
          right: '20px',
          background: 'rgba(10, 15, 35, 0.85)',
          backdropFilter: 'blur(15px)',
          borderRadius: '12px',
          padding: '12px',
          border: '1px solid rgba(110, 231, 255, 0.2)',
          color: '#ccc',
          fontSize: '12px',
          maxWidth: '280px',
          zIndex: 5,
        }}
      >
        <div style={{ color: '#6ee7ff', fontWeight: 'bold', marginBottom: '8px' }}>📖 Instructions:</div>
        <p style={{ margin: '4px 0', lineHeight: '1.4' }}>1. Click "Start Game" to begin</p>
        <p style={{ margin: '4px 0', lineHeight: '1.4' }}>2. Click/drag to slice energy orbs</p>
        <p style={{ margin: '4px 0', lineHeight: '1.4' }}>3. Avoid red bombs! They deduct points</p>
        <p style={{ margin: '4px 0', lineHeight: '1.4' }}>4. Fast cuts = higher combo multiplier</p>
        <p style={{ margin: '4px 0', lineHeight: '1.4' }}>5. Different colors = different points</p>
      </div>
    </div>
  );
};
