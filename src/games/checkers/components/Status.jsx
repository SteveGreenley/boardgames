import { RED, BLACK } from '../utils/gameLogic';

const Status = ({ pieceCount, isPlayerTurn, gameOver, winner }) => {
  const getMessage = () => {
    if (gameOver) {
      if (winner === RED) return 'You win!';
      if (winner === BLACK) return 'Computer wins!';
      return "It's a tie!";
    }
    return isPlayerTurn ? 'Your turn (Red)' : "Computer's turn...";
  };

  return (
    <div className="status">
      <div className="message">{getMessage()}</div>
      <div className="score">
        <span className="score-red">
          <span className="score-piece red" /> {pieceCount.red}
        </span>
        <span className="score-black">
          <span className="score-piece black" /> {pieceCount.black}
        </span>
      </div>
    </div>
  );
};

export default Status;
