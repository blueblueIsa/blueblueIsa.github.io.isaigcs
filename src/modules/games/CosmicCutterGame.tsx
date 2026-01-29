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
  const [initialDifficulty, setInitialDifficulty] = useState(1);
  const [failThresholdState, setFailThresholdState] = useState( -200 );

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
    // difficulty scaling and effects
    difficultyMultiplier: 1,
    nextDifficultyAt: 1000,
    bombHitFlash: { active: false, opacity: 0 },
    failThreshold: -200,
    isSlicing: false,
    sliceTrail: [] as Array<{ x: number; y: number }>,
    handX: 0,
    handY: 0,
  });

  // Gameplay tuning constants
  const ORB_SIZE_MIN = 6;
  const ORB_SIZE_MAX = 18;
  const BOMB_SIZE_MIN = 10;
  const BOMB_SIZE_MAX = 30;
  const BOMB_DAMAGE_MULT = 12; // damage per unit size

  

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
          const gained = Math.round((orb.points || 100) * gameStateRef.current.difficultyMultiplier);
          gameStateRef.current.score += gained * gameStateRef.current.combo;
          setScore(gameStateRef.current.score);

          // Create explosion particles (scaled by orb size)
          const particleCount = Math.min(60, 8 + Math.floor(orb.size * 2));
          for (let j = 0; j < particleCount; j++) {
            gameStateRef.current.particles.push({
              x: orb.x,
              y: orb.y,
              vx: (Math.random() - 0.5) * (6 + orb.size / 2),
              vy: (Math.random() - 0.5) * (6 + orb.size / 2),
              size: Math.random() * (particleSizeRange || 2) + 1,
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
          // compute damage from size if not set
          const damage = bomb.damage || Math.round(bomb.size * BOMB_DAMAGE_MULT);
          gameStateRef.current.score -= damage;
          setScore(gameStateRef.current.score);

          // Create exaggerated red explosion particles for bomb
          const particleCount = 30 + Math.floor(bomb.size * 2);
          for (let j = 0; j < particleCount; j++) {
            gameStateRef.current.particles.push({
              x: bomb.x,
              y: bomb.y,
              vx: (Math.random() - 0.5) * (10 + bomb.size),
              vy: (Math.random() - 0.5) * (10 + bomb.size),
              size: Math.random() * (particleSizeRange || 2) + 2,
              color: '#ff3333',
              life: 1,
            });
          }

          // Trigger canvas red flash
          gameStateRef.current.bombHitFlash.active = true;
          gameStateRef.current.bombHitFlash.opacity = 0.95;

          // Reset combo on bomb hit
          gameStateRef.current.combo = 1;
          setCombo(1);

          // If score fell below fail threshold, end the game
          if (gameStateRef.current.score < (gameStateRef.current.failThreshold ?? -200)) {
            gameStateRef.current.gameActive = false;
            setGameActive(false);
            if (gameStateRef.current.gameTimer) {
              clearInterval(gameStateRef.current.gameTimer);
              gameStateRef.current.gameTimer = null;
            }
          }
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

        // Randomly create new orbs (scale frequency with difficulty)
        if (Math.random() < 0.02 * (gameStateRef.current.difficultyMultiplier || 1)) {
          const orbTypes = [
            { color: '#ff3366', points: 100 },
            { color: '#6ee7ff', points: 200 },
            { color: '#9966ff', points: 300 },
            { color: '#66ff99', points: 400 },
            { color: '#ff9900', points: 500 },
          ];
          const type = orbTypes[Math.floor(Math.random() * orbTypes.length)];
          const size = ORB_SIZE_MIN + Math.random() * (ORB_SIZE_MAX - ORB_SIZE_MIN);
          const points = Math.round(type.points * (size / 12));
          gameStateRef.current.energyOrbs.push({
            x: Math.random() * canvas.width,
            y: -30,
            vx: (Math.random() - 0.5) * (1.5 + gameStateRef.current.difficultyMultiplier),
            vy: 1.5 + Math.random() * (1.5 + gameStateRef.current.difficultyMultiplier),
            size,
            color: type.color,
            hit: false,
            points,
          });
        }

        // Randomly create bombs (scale frequency with difficulty)
        if (Math.random() < 0.005 * (gameStateRef.current.difficultyMultiplier || 1)) {
          const size = BOMB_SIZE_MIN + Math.random() * (BOMB_SIZE_MAX - BOMB_SIZE_MIN);
          const damage = Math.round(size * BOMB_DAMAGE_MULT);
          gameStateRef.current.bombs.push({
            x: Math.random() * canvas.width,
            y: -30,
            vy: 1 + Math.random() * (1.5 + gameStateRef.current.difficultyMultiplier),
            size,
            hit: false,
            damage,
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

      // Render bomb flash overlay (canvas effect)
      if (gameStateRef.current.bombHitFlash && gameStateRef.current.bombHitFlash.active) {
        const op = gameStateRef.current.bombHitFlash.opacity;
        ctx.save();
        ctx.fillStyle = `rgba(255,0,0,${Math.min(1, op)})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        // decay
        gameStateRef.current.bombHitFlash.opacity *= 0.92;
        if (gameStateRef.current.bombHitFlash.opacity < 0.02) {
          gameStateRef.current.bombHitFlash.active = false;
          gameStateRef.current.bombHitFlash.opacity = 0;
        }
      }

      // Difficulty increase based on score
      if (gameStateRef.current.score >= (gameStateRef.current.nextDifficultyAt || 1000)) {
        gameStateRef.current.difficultyMultiplier = (gameStateRef.current.difficultyMultiplier || 1) + 0.5;
        gameStateRef.current.nextDifficultyAt = (gameStateRef.current.nextDifficultyAt || 1000) * 2;
      }

      // If score falls below fail threshold, ensure game stops (safety)
          if (gameStateRef.current.score < (gameStateRef.current.failThreshold ?? -200)) {
        gameStateRef.current.gameActive = false;
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
      // initialize difficulty and fail threshold from UI
      gameStateRef.current.difficultyMultiplier = initialDifficulty;
      gameStateRef.current.failThreshold = failThresholdState;
      gameStateRef.current.nextDifficultyAt = Math.max(500, Math.floor(1000 * gameStateRef.current.difficultyMultiplier));

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
        height: '100vh',
        background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 100%)',
        borderRadius: '0',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className="game-header" style={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 60, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} className="back-button" title="Back to games">← Back</button>
        <h2 style={{ margin: 0, color: '#e5e7eb' }}>Cosmic Cutter</h2>
      </div>

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

      {/* Game Stats */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'rgba(10, 15, 35, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '12px',
          padding: 'clamp(10px, 2.5vw, 16px)',
          border: '1px solid rgba(110, 231, 255, 0.2)',
          color: '#e5e7eb',
          minWidth: 'clamp(160px, 20vw, 200px)',
          maxWidth: '90vw',
          zIndex: 45,
          fontSize: 'clamp(11px, 2.2vw, 14px)',
        }}
      >
        <div style={{ marginBottom: '12px', fontSize: '14px' }}>
          <div style={{ color: '#9ca3af', marginBottom: '4px' }}>Score</div>
          <div style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 'bold', color: '#6ee7ff' }}>{score}</div>
        </div>
        <div style={{ marginBottom: '12px', fontSize: '14px' }}>
          <div style={{ color: '#9ca3af', marginBottom: '4px' }}>Combo</div>
          <div style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 'bold', color: '#6ee7ff' }}>x{combo}</div>
        </div>
        <div style={{ marginBottom: '12px', fontSize: '14px' }}>
          <div style={{ color: '#9ca3af', marginBottom: '4px' }}>Time</div>
          <div style={{ fontSize: 'clamp(14px, 2.5vw, 18px)', fontWeight: 'bold', color: '#6ee7ff' }}>{gameTime}</div>
        </div>
        <div style={{ marginBottom: '12px', fontSize: '14px' }}>
          <div style={{ color: '#9ca3af', marginBottom: '4px' }}>Cuts</div>
          <div style={{ fontSize: 'clamp(14px, 2.5vw, 18px)', fontWeight: 'bold', color: '#6ee7ff' }}>{sliceCount}</div>
        </div>
        <div style={{ fontSize: '14px' }}>
          <div style={{ color: '#9ca3af', marginBottom: '4px' }}>Accuracy</div>
          <div style={{ fontSize: 'clamp(14px, 2.5vw, 18px)', fontWeight: 'bold', color: '#6ee7ff' }}>{accuracy}</div>
        </div>
      </div>

      {/* End-game overlay: show when game not active but was started */}
      {(!gameActive && gameStateRef.current.gameStartTime > 0) && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', zIndex: 60 }}>
          <div style={{ background: '#0b1220', padding: 18, borderRadius: 10, minWidth: 300, color: '#fff', textAlign: 'center' }}>
            <h2 style={{ margin: 0 }}>{gameStateRef.current.score < (gameStateRef.current.failThreshold ?? -200) ? 'You Failed' : 'Game Over'}</h2>
            <p style={{ marginTop: 8 }}>Final Score: {gameStateRef.current.score}</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
              <button onClick={() => { handleStartGame(); }} style={{ padding: '8px 12px' }}>Retry</button>
              <button onClick={onBack} style={{ padding: '8px 12px' }}>Back</button>
            </div>
          </div>
        </div>
      )}

      {/* Control Panel */}
      <div
        style={{
          position: 'fixed',
          bottom: 'clamp(10px, 2vh, 30px)',
          left: 'clamp(10px, 2vw, 20px)',
          background: 'rgba(10, 15, 35, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '12px',
          padding: 'clamp(12px, 2vw, 16px)',
          border: '1px solid rgba(110, 231, 255, 0.2)',
          color: '#e5e7eb',
          zIndex: 40,
          minWidth: 'clamp(180px, 25vw, 280px)',
          maxWidth: '90vw',
          maxHeight: 'calc(100vh - 140px)',
          overflowY: 'auto',
          fontSize: 'clamp(11px, 2vw, 13px)',
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

        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '13px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>
            Initial Difficulty Multiplier: {initialDifficulty.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={initialDifficulty}
            onChange={(e) => setInitialDifficulty(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '13px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>
            Fail Threshold: {failThresholdState}
          </label>
          <input
            type="range"
            min="-1000"
            max="0"
            step="50"
            value={failThresholdState}
            onChange={(e) => setFailThresholdState(parseInt(e.target.value))}
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
          position: 'fixed',
          bottom: 'clamp(10px, 2vh, 30px)',
          right: 'clamp(10px, 2vw, 20px)',
          background: 'rgba(10, 15, 35, 0.95)',
          backdropFilter: 'blur(15px)',
          borderRadius: '12px',
          padding: 'clamp(10px, 2vw, 12px)',
          border: '1px solid rgba(110, 231, 255, 0.2)',
          color: '#ccc',
          fontSize: 'clamp(10px, 1.8vw, 12px)',
          maxWidth: 'clamp(200px, 22vw, 280px)',
          maxHeight: 'calc(100vh - 140px)',
          overflowY: 'auto',
          zIndex: 40,
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
