export const RED = 'red';
export const BLACK = 'black';
export const RED_KING = 'red-king';
export const BLACK_KING = 'black-king';
export const PLAYER = RED;
export const COMPUTER = BLACK;

export const isPlayerPiece = (piece) => piece === RED || piece === RED_KING;
export const isComputerPiece = (piece) => piece === BLACK || piece === BLACK_KING;
export const isKing = (piece) => piece === RED_KING || piece === BLACK_KING;

const getOwner = (piece) => {
  if (piece === RED || piece === RED_KING) return RED;
  if (piece === BLACK || piece === BLACK_KING) return BLACK;
  return null;
};

const isValidPosition = (row, col) => row >= 0 && row < 8 && col >= 0 && col < 8;

export const createInitialBoard = () => {
  const board = Array(8).fill(null).map(() => Array(8).fill(null));

  // Black pieces at top (rows 0-2)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = BLACK;
      }
    }
  }

  // Red pieces at bottom (rows 5-7)
  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = RED;
      }
    }
  }

  return board;
};

const getSimpleMoves = (board, row, col) => {
  const piece = board[row][col];
  if (!piece) return [];

  const moves = [];
  const directions = [];

  // Red moves up (decreasing row), Black moves down (increasing row)
  // Kings can move both directions
  if (piece === RED || isKing(piece)) {
    directions.push([-1, -1], [-1, 1]);
  }
  if (piece === BLACK || isKing(piece)) {
    directions.push([1, -1], [1, 1]);
  }

  for (const [dRow, dCol] of directions) {
    const newRow = row + dRow;
    const newCol = col + dCol;
    if (isValidPosition(newRow, newCol) && board[newRow][newCol] === null) {
      moves.push({ from: [row, col], to: [newRow, newCol], captures: [] });
    }
  }

  return moves;
};

const getJumpMoves = (board, row, col, piece = null, visited = new Set()) => {
  piece = piece || board[row][col];
  if (!piece) return [];

  const owner = getOwner(piece);
  const moves = [];
  const directions = [];

  if (piece === RED || piece === RED_KING || isKing(piece)) {
    directions.push([-1, -1], [-1, 1]);
  }
  if (piece === BLACK || piece === BLACK_KING || isKing(piece)) {
    directions.push([1, -1], [1, 1]);
  }

  // Remove duplicates for kings
  const uniqueDirections = piece === RED_KING || piece === BLACK_KING
    ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
    : directions;

  for (const [dRow, dCol] of uniqueDirections) {
    const jumpedRow = row + dRow;
    const jumpedCol = col + dCol;
    const landRow = row + 2 * dRow;
    const landCol = col + 2 * dCol;

    const jumpKey = `${jumpedRow},${jumpedCol}`;

    if (
      isValidPosition(landRow, landCol) &&
      board[landRow][landCol] === null &&
      board[jumpedRow][jumpedCol] !== null &&
      getOwner(board[jumpedRow][jumpedCol]) !== owner &&
      !visited.has(jumpKey)
    ) {
      // Valid jump found
      const newVisited = new Set(visited);
      newVisited.add(jumpKey);

      // Create new board state after this jump
      const newBoard = board.map(r => [...r]);
      newBoard[landRow][landCol] = piece;
      newBoard[row][col] = null;
      newBoard[jumpedRow][jumpedCol] = null;

      // Check for promotion
      let landingPiece = piece;
      if (piece === RED && landRow === 0) landingPiece = RED_KING;
      if (piece === BLACK && landRow === 7) landingPiece = BLACK_KING;
      newBoard[landRow][landCol] = landingPiece;

      // Look for additional jumps (multi-jump)
      const furtherJumps = getJumpMoves(newBoard, landRow, landCol, landingPiece, newVisited);

      if (furtherJumps.length > 0) {
        for (const further of furtherJumps) {
          moves.push({
            from: [row, col],
            to: further.to,
            captures: [[jumpedRow, jumpedCol], ...further.captures],
          });
        }
      } else {
        moves.push({
          from: [row, col],
          to: [landRow, landCol],
          captures: [[jumpedRow, jumpedCol]],
        });
      }
    }
  }

  return moves;
};

export const getMovesForPiece = (board, row, col, player) => {
  const piece = board[row][col];
  if (!piece || getOwner(piece) !== player) return [];

  const jumps = getJumpMoves(board, row, col);
  if (jumps.length > 0) return jumps;

  return getSimpleMoves(board, row, col);
};

export const getAllMoves = (board, player) => {
  const allJumps = [];
  const allSimple = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && getOwner(piece) === player) {
        const jumps = getJumpMoves(board, row, col);
        allJumps.push(...jumps);

        if (jumps.length === 0) {
          const simple = getSimpleMoves(board, row, col);
          allSimple.push(...simple);
        }
      }
    }
  }

  // If jumps are available, they are mandatory
  return allJumps.length > 0 ? allJumps : allSimple;
};

export const getValidMoves = (board, player, selectedRow, selectedCol) => {
  const allMoves = getAllMoves(board, player);

  if (selectedRow === null || selectedCol === null) {
    return allMoves;
  }

  // Filter to moves from selected piece
  const pieceMoves = allMoves.filter(
    move => move.from[0] === selectedRow && move.from[1] === selectedCol
  );

  // If jumps exist anywhere, only return jumps for this piece
  const hasAnyJumps = allMoves.some(m => m.captures.length > 0);
  if (hasAnyJumps) {
    return pieceMoves.filter(m => m.captures.length > 0);
  }

  return pieceMoves;
};

export const makeMove = (board, move) => {
  const newBoard = board.map(r => [...r]);
  const [fromRow, fromCol] = move.from;
  const [toRow, toCol] = move.to;

  let piece = newBoard[fromRow][fromCol];
  newBoard[fromRow][fromCol] = null;

  // Remove captured pieces
  for (const [capRow, capCol] of move.captures) {
    newBoard[capRow][capCol] = null;
  }

  // Check for promotion
  if (piece === RED && toRow === 0) piece = RED_KING;
  if (piece === BLACK && toRow === 7) piece = BLACK_KING;

  newBoard[toRow][toCol] = piece;
  return newBoard;
};

export const getScore = (board) => {
  let red = 0;
  let black = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece === RED) red += 1;
      else if (piece === RED_KING) red += 2;
      else if (piece === BLACK) black += 1;
      else if (piece === BLACK_KING) black += 2;
    }
  }

  return { red, black };
};

export const getPieceCount = (board) => {
  let red = 0;
  let black = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (isPlayerPiece(piece)) red++;
      else if (isComputerPiece(piece)) black++;
    }
  }

  return { red, black };
};

export const isGameOver = (board) => {
  const redMoves = getAllMoves(board, RED);
  const blackMoves = getAllMoves(board, BLACK);
  const counts = getPieceCount(board);

  return counts.red === 0 || counts.black === 0 ||
         redMoves.length === 0 || blackMoves.length === 0;
};

export const getWinner = (board) => {
  const counts = getPieceCount(board);
  const redMoves = getAllMoves(board, RED);
  const blackMoves = getAllMoves(board, BLACK);

  if (counts.red === 0 || redMoves.length === 0) return BLACK;
  if (counts.black === 0 || blackMoves.length === 0) return RED;
  return null;
};

// AI evaluation
const evaluateBoard = (board, player) => {
  const score = getScore(board);
  const opponent = player === RED ? BLACK : RED;

  let evaluation = 0;

  // Piece values
  if (player === RED) {
    evaluation = score.red - score.black;
  } else {
    evaluation = score.black - score.red;
  }

  // Position bonuses
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece) continue;

      const owner = getOwner(piece);
      const sign = owner === player ? 1 : -1;

      // Center control
      if (col >= 2 && col <= 5) {
        evaluation += sign * 0.1;
      }

      // Advancement bonus for non-kings
      if (!isKing(piece)) {
        if (owner === RED) {
          evaluation += sign * (7 - row) * 0.05;
        } else {
          evaluation += sign * row * 0.05;
        }
      }

      // Back row protection
      if ((owner === RED && row === 7) || (owner === BLACK && row === 0)) {
        evaluation += sign * 0.2;
      }
    }
  }

  // Mobility
  const playerMoves = getAllMoves(board, player).length;
  const opponentMoves = getAllMoves(board, opponent).length;
  evaluation += (playerMoves - opponentMoves) * 0.1;

  return evaluation;
};

const minimax = (board, depth, alpha, beta, maximizingPlayer, aiPlayer) => {
  const currentPlayer = maximizingPlayer ? aiPlayer : (aiPlayer === RED ? BLACK : RED);

  if (depth === 0 || isGameOver(board)) {
    return { score: evaluateBoard(board, aiPlayer), move: null };
  }

  const moves = getAllMoves(board, currentPlayer);

  if (moves.length === 0) {
    return { score: maximizingPlayer ? -1000 : 1000, move: null };
  }

  let bestMove = moves[0];

  if (maximizingPlayer) {
    let maxScore = -Infinity;
    for (const move of moves) {
      const newBoard = makeMove(board, move);
      const result = minimax(newBoard, depth - 1, alpha, beta, false, aiPlayer);
      if (result.score > maxScore) {
        maxScore = result.score;
        bestMove = move;
      }
      alpha = Math.max(alpha, result.score);
      if (beta <= alpha) break;
    }
    return { score: maxScore, move: bestMove };
  } else {
    let minScore = Infinity;
    for (const move of moves) {
      const newBoard = makeMove(board, move);
      const result = minimax(newBoard, depth - 1, alpha, beta, true, aiPlayer);
      if (result.score < minScore) {
        minScore = result.score;
        bestMove = move;
      }
      beta = Math.min(beta, result.score);
      if (beta <= alpha) break;
    }
    return { score: minScore, move: bestMove };
  }
};

export const DIFFICULTY_DEPTH = {
  easy: 2,
  medium: 4,
  hard: 6,
};

export const getBestMove = (board, player, difficulty = 'medium') => {
  const depth = DIFFICULTY_DEPTH[difficulty] || 4;
  const result = minimax(board, depth, -Infinity, Infinity, true, player);
  return result.move;
};
