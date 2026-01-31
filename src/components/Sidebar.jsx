import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import games from '../games';

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (window.innerWidth <= 768) {
      onToggle(false);
    }
  }, [location, onToggle]);

  return (
    <>
      {/* Hamburger button - visible when sidebar is closed */}
      {!isOpen && (
        <button
          className="sidebar-toggle sidebar-toggle-open"
          onClick={() => onToggle(true)}
          aria-label="Open menu"
        >
          <span className="hamburger-icon">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      )}

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => onToggle(false)}
        />
      )}

      {/* Sidebar */}
      <nav className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="sidebar-header">
          <NavLink to="/" className="sidebar-brand">
            Board Games
          </NavLink>
          <button
            className="sidebar-toggle sidebar-toggle-close"
            onClick={() => onToggle(false)}
            aria-label="Close menu"
          >
            <span className="close-icon">&times;</span>
          </button>
        </div>

        <div className="sidebar-links">
          {games.map((game) => (
            <NavLink
              key={game.id}
              to={game.path}
              className={({ isActive }) =>
                isActive ? 'sidebar-link active' : 'sidebar-link'
              }
            >
              <span className="sidebar-link-icon">{game.icon}</span>
              <span className="sidebar-link-text">{game.name}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
