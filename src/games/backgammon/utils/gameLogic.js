export const WHITE = 'white';
export const BLACK = 'black';
export const PLAYER = WHITE;
export const COMPUTER = BLACK;

// Initial board setup - array of 24 points
// Positive numbers = white pieces, negative = black pieces
// White moves from point 24 toward point 1 (home board is 1-6)
// Black moves from point 1 toward point 24 (home board is 19-24)
export const createInitialBoard = () => {
  const board = Array(24).fill(0);

  // White pieces (positive) - moving toward point 1
  board[23] = 2;  // Point 24: 2 white
  board[12] = 5;  // Point 13: 5 white
  board[7] = 3;   // Point 8: 3 white
  board[5] = 5;   // Point 6: 5 white

  // Black pieces (negative) - moving toward point 24
  board[0] = -2;   // Point 1: 2 black
  board[11] = -5;  // Point 12: 5 black
  board[16] = -3;  // Point 17: 3 black
  board[18] = -5;  // Point 19: 5 black

  return board;
};

export const createInitialState = () => ({
  board: createInitialBoard(),
  whiteBar: 0,
  blackBar: 0,
  whiteOff: 0,
  blackOff: 0,
  dice: [],
  currentPlayer: WHITE,
  movesRemaining: [],
  gameOver: false,
  winner: null,
});

export const rollDice = () => {
  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;

  // Doubles = 4 moves of that value
  if (die1 === die2) {
    return [die1, die1, die1, die1];
  }
  return [die1, die2];
};

const getPlayerSign = (player) => player === WHITE ? 1 : -1;
const isPlayerPoint = (board, point, player) => {
  const sign = getPlayerSign(player);
  return board[point] * sign > 0;
};

const isOpponentPoint = (board, point, player) => {
  const sign = getPlayerSign(player);
  return board[point] * sign < 0;
};

const isOpenPoint = (board, point, player) => {
  const sign = getPlayerSign(player);
  // Open if empty, own pieces, or only one opponent piece (can hit)
  return board[point] === 0 ||
         board[point] * sign > 0 ||
         Math.abs(board[point]) === 1;
};

const getBar = (state, player) => player === WHITE ? state.whiteBar : state.blackBar;
const getOff = (state, player) => player === WHITE ? state.whiteOff : state.blackOff;

// Check if all pieces are in home board (can start bearing off)
export const canBearOff = (state, player) => {
  const { board } = state;
  const bar = getBar(state, player);

  if (bar > 0) return false;

  if (player === WHITE) {
    // White home board is points 1-6 (indices 0-5)
    // Check if any white pieces are outside home board
    for (let i = 6; i < 24; i++) {
      if (board[i] > 0) return false;
    }
  } else {
    // Black home board is points 19-24 (indices 18-23)
    // Check if any black pieces are outside home board
    for (let i = 0; i < 18; i++) {
      if (board[i] < 0) return false;
    }
  }

  return true;
};

// Get valid moves for a specific die value
export const getValidMovesForDie = (state, player, dieValue) => {
  const { board } = state;
  const bar = getBar(state, player);
  const moves = [];
  const sign = getPlayerSign(player);

  // Must move from bar first
  if (bar > 0) {
    let entryPoint;
    if (player === WHITE) {
      // White enters on opponent's home board: points 19-24 (indices 18-23)
      // Die value 1 = point 24 (index 23), die value 6 = point 19 (index 18)
      entryPoint = 24 - dieValue;
    } else {
      // Black enters on opponent's home board: points 1-6 (indices 0-5)
      // Die value 1 = point 1 (index 0), die value 6 = point 6 (index 5)
      entryPoint = dieValue - 1;
    }

    if (isOpenPoint(board, entryPoint, player)) {
      moves.push({ from: 'bar', to: entryPoint, dieValue });
    }
    return moves;
  }

  // Regular moves
  for (let i = 0; i < 24; i++) {
    if (!isPlayerPoint(board, i, player)) continue;

    let targetPoint;
    if (player === WHITE) {
      // White moves toward point 1 (decreasing index)
      targetPoint = i - dieValue;
    } else {
      // Black moves toward point 24 (increasing index)
      targetPoint = i + dieValue;
    }

    // Bearing off
    if (canBearOff(state, player)) {
      if (player === WHITE && targetPoint < 0) {
        // White bears off from points 1-6 (indices 0-5)
        // Exact or higher (if no pieces behind)
        if (targetPoint === -1) {
          moves.push({ from: i, to: 'off', dieValue });
        } else {
          // Can only bear off with higher if this is the furthest piece
          let hasPieceBehind = false;
          for (let j = i + 1; j <= 5; j++) {
            if (board[j] > 0) hasPieceBehind = true;
          }
          if (!hasPieceBehind) {
            moves.push({ from: i, to: 'off', dieValue });
          }
        }
        continue;
      }
      if (player === BLACK && targetPoint >= 24) {
        // Black bears off from points 19-24 (indices 18-23)
        if (targetPoint === 24) {
          moves.push({ from: i, to: 'off', dieValue });
        } else {
          // Can only bear off with higher if this is the furthest piece
          let hasPieceBehind = false;
          for (let j = 18; j < i; j++) {
            if (board[j] < 0) hasPieceBehind = true;
          }
          if (!hasPieceBehind) {
            moves.push({ from: i, to: 'off', dieValue });
          }
        }
        continue;
      }
    }

    // Regular move
    if (targetPoint >= 0 && targetPoint < 24 && isOpenPoint(board, targetPoint, player)) {
      moves.push({ from: i, to: targetPoint, dieValue });
    }
  }

  return moves;
};

export const getAllValidMoves = (state, player) => {
  const allMoves = [];
  const usedDice = new Set();

  for (const dieValue of state.movesRemaining) {
    if (usedDice.has(dieValue)) continue;
    usedDice.add(dieValue);

    const moves = getValidMovesForDie(state, player, dieValue);
    allMoves.push(...moves);
  }

  return allMoves;
};

export const makeMove = (state, move, player) => {
  const newState = {
    ...state,
    board: [...state.board],
    movesRemaining: [...state.movesRemaining],
  };

  const sign = getPlayerSign(player);

  // Remove from source
  if (move.from === 'bar') {
    if (player === WHITE) {
      newState.whiteBar--;
    } else {
      newState.blackBar--;
    }
  } else {
    newState.board[move.from] -= sign;
  }

  // Add to destination
  if (move.to === 'off') {
    if (player === WHITE) {
      newState.whiteOff++;
    } else {
      newState.blackOff++;
    }
  } else {
    // Check for hit
    if (isOpponentPoint(newState.board, move.to, player) && Math.abs(newState.board[move.to]) === 1) {
      // Hit! Send to bar
      if (player === WHITE) {
        newState.blackBar++;
      } else {
        newState.whiteBar++;
      }
      newState.board[move.to] = 0;
    }

    newState.board[move.to] += sign;
  }

  // Remove used die
  const dieIndex = newState.movesRemaining.indexOf(move.dieValue);
  if (dieIndex !== -1) {
    newState.movesRemaining.splice(dieIndex, 1);
  }

  return newState;
};

export const isGameOver = (state) => {
  return state.whiteOff === 15 || state.blackOff === 15;
};

export const getWinner = (state) => {
  if (state.whiteOff === 15) return WHITE;
  if (state.blackOff === 15) return BLACK;
  return null;
};

// Simple AI - prioritize: hitting, making points, advancing
export const getBestMove = (state, player) => {
  const moves = getAllValidMoves(state, player);
  if (moves.length === 0) return null;

  let bestMove = moves[0];
  let bestScore = -Infinity;

  for (const move of moves) {
    let score = 0;

    // Prefer bearing off
    if (move.to === 'off') {
      score += 100;
    }

    // Prefer hitting
    if (move.to !== 'off' && move.to !== 'bar') {
      const targetPieces = state.board[move.to];
      const sign = getPlayerSign(player);
      if (targetPieces * sign < 0 && Math.abs(targetPieces) === 1) {
        score += 50;
      }

      // Prefer making points (2+ pieces)
      if (Math.abs(state.board[move.from]) >= 2) {
        score += 10;
      }

      // Prefer advancing
      if (player === WHITE) {
        score += move.to - move.from;
      } else {
        score += move.from - move.to;
      }
    }

    // Prefer getting off the bar
    if (move.from === 'bar') {
      score += 200;
    }

    // Add some randomness
    score += Math.random() * 5;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
};
