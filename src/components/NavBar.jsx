import { NavLink } from 'react-router-dom';
import games from '../games';

const NavBar = () => {
  return (
    <nav className="navbar">
      <NavLink to="/" className="nav-brand">
        Game Center
      </NavLink>
      <div className="nav-links">
        {games.map((game) => (
          <NavLink
            key={game.id}
            to={game.path}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            {game.name}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default NavBar;
