import { useEffect, useState } from 'react';
import Board from './components/Board';
import Status from './components/Status';
import {
  RED,
  BLACK,
  PLAYER,
  COMPUTER,
  createInitialBoard,
  getAllMoves,
  getValidMoves,
  makeMove,
  isGameOver,
  getPieceCount,
  getWinner,
  getBestMove,
  isPlayerPiece,
  DIFFICULTY_DEPTH,
} from './utils/gameLogic';
import useGameState from '../../hooks/useGameState';
import './Checkers.css';

const INITIAL_STATE = {
  board: createInitialBoard(),
  currentPlayer: RED,
  gameOver: false,
  winner: null,
  difficulty: 'medium',
};

const Checkers = () => {
  const [state, setState, resetState] = useGameState('checkers', INITIAL_STATE);
  const { board, currentPlayer, gameOver, winner, difficulty } = state;
  const [selectedPiece, setSelectedPiece] = useState(null);

  const isPlayerTurn = currentPlayer === PLAYER;
  const pieceCount = getPieceCount(board);

  // Get valid moves for display
  const validMoves = selectedPiece
    ? getValidMoves(board, currentPlayer, selectedPiece[0], selectedPiece[1])
    : [];

  // Check if piece can be selected (has moves available)
  const canSelectPiece = (row, col) => {
    const piece = board[row][col];
    if (!piece || !isPlayerPiece(piece)) return false;

    const allMoves = getAllMoves(board, PLAYER);
    const hasJumps = allMoves.some(m => m.captures.length > 0);

    // If jumps available, can only select pieces that can jump
    if (hasJumps) {
      return allMoves.some(
        m => m.from[0] === row && m.from[1] === col && m.captures.length > 0
      );
    }

    return allMoves.some(m => m.from[0] === row && m.from[1] === col);
  };

  const handleCellClick = (row, col) => {
    if (!isPlayerTurn || gameOver) return;

    const clickedPiece = board[row][col];

    // If clicking on own piece, select it
    if (clickedPiece && isPlayerPiece(clickedPiece)) {
      if (canSelectPiece(row, col)) {
        setSelectedPiece([row, col]);
      }
      return;
    }

    // If no piece selected, do nothing
    if (!selectedPiece) return;

    // Check if this is a valid move destination
    const move = validMoves.find(m => m.to[0] === row && m.to[1] === col);
    if (!move) {
      setSelectedPiece(null);
      return;
    }

    // Make the move
    const newBoard = makeMove(board, move);
    setSelectedPiece(null);

    if (isGameOver(newBoard)) {
      setState({
        ...state,
        board: newBoard,
        gameOver: true,
        winner: getWinner(newBoard),
      });
      return;
    }

    setState({
      ...state,
      board: newBoard,
      currentPlayer: COMPUTER,
    });
  };

  // Computer's turn
  useEffect(() => {
    if (isPlayerTurn || gameOver) return;

    const timer = setTimeout(() => {
      const move = getBestMove(board, COMPUTER, difficulty);
      if (move) {
        const newBoard = makeMove(board, move);

        if (isGameOver(newBoard)) {
          setState({
            ...state,
            board: newBoard,
            gameOver: true,
            winner: getWinner(newBoard),
          });
          return;
        }

        setState({
          ...state,
          board: newBoard,
          currentPlayer: PLAYER,
        });
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

  const handleReset = () => {
    setSelectedPiece(null);
    resetState();
  };

  return (
    <div className="checkers-container">
      <h1>Checkers</h1>
      <Status
        pieceCount={pieceCount}
        isPlayerTurn={isPlayerTurn}
        gameOver={gameOver}
        winner={winner}
      />
      <Board
        board={board}
        selectedPiece={selectedPiece}
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
        <button onClick={handleReset}>New Game</button>
      </div>
    </div>
  );
};

export default Checkers;
