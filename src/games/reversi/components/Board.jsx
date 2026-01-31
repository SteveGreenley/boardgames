import Cell from './Cell';

const Board = ({ board, validMoves, onCellClick }) => {
  const isValidMove = (row, col) => {
    return validMoves.some(([r, c]) => r === row && c === col);
  };

  return (
    <div className="board">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <Cell
            key={`${rowIndex}-${colIndex}`}
            value={cell}
            onClick={() => onCellClick(rowIndex, colIndex)}
            isValidMove={isValidMove(rowIndex, colIndex)}
          />
        ))
      )}
    </div>
  );
};

export default Board;
