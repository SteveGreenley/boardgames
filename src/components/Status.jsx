import { PLAYER, COMPUTER } from '../utils/gameLogic';

const Status = ({ gameResult, isPlayerTurn }) => {
  const getMessage = () => {
    if (gameResult) {
      if (gameResult.winner === PLAYER) return 'You win!';
      if (gameResult.winner === COMPUTER) return 'Computer wins!';
      return "It's a draw!";
    }
    return isPlayerTurn ? 'Your turn (X)' : "Computer's turn...";
  };

  return <div className="status">{getMessage()}</div>;
};

export default Status;
