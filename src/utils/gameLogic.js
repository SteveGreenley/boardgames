export const PLAYER = 'X';
export const COMPUTER = 'O';

const WIN_PATTERNS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

const getWinner = (cells) => {
  for (let [a, b, c] of WIN_PATTERNS) {
    if (cells[a] && cells[a] === cells[b] && cells[b] === cells[c]) {
      return cells[a];
    }
  }
  return null;
};

const minimax = (cells, isMaximizing) => {
  const winner = getWinner(cells);

  if (winner === COMPUTER) return 10;
  if (winner === PLAYER) return -10;
  if (!cells.includes('')) return 0;

  const emptyCells = cells
    .map((cell, index) => cell === '' ? index : null)
    .filter(index => index !== null);

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let index of emptyCells) {
      const newCells = [...cells];
      newCells[index] = COMPUTER;
      const score = minimax(newCells, false);
      bestScore = Math.max(score, bestScore);
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let index of emptyCells) {
      const newCells = [...cells];
      newCells[index] = PLAYER;
      const score = minimax(newCells, true);
      bestScore = Math.min(score, bestScore);
    }
    return bestScore;
  }
};

export const getBestMove = (cells) => {
  const emptyCells = cells
    .map((cell, index) => cell === '' ? index : null)
    .filter(index => index !== null);

  let bestScore = -Infinity;
  let bestMove = -1;

  for (let index of emptyCells) {
    const newCells = [...cells];
    newCells[index] = COMPUTER;
    const score = minimax(newCells, false);
    if (score > bestScore) {
      bestScore = score;
      bestMove = index;
    }
  }

  return bestMove;
};

export const checkWinner = (cells) => {
  for (let pattern of WIN_PATTERNS) {
    const [a, b, c] = pattern;
    if (cells[a] && cells[a] === cells[b] && cells[b] === cells[c]) {
      return { winner: cells[a], pattern };
    }
  }
  if (!cells.includes('')) {
    return { winner: 'draw', pattern: [] };
  }
  return null;
};
