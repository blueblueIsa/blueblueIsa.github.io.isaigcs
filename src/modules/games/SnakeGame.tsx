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
      if (!gameState.isPlaying || gameState.isPaused) return;

      switch (e.key) {
        case 'ArrowUp':
          if (gameState.direction !== 'down') gameState.nextDirection = 'up';
          break;
        case 'ArrowDown':
          if (gameState.direction !== 'up') gameState.nextDirection = 'down';
          break;
        case 'ArrowLeft':
          if (gameState.direction !== 'right') gameState.nextDirection = 'left';
          break;
        case 'ArrowRight':
          if (gameState.direction !== 'left') gameState.nextDirection = 'right';
          break;
      }
    };

    document.addEventListener('keydown', keydownHandler);

    // Initial draw
    generateFood();
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawSnake();
    drawFood();

    // Expose controls
    (window as any).snakeControls = { startGame, pauseGame, resetGame };

    return () => {
      clearInterval(gameState.gameLoop);
      document.removeEventListener('keydown', keydownHandler);
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
        <canvas ref={canvasRef} width={700} height={450} className="game-canvas" />

        <div className="game-controls">
          <h3>Controls</h3>
          <p>Use arrow keys to move the snake.</p>
          <p>Eat the food to grow longer and earn points!</p>

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

      {(controlsState && !controlsState.isPlaying) && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)' }}>
          <div style={{ background: '#fff', padding: 18, borderRadius: 8, minWidth: 240, textAlign: 'center' }}>
            <h3 style={{ margin: 0 }}>Game Over</h3>
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
