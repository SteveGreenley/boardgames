import { useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import useGameState from '../../hooks/useGameState';
import useStockfish, { DIFFICULTY_DEPTH } from './useStockfish';
import './Chess.css';

const INITIAL_STATE = {
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  history: [],
  difficulty: 'club',
  gameOver: null,
};

const getGameStatus = (game) => {
  if (game.isCheckmate()) {
    return game.turn() === 'w' ? 'checkmate-black' : 'checkmate-white';
  }
  if (game.isStalemate()) return 'stalemate';
  if (game.isDraw()) return 'draw';
  if (game.isCheck()) return 'check';
  return null;
};

const ChessGame = () => {
  const [state, setState, resetState] = useGameState('chess', INITIAL_STATE);
  const { fen, difficulty, gameOver } = state;
  const { isReady, isThinking, getMove } = useStockfish();

  const game = new Chess(fen);
  const isPlayerTurn = game.turn() === 'w';
  const status = getGameStatus(game);

  const makeStockfishMove = useCallback(async () => {
    if (!isReady || isPlayerTurn || gameOver) return;

    const move = await getMove(fen, difficulty);
    if (move) {
      const gameCopy = new Chess(fen);
      const result = gameCopy.move({
        from: move.slice(0, 2),
        to: move.slice(2, 4),
        promotion: move[4] || 'q',
      });

      if (result) {
        const newStatus = getGameStatus(gameCopy);
        const isGameOver = newStatus === 'checkmate-white' ||
                          newStatus === 'checkmate-black' ||
                          newStatus === 'stalemate' ||
                          newStatus === 'draw';

        setState((prev) => ({
          ...prev,
          fen: gameCopy.fen(),
          history: [...prev.history, result.san],
          gameOver: isGameOver ? newStatus : null,
        }));
      }
    }
  }, [isReady, isPlayerTurn, gameOver, fen, difficulty, getMove, setState]);

  useEffect(() => {
    if (!isPlayerTurn && !gameOver && isReady) {
      const timer = setTimeout(makeStockfishMove, 300);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, gameOver, isReady, makeStockfishMove]);

  const onPieceDrop = (sourceSquare, targetSquare, piece) => {
    if (!isPlayerTurn || gameOver) return false;

    const gameCopy = new Chess(fen);

    const moveConfig = {
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    };

    const result = gameCopy.move(moveConfig);
    if (!result) return false;

    const newStatus = getGameStatus(gameCopy);
    const isGameOver = newStatus === 'checkmate-white' ||
                      newStatus === 'checkmate-black' ||
                      newStatus === 'stalemate' ||
                      newStatus === 'draw';

    setState((prev) => ({
      ...prev,
      fen: gameCopy.fen(),
      history: [...prev.history, result.san],
      gameOver: isGameOver ? newStatus : null,
    }));

    return true;
  };

  const handleDifficultyChange = (e) => {
    setState((prev) => ({
      ...prev,
      difficulty: e.target.value,
    }));
  };

  const getStatusText = () => {
    if (isThinking) return 'Thinking...';
    if (gameOver === 'checkmate-white') return 'Checkmate! You win!';
    if (gameOver === 'checkmate-black') return 'Checkmate! You lose.';
    if (gameOver === 'stalemate') return 'Stalemate! Draw.';
    if (gameOver === 'draw') return 'Draw!';
    if (status === 'check') return isPlayerTurn ? 'Check! Your move.' : 'Check!';
    return isPlayerTurn ? 'Your move' : 'Computer thinking...';
  };

  const statusClass = gameOver
    ? 'game-over'
    : status === 'check'
      ? 'check'
      : '';

  return (
    <div className="chess-container">
      <h1>Chess</h1>

      <div className={`chess-status ${statusClass}`}>
        {!isReady ? 'Loading engine...' : getStatusText()}
      </div>

      <div className="chess-board-wrapper">
        <Chessboard
          position={fen}
          onPieceDrop={onPieceDrop}
          boardOrientation="white"
          arePiecesDraggable={isPlayerTurn && !gameOver && isReady}
        />
      </div>

      <div className="chess-controls">
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

export default ChessGame;
