import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import '../../styles/games.scss';

interface BreakoutGameProps {
  onBack: () => void;
}

export const BreakoutGame: React.FC<BreakoutGameProps> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [controlsState, setControlsState] = useState<any>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameState = {
      score: 0,
      lives: 3,
      initialLives: 3,
      level: 1,
      isPlaying: false,
      isPaused: false,
      gameLoop: null as unknown as ReturnType<typeof setInterval>,
      ball: { x: 350, y: 400, radius: 8, speedX: 4, speedY: -4 },
      paddle: { x: 300, y: 420, width: 100, height: 10, speed: 8 },
      bricks: [] as Array<Array<{ x: number; y: number; status: number }>>,
      brickRows: 5,
      brickCols: 10,
      brickWidth: 50,
      brickHeight: 20,
      brickPadding: 5,
      brickOffsetTop: 50,
      brickOffsetLeft: 50,
      difficulty: 'medium' as 'easy' | 'medium' | 'hard'
    };

    const activeKeys = new Set<string>();

    const initBricks = () => {
      gameState.bricks = [];
      for (let c = 0; c < gameState.brickCols; c++) {
        gameState.bricks[c] = [];
        for (let r = 0; r < gameState.brickRows; r++) {
          gameState.bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
      }
    };

    initBricks();

    const drawBall = () => {
      ctx.beginPath();
      ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.closePath();
    };

    const drawPaddle = () => {
      ctx.beginPath();
      ctx.rect(gameState.paddle.x, gameState.paddle.y, gameState.paddle.width, gameState.paddle.height);
      ctx.fillStyle = '#4CAF50';
      ctx.fill();
      ctx.closePath();
    };

    const drawBricks = () => {
      for (let c = 0; c < gameState.brickCols; c++) {
        for (let r = 0; r < gameState.brickRows; r++) {
          if (gameState.bricks[c][r].status === 1) {
            const brickX = c * (gameState.brickWidth + gameState.brickPadding) + gameState.brickOffsetLeft;
            const brickY = r * (gameState.brickHeight + gameState.brickPadding) + gameState.brickOffsetTop;
            gameState.bricks[c][r].x = brickX;
            gameState.bricks[c][r].y = brickY;

            ctx.beginPath();
            ctx.rect(brickX, brickY, gameState.brickWidth, gameState.brickHeight);
            ctx.fillStyle = `hsl(${r * 60}, 100%, 50%)`;
            ctx.fill();
            ctx.closePath();
          }
        }
      }
    };

    const update = () => {
      gameState.ball.x += gameState.ball.speedX;
      gameState.ball.y += gameState.ball.speedY;

      if (gameState.ball.x + gameState.ball.radius > canvas.width || gameState.ball.x - gameState.ball.radius < 0) {
        gameState.ball.speedX = -gameState.ball.speedX;
      }

      if (gameState.ball.y - gameState.ball.radius < 0) {
        gameState.ball.speedY = -gameState.ball.speedY;
      }

      if (gameState.ball.y + gameState.ball.radius > canvas.height) {
        gameState.lives--;
        if (gameState.lives <= 0) {
          gameState.isPlaying = false;
          clearInterval(gameState.gameLoop);
        } else {
          gameState.ball.x = canvas.width / 2;
          gameState.ball.y = canvas.height - 30;
          // keep the same base speed for the current difficulty
          const baseSpeed = (() => {
            switch (gameState.difficulty) {
              case 'easy': return 3;
              case 'hard': return 7;
              case 'medium':
              default:
                return 5;
            }
          })();
          gameState.ball.speedX = baseSpeed * (Math.random() > 0.5 ? 1 : -1);
          gameState.ball.speedY = -baseSpeed;
        }
      }

      if (
        gameState.ball.x > gameState.paddle.x &&
        gameState.ball.x < gameState.paddle.x + gameState.paddle.width &&
        gameState.ball.y + gameState.ball.radius > gameState.paddle.y &&
        gameState.ball.y - gameState.ball.radius < gameState.paddle.y + gameState.paddle.height
      ) {
        gameState.ball.speedY = -Math.abs(gameState.ball.speedY);
        // Add angle based on where the ball hits the paddle
        const hitPos = (gameState.ball.x - gameState.paddle.x) / gameState.paddle.width;
        gameState.ball.speedX = (hitPos - 0.5) * 8;
      }

      for (let c = 0; c < gameState.brickCols; c++) {
        for (let r = 0; r < gameState.brickRows; r++) {
          const b = gameState.bricks[c][r];
          if (b.status === 1) {
            if (
              gameState.ball.x > b.x &&
              gameState.ball.x < b.x + gameState.brickWidth &&
              gameState.ball.y > b.y &&
              gameState.ball.y < b.y + gameState.brickHeight
            ) {
              // Determine collision direction
              const overlapLeft = (gameState.ball.x + gameState.ball.radius) - b.x;
              const overlapRight = (b.x + gameState.brickWidth) - (gameState.ball.x - gameState.ball.radius);
              const overlapTop = (gameState.ball.y + gameState.ball.radius) - b.y;
              const overlapBottom = (b.y + gameState.brickHeight) - (gameState.ball.y - gameState.ball.radius);

              const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

              if (minOverlap === overlapLeft || minOverlap === overlapRight) {
                gameState.ball.speedX = -gameState.ball.speedX;
              } else {
                gameState.ball.speedY = -gameState.ball.speedY;
              }

              b.status = 0;
              gameState.score += 10;
            }
          }
        }
      }

      if (gameState.paddle.x > 0 && (activeKeys.has('ArrowLeft') || activeKeys.has('a'))) {
        gameState.paddle.x -= gameState.paddle.speed;
      }

      if (gameState.paddle.x + gameState.paddle.width < canvas.width && (activeKeys.has('ArrowRight') || activeKeys.has('d'))) {
        gameState.paddle.x += gameState.paddle.speed;
      }

      // Check if all bricks are destroyed
      for (let c = 0; c < gameState.brickCols; c++) {
        for (let r = 0; r < gameState.brickRows; r++) {
          if (gameState.bricks[c][r].status === 1) return;
        }
      }

      gameState.isPlaying = false;
      clearInterval(gameState.gameLoop);
    };

    const gameLoop = () => {
      if (!gameState.isPlaying) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawBricks();
      drawBall();
      drawPaddle();

      update();

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
        // set ball speed based on difficulty for clear differences
        switch (gameState.difficulty) {
          case 'easy':
            gameState.ball.speedX = 3 * (Math.random() > 0.5 ? 1 : -1);
            gameState.ball.speedY = -3;
            break;
          case 'medium':
            gameState.ball.speedX = 5 * (Math.random() > 0.5 ? 1 : -1);
            gameState.ball.speedY = -5;
            break;
          case 'hard':
            gameState.ball.speedX = 7 * (Math.random() > 0.5 ? 1 : -1);
            gameState.ball.speedY = -7;
            break;
        }
        gameState.gameLoop = setInterval(gameLoop, 25);
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
      gameState.level = 1;
      gameState.isPlaying = false;
      gameState.isPaused = false;

      // adjust initial ball/paddle and brick rows by difficulty
      switch (gameState.difficulty) {
        case 'easy':
          gameState.ball = { x: 300, y: 350, radius: 8, speedX: 3, speedY: -3 };
          gameState.paddle = { x: 250, y: 380, width: 120, height: 10, speed: 8 };
          gameState.brickRows = 4;
          break;
        case 'medium':
          gameState.ball = { x: 300, y: 350, radius: 8, speedX: 5, speedY: -5 };
          gameState.paddle = { x: 250, y: 380, width: 100, height: 10, speed: 9 };
          gameState.brickRows = 5;
          break;
        case 'hard':
        default:
          gameState.ball = { x: 300, y: 350, radius: 8, speedX: 7, speedY: -7 };
          gameState.paddle = { x: 250, y: 380, width: 75, height: 10, speed: 10 };
          gameState.brickRows = 6;
          break;
      }

      initBricks();

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBricks();
      drawBall();
      drawPaddle();
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
    drawBricks();
    drawBall();
    drawPaddle();

    // Expose controls
    (window as any).breakoutControls = { startGame, pauseGame, resetGame, gameState };

    return () => {
      clearInterval(gameState.gameLoop);
      document.removeEventListener('keydown', keydownHandler);
      document.removeEventListener('keyup', keyupHandler);
      delete (window as any).breakoutControls;
    };
  }, []);

  // Poll global controls state so React can render overlays when game ends
  useEffect(() => {
    const id = setInterval(() => {
      setControlsState((window as any).breakoutControls?.gameState || null);
    }, 200);
    return () => clearInterval(id);
  }, []);

  const handleStart = () => {
    (window as any).breakoutControls?.startGame();
  };

  const handlePause = () => {
    (window as any).breakoutControls?.pauseGame();
  };

  const handleReset = () => {
    (window as any).breakoutControls?.resetGame();
  };

  const changeDifficulty = (difficulty: 'easy' | 'medium' | 'hard') => {
    setSelectedDifficulty(difficulty);
    const controls = (window as any).breakoutControls;
    if (controls && controls.gameState) {
      controls.gameState.difficulty = difficulty;
      switch (difficulty) {
        case 'easy':
          controls.gameState.ball.speedX = 3;
          controls.gameState.ball.speedY = -3;
          controls.gameState.paddle.width = 120;
          controls.gameState.paddle.speed = 8;
          controls.gameState.brickRows = 4;
          break;
        case 'medium':
          controls.gameState.ball.speedX = 5;
          controls.gameState.ball.speedY = -5;
          controls.gameState.paddle.width = 100;
          controls.gameState.paddle.speed = 9;
          controls.gameState.brickRows = 5;
          break;
        case 'hard':
          controls.gameState.ball.speedX = 7;
          controls.gameState.ball.speedY = -7;
          controls.gameState.paddle.width = 75;
          controls.gameState.paddle.speed = 10;
          controls.gameState.brickRows = 6;
          break;
      }

      controls.resetGame();
    }
  };

  return (
    <div className="game-container" style={{ position: 'relative' }}>
      <div className="game-header">
        <button className="back-button" onClick={onBack} title="Back to games">
          <ArrowLeft size={20} />
        </button>
        <h2>Breakout</h2>
      </div>

      <div className="game-content">
        <canvas ref={canvasRef} width={700} height={450} className="game-canvas" />

        <div className="game-controls">
          <h3>Controls</h3>
          <p>Use arrow keys to move the paddle.</p>
          <p>Break all the bricks to advance to the next level!</p>

          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '16px', padding: '12px', background: 'var(--background)', borderRadius: '6px', fontSize: '0.9rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Score</div>
              <div style={{ fontFamily: 'monospace', fontWeight: '600', fontSize: '1.1rem', color: 'var(--accent)' }}>{(window as any).breakoutControls?.gameState?.score || 0}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Lives</div>
              <div style={{ fontFamily: 'monospace', fontWeight: '600', fontSize: '1.1rem', color: '#ef4444' }}>
                {(window as any).breakoutControls?.gameState?.lives || 3} / {(window as any).breakoutControls?.gameState?.initialLives || 3}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Level</div>
              <div style={{ fontFamily: 'monospace', fontWeight: '600', fontSize: '1.1rem', color: '#10b981' }}>{(window as any).breakoutControls?.gameState?.level || 1}</div>
            </div>
          </div>

          <div className="difficulty-buttons" style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button
              className="btn btn-secondary"
              onClick={() => changeDifficulty('easy')}
              style={selectedDifficulty === 'easy' ? { background: 'linear-gradient(90deg,#bbf7d0,#86efac)', borderColor: '#34d399', color: '#065f46' } : {}}
            >
              Easy
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => changeDifficulty('medium')}
              style={selectedDifficulty === 'medium' ? { background: 'linear-gradient(90deg,#bfdbfe,#93c5fd)', borderColor: '#3b82f6', color: '#1e3a8a' } : {}}
            >
              Medium
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => changeDifficulty('hard')}
              style={selectedDifficulty === 'hard' ? { background: 'linear-gradient(90deg,#fed7aa,#fdba74)', borderColor: '#fb923c', color: '#7c2d12' } : {}}
            >
              Hard
            </button>
          </div>

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
            <p>Left/Right Arrow Keys: Move Paddle</p>
          </div>
        </div>
      </div>

      {(controlsState) && (() => {
        // determine real end condition: out of lives OR level cleared
        try {
          const bricks = controlsState.bricks || [];
          const anyAlive = bricks.flat().some((b: any) => b && b.status === 1);
          const levelComplete = !anyAlive;
          const outOfLives = typeof controlsState.lives === 'number' && controlsState.lives <= 0;
          const showOverlay = !controlsState.isPlaying && (levelComplete || outOfLives);

          if (!showOverlay) return null;

          return (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)', zIndex: 60 }}>
              <div style={{ background: '#fff', padding: 18, borderRadius: 8, minWidth: 260, textAlign: 'center' }}>
                <h3 style={{ margin: 0 }}>{levelComplete ? 'Level Complete!' : 'Game Over'}</h3>
                <div style={{ marginTop: 10, display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <button onClick={() => { (window as any).breakoutControls?.resetGame(); (window as any).breakoutControls?.startGame?.(); }}>Retry</button>
                  <button onClick={() => {
                    const controls = (window as any).breakoutControls;
                    if (controls && controls.gameState) {
                      controls.gameState.level = (controls.gameState.level || 1) + 1;
                      controls.resetGame();
                      controls.startGame?.();
                    }
                  }}>Next</button>
                  <button onClick={onBack}>Back</button>
                </div>
              </div>
            </div>
          );
        } catch (e) {
          return null;
        }
      })()}
    </div>
  );
};
