import { Link } from 'react-router-dom';

const GameCard = ({ game }) => {
  return (
    <Link to={game.path} className="game-card">
      <div className="game-card-icon">{game.icon}</div>
      <h2 className="game-card-title">{game.name}</h2>
      <p className="game-card-description">{game.description}</p>
    </Link>
  );
};

export default GameCard;
