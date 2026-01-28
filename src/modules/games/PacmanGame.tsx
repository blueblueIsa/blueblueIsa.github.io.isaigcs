import React, { useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import '../../styles/games.scss';

interface PacmanProps {
  onBack: () => void;
}

export const PacmanGame: React.FC<PacmanProps> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameState = {
      score: 0,
      lives: 3,
      level: 1,
      isPlaying: false,
      isPaused: false,
      gameLoop: null as unknown as ReturnType<typeof setInterval>,
      pacman: { x: 350, y: 225, radius: 15, speed: 3, direction: 0, mouthOpen: 0 },
      ghosts: [
        { x: 300, y: 175, radius: 15, color: '#FF0000', speed: 2, direction: 0, alive: true },
        { x: 400, y: 175, radius: 15, color: '#FFB8FF', speed: 2, direction: 90, alive: true },
        { x: 300, y: 275, radius: 15, color: '#00FFFF', speed: 2, direction: 180, alive: true },
        { x: 400, y: 275, radius: 15, color: '#FFB847', speed: 2, direction: 270, alive: true }
      ],
      dots: [] as Array<{ x: number; y: number }>,
      powerDots: [] as Array<{ x: number; y: number }>,
      dotSize: 5,
      powerDotSize: 10,
      frightenedMode: false,
      frightenedTimer: 0,
      collisionEffect: { active: false, x: 0, y: 0, duration: 0, maxDuration: 15 },
      gameOverEffect: { active: false, fadeOpacity: 0, maxFadeDuration: 30 },
      eatenGhosts: [] as Array<{ ghostIndex: number; x: number; y: number; duration: number; maxDuration: number }>
    };

    const activeKeys = new Set<string>();

    // Initialize dots
    for (let x = 40; x < 660; x += 40) {
      for (let y = 40; y < 410; y += 40) {
        if (Math.random() > 0.15) {
          gameState.dots.push({ x, y });
        }
      }
    }

    // Add power dots
    gameState.powerDots = [
      { x: 50, y: 50 },
      { x: 650, y: 50 },
      { x: 50, y: 400 },
      { x: 650, y: 400 }
    ];

    const drawPacman = (pacman: any) => {
      ctx.save();
      ctx.translate(pacman.x, pacman.y);
      ctx.rotate((pacman.direction * Math.PI) / 180);

      ctx.beginPath();
      ctx.arc(0, 0, pacman.radius, (0.2 + pacman.mouthOpen) * Math.PI, (1.8 - pacman.mouthOpen) * Math.PI);
      ctx.lineTo(0, 0);
      ctx.fillStyle = '#FFFF00';
      ctx.fill();

      ctx.restore();
    };

    const drawGhost = (ghost: any, ghostIndex: number) => {
      // Check if this ghost is eaten and should show animation
      const eatenEffect = gameState.eatenGhosts.find(e => e.ghostIndex === ghostIndex);
      
      if (eatenEffect) {
        const progress = 1 - eatenEffect.duration / eatenEffect.maxDuration;
        const scale = 1 - progress * 0.8;
        const opacity = 1 - progress * 0.5;
        
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.translate(eatenEffect.x, eatenEffect.y);
        ctx.scale(scale, scale);
        
        // Draw fading ghost outline
        ctx.strokeStyle = ghost.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, ghost.radius, Math.PI, 0, false);
        ctx.lineTo(ghost.radius, ghost.radius * 1.5);
        ctx.lineTo(0, ghost.radius * 1.2);
        ctx.lineTo(-ghost.radius, ghost.radius * 1.5);
        ctx.closePath();
        ctx.stroke();
        
        ctx.restore();
        return;
      }
      
      ctx.save();
      ctx.translate(ghost.x, ghost.y);

      ctx.beginPath();
      ctx.arc(0, 0, ghost.radius, Math.PI, 0, false);
      ctx.lineTo(ghost.radius, ghost.radius * 1.5);
      ctx.lineTo(0, ghost.radius * 1.2);
      ctx.lineTo(-ghost.radius, ghost.radius * 1.5);
      ctx.closePath();

      if (gameState.frightenedMode) {
        ctx.fillStyle = '#0000FF';
      } else {
        ctx.fillStyle = ghost.color;
      }
      ctx.fill();

      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(-ghost.radius / 2, -ghost.radius / 4, ghost.radius / 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(ghost.radius / 2, -ghost.radius / 4, ghost.radius / 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0000FF';
      ctx.beginPath();
      ctx.arc(-ghost.radius / 2, -ghost.radius / 4, ghost.radius / 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(ghost.radius / 2, -ghost.radius / 4, ghost.radius / 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const drawDots = () => {
      ctx.fillStyle = '#FFFFFF';
      gameState.dots.forEach((dot) => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, gameState.dotSize, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = '#FFD700';
      gameState.powerDots.forEach((dot) => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, gameState.powerDotSize, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const drawMaze = () => {
      ctx.strokeStyle = '#4169E1';
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, 560, 360);
      ctx.beginPath();
      ctx.rect(200, 150, 200, 100);
      ctx.stroke();
    };

    const updatePacman = () => {
      const pacman = gameState.pacman;

      if (activeKeys.has('ArrowUp')) pacman.direction = 270;
      if (activeKeys.has('ArrowDown')) pacman.direction = 90;
      if (activeKeys.has('ArrowLeft')) pacman.direction = 180;
      if (activeKeys.has('ArrowRight')) pacman.direction = 0;

      const angle = (pacman.direction * Math.PI) / 180;
      pacman.x += Math.cos(angle) * pacman.speed;
      pacman.y += Math.sin(angle) * pacman.speed;

      if (pacman.x - pacman.radius < 20) pacman.x = 20 + pacman.radius;
      if (pacman.x + pacman.radius > 680) pacman.x = 680 - pacman.radius;
      if (pacman.y - pacman.radius < 20) pacman.y = 20 + pacman.radius;
      if (pacman.y + pacman.radius > 430) pacman.y = 430 - pacman.radius;

      pacman.mouthOpen = (pacman.mouthOpen + 0.1) % 0.2;

      gameState.dots = gameState.dots.filter((dot) => {
        const dist = Math.hypot(dot.x - pacman.x, dot.y - pacman.y);
        if (dist < pacman.radius + gameState.dotSize) {
          gameState.score += 10;
          return false;
        }
        return true;
      });

      gameState.powerDots = gameState.powerDots.filter((dot) => {
        const dist = Math.hypot(dot.x - pacman.x, dot.y - pacman.y);
        if (dist < pacman.radius + gameState.powerDotSize) {
          gameState.score += 100;
          gameState.frightenedMode = true;
          gameState.frightenedTimer = 300;
          return false;
        }
        return true;
      });

      if (gameState.frightenedMode) {
        gameState.frightenedTimer--;
        if (gameState.frightenedTimer <= 0) {
          gameState.frightenedMode = false;
        }
      }
    };

    const updateGhosts = () => {
      gameState.ghosts.forEach((ghost, ghostIndex) => {
        if (!ghost.alive) return;
        
        ghost.x += (Math.cos((ghost.direction * Math.PI) / 180) * ghost.speed);
        ghost.y += (Math.sin((ghost.direction * Math.PI) / 180) * ghost.speed);

        if (ghost.x < 30 || ghost.x > 670) ghost.direction = (ghost.direction + 180) % 360;
        if (ghost.y < 30 || ghost.y > 420) ghost.direction = (ghost.direction + 180) % 360;

        // Check collision with Pac-Man
        const dist = Math.hypot(ghost.x - gameState.pacman.x, ghost.y - gameState.pacman.y);
        if (dist < ghost.radius + gameState.pacman.radius) {
          if (gameState.frightenedMode) {
            // Eating ghost in frightened mode - add score and trigger eaten animation
            gameState.score += 200;
            gameState.eatenGhosts.push({
              ghostIndex,
              x: ghost.x,
              y: ghost.y,
              duration: 20,
              maxDuration: 20
            });
            ghost.alive = false;
            ghost.x = 300 + Math.random() * 100;
            ghost.y = 150 + Math.random() * 100;
          } else {
            // Hit by ghost - show collision effect and lose a life
            gameState.collisionEffect.active = true;
            gameState.collisionEffect.x = gameState.pacman.x;
            gameState.collisionEffect.y = gameState.pacman.y;
            gameState.collisionEffect.duration = gameState.collisionEffect.maxDuration;
            
            gameState.lives--;
            if (gameState.lives <= 0) {
              gameState.isPlaying = false;
              gameState.gameOverEffect.active = true;
              gameState.gameOverEffect.fadeOpacity = 0;
              clearInterval(gameState.gameLoop);
            } else {
              // Reset Pac-Man position
              gameState.pacman.x = 350;
              gameState.pacman.y = 225;
            }
          }
        }
      });
    };

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawMaze();
      drawDots();
      drawPacman(gameState.pacman);
      gameState.ghosts.forEach((ghost, index) => drawGhost(ghost, index));

      updatePacman();
      updateGhosts();

      // Update and render eaten ghost effects
      gameState.eatenGhosts = gameState.eatenGhosts.filter(effect => {
        effect.duration--;
        return effect.duration > 0;
      });

      // Render collision effect (red flash)
      if (gameState.collisionEffect.active && gameState.collisionEffect.duration > 0) {
        const opacity = gameState.collisionEffect.duration / gameState.collisionEffect.maxDuration;
        ctx.save();
        ctx.globalAlpha = opacity * 0.4;
        ctx.fillStyle = '#FF0000';
        
        // Red expanding rings
        const currentRadius = (gameState.collisionEffect.maxDuration - gameState.collisionEffect.duration) * 5;
        
        ctx.beginPath();
        ctx.arc(gameState.collisionEffect.x, gameState.collisionEffect.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        gameState.collisionEffect.duration--;
      }

      // Render game-over effect
      if (gameState.gameOverEffect.active) {
        gameState.gameOverEffect.fadeOpacity = Math.min(gameState.gameOverEffect.fadeOpacity + 0.05, 0.7);
        
        ctx.save();
        ctx.fillStyle = '#000000';
        ctx.globalAlpha = gameState.gameOverEffect.fadeOpacity;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw GAME OVER text
        ctx.fillStyle = '#FF0000';
        ctx.globalAlpha = Math.min(gameState.gameOverEffect.fadeOpacity * 1.5, 1);
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30);
        
        ctx.font = '24px Arial';
        ctx.fillText(`Final Score: ${gameState.score}`, canvas.width / 2, canvas.height / 2 + 20);
        
        ctx.restore();
      }

      if (gameState.dots.length === 0 && gameState.powerDots.length === 0) {
        gameState.level++;
        for (let x = 40; x < 660; x += 40) {
          for (let y = 40; y < 410; y += 40) {
            if (Math.random() > 0.15) {
              gameState.dots.push({ x, y });
            }
          }
        }
        gameState.powerDots = [
          { x: 50, y: 50 },
          { x: 650, y: 50 },
          { x: 50, y: 400 },
          { x: 650, y: 400 }
        ];
        // Reset ghosts to alive
        gameState.ghosts.forEach(ghost => {
          ghost.alive = true;
        });
      }
    };

    const startGame = () => {
      if (!gameState.isPlaying) {
        gameState.isPlaying = true;
        gameState.isPaused = false;
        gameState.gameLoop = setInterval(gameLoop, 50);
      }
    };

    const pauseGame = () => {
      if (gameState.isPlaying) {
        gameState.isPaused = !gameState.isPaused;
        if (gameState.isPaused) {
          clearInterval(gameState.gameLoop);
        } else {
          gameState.gameLoop = setInterval(gameLoop, 50);
        }
      }
    };

    const resetGame = () => {
      clearInterval(gameState.gameLoop);
      gameState.score = 0;
      gameState.lives = 3;
      gameState.level = 1;
      gameState.isPlaying = false;
      gameState.isPaused = false;
      gameState.pacman = { x: 350, y: 225, radius: 15, speed: 3, direction: 0, mouthOpen: 0 };
      gameState.dots = [];
      gameState.powerDots = [];
      gameState.collisionEffect = { active: false, x: 0, y: 0, duration: 0, maxDuration: 15 };
      gameState.gameOverEffect = { active: false, fadeOpacity: 0, maxFadeDuration: 30 };
      gameState.eatenGhosts = [];
      gameState.ghosts.forEach(ghost => {
        ghost.alive = true;
      });

      for (let x = 40; x < 660; x += 40) {
        for (let y = 40; y < 410; y += 40) {
          if (Math.random() > 0.15) {
            gameState.dots.push({ x, y });
          }
        }
      }

      gameState.powerDots = [
        { x: 50, y: 50 },
        { x: 650, y: 50 },
        { x: 50, y: 400 },
        { x: 650, y: 400 }
      ];

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawMaze();
      drawDots();
      drawPacman(gameState.pacman);
      gameState.ghosts.forEach((ghost, index) => drawGhost(ghost, index));
    };

    const keydownHandler = (e: KeyboardEvent) => {
      activeKeys.add(e.key);
    };

    const keyupHandler = (e: KeyboardEvent) => {
      activeKeys.delete(e.key);
    };

    document.addEventListener('keydown', keydownHandler);
    document.addEventListener('keyup', keyupHandler);

    // Initial draw
    drawMaze();
    drawDots();
    drawPacman(gameState.pacman);
    gameState.ghosts.forEach((ghost, index) => drawGhost(ghost, index));

    // Expose controls to global
    (window as any).pacmanControls = { startGame, pauseGame, resetGame };

    return () => {
      clearInterval(gameState.gameLoop);
      document.removeEventListener('keydown', keydownHandler);
      document.removeEventListener('keyup', keyupHandler);
      delete (window as any).pacmanControls;
    };
  }, []);

  const handleStart = () => {
    (window as any).pacmanControls?.startGame();
  };

  const handlePause = () => {
    (window as any).pacmanControls?.pauseGame();
  };

  const handleReset = () => {
    (window as any).pacmanControls?.resetGame();
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <button className="back-button" onClick={onBack} title="Back to games">
          <ArrowLeft size={20} />
        </button>
        <h2>Pac-Man</h2>
      </div>

      <div className="game-content">
        <canvas ref={canvasRef} width={700} height={450} className="game-canvas" />

        <div className="game-controls">
          <h3>Controls</h3>
          <p>Use arrow keys to move Pac-Man. Eat all the dots to win!</p>
          <p>Power dots make ghosts vulnerable for a short time.</p>

          <div className="button-group">
            <button className="btn btn-primary" onClick={handleStart}>
              Start
            </button>
            <button className="btn btn-warning" onClick={handlePause}>
              Pause
            </button>
            <button className="btn btn-danger" onClick={handleReset}>
              Reset
            </button>
          </div>

          <div className="keyboard-info">
            <p>Arrow Keys: Move</p>
          </div>
        </div>
      </div>
    </div>
  );
};
