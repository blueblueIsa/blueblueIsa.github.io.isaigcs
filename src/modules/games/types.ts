export interface GameProps {
  onBack: () => void;
}

export interface Game {
  id: string;
  name: string;
  description: string;
  icon: string;
  component: React.ComponentType<GameProps>;
}

export type GameId = 'cosmic' | 'minesweeper' | 'pacman' | 'snake' | 'breakout' | 'invaders' | 'memory';

