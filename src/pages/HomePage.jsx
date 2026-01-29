import GameCard from '../components/GameCard';
import games from '../games';

const HomePage = () => {
  return (
    <div className="home-page">
      <h1>Board Games</h1>
      <p className="home-subtitle">Choose a game to play</p>
      <div className="games-grid">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
