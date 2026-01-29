import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { GameProps } from './types';

interface Cell {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  nearbyMines: number;
}

interface GameState {
  board: Cell[][];
  gameOver: boolean;
  won: boolean;
  isPlaying: boolean;
  mines: number;
  flags: number;
  revealed: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const MinesweeperGame: React.FC<GameProps> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [flaggingMode, setFlaggingMode] = useState(false);
  const touchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const getDimensions = (difficulty: 'easy' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'easy':
        return { rows: 8, cols: 8, mines: 10 };
      case 'medium':
        return { rows: 12, cols: 12, mines: 30 };
      case 'hard':
        return { rows: 16, cols: 16, mines: 99 };
    }
  };

  const initializeGame = useCallback((difficulty: 'easy' | 'medium' | 'hard'): GameState => {
    const { rows, cols, mines } = getDimensions(difficulty);
    const board: Cell[][] = Array(rows)
      .fill(null)
      .map(() =>
        Array(cols)
          .fill(null)
          .map(() => ({
            mine: false,
            revealed: false,
            flagged: false,
            nearbyMines: 0
          }))
      );

    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);
      if (!board[row][col].mine) {
        board[row][col].mine = true;
        minesPlaced++;
      }
    }

    // Calculate nearby mines
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!board[r][c].mine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].mine) {
                count++;
              }
            }
          }
          board[r][c].nearbyMines = count;
        }
      }
    }

    return {
      board,
      gameOver: false,
      won: false,
      isPlaying: true,
      mines,
      flags: 0,
      revealed: 0,
      difficulty
    };
  }, []);

  const revealCell = useCallback((row: number, col: number) => {
    setGameState(prevState => {
      if (!prevState) return prevState;
      const newState = JSON.parse(JSON.stringify(prevState));
      const board = newState.board;

      if (board[row][col].revealed || board[row][col].flagged) return prevState;

      // If this is the first reveal, regenerate mines to guarantee the
      // clicked cell and its neighbours are safe, ensuring a larger open area
      if (newState.revealed === 0) {
        const rows = board.length;
        const cols = board[0].length;
        const mines = newState.mines;

        // clear existing mines
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) board[r][c].mine = false;
        }

        // build exclusion set: clicked cell and its neighbors
        const excluded = new Set<string>();
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const rr = row + dr;
            const cc = col + dc;
            if (rr >= 0 && rr < rows && cc >= 0 && cc < cols) {
              excluded.add(`${rr},${cc}`);
            }
          }
        }

        // place mines avoiding excluded cells
        let minesPlaced = 0;
        const maxAttempts = rows * cols * 10;
        let attempts = 0;
        while (minesPlaced < mines && attempts < maxAttempts) {
          attempts++;
          const r = Math.floor(Math.random() * rows);
          const c = Math.floor(Math.random() * cols);
          if (excluded.has(`${r},${c}`)) continue;
          if (!board[r][c].mine) {
            board[r][c].mine = true;
            minesPlaced++;
          }
        }

        // Fallback linear fill if not enough placed
        if (minesPlaced < mines) {
          for (let r = 0; r < rows && minesPlaced < mines; r++) {
            for (let c = 0; c < cols && minesPlaced < mines; c++) {
              if (!board[r][c].mine && !excluded.has(`${r},${c}`)) {
                board[r][c].mine = true;
                minesPlaced++;
              }
            }
          }
        }

        // recalc nearby counts
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (!board[r][c].mine) {
              let count = 0;
              for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                  const nr = r + dr;
                  const nc = c + dc;
                  if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].mine) count++;
                }
              }
              board[r][c].nearbyMines = count;
            } else {
              board[r][c].nearbyMines = 0;
            }
          }
        }
      }

      board[row][col].revealed = true;
      newState.revealed++;

      if (board[row][col].mine) {
        newState.gameOver = true;
        newState.isPlaying = false;
        revealAllMines(board);
      } else if (board[row][col].nearbyMines === 0) {
        // Flood fill
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = row + dr;
            const nc = col + dc;
            if (nr >= 0 && nr < board.length && nc >= 0 && nc < board[0].length) {
              if (!board[nr][nc].revealed && !board[nr][nc].flagged) {
                if (!board[nr][nc].mine) {
                  revealCellRecursive(board, nr, nc, newState);
                }
              }
            }
          }
        }
      }

      checkWin(newState);
      return newState;
    });
  }, []);

  const revealCellRecursive = (board: Cell[][], row: number, col: number, newState: GameState) => {
    if (board[row][col].revealed || board[row][col].flagged) return;

    board[row][col].revealed = true;
    newState.revealed++;

    if (board[row][col].nearbyMines === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = row + dr;
          const nc = col + dc;
          if (nr >= 0 && nr < board.length && nc >= 0 && nc < board[0].length) {
            if (!board[nr][nc].revealed && !board[nr][nc].flagged && !board[nr][nc].mine) {
              revealCellRecursive(board, nr, nc, newState);
            }
          }
        }
      }
    }
  };

  const toggleFlag = useCallback((row: number, col: number) => {
    setGameState(prevState => {
      if (!prevState) return prevState;
      const newState = JSON.parse(JSON.stringify(prevState));
      const board = newState.board;

      if (board[row][col].revealed) return prevState;

      if (board[row][col].flagged) {
        board[row][col].flagged = false;
        newState.flags--;
      } else if (newState.flags < newState.mines) {
        board[row][col].flagged = true;
        newState.flags++;
      }

      return newState;
    });
  }, []);

  const revealAllMines = (board: Cell[][]) => {
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board[0].length; c++) {
        if (board[r][c].mine) {
          board[r][c].revealed = true;
        }
      }
    }
  };

  const checkWin = (newState: GameState) => {
    const board = newState.board;
    const totalCells = board.length * board[0].length;
    const nonMines = totalCells - newState.mines;
    if (newState.revealed === nonMines) {
      newState.won = true;
      newState.isPlaying = false;
    }
  };

  const drawBoard = useCallback((ctx: CanvasRenderingContext2D, cellSize: number) => {
    if (!gameState) return;
    const board = gameState.board;
    
    // Modern gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, board.length * cellSize);
    gradient.addColorStop(0, '#f5f5f5');
    gradient.addColorStop(1, '#e0e0e0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, board[0].length * cellSize, board.length * cellSize);

    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board[0].length; c++) {
        const cell = board[r][c];
        const x = c * cellSize;
        const y = r * cellSize;

        if (cell.flagged) {
          // Flagged cell - bright red with shadow
          ctx.fillStyle = '#ef5350';
          ctx.shadowColor = 'rgba(0,0,0,0.3)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;
          ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
          ctx.shadowColor = 'transparent';
          
          ctx.fillStyle = 'white';
          ctx.font = `bold ${Math.floor(cellSize * 0.6)}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🚩', x + cellSize / 2, y + cellSize / 2);
        } else if (cell.revealed) {
          // Revealed cell - light color with subtle shadow
          ctx.fillStyle = '#f0f0f0';
          ctx.shadowColor = 'rgba(0,0,0,0.1)';
          ctx.shadowBlur = 2;
          ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
          ctx.shadowColor = 'transparent';
          
          // Add inset border for depth
          ctx.strokeStyle = '#c0c0c0';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x + 1, y + 1, cellSize - 2, cellSize - 2);

          if (cell.mine) {
            // Mine - red explosion
            ctx.fillStyle = '#d32f2f';
            ctx.beginPath();
            ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 3, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = 'white';
            ctx.font = `bold ${Math.floor(cellSize * 0.5)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('💣', x + cellSize / 2, y + cellSize / 2);
          } else if (cell.nearbyMines > 0) {
            // Number - colored by mine count
            const colors = ['#0000ff', '#008000', '#ff0000', '#000080', '#800000', '#008080', '#000000', '#808080'];
            ctx.fillStyle = colors[cell.nearbyMines - 1] || '#000';
            ctx.font = `bold ${Math.floor(cellSize * 0.7)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(cell.nearbyMines.toString(), x + cellSize / 2, y + cellSize / 2);
          }
        } else {
          // Unrevealed cell - raised button effect
          const grad = ctx.createLinearGradient(x, y, x, y + cellSize);
          grad.addColorStop(0, '#d0d0d0');
          grad.addColorStop(1, '#a0a0a0');
          ctx.fillStyle = grad;
          ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
          
          // Raised effect with borders
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x + 1, y + cellSize - 1);
          ctx.lineTo(x + 1, y + 1);
          ctx.lineTo(x + cellSize - 1, y + 1);
          ctx.stroke();
          
          ctx.strokeStyle = '#505050';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x + cellSize - 1, y + 1);
          ctx.lineTo(x + cellSize - 1, y + cellSize - 1);
          ctx.lineTo(x + 1, y + cellSize - 1);
          ctx.stroke();
        }
      }
    }
  }, [gameState]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameState) return;

    const board = gameState.board;
    const rows = board.length;
    const cols = board[0].length;
    const cellSize = Math.min(canvas.width / cols, canvas.height / rows);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawBoard(ctx, cellSize);

    if (gameState.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
    } else if (gameState.won) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('You Won!', canvas.width / 2, canvas.height / 2);
    }
  }, [gameState, drawBoard]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameState || !gameState.isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const board = gameState.board;
    const rows = board.length;
    const cols = board[0].length;
    const cellSize = Math.min(canvas.width / cols, canvas.height / rows);

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      // Left click (button 0) to reveal
      if (e.button === 0) {
        revealCell(row, col);
      }
    }
  }, [gameState, revealCell]);

  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    if (!gameState || !gameState.isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const board = gameState.board;
    const rows = board.length;
    const cols = board[0].length;
    const cellSize = Math.min(canvas.width / cols, canvas.height / rows);

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      // Right click to flag
      toggleFlag(row, col);
    }
  }, [gameState, toggleFlag]);

  // Touch handlers for mobile/tablet support
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!gameState || !gameState.isPlaying) return;

    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };

    // Set a timeout for long press (flag) - 500ms
    touchTimeoutRef.current = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const board = gameState.board;
      const rows = board.length;
      const cols = board[0].length;
      const cellSize = Math.min(canvas.width / cols, canvas.height / rows);

      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      const col = Math.floor(x / cellSize);
      const row = Math.floor(y / cellSize);

      if (row >= 0 && row < rows && col >= 0 && col < cols) {
        toggleFlag(row, col);
      }
    }, 500);
  }, [gameState, toggleFlag]);

  const handleTouchCancel = useCallback(() => {
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }
  }, []);

  const handleTouchClick = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!gameState || !gameState.isPlaying) return;

    const touch = e.changedTouches[0];
    const startPos = touchStartRef.current;

    // If touch moved significantly, don't treat as click
    if (startPos) {
      const dx = touch.clientX - startPos.x;
      const dy = touch.clientY - startPos.y;
      if (Math.sqrt(dx * dx + dy * dy) > 10) return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const board = gameState.board;
    const rows = board.length;
    const cols = board[0].length;
    const cellSize = Math.min(canvas.width / cols, canvas.height / rows);

    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      if (flaggingMode) {
        toggleFlag(row, col);
      } else {
        revealCell(row, col);
      }
    }
  }, [gameState, flaggingMode, revealCell, toggleFlag]);

  useEffect(() => {
    const initialState = initializeGame('easy');
    setGameState(initialState);
  }, [initializeGame]);

  useEffect(() => {
    if (gameState) {
      gameStateRef.current = gameState;
      render();
    }
  }, [gameState, render]);

  const changeDifficulty = useCallback((difficulty: 'easy' | 'medium' | 'hard') => {
    const newState = initializeGame(difficulty);
    setGameState(newState);
  }, [initializeGame]);

  if (!gameState) return null;

  return (
    <div className="game-container">
      <div className="game-header">
        <button onClick={onBack} className="back-button">
          ← Back
        </button>
        <h1>Minesweeper</h1>
      </div>

      <div className="minesweeper-controls">
        <div className="difficulty-buttons">
          <button onClick={() => changeDifficulty('easy')} className={gameState.difficulty === 'easy' ? 'active' : ''}>
            Easy (8x8, 10 mines)
          </button>
          <button onClick={() => changeDifficulty('medium')} className={gameState.difficulty === 'medium' ? 'active' : ''}>
            Medium (12x12, 30 mines)
          </button>
          <button onClick={() => changeDifficulty('hard')} className={gameState.difficulty === 'hard' ? 'active' : ''}>
            Hard (16x16, 99 mines)
          </button>
        </div>

        <div className="game-stats">
          <span>Flags: {gameState.flags} / {gameState.mines}</span>
          <span>Revealed: {gameState.revealed}</span>
        </div>

        <button onClick={() => changeDifficulty(gameState.difficulty)} className="new-game-button">
          New Game
        </button>
        
        {/* Mobile flagging mode toggle */}
        <button 
          onClick={() => setFlaggingMode(!flaggingMode)}
          style={{
            marginLeft: '8px',
            padding: '8px 12px',
            background: flaggingMode ? 'rgba(110, 231, 255, 0.3)' : 'rgba(110, 231, 255, 0.1)',
            border: `2px solid ${flaggingMode ? 'rgba(110, 231, 255, 0.8)' : 'rgba(110, 231, 255, 0.3)'}`,
            color: '#6ee7ff',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '12px',
          }}
          title="Toggle flagging mode on mobile"
        >
          🚩 {flaggingMode ? 'Flag Mode' : 'Reveal Mode'}
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        className="game-canvas minesweeper-canvas"
        onClick={handleCanvasClick}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchClick}
        onTouchCancel={handleTouchCancel}
        style={{ cursor: 'pointer', border: '2px solid #333', borderRadius: '8px' }}
      />

      <div className="game-instructions">
        <p>
          {window.innerWidth < 768 
            ? `${flaggingMode ? 'Tap to flag' : 'Tap to reveal'} • Long press to ${flaggingMode ? 'reveal' : 'flag'}` 
            : 'Left click to reveal a cell • Right click to flag a cell'}
        </p>
      </div>
    </div>
  );
};
