import { useCallback } from 'react';
import { useGamesContext } from '../context/GamesContext';

const useGameState = (gameId, initialState) => {
  const { getGameState, setGameState, clearGameState } = useGamesContext();

  const state = getGameState(gameId) || initialState;

  const setState = useCallback(
    (newState) => {
      if (typeof newState === 'function') {
        setGameState(gameId, newState(getGameState(gameId) || initialState));
      } else {
        setGameState(gameId, newState);
      }
    },
    [gameId, initialState, getGameState, setGameState]
  );

  const resetState = useCallback(() => {
    clearGameState(gameId);
  }, [gameId, clearGameState]);

  return [state, setState, resetState];
};

export default useGameState;
