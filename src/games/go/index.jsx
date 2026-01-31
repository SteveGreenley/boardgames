import { useEffect, useRef, useState, useCallback } from 'react';
import { Game, SVGBoard, Color } from 'wgo';
import useGameState from '../../hooks/useGameState';
import './Go.css';

const BOARD_SIZES = {
  '9x9': 9,
  '13x13': 13,
  '19x19': 19,
};

const DIFFICULTY_SETTINGS = {
  easy: { depth: 1, randomness: 0.8 },
  medium: { depth: 2, randomness: 0.4 },
  hard: { depth: 3, randomness: 0.1 },
};

const INITIAL_STATE = {
  boardSize: 9,
  difficulty: 'medium',
  consecutivePasses: 0,
  gameOver: false,
  winner: null,
};

// Simple AI for Go - evaluates moves based on captures and territory influence
const evaluateMove = (game, x, y) => {
  const testGame = new Game(game.size);
  // Copy current position
  for (let i = 0; i < game.size; i++) {
    for (let j = 0; j < game.size; j++) {
      const stone = game.getStone(i, j);
      if (stone !== null && stone !== Color.EMPTY) {
        testGame.addStone(i, j, stone);
      }
    }
  }
  testGame.turn = game.turn;

  const beforeCaps = testGame.capCount;
  const result = testGame.play(x, y);

  if (!result) return -1000;

  const afterCaps = testGame.capCount;
  const captures = game.turn === Color.BLACK
    ? afterCaps.black - beforeCaps.black
    : afterCaps.white - beforeCaps.white;

  // Score based on captures and position
  let score = captures * 10;

  // Prefer moves away from edges (except corners for territory)
  const center = Math.floor(game.size / 2);
  const distFromCenter = Math.abs(x - center) + Math.abs(y - center);
  score += (game.size - distFromCenter) * 0.5;

  // Prefer moves near existing stones
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dx, dy] of directions) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx >= 0 && nx < game.size && ny >= 0 && ny < game.size) {
      const neighbor = game.getStone(nx, ny);
      if (neighbor === game.turn) score += 2;
      else if (neighbor !== null && neighbor !== Color.EMPTY) score += 1;
    }
  }

  return score;
};

const getBestMove = (game, difficulty) => {
  const settings = DIFFICULTY_SETTINGS[difficulty];
  const validMoves = [];

  for (let x = 0; x < game.size; x++) {
    for (let y = 0; y < game.size; y++) {
      if (game.isValid(x, y)) {
        const score = evaluateMove(game, x, y);
        if (score > -1000) {
          validMoves.push({ x, y, score });
        }
      }
    }
  }

  if (validMoves.length === 0) return null;

  // Sort by score
  validMoves.sort((a, b) => b.score - a.score);

  // Add randomness based on difficulty
  if (Math.random() < settings.randomness) {
    const randomIndex = Math.floor(Math.random() * Math.min(validMoves.length, 5 + settings.depth * 2));
    return validMoves[randomIndex];
  }

  return validMoves[0];
};

const Go = () => {
  const [state, setState, resetState] = useGameState('go', INITIAL_STATE);
  const { boardSize, difficulty, consecutivePasses, gameOver, winner } = state;

  const boardRef = useRef(null);
  const svgBoardRef = useRef(null);
  const gameRef = useRef(null);
  const stonesRef = useRef([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [captures, setCaptures] = useState({ black: 0, white: 0 });

  // Use refs to access latest state in click handler without re-registering
  const isPlayerTurnRef = useRef(isPlayerTurn);
  const gameOverRef = useRef(gameOver);
  isPlayerTurnRef.current = isPlayerTurn;
  gameOverRef.current = gameOver;

  // Sync board display with game state
  const syncBoard = useCallback(() => {
    if (!svgBoardRef.current || !gameRef.current) return;

    // Remove all existing stones
    for (const stone of stonesRef.current) {
      svgBoardRef.current.removeObject(stone);
    }
    stonesRef.current = [];

    // Add current stones
    const game = gameRef.current;
    for (let x = 0; x < game.size; x++) {
      for (let y = 0; y < game.size; y++) {
        const color = game.getStone(x, y);
        if (color === Color.BLACK || color === Color.WHITE) {
          const stone = { x, y, type: color === Color.BLACK ? 'B' : 'W' };
          stonesRef.current.push(stone);
          svgBoardRef.current.addObject(stone);
        }
      }
    }

    setCaptures({ ...game.capCount });
  }, []);

  // Initialize game and board
  useEffect(() => {
    if (!boardRef.current) return;

    // Clear previous board
    boardRef.current.innerHTML = '';

    // Create new game
    gameRef.current = new Game(boardSize);
    stonesRef.current = [];

    // Create SVG board
    const board = new SVGBoard(boardRef.current, {
      size: boardSize,
      width: 400,
      height: 400,
      coordinates: true,
    });
    svgBoardRef.current = board;

    // Setup click handler once when board is created
    board.on('click', (event, point) => {
      if (!isPlayerTurnRef.current || gameOverRef.current || !gameRef.current) return;

      const { x, y } = point;
      const game = gameRef.current;

      if (!game.isValid(x, y)) return;

      const result = game.play(x, y);
      if (result) {
        // Sync board
        for (const stone of stonesRef.current) {
          board.removeObject(stone);
        }
        stonesRef.current = [];

        for (let i = 0; i < game.size; i++) {
          for (let j = 0; j < game.size; j++) {
            const color = game.getStone(i, j);
            if (color === Color.BLACK || color === Color.WHITE) {
              const stone = { x: i, y: j, type: color === Color.BLACK ? 'B' : 'W' };
              stonesRef.current.push(stone);
              board.addObject(stone);
            }
          }
        }

        setCaptures({ ...game.capCount });
        setState(prev => ({ ...prev, consecutivePasses: 0 }));
        setIsPlayerTurn(false);
      }
    });

    setIsPlayerTurn(true);
    setCaptures({ black: 0, white: 0 });

    return () => {
      if (boardRef.current) {
        boardRef.current.innerHTML = '';
      }
    };
  }, [boardSize, setState]);

  // Computer's turn
  useEffect(() => {
    if (isPlayerTurn || gameOver || !gameRef.current) return;

    const timer = setTimeout(() => {
      const game = gameRef.current;
      const move = getBestMove(game, difficulty);

      if (move) {
        game.play(move.x, move.y);
        syncBoard();
        setState(prev => ({ ...prev, consecutivePasses: 0 }));
      } else {
        // AI passes
        game.pass();
        const newPasses = consecutivePasses + 1;
        if (newPasses >= 2) {
          // Game over - both passed
          const score = calculateScore(game);
          setState(prev => ({
            ...prev,
            consecutivePasses: newPasses,
            gameOver: true,
            winner: score.black > score.white ? 'black' : score.white > score.black ? 'white' : 'tie',
          }));
        } else {
          setState(prev => ({ ...prev, consecutivePasses: newPasses }));
        }
      }

      setIsPlayerTurn(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [isPlayerTurn, gameOver, difficulty, consecutivePasses, syncBoard, setState]);

  const handlePass = () => {
    if (!isPlayerTurn || gameOver || !gameRef.current) return;

    gameRef.current.pass();
    const newPasses = consecutivePasses + 1;

    if (newPasses >= 2) {
      const score = calculateScore(gameRef.current);
      setState(prev => ({
        ...prev,
        consecutivePasses: newPasses,
        gameOver: true,
        winner: score.black > score.white ? 'black' : score.white > score.black ? 'white' : 'tie',
      }));
    } else {
      setState(prev => ({ ...prev, consecutivePasses: newPasses }));
      setIsPlayerTurn(false);
    }
  };

  const calculateScore = (game) => {
    // Simple scoring: count stones + captures
    // (Real Go uses territory scoring which is more complex)
    let black = game.capCount.black;
    let white = game.capCount.white + 6.5; // Komi for white

    for (let x = 0; x < game.size; x++) {
      for (let y = 0; y < game.size; y++) {
        const stone = game.getStone(x, y);
        if (stone === Color.BLACK) black++;
        else if (stone === Color.WHITE) white++;
      }
    }

    return { black, white };
  };

  const handleNewGame = () => {
    resetState();
    // Board will reinitialize via useEffect when state changes
  };

  const handleBoardSizeChange = (e) => {
    const newSize = BOARD_SIZES[e.target.value];
    setState(prev => ({
      ...INITIAL_STATE,
      boardSize: newSize,
      difficulty: prev.difficulty,
    }));
  };

  const handleDifficultyChange = (e) => {
    setState(prev => ({ ...prev, difficulty: e.target.value }));
  };

  const getMessage = () => {
    if (gameOver) {
      if (winner === 'black') return 'You win!';
      if (winner === 'white') return 'Computer wins!';
      return "It's a tie!";
    }
    return isPlayerTurn ? 'Your turn (Black)' : "Computer's turn...";
  };

  return (
    <div className="go-container">
      <h1>Go</h1>

      <div className="status">
        <div className="message">{getMessage()}</div>
        <div className="score">
          <span className="score-black">
            <span className="score-stone black" /> Captures: {captures.black}
          </span>
          <span className="score-white">
            <span className="score-stone white" /> Captures: {captures.white}
          </span>
        </div>
      </div>

      <div className="board-wrapper" ref={boardRef} />

      <div className="controls">
        <label>
          Board:
          <select
            value={Object.keys(BOARD_SIZES).find(k => BOARD_SIZES[k] === boardSize)}
            onChange={handleBoardSizeChange}
          >
            {Object.keys(BOARD_SIZES).map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </label>
        <label>
          Difficulty:
          <select value={difficulty} onChange={handleDifficultyChange}>
            {Object.keys(DIFFICULTY_SETTINGS).map((level) => (
              <option key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <button onClick={handlePass} disabled={!isPlayerTurn || gameOver}>
          Pass
        </button>
        <button onClick={handleNewGame}>New Game</button>
      </div>
    </div>
  );
};

export default Go;
