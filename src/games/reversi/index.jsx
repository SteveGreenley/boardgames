import { useEffect } from 'react';
import Board from './components/Board';
import Status from './components/Status';
import {
  BLACK,
  WHITE,
  PLAYER,
  COMPUTER,
  createInitialBoard,
  getValidMoves,
  makeMove,
  isGameOver,
  getScore,
  getWinner,
  getBestMove,
  DIFFICULTY_DEPTH,
} from './utils/gameLogic';
import useGameState from '../../hooks/useGameState';
import './Reversi.css';

const INITIAL_STATE = {
  board: createInitialBoard(),
  currentPlayer: BLACK,
  gameOver: false,
  winner: null,
  difficulty: 'medium',
};

const Reversi = () => {
  const [state, setState, resetState] = useGameState('reversi', INITIAL_STATE);
  const { board, currentPlayer, gameOver, winner, difficulty } = state;

  const isPlayerTurn = currentPlayer === PLAYER;
  const score = getScore(board);
  const validMoves = getValidMoves(board, currentPlayer);

  const handleCellClick = (row, col) => {
    if (!isPlayerTurn || gameOver) return;

    const newBoard = makeMove(board, row, col, PLAYER);
    if (!newBoard) return;

    if (isGameOver(newBoard)) {
      setState({
        ...state,
        board: newBoard,
        gameOver: true,
        winner: getWinner(newBoard),
      });
      return;
    }

    // Check if computer can move
    const computerMoves = getValidMoves(newBoard, COMPUTER);
    if (computerMoves.length > 0) {
      setState({
        ...state,
        board: newBoard,
        currentPlayer: COMPUTER,
      });
    } else {
      // Computer has no moves, player goes again
      const playerMoves = getValidMoves(newBoard, PLAYER);
      if (playerMoves.length > 0) {
        setState({
          ...state,
          board: newBoard,
          currentPlayer: PLAYER,
        });
      } else {
        // Neither can move - game over
        setState({
          ...state,
          board: newBoard,
          gameOver: true,
          winner: getWinner(newBoard),
        });
      }
    }
  };

  useEffect(() => {
    if (isPlayerTurn || gameOver) return;

    const timer = setTimeout(() => {
      const move = getBestMove(board, COMPUTER, difficulty);
      if (move) {
        const [row, col] = move;
        const newBoard = makeMove(board, row, col, COMPUTER);

        if (isGameOver(newBoard)) {
          setState({
            ...state,
            board: newBoard,
            gameOver: true,
            winner: getWinner(newBoard),
          });
          return;
        }

        // Check if player can move
        const playerMoves = getValidMoves(newBoard, PLAYER);
        if (playerMoves.length > 0) {
          setState({
            ...state,
            board: newBoard,
            currentPlayer: PLAYER,
          });
        } else {
          // Player has no moves, computer goes again
          const computerMoves = getValidMoves(newBoard, COMPUTER);
          if (computerMoves.length > 0) {
            setState({
              ...state,
              board: newBoard,
              currentPlayer: COMPUTER,
            });
          } else {
            // Neither can move - game over
            setState({
              ...state,
              board: newBoard,
              gameOver: true,
              winner: getWinner(newBoard),
            });
          }
        }
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [currentPlayer, board, gameOver, difficulty, setState, state, isPlayerTurn]);

  const handleDifficultyChange = (e) => {
    setState({
      ...state,
      difficulty: e.target.value,
    });
  };

  return (
    <div className="reversi-container">
      <h1>Reversi</h1>
      <Status
        score={score}
        currentPlayer={currentPlayer}
        isPlayerTurn={isPlayerTurn}
        gameOver={gameOver}
        winner={winner}
      />
      <Board
        board={board}
        validMoves={isPlayerTurn && !gameOver ? validMoves : []}
        onCellClick={handleCellClick}
      />
      <div className="controls">
        <label>
          Difficulty:
          <select value={difficulty} onChange={handleDifficultyChange}>
            {Object.keys(DIFFICULTY_DEPTH).map((level) => (
              <option key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <button onClick={resetState}>New Game</button>
      </div>
    </div>
  );
};

export default Reversi;
