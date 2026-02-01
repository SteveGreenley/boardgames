import TicTacToe from './tictactoe';
import Chess from './chess';
import Reversi from './reversi';
import Checkers from './checkers';
import Go from './go';
import Backgammon from './backgammon';

const games = [
  {
    id: 'tictactoe',
    name: 'Tic Tac Toe',
    path: '/tictactoe',
    component: TicTacToe,
    icon: '#',
    description: 'Classic X and O game against the computer',
  },
  {
    id: 'chess',
    name: 'Chess',
    path: '/chess',
    component: Chess,
    icon: '\u265E',
    description: 'Play chess against Stockfish AI',
  },
  {
    id: 'reversi',
    name: 'Reversi',
    path: '/reversi',
    component: Reversi,
    icon: '\u26AB',
    description: "Classic strategy game - flip your opponent's pieces",
  },
  {
    id: 'checkers',
    name: 'Checkers',
    path: '/checkers',
    component: Checkers,
    icon: '\u26C2',
    description: 'Jump and capture your way to victory',
  },
  {
    id: 'go',
    name: 'Go',
    path: '/go',
    component: Go,
    icon: '\u25CB',
    description: 'Ancient strategy game of territory and capture',
  },
  {
    id: 'backgammon',
    name: 'Backgammon',
    path: '/backgammon',
    component: Backgammon,
    icon: '\u{1F3B2}',
    description: 'Classic dice and strategy board game',
  },
];

export default games;
