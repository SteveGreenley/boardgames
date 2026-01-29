import TicTacToe from './tictactoe';
import Chess from './chess';

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
];

export default games;
