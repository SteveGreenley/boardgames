import Cell from './Cell';

const Board = ({ cells, onCellClick, winningPattern }) => {
  const isWinningCell = (index) => winningPattern?.includes(index);

  return (
    <div className="board">
      {cells.map((cell, index) => (
        <Cell
          key={index}
          value={cell}
          onClick={() => onCellClick(index)}
          isWinner={isWinningCell(index)}
        />
      ))}
    </div>
  );
};

export default Board;
