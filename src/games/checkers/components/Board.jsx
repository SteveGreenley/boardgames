import Cell from './Cell';

const Board = ({ board, selectedPiece, validMoves, onCellClick }) => {
  const isValidMoveTarget = (row, col) => {
    return validMoves.some(move => move.to[0] === row && move.to[1] === col);
  };

  const isSelected = (row, col) => {
    return selectedPiece && selectedPiece[0] === row && selectedPiece[1] === col;
  };

  return (
    <div className="board">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <Cell
            key={`${rowIndex}-${colIndex}`}
            value={cell}
            onClick={() => onCellClick(rowIndex, colIndex)}
            isLight={(rowIndex + colIndex) % 2 === 0}
            isSelected={isSelected(rowIndex, colIndex)}
            isValidMove={isValidMoveTarget(rowIndex, colIndex)}
          />
        ))
      )}
    </div>
  );
};

export default Board;
