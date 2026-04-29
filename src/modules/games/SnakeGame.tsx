import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import '../../styles/games.scss';

interface SnakeGameProps {
  onBack: () => void;
}

export const SnakeGame: React.FC<SnakeGameProps> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [controlsState, setControlsState] = useState<any>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameState = {
      score: 0,
      length: 3,
      speed: 5,
      isPlaying: false,
      isPaused: false,
      gameLoop: null as unknown as ReturnType<typeof setInterval>,
      snake: [
        { x: 300, y: 200 },
        { x: 290, y: 200 },
        { x: 280, y: 200 }
      ],
      direction: 'right',
      nextDirection: 'right',
      food: { x: 100, y: 100 },
      gridSize: 10
    };

    // Touch control variables
    let touchStartX = 0;
    let touchStartY = 0;

    const drawSnake = () => {
      gameState.snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#4CAF50' : '#45a049';
        ctx.fillRect(segment.x, segment.y, gameState.gridSize, gameState.gridSize);
        ctx.strokeStyle = '#2d6a2d';
        ctx.strokeRect(segment.x, segment.y, gameState.gridSize, gameState.gridSize);
      });
    };

    const drawFood = () => {
      ctx.fillStyle = '#FF5722';
      ctx.beginPath();
      ctx.arc(gameState.food.x + gameState.gridSize / 2, gameState.food.y + gameState.gridSize / 2, gameState.gridSize / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFCCBC';
      ctx.beginPath();
      ctx.arc(gameState.food.x + gameState.gridSize / 2 - 2, gameState.food.y + gameState.gridSize / 2 - 2, gameState.gridSize / 4, 0, Math.PI * 2);
      ctx.fill();
    };

    const updateSnake = () => {
      gameState.direction = gameState.nextDirection;

      const head = { ...gameState.snake[0] };

      switch (gameState.direction) {
        case 'right':
          head.x += gameState.gridSize;
          break;
        case 'left':
          head.x -= gameState.gridSize;
          break;
        case 'up':
          head.y -= gameState.gridSize;
          break;
        case 'down':
          head.y += gameState.gridSize;
          break;
      }

      if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        gameState.isPlaying = false;
        clearInterval(gameState.gameLoop);
        return;
      }

      for (let i = 0; i < gameState.snake.length; i++) {
        if (head.x === gameState.snake[i].x && head.y === gameState.snake[i].y) {
          gameState.isPlaying = false;
          clearInterval(gameState.gameLoop);
          return;
        }
      }

      gameState.snake.unshift(head);

      if (head.x === gameState.food.x && head.y === gameState.food.y) {
        gameState.score += 10;
        gameState.length++;
        generateFood();
      } else {
        gameState.snake.pop();
      }
    };

    const generateFood = () => {
      let foodOnSnake = false;
      let newFood = {
        x: Math.floor(Math.random() * (canvas.width / gameState.gridSize)) * gameState.gridSize,
        y: Math.floor(Math.random() * (canvas.height / gameState.gridSize)) * gameState.gridSize
      };

      do {
        foodOnSnake = gameState.snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y);
        if (foodOnSnake) {
          newFood = {
            x: Math.floor(Math.random() * (canvas.width / gameState.gridSize)) * gameState.gridSize,
            y: Math.floor(Math.random() * (canvas.height / gameState.gridSize)) * gameState.gridSize
          };
        }
      } while (foodOnSnake);

      gameState.food = newFood;
    };

    const gameLoop = () => {
      if (!gameState.isPlaying) return;

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawSnake();
      drawFood();

      updateSnake();

      if (!gameState.isPlaying) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
      }
    };

    const startGame = () => {
      if (!gameState.isPlaying) {
        gameState.isPlaying = true;
        gameState.isPaused = false;
        gameState.gameLoop = setInterval(gameLoop, 100 - gameState.speed * 2);
      }
    };

    const pauseGame = () => {
      if (gameState.isPlaying) {
        gameState.isPaused = !gameState.isPaused;
        if (gameState.isPaused) {
          clearInterval(gameState.gameLoop);
        } else {
          gameState.gameLoop = setInterval(gameLoop, 100 - gameState.speed * 2);
        }
      }
    };

    const resetGame = () => {
      clearInterval(gameState.gameLoop);
      gameState.score = 0;
      gameState.length = 3;
      gameState.speed = 5;
      gameState.isPlaying = false;
      gameState.isPaused = false;
      gameState.snake = [
        { x: 300, y: 200 },
        { x: 290, y: 200 },
        { x: 280, y: 200 }
      ];
      gameState.direction = 'right';
      gameState.nextDirection = 'right';

      generateFood();

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawSnake();
      drawFood();
    };

    const keydownHandler = (e: KeyboardEvent) => {
      if (gameState.isPaused) return;

      switch (e.key) {
        case 'ArrowUp':
          if (!gameState.isPlaying || gameState.direction !== 'down') {
            gameState.nextDirection = 'up';
            if (!gameState.isPlaying) {
              gameState.direction = 'up';
            }
          }
          break;
        case 'ArrowDown':
          if (!gameState.isPlaying || gameState.direction !== 'up') {
            gameState.nextDirection = 'down';
            if (!gameState.isPlaying) {
              gameState.direction = 'down';
            }
          }
          break;
        case 'ArrowLeft':
          if (!gameState.isPlaying || gameState.direction !== 'right') {
            gameState.nextDirection = 'left';
            if (!gameState.isPlaying) {
              gameState.direction = 'left';
            }
          }
          break;
        case 'ArrowRight':
          if (!gameState.isPlaying || gameState.direction !== 'left') {
            gameState.nextDirection = 'right';
            if (!gameState.isPlaying) {
              gameState.direction = 'right';
            }
          }
          break;
      }
    };

    document.addEventListener('keydown', keydownHandler);

    // Touch event handlers for mobile/tablet
    const touchstartHandler = (e: TouchEvent) => {
      e.preventDefault();
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const touchendHandler = (e: TouchEvent) => {
      e.preventDefault();
      if (gameState.isPaused) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;

      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe
        if (dx > 0 && (!gameState.isPlaying || gameState.direction !== 'left')) {
          gameState.nextDirection = 'right';
          if (!gameState.isPlaying) {
            gameState.direction = 'right';
          }
        } else if (dx < 0 && (!gameState.isPlaying || gameState.direction !== 'right')) {
          gameState.nextDirection = 'left';
          if (!gameState.isPlaying) {
            gameState.direction = 'left';
          }
        }
      } else {
        // Vertical swipe
        if (dy > 0 && (!gameState.isPlaying || gameState.direction !== 'up')) {
          gameState.nextDirection = 'down';
          if (!gameState.isPlaying) {
            gameState.direction = 'down';
          }
        } else if (dy < 0 && (!gameState.isPlaying || gameState.direction !== 'down')) {
          gameState.nextDirection = 'up';
          if (!gameState.isPlaying) {
            gameState.direction = 'up';
          }
        }
      }
    };

    // Add touch event listeners
    canvas.addEventListener('touchstart', touchstartHandler);
    canvas.addEventListener('touchend', touchendHandler);

    // Initial draw
    generateFood();
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawSnake();
    drawFood();

    // Expose controls with a getter for gameState to ensure we always get the latest state
    (window as any).snakeControls = {
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
      canvas.removeEventListener('touchstart', touchstartHandler);
      canvas.removeEventListener('touchend', touchendHandler);
      delete (window as any).snakeControls;
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setControlsState((window as any).snakeControls?.gameState || null);
    }, 200);
    return () => clearInterval(id);
  }, []);

  const handleStart = () => {
    (window as any).snakeControls?.startGame();
  };

  const handlePause = () => {
    (window as any).snakeControls?.pauseGame();
  };

  const handleReset = () => {
    (window as any).snakeControls?.resetGame();
  };

  return (
      <div className="game-container" style={{ position: 'relative' }}>
        <div className="game-header">
          <button className="back-button" onClick={onBack} title="Back to games">
            <ArrowLeft size={20} />
          </button>
          <h2>Snake</h2>
        </div>

        <div className="game-content">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <canvas ref={canvasRef} width={700} height={450} className="game-canvas" />

            {/* Mobile touch controls */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '10px', 
              marginTop: '20px', 
              width: '250px',
              maxWidth: '100%'
            }}>
              <div style={{ gridColumn: '2', gridRow: '1' }}>
                <button 
                  style={{
                    width: '80px', 
                    height: '80px', 
                    fontSize: '24px',
                    borderRadius: '8px',
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    const gameState = (window as any).snakeControls?.gameState;
                    if (gameState && !gameState.isPaused) {
                      if (!gameState.isPlaying || gameState.direction !== 'down') {
                        gameState.nextDirection = 'up';
                        if (!gameState.isPlaying) {
                          gameState.direction = 'up';
                        }
                      }
                    }
                  }}
                >
                  ↑
                </button>
              </div>
              <div style={{ gridColumn: '1', gridRow: '2' }}>
                <button 
                  style={{
                    width: '80px', 
                    height: '80px', 
                    fontSize: '24px',
                    borderRadius: '8px',
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    const gameState = (window as any).snakeControls?.gameState;
                    if (gameState && !gameState.isPaused) {
                      if (!gameState.isPlaying || gameState.direction !== 'right') {
                        gameState.nextDirection = 'left';
                        if (!gameState.isPlaying) {
                          gameState.direction = 'left';
                        }
                      }
                    }
                  }}
                >
                  ←
                </button>
              </div>
              <div style={{ gridColumn: '2', gridRow: '2' }}>
                <button 
                  style={{
                    width: '80px', 
                    height: '80px', 
                    fontSize: '24px',
                    borderRadius: '8px',
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    const gameState = (window as any).snakeControls?.gameState;
                    if (gameState && !gameState.isPaused) {
                      if (!gameState.isPlaying || gameState.direction !== 'up') {
                        gameState.nextDirection = 'down';
                        if (!gameState.isPlaying) {
                          gameState.direction = 'down';
                        }
                      }
                    }
                  }}
                >
                  ↓
                </button>
              </div>
              <div style={{ gridColumn: '3', gridRow: '2' }}>
                <button 
                  style={{
                    width: '80px', 
                    height: '80px', 
                    fontSize: '24px',
                    borderRadius: '8px',
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    const gameState = (window as any).snakeControls?.gameState;
                    if (gameState && !gameState.isPaused) {
                      if (!gameState.isPlaying || gameState.direction !== 'left') {
                        gameState.nextDirection = 'right';
                        if (!gameState.isPlaying) {
                          gameState.direction = 'right';
                        }
                      }
                    }
                  }}
                >
                  →
                </button>
              </div>
            </div>
          </div>

          <div className="game-controls">
          <h3>Controls</h3>
          <p>Use arrow keys to move the snake.</p>
          <p>Eat the food to grow longer and earn points!</p>

          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '16px', padding: '12px', background: 'var(--background)', borderRadius: '6px', fontSize: '0.9rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Score</div>
              <div style={{ fontFamily: 'monospace', fontWeight: '600', fontSize: '1.1rem', color: 'var(--accent)' }}>{controlsState?.score || 0}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Length</div>
              <div style={{ fontFamily: 'monospace', fontWeight: '600', fontSize: '1.1rem', color: '#10b981' }}>{controlsState?.length || 3}</div>
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
              <p>Arrow Keys: Move</p>
              <p>Touch/Swipe: Move (Mobile/Tablet)</p>
              <p>Direction Buttons: Move (Mobile/Tablet)</p>
            </div>
          </div>
        </div>

        {/* Only show game over dialog if the game was actually played and started */}
        {(controlsState && !controlsState.isPlaying && controlsState.snake && controlsState.snake.length > 0 && controlsState.score > 0) && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)' }}>
            <div style={{ background: '#fff', padding: 18, borderRadius: 8, minWidth: 240, textAlign: 'center', color: '#1e293b' }}>
              <h3 style={{ margin: 0, color: '#1e293b' }}>Game Over</h3>
              <div style={{ marginTop: 10, display: 'flex', gap: 8, justifyContent: 'center' }}>
                <button onClick={() => (window as any).snakeControls?.resetGame()}>Retry</button>
                <button onClick={onBack}>Back</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
};
