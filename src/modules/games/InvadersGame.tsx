import React, { useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import '../../styles/games.scss';

interface InvadersGameProps {
  onBack: () => void;
}

export const InvadersGame: React.FC<InvadersGameProps> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameState = {
      score: 0,
      lives: 3,
      wave: 1,
      isPlaying: false,
      isPaused: false,
      gameLoop: null as unknown as ReturnType<typeof setInterval>,
      player: { x: canvas.width / 2 - 25, y: canvas.height - 40, width: 50, height: 20, speed: 7 },
      bullets: [] as Array<{ x: number; y: number }>,
      enemies: [] as Array<Array<{ x: number; y: number; status: number }>>,
      enemyRows: 3,
      enemyCols: 8,
      enemyWidth: 40,
      enemyHeight: 30,
      enemyPadding: 15,
      enemyOffsetTop: 50,
      enemyOffsetLeft: 30,
      enemySpeed: 1,
      enemyDirection: 1,
      enemyDropDistance: 10,
      lastShot: 0,
      shotDelay: 300,
      enemyShots: [] as any[],
      enemyShotChance: 0.01,
      hitEffect: { active: false, x: 0, y: 0, duration: 0, maxDuration: 10 }
    };

    const activeKeys = new Set<string>();

    const initEnemies = () => {
      gameState.enemies = [];
      for (let c = 0; c < gameState.enemyCols; c++) {
        gameState.enemies[c] = [];
        for (let r = 0; r < gameState.enemyRows; r++) {
          const enemyX = c * (gameState.enemyWidth + gameState.enemyPadding) + gameState.enemyOffsetLeft;
          const enemyY = r * (gameState.enemyHeight + gameState.enemyPadding) + gameState.enemyOffsetTop;
          gameState.enemies[c][r] = { x: enemyX, y: enemyY, status: 1 };
        }
      }
    };

    initEnemies();

    const drawPlayer = () => {
      // Draw player with gradient and glow effect
      const playerGradient = ctx.createLinearGradient(gameState.player.x, gameState.player.y, gameState.player.x, gameState.player.y + gameState.player.height);
      playerGradient.addColorStop(0, '#64B5F6');
      playerGradient.addColorStop(1, '#1976D2');
      ctx.fillStyle = playerGradient;

      ctx.beginPath();
      ctx.moveTo(gameState.player.x, gameState.player.y + gameState.player.height);
      ctx.lineTo(gameState.player.x + gameState.player.width / 2, gameState.player.y);
      ctx.lineTo(gameState.player.x + gameState.player.width, gameState.player.y + gameState.player.height);
      ctx.closePath();
      ctx.fill();

      ctx.fillRect(gameState.player.x + 15, gameState.player.y + gameState.player.height, gameState.player.width - 30, 8);

      // Add glow effect
      ctx.shadowColor = '#2196F3';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = '#64B5F6';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowColor = 'transparent';
    };

    const drawBullets = () => {
      // Player bullets - yellow with glow
      ctx.fillStyle = '#FFFF00';
      ctx.shadowColor = '#FFFF00';
      ctx.shadowBlur = 8;
      gameState.bullets.forEach((bullet) => {
        ctx.fillRect(bullet.x, bullet.y, 4, 10);
        ctx.beginPath();
        ctx.arc(bullet.x + 2, bullet.y + 5, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowColor = 'transparent';

      // Enemy bullets - red with glow
      ctx.fillStyle = '#FF5252';
      ctx.shadowColor = '#FF1744';
      ctx.shadowBlur = 8;
      gameState.enemyShots.forEach((shot) => {
        ctx.fillRect(shot.x, shot.y, 4, 10);
        ctx.beginPath();
        ctx.arc(shot.x + 2, shot.y + 5, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowColor = 'transparent';
    };

    const drawEnemies = () => {
      for (let c = 0; c < gameState.enemyCols; c++) {
        for (let r = 0; r < gameState.enemyRows; r++) {
          if (gameState.enemies[c][r].status === 1) {
            const enemy = gameState.enemies[c][r];
            
            // Gradient fill for enemies
            const enemyGradient = ctx.createLinearGradient(enemy.x, enemy.y, enemy.x, enemy.y + gameState.enemyHeight);
            enemyGradient.addColorStop(0, '#FFB74D');
            enemyGradient.addColorStop(1, '#F57C00');
            ctx.fillStyle = enemyGradient;
            
            ctx.fillRect(enemy.x, enemy.y, gameState.enemyWidth, gameState.enemyHeight);

            // Eyes
            ctx.fillStyle = '#000000';
            ctx.fillRect(enemy.x + 8, enemy.y + 5, 8, 8);
            ctx.fillRect(enemy.x + gameState.enemyWidth - 16, enemy.y + 5, 8, 8);

            // Mouth
            ctx.fillStyle = '#FFB74D';
            ctx.fillRect(enemy.x + 5, enemy.y + 20, 6, 6);
            ctx.fillRect(enemy.x + gameState.enemyWidth - 11, enemy.y + 20, 6, 6);

            // Add border/glow
            ctx.strokeStyle = '#FF6F00';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(enemy.x, enemy.y, gameState.enemyWidth, gameState.enemyHeight);
          }
        }
      }
    };

    const update = () => {
      if (activeKeys.has('ArrowLeft')) {
        if (gameState.player.x > 0) {
          gameState.player.x -= gameState.player.speed;
        }
      }

      if (activeKeys.has('ArrowRight')) {
        if (gameState.player.x + gameState.player.width < canvas.width) {
          gameState.player.x += gameState.player.speed;
        }
      }

      if ((activeKeys.has(' ') || activeKeys.has(' ')) && Date.now() - gameState.lastShot > gameState.shotDelay) {
        gameState.bullets.push({
          x: gameState.player.x + gameState.player.width / 2 - 2,
          y: gameState.player.y
        });
        gameState.lastShot = Date.now();
      }

      gameState.bullets = gameState.bullets.filter((bullet) => {
        bullet.y -= 7;

        for (let c = 0; c < gameState.enemyCols; c++) {
          for (let r = 0; r < gameState.enemyRows; r++) {
            const enemy = gameState.enemies[c][r];
            if (
              enemy.status === 1 &&
              bullet.x > enemy.x &&
              bullet.x < enemy.x + gameState.enemyWidth &&
              bullet.y > enemy.y &&
              bullet.y < enemy.y + gameState.enemyHeight
            ) {
              enemy.status = 0;
              gameState.score += 10;
              return false;
            }
          }
        }

        return bullet.y > 0;
      });

      let moveDown = false;
      let edgeReached = false;

      for (let c = 0; c < gameState.enemyCols; c++) {
        for (let r = 0; r < gameState.enemyRows; r++) {
          if (gameState.enemies[c][r].status === 1) {
            gameState.enemies[c][r].x += gameState.enemySpeed * gameState.enemyDirection;

            if (gameState.enemies[c][r].x < 0 || gameState.enemies[c][r].x + gameState.enemyWidth > canvas.width) {
              edgeReached = true;
            }
          }
        }
      }

      if (edgeReached) {
        gameState.enemyDirection *= -1;
        moveDown = true;
      }

      if (moveDown) {
        for (let c = 0; c < gameState.enemyCols; c++) {
          for (let r = 0; r < gameState.enemyRows; r++) {
            if (gameState.enemies[c][r].status === 1) {
              gameState.enemies[c][r].y += gameState.enemyDropDistance;

              if (gameState.enemies[c][r].y + gameState.enemyHeight > canvas.height) {
                gameState.isPlaying = false;
                clearInterval(gameState.gameLoop);
                return;
              }
            }
          }
        }
      }

      for (let c = 0; c < gameState.enemyCols; c++) {
        for (let r = 0; r < gameState.enemyRows; r++) {
          if (gameState.enemies[c][r].status === 1 && Math.random() < gameState.enemyShotChance * 3) {
            gameState.enemyShots.push({
              x: gameState.enemies[c][r].x + gameState.enemyWidth / 2 - 2,
              y: gameState.enemies[c][r].y + gameState.enemyHeight
            });
          }
        }
      }

      gameState.enemyShots = gameState.enemyShots.filter((shot) => {
        shot.y += 5;

        if (
          shot.x > gameState.player.x &&
          shot.x < gameState.player.x + gameState.player.width &&
          shot.y > gameState.player.y &&
          shot.y < gameState.player.y + gameState.player.height
        ) {
          gameState.lives--;
          // Trigger hit effect
          gameState.hitEffect = { active: true, x: gameState.player.x + gameState.player.width / 2, y: gameState.player.y + gameState.player.height / 2, duration: gameState.hitEffect.maxDuration, maxDuration: gameState.hitEffect.maxDuration };
          
          if (gameState.lives <= 0) {
            gameState.isPlaying = false;
            clearInterval(gameState.gameLoop);
          }
          return false;
        }

        return shot.y < canvas.height;
      });
    };

    const gameLoop = () => {
      if (!gameState.isPlaying) return;

      ctx.fillStyle = '#000033';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawPlayer();
      drawBullets();
      drawEnemies();

      // Draw hit effect
      if (gameState.hitEffect.active && gameState.hitEffect.duration > 0) {
        const progress = 1 - gameState.hitEffect.duration / gameState.hitEffect.maxDuration;
        const radius = 20 + progress * 30;
        
        // Red explosion circle
        ctx.strokeStyle = `rgba(255, 0, 0, ${1 - progress})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(gameState.hitEffect.x, gameState.hitEffect.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner yellow flash
        ctx.fillStyle = `rgba(255, 255, 0, ${(1 - progress) * 0.3})`;
        ctx.beginPath();
        ctx.arc(gameState.hitEffect.x, gameState.hitEffect.y, radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
        
        gameState.hitEffect.duration--;
      } else if (gameState.hitEffect.duration <= 0) {
        gameState.hitEffect.active = false;
      }

      update();
    };

    const startGame = () => {
      if (!gameState.isPlaying) {
        gameState.isPlaying = true;
        gameState.isPaused = false;
        gameState.gameLoop = setInterval(gameLoop, 30);
      }
    };

    const pauseGame = () => {
      if (gameState.isPlaying) {
        gameState.isPaused = !gameState.isPaused;
        if (gameState.isPaused) {
          clearInterval(gameState.gameLoop);
        } else {
          gameState.gameLoop = setInterval(gameLoop, 30);
        }
      }
    };

    const resetGame = () => {
      clearInterval(gameState.gameLoop);

      gameState.score = 0;
      gameState.lives = 3;
      gameState.wave = 1;
      gameState.isPlaying = false;
      gameState.isPaused = false;

      gameState.player = { x: canvas.width / 2 - 25, y: canvas.height - 40, width: 50, height: 20, speed: 7 };
      gameState.bullets = [];
      gameState.enemyShots = [];
      gameState.enemySpeed = 1;
      gameState.enemyDirection = 1;
      gameState.enemyShotChance = 0.01;
      gameState.lastShot = 0;

      initEnemies();

      ctx.fillStyle = '#000033';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawPlayer();
      drawEnemies();
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
    ctx.fillStyle = '#000033';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawEnemies();

    // Expose controls
    (window as any).invadersControls = { startGame, pauseGame, resetGame };

    return () => {
      clearInterval(gameState.gameLoop);
      document.removeEventListener('keydown', keydownHandler);
      document.removeEventListener('keyup', keyupHandler);
      delete (window as any).invadersControls;
    };
  }, []);

  const handleStart = () => {
    (window as any).invadersControls?.startGame();
  };

  const handlePause = () => {
    (window as any).invadersControls?.pauseGame();
  };

  const handleReset = () => {
    (window as any).invadersControls?.resetGame();
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <button className="back-button" onClick={onBack} title="Back to games">
          <ArrowLeft size={20} />
        </button>
        <h2>Space Invaders</h2>
      </div>

      <div className="game-content">
        <canvas ref={canvasRef} width={700} height={450} className="game-canvas" />

        <div className="game-controls">
          <h3>Controls</h3>
          <p>Use arrow keys to move your ship.</p>
          <p>Press Space to shoot down the invaders!</p>

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
            <p>Left/Right Arrow Keys: Move</p>
            <p>Space: Shoot</p>
          </div>
        </div>
      </div>
    </div>
  );
};
