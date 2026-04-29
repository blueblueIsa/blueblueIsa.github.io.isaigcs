import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import '../../styles/games.scss';

interface InvadersGameProps {
  onBack: () => void;
}

export const InvadersGame: React.FC<InvadersGameProps> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [controlsState, setControlsState] = useState<any>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameState = {
      score: 0,
      lives: 3,
      wave: 1,
      maxWaves: 3,
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
      enemyShotChance: 0.005,
      hitEffect: { active: false, x: 0, y: 0, duration: 0, maxDuration: 10 },
      waveCompleteEffect: { active: false, fadeOpacity: 0, maxFadeDuration: 30 }
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
          if (gameState.enemies[c][r].status === 1 && Math.random() < gameState.enemyShotChance) {
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

      // Check if all enemies are destroyed (wave complete)
      let allEnemiesDestroyed = true;
      for (let c = 0; c < gameState.enemyCols; c++) {
        for (let r = 0; r < gameState.enemyRows; r++) {
          if (gameState.enemies[c][r].status === 1) {
            allEnemiesDestroyed = false;
            break;
          }
        }
        if (!allEnemiesDestroyed) break;
      }

      if (allEnemiesDestroyed) {
        if (gameState.wave < gameState.maxWaves) {
          // Wave complete, move to next wave
          gameState.wave++;
          gameState.waveCompleteEffect.active = true;
          gameState.waveCompleteEffect.fadeOpacity = 0;
          
          // Increase difficulty for next wave
          gameState.enemySpeed += 0.5;
          gameState.enemyShotChance += 0.002;
          gameState.enemyDropDistance += 2;
          
          // Add more enemies for higher waves
          if (gameState.wave === 2) {
            gameState.enemyRows = 4;
            gameState.enemyCols = 9;
          } else if (gameState.wave === 3) {
            gameState.enemyRows = 5;
            gameState.enemyCols = 10;
          }
          
          // Reset game elements for next wave
          gameState.bullets = [];
          gameState.enemyShots = [];
          initEnemies();
          
          // Reset player position
          gameState.player.x = canvas.width / 2 - 25;
          
          // Auto-dismiss wave complete effect after 2 seconds
          setTimeout(() => {
            gameState.waveCompleteEffect.active = false;
          }, 2000);
        } else {
          // Game won! All waves completed
          gameState.isPlaying = false;
          clearInterval(gameState.gameLoop);
        }
      }
    };

    const gameLoop = () => {
      if (!gameState.isPlaying) return;

      // First update game state
      update();

      // Then draw game elements
      ctx.fillStyle = '#000033';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawPlayer();
      drawBullets();
      drawEnemies();

      // Draw hit effect only if game is still playing
      if (gameState.isPlaying && gameState.hitEffect.active && gameState.hitEffect.duration > 0) {
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
      
      // Draw wave complete effect only if game is not playing
      if (!gameState.isPlaying && gameState.waveCompleteEffect.active) {
        gameState.waveCompleteEffect.fadeOpacity = Math.min(gameState.waveCompleteEffect.fadeOpacity + 0.05, 0.7);
        
        ctx.save();
        ctx.fillStyle = '#000033';
        ctx.globalAlpha = gameState.waveCompleteEffect.fadeOpacity;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw WAVE COMPLETE text
        ctx.fillStyle = '#00FF00';
        ctx.globalAlpha = Math.min(gameState.waveCompleteEffect.fadeOpacity * 1.5, 1);
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('WAVE COMPLETE!', canvas.width / 2, canvas.height / 2 - 30);
        
        ctx.font = '24px Arial';
        ctx.fillText(`Advancing to Wave ${gameState.wave}`, canvas.width / 2, canvas.height / 2 + 20);
        
        ctx.restore();
      }
    };

    const startGame = () => {
      if (!gameState.isPlaying) {
        gameState.isPlaying = true;
        gameState.isPaused = false;
        // Reset all game effects
        gameState.hitEffect.active = false;
        gameState.hitEffect.duration = 0;
        gameState.waveCompleteEffect.active = false;
        gameState.waveCompleteEffect.fadeOpacity = 0;
        // Reset game elements
        gameState.bullets = [];
        gameState.enemyShots = [];
        // Reset player position
        gameState.player.x = canvas.width / 2 - 25;
        gameState.player.y = canvas.height - 40;
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
      gameState.enemyDropDistance = 10;
      gameState.enemyShotChance = 0.005;
      gameState.enemyRows = 3;
      gameState.enemyCols = 8;
      gameState.waveCompleteEffect = { active: false, fadeOpacity: 0, maxFadeDuration: 30 };
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

    // Touch event handlers for mobile/tablet
    const touchstartHandler = (e: TouchEvent) => {
      e.preventDefault();
    };

    const touchmoveHandler = (e: TouchEvent) => {
      e.preventDefault();
      if (!gameState.isPlaying || gameState.isPaused) return;

      const touchX = e.touches[0].clientX;
      const rect = canvas.getBoundingClientRect();
      const canvasWidth = rect.width;
      
      // Calculate target position based on touch position
      const targetX = (touchX - rect.left) / canvasWidth * canvas.width;
      const centerX = canvas.width / 2;
      
      // Move player left or right based on touch position relative to center
      if (targetX < centerX - 50) {
        // Move left
        if (gameState.player.x > 0) {
          gameState.player.x -= gameState.player.speed;
        }
      } else if (targetX > centerX + 50) {
        // Move right
        if (gameState.player.x + gameState.player.width < canvas.width) {
          gameState.player.x += gameState.player.speed;
        }
      }
    };

    // Add touch event listeners
    canvas.addEventListener('touchstart', touchstartHandler);
    canvas.addEventListener('touchmove', touchmoveHandler);

    // Initial draw
    ctx.fillStyle = '#000033';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawEnemies();

    // Expose controls with gameState getter
    (window as any).invadersControls = { 
      startGame, 
      pauseGame, 
      resetGame,
      get gameState() {
        return gameState;
      }
    };

    return () => {
      clearInterval(gameState.gameLoop);
      document.removeEventListener('keydown', keydownHandler);
      document.removeEventListener('keyup', keyupHandler);
      canvas.removeEventListener('touchstart', touchstartHandler);
      canvas.removeEventListener('touchmove', touchmoveHandler);
      delete (window as any).invadersControls;
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setControlsState((window as any).invadersControls?.gameState || null);
    }, 200);
    return () => clearInterval(id);
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
    <div className="game-container" style={{ position: 'relative' }}>
      <div className="game-header">
        <button className="back-button" onClick={onBack} title="Back to games">
          <ArrowLeft size={20} />
        </button>
        <h2>Space Invaders</h2>
      </div>

      <div className="game-content">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <canvas ref={canvasRef} width={700} height={450} className="game-canvas" />

          {/* Mobile touch controls */}
          <div style={{ 
            display: 'flex', 
            gap: '40px', 
            marginTop: '20px',
            justifyContent: 'center'
          }}>
            {/* Left and Right buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                style={{
                  width: '100px', 
                  height: '80px', 
                  fontSize: '32px',
                  borderRadius: '8px',
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  // Create and dispatch keyboard events for left arrow
                  const keydownEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true });
                  const keyupEvent = new KeyboardEvent('keyup', { key: 'ArrowLeft', bubbles: true });
                  document.dispatchEvent(keydownEvent);
                  setTimeout(() => document.dispatchEvent(keyupEvent), 300);
                }}
              >
                ←
              </button>
              <button 
                style={{
                  width: '100px', 
                  height: '80px', 
                  fontSize: '32px',
                  borderRadius: '8px',
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  // Create and dispatch keyboard events for right arrow
                  const keydownEvent = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true });
                  const keyupEvent = new KeyboardEvent('keyup', { key: 'ArrowRight', bubbles: true });
                  document.dispatchEvent(keydownEvent);
                  setTimeout(() => document.dispatchEvent(keyupEvent), 300);
                }}
              >
                →
              </button>
            </div>
            
            {/* Shoot button */}
            <button 
              style={{
                width: '100px', 
                height: '80px', 
                fontSize: '24px',
                borderRadius: '8px',
                background: '#FF5722',
                color: 'white',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={() => {
                // Create and dispatch keyboard events for space bar
                const keydownEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
                const keyupEvent = new KeyboardEvent('keyup', { key: ' ', bubbles: true });
                document.dispatchEvent(keydownEvent);
                setTimeout(() => document.dispatchEvent(keyupEvent), 300);
              }}
            >
              Fire
            </button>
          </div>
        </div>

        <div className="game-controls">
          <h3>Controls</h3>
          <p>Use arrow keys to move your ship.</p>
          <p>Press Space to shoot down the invaders!</p>

          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '16px', padding: '12px', background: 'var(--background)', borderRadius: '6px', fontSize: '0.9rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Score</div>
              <div style={{ fontFamily: 'monospace', fontWeight: '600', fontSize: '1.1rem', color: 'var(--accent)' }}>{controlsState?.score || 0}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Lives</div>
              <div style={{ fontFamily: 'monospace', fontWeight: '600', fontSize: '1.1rem', color: '#ef4444' }}>{controlsState?.lives || 3}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Wave</div>
              <div style={{ fontFamily: 'monospace', fontWeight: '600', fontSize: '1.1rem', color: '#10b981' }}>{controlsState?.wave || 1}</div>
            </div>
          </div>

          <div className="button-group" style={{ display: 'flex', gap: '12px', margin: '16px 0' }}>
            <button 
              onClick={handleStart}
              style={{
                background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                border: 'none',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                flex: 1
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
                (e.target as HTMLButtonElement).style.boxShadow = '0 6px 16px rgba(76, 175, 80, 0.4)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.target as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.3)';
              }}
            >
              Start
            </button>
            <button 
              onClick={handlePause}
              style={{
                background: 'linear-gradient(135deg, #ff9800, #f57c00)',
                border: 'none',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)',
                flex: 1
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
                (e.target as HTMLButtonElement).style.boxShadow = '0 6px 16px rgba(255, 152, 0, 0.4)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.target as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(255, 152, 0, 0.3)';
              }}
            >
              Pause
            </button>
            <button 
              onClick={handleReset}
              style={{
                background: 'linear-gradient(135deg, #f44336, #d32f2f)',
                border: 'none',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
                flex: 1
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
                (e.target as HTMLButtonElement).style.boxShadow = '0 6px 16px rgba(244, 67, 54, 0.4)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.target as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(244, 67, 54, 0.3)';
              }}
            >
              Reset
            </button>
          </div>

          <div className="keyboard-info">
            <p>Left/Right Arrow Keys: Move</p>
            <p>Space: Shoot</p>
          </div>
        </div>
      </div>

      {/* Only show game over dialog if the game was actually played */}
      {(controlsState && !controlsState.isPlaying && controlsState.score > 0) && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)' }}>
          <div style={{ background: '#fff', padding: 18, borderRadius: 8, minWidth: 260, textAlign: 'center', color: '#1e293b' }}>
            <h3 style={{ margin: 0, color: '#1e293b' }}>{(() => {
              try {
                if (controlsState.wave >= controlsState.maxWaves) {
                  return 'Congratulations! You Won!';
                }
                const enemies = controlsState.enemies || [];
                const anyAlive = enemies.flat().some((e: any) => e && e.status === 1);
                return anyAlive ? 'Game Over' : 'Wave Cleared!';
              } catch { return 'Game Over'; }
            })()}</h3>
            <p style={{ margin: '10px 0' }}>Score: {controlsState.score}</p>
            <p style={{ margin: '0 0 10px 0' }}>Wave: {controlsState.wave}</p>
            <div style={{ marginTop: 10, display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button onClick={() => (window as any).invadersControls?.resetGame()}>Retry</button>
              {controlsState.wave < controlsState.maxWaves && (
                <button onClick={() => { 
                  const controls = (window as any).invadersControls;
                  if (controls) {
                    // Start next wave
                    controls.resetGame();
                    controls.startGame();
                  }
                }}>Next Wave</button>
              )}
              <button onClick={onBack}>Back</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
