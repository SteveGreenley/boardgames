import { useEffect } from 'react';
import Board from './components/Board';
import Status from './components/Status';
import { PLAYER, COMPUTER, getBestMove, checkWinner } from './utils/gameLogic';
import useGameState from '../../hooks/useGameState';
import './TicTacToe.css';

const INITIAL_STATE = {
  cells: Array(9).fill(''),
  isPlayerTurn: true,
  gameResult: null,
};

const TicTacToe = () => {
  const [state, setState, resetState] = useGameState('tictactoe', INITIAL_STATE);
  const { cells, isPlayerTurn, gameResult } = state;

  const handleCellClick = (index) => {
    if (!isPlayerTurn || cells[index] || gameResult) return;

    const newCells = [...cells];
    newCells[index] = PLAYER;

    const result = checkWinner(newCells);
    if (result) {
      setState({ cells: newCells, isPlayerTurn: true, gameResult: result });
    } else {
      setState({ cells: newCells, isPlayerTurn: false, gameResult: null });
    }
  };

  useEffect(() => {
    if (isPlayerTurn || gameResult) return;

    const timer = setTimeout(() => {
      const move = getBestMove(cells);
      if (move !== -1) {
        const newCells = [...cells];
        newCells[move] = COMPUTER;

        const result = checkWinner(newCells);
        if (result) {
          setState({ cells: newCells, isPlayerTurn: true, gameResult: result });
        } else {
          setState({ cells: newCells, isPlayerTurn: true, gameResult: null });
        }
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [isPlayerTurn, cells, gameResult, setState]);

  const restart = () => {
    resetState();
  };

  return (
    <div className="tictactoe-container">
      <h1>Tic Tac Toe</h1>
      <Status gameResult={gameResult} isPlayerTurn={isPlayerTurn} />
      <Board
        cells={cells}
        onCellClick={handleCellClick}
        winningPattern={gameResult?.pattern}
      />
      <button onClick={restart}>New Game</button>
    </div>
  );
};

export default TicTacToe;
