import React, { useState } from 'react';
import type { Game, GameId } from './types';
import { CosmicCutterGame } from './CosmicCutterGame';
import { MinesweeperGame } from './MinesweeperGame';
import { PacmanGame } from './PacmanGame';
import { SnakeGame } from './SnakeGame';
import { BreakoutGame } from './BreakoutGame';
import { InvadersGame } from './InvadersGame';
import '../../styles/games.scss';

const games: Game[] = [
  {
    id: 'cosmic',
    name: 'Cosmic Cutter',
    description: 'A particle slicing game! Click and drag to slice through cosmic particles and objects.',
    icon: '✨',
    component: CosmicCutterGame
  },
  {
    id: 'minesweeper',
    name: 'Minesweeper',
    description: 'Find all the safe cells while avoiding hidden mines! Right-click to flag.',
    icon: '💣',
    component: MinesweeperGame
  },
  {
    id: 'pacman',
    name: 'Pac-Man',
    description: 'Guide Pac-Man through the maze, eat all the dots while avoiding ghosts!',
    icon: '👻',
    component: PacmanGame
  },
  {
    id: 'snake',
    name: 'Snake',
    description: 'Control the snake, eat food to grow longer, but don\'t hit the walls!',
    icon: '🐍',
    component: SnakeGame
  },
  {
    id: 'breakout',
    name: 'Breakout',
    description: 'Use the paddle to bounce the ball and break all the bricks!',
    icon: '🧱',
    component: BreakoutGame
  },
  {
    id: 'invaders',
    name: 'Space Invaders',
    description: 'Defend Earth from the alien invasion! Shoot down all enemies!',
    icon: '👾',
    component: InvadersGame
  }
];

export const GamesView: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);

  if (selectedGame) {
    const game = games.find((g) => g.id === selectedGame);
    if (game) {
      const GameComponent = game.component;
      return <GameComponent onBack={() => setSelectedGame(null)} />;
    }
  }

  return (
    <div className="games-container">
      <h1>Games</h1>
      <p className="games-intro">Classic games to test your reflexes and memory. Click on any card to play!</p>

      <div className="games-grid">
        {games.map((game) => (
          <div
            key={game.id}
            className="game-card"
            onClick={() => setSelectedGame(game.id as GameId)}
          >
            <div className="game-card-icon">{game.icon}</div>
            <h3>{game.name}</h3>
            <p>{game.description}</p>
            <button className="play-button">Play</button>
          </div>
        ))}
      </div>
    </div>
  );
};
