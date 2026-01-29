import { createContext, useContext, useState, useEffect } from 'react';

const GamesContext = createContext(null);

const STORAGE_KEY = 'gameCenter_states';

const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const saveToStorage = (states) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
  } catch {
    // localStorage unavailable or full
  }
};

export const GamesProvider = ({ children }) => {
  const [gameStates, setGameStates] = useState(loadFromStorage);

  useEffect(() => {
    saveToStorage(gameStates);
  }, [gameStates]);

  const getGameState = (gameId) => gameStates[gameId] || null;

  const setGameState = (gameId, state) => {
    setGameStates((prev) => ({
      ...prev,
      [gameId]: state,
    }));
  };

  const clearGameState = (gameId) => {
    setGameStates((prev) => {
      const { [gameId]: _, ...rest } = prev;
      return rest;
    });
  };

  return (
    <GamesContext.Provider value={{ getGameState, setGameState, clearGameState }}>
      {children}
    </GamesContext.Provider>
  );
};

export const useGamesContext = () => {
  const context = useContext(GamesContext);
  if (!context) {
    throw new Error('useGamesContext must be used within a GamesProvider');
  }
  return context;
};
