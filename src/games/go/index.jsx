import { useEffect, useRef, useState, useCallback } from 'react';
import { Game, Color } from 'wgo';
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

  let score = captures * 10;

  const center = Math.floor(game.size / 2);
  const distFromCenter = Math.abs(x - center) + Math.abs(y - center);
  score += (game.size - distFromCenter) * 0.5;

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

  validMoves.sort((a, b) => b.score - a.score);

  if (Math.random() < settings.randomness) {
    const randomIndex = Math.floor(Math.random() * Math.min(validMoves.length, 5 + settings.depth * 2));
    return validMoves[randomIndex];
  }

  return validMoves[0];
};

// Custom SVG Board component
const GoBoard = ({ size, stones, onCellClick, disabled }) => {
  const padding = 20;
  const boardSize = 360;
  const cellSize = boardSize / (size - 1);

  // Star points for different board sizes
  const getStarPoints = (size) => {
    if (size === 9) {
      return [[2, 2], [2, 6], [4, 4], [6, 2], [6, 6]];
    } else if (size === 13) {
      return [[3, 3], [3, 9], [6, 6], [9, 3], [9, 9]];
    } else if (size === 19) {
      return [
        [3, 3], [3, 9], [3, 15],
        [9, 3], [9, 9], [9, 15],
        [15, 3], [15, 9], [15, 15],
      ];
    }
    return [];
  };

  const starPoints = getStarPoints(size);

  const handleClick = (x, y) => {
    if (!disabled) {
      onCellClick(x, y);
    }
  };

  return (
    <svg
      width={boardSize + padding * 2}
      height={boardSize + padding * 2}
      className="go-board-svg"
    >
      {/* Background */}
      <rect
        x={0}
        y={0}
        width={boardSize + padding * 2}
        height={boardSize + padding * 2}
        fill="#DEB887"
      />

      {/* Grid lines */}
      {Array.from({ length: size }).map((_, i) => (
        <g key={`lines-${i}`}>
          {/* Vertical lines */}
          <line
            x1={padding + i * cellSize}
            y1={padding}
            x2={padding + i * cellSize}
            y2={padding + boardSize}
            stroke="#333"
            strokeWidth={i === 0 || i === size - 1 ? 2 : 1}
          />
          {/* Horizontal lines */}
          <line
            x1={padding}
            y1={padding + i * cellSize}
            x2={padding + boardSize}
            y2={padding + i * cellSize}
            stroke="#333"
            strokeWidth={i === 0 || i === size - 1 ? 2 : 1}
          />
        </g>
      ))}

      {/* Star points */}
      {starPoints.map(([x, y]) => (
        <circle
          key={`star-${x}-${y}`}
          cx={padding + x * cellSize}
          cy={padding + y * cellSize}
          r={4}
          fill="#333"
        />
      ))}

      {/* Click areas */}
      {Array.from({ length: size }).map((_, x) =>
        Array.from({ length: size }).map((_, y) => (
          <rect
            key={`click-${x}-${y}`}
            x={padding + x * cellSize - cellSize / 2}
            y={padding + y * cellSize - cellSize / 2}
            width={cellSize}
            height={cellSize}
            fill="transparent"
            style={{ cursor: disabled ? 'default' : 'pointer' }}
            onClick={() => handleClick(x, y)}
          />
        ))
      )}

      {/* Stones */}
      {stones.map(({ x, y, color }) => (
        <g key={`stone-${x}-${y}`}>
          {/* Shadow */}
          <ellipse
            cx={padding + x * cellSize + 2}
            cy={padding + y * cellSize + 2}
            rx={cellSize * 0.43}
            ry={cellSize * 0.43}
            fill="rgba(0,0,0,0.3)"
          />
          {/* Stone */}
          <circle
            cx={padding + x * cellSize}
            cy={padding + y * cellSize}
            r={cellSize * 0.43}
            fill={color === 'black' ? '#1a1a1a' : '#f5f5f5'}
            stroke={color === 'black' ? '#000' : '#ccc'}
            strokeWidth={1}
          />
          {/* Highlight */}
          <circle
            cx={padding + x * cellSize - cellSize * 0.15}
            cy={padding + y * cellSize - cellSize * 0.15}
            r={cellSize * 0.12}
            fill={color === 'black' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.8)'}
          />
        </g>
      ))}
    </svg>
  );
};

const Go = () => {
  const [state, setState] = useGameState('go', INITIAL_STATE);
  const { boardSize, difficulty, consecutivePasses, gameOver, winner } = state;

  const gameRef = useRef(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [captures, setCaptures] = useState({ black: 0, white: 0 });
  const [stones, setStones] = useState([]);

  // Initialize game
  useEffect(() => {
    gameRef.current = new Game(boardSize);
    setStones([]);
    setIsPlayerTurn(true);
    setCaptures({ black: 0, white: 0 });
  }, [boardSize]);

  // Sync stones from game state
  const syncStones = useCallback(() => {
    if (!gameRef.current) return;

    const game = gameRef.current;
    const newStones = [];

    for (let x = 0; x < game.size; x++) {
      for (let y = 0; y < game.size; y++) {
        const stone = game.getStone(x, y);
        if (stone === Color.BLACK) {
          newStones.push({ x, y, color: 'black' });
        } else if (stone === Color.WHITE) {
          newStones.push({ x, y, color: 'white' });
        }
      }
    }

    setStones(newStones);
    setCaptures({ ...game.capCount });
  }, []);

  // Handle player click
  const handleCellClick = useCallback((x, y) => {
    if (!isPlayerTurn || gameOver || !gameRef.current) return;

    const game = gameRef.current;

    if (!game.isValid(x, y)) return;

    const result = game.play(x, y);
    if (result) {
      syncStones();
      setState(prev => ({ ...prev, consecutivePasses: 0 }));
      setIsPlayerTurn(false);
    }
  }, [isPlayerTurn, gameOver, syncStones, setState]);

  // Computer's turn
  useEffect(() => {
    if (isPlayerTurn || gameOver || !gameRef.current) return;

    const timer = setTimeout(() => {
      const game = gameRef.current;
      const move = getBestMove(game, difficulty);

      if (move) {
        game.play(move.x, move.y);
        syncStones();
        setState(prev => ({ ...prev, consecutivePasses: 0 }));
      } else {
        game.pass();
        const newPasses = consecutivePasses + 1;
        if (newPasses >= 2) {
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
  }, [isPlayerTurn, gameOver, difficulty, consecutivePasses, syncStones, setState]);

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
    let black = game.capCount.black;
    let white = game.capCount.white + 6.5;

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
    setState({
      ...INITIAL_STATE,
      boardSize: boardSize,
      difficulty: difficulty,
    });
    gameRef.current = new Game(boardSize);
    setStones([]);
    setIsPlayerTurn(true);
    setCaptures({ black: 0, white: 0 });
  };

  const handleBoardSizeChange = (e) => {
    const newSize = BOARD_SIZES[e.target.value];
    setState({
      ...INITIAL_STATE,
      boardSize: newSize,
      difficulty: state.difficulty,
    });
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

      <div className="board-wrapper">
        <GoBoard
          size={boardSize}
          stones={stones}
          onCellClick={handleCellClick}
          disabled={!isPlayerTurn || gameOver}
        />
      </div>

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
