import { BLACK, WHITE } from '../utils/gameLogic';

const Status = ({ score, currentPlayer, isPlayerTurn, gameOver, winner }) => {
  const getMessage = () => {
    if (gameOver) {
      if (winner === BLACK) return 'You win!';
      if (winner === WHITE) return 'Computer wins!';
      return "It's a tie!";
    }
    return isPlayerTurn ? 'Your turn (Black)' : "Computer's turn...";
  };

  return (
    <div className="status">
      <div className="message">{getMessage()}</div>
      <div className="score">
        <span className="score-black">
          <span className="score-piece black" /> {score.black}
        </span>
        <span className="score-white">
          <span className="score-piece white" /> {score.white}
        </span>
      </div>
    </div>
  );
};

export default Status;
