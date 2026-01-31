export const BLACK = 'black';
export const WHITE = 'white';
export const PLAYER = BLACK;
export const COMPUTER = WHITE;

const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],          [0, 1],
  [1, -1],  [1, 0], [1, 1],
];

export const createInitialBoard = () => {
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  board[3][3] = WHITE;
  board[3][4] = BLACK;
  board[4][3] = BLACK;
  board[4][4] = WHITE;
  return board;
};

const getOpponent = (player) => player === BLACK ? WHITE : BLACK;

const isValidPosition = (row, col) => row >= 0 && row < 8 && col >= 0 && col < 8;

const getFlipsInDirection = (board, row, col, player, [dRow, dCol]) => {
  const opponent = getOpponent(player);
  const flips = [];
  let r = row + dRow;
  let c = col + dCol;

  while (isValidPosition(r, c) && board[r][c] === opponent) {
    flips.push([r, c]);
    r += dRow;
    c += dCol;
  }

  if (flips.length > 0 && isValidPosition(r, c) && board[r][c] === player) {
    return flips;
  }
  return [];
};

const getFlipsForMove = (board, row, col, player) => {
  if (board[row][col] !== null) return [];

  const allFlips = [];
  for (const dir of DIRECTIONS) {
    const flips = getFlipsInDirection(board, row, col, player, dir);
    allFlips.push(...flips);
  }
  return allFlips;
};

export const isValidMove = (board, row, col, player) => {
  return getFlipsForMove(board, row, col, player).length > 0;
};

export const getValidMoves = (board, player) => {
  const moves = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (isValidMove(board, row, col, player)) {
        moves.push([row, col]);
      }
    }
  }
  return moves;
};

export const makeMove = (board, row, col, player) => {
  const flips = getFlipsForMove(board, row, col, player);
  if (flips.length === 0) return null;

  const newBoard = board.map(r => [...r]);
  newBoard[row][col] = player;
  for (const [r, c] of flips) {
    newBoard[r][c] = player;
  }
  return newBoard;
};

export const getScore = (board) => {
  let black = 0;
  let white = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col] === BLACK) black++;
      else if (board[row][col] === WHITE) white++;
    }
  }
  return { black, white };
};

export const isGameOver = (board) => {
  return getValidMoves(board, BLACK).length === 0 &&
         getValidMoves(board, WHITE).length === 0;
};

export const getWinner = (board) => {
  const score = getScore(board);
  if (score.black > score.white) return BLACK;
  if (score.white > score.black) return WHITE;
  return null;
};

// Position weights for evaluation - corners and edges are valuable
const POSITION_WEIGHTS = [
  [100, -20,  10,   5,   5,  10, -20, 100],
  [-20, -50,  -2,  -2,  -2,  -2, -50, -20],
  [ 10,  -2,   1,   1,   1,   1,  -2,  10],
  [  5,  -2,   1,   0,   0,   1,  -2,   5],
  [  5,  -2,   1,   0,   0,   1,  -2,   5],
  [ 10,  -2,   1,   1,   1,   1,  -2,  10],
  [-20, -50,  -2,  -2,  -2,  -2, -50, -20],
  [100, -20,  10,   5,   5,  10, -20, 100],
];

const evaluateBoard = (board, player) => {
  const opponent = getOpponent(player);
  let score = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col] === player) {
        score += POSITION_WEIGHTS[row][col];
      } else if (board[row][col] === opponent) {
        score -= POSITION_WEIGHTS[row][col];
      }
    }
  }

  // Add mobility factor
  const playerMoves = getValidMoves(board, player).length;
  const opponentMoves = getValidMoves(board, opponent).length;
  score += (playerMoves - opponentMoves) * 5;

  return score;
};

const minimax = (board, depth, alpha, beta, maximizingPlayer, aiPlayer) => {
  const currentPlayer = maximizingPlayer ? aiPlayer : getOpponent(aiPlayer);

  if (depth === 0 || isGameOver(board)) {
    return { score: evaluateBoard(board, aiPlayer), move: null };
  }

  const moves = getValidMoves(board, currentPlayer);

  // If no valid moves, pass to opponent
  if (moves.length === 0) {
    const result = minimax(board, depth - 1, alpha, beta, !maximizingPlayer, aiPlayer);
    return { score: result.score, move: null };
  }

  let bestMove = moves[0];

  if (maximizingPlayer) {
    let maxScore = -Infinity;
    for (const [row, col] of moves) {
      const newBoard = makeMove(board, row, col, currentPlayer);
      const result = minimax(newBoard, depth - 1, alpha, beta, false, aiPlayer);
      if (result.score > maxScore) {
        maxScore = result.score;
        bestMove = [row, col];
      }
      alpha = Math.max(alpha, result.score);
      if (beta <= alpha) break;
    }
    return { score: maxScore, move: bestMove };
  } else {
    let minScore = Infinity;
    for (const [row, col] of moves) {
      const newBoard = makeMove(board, row, col, currentPlayer);
      const result = minimax(newBoard, depth - 1, alpha, beta, true, aiPlayer);
      if (result.score < minScore) {
        minScore = result.score;
        bestMove = [row, col];
      }
      beta = Math.min(beta, result.score);
      if (beta <= alpha) break;
    }
    return { score: minScore, move: bestMove };
  }
};

export const DIFFICULTY_DEPTH = {
  easy: 1,
  medium: 3,
  hard: 5,
};

export const getBestMove = (board, player, difficulty = 'medium') => {
  const depth = DIFFICULTY_DEPTH[difficulty] || 3;
  const result = minimax(board, depth, -Infinity, Infinity, true, player);
  return result.move;
};
