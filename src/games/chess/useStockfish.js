import { useState, useEffect, useCallback, useRef } from 'react';
import { initEngine, getBestMove as getStockfishMove, terminate } from './stockfishWorker';

const DIFFICULTY_DEPTH = {
  beginner: 1,
  casual: 3,
  club: 5,
  expert: 8,
  grandmaster: 12,
};

const useStockfish = () => {
  const [isReady, setIsReady] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    initEngine()
      .then(() => {
        if (mountedRef.current) {
          setIsReady(true);
        }
      })
      .catch((err) => {
        console.error('Failed to initialize Stockfish:', err);
      });

    return () => {
      mountedRef.current = false;
      terminate();
    };
  }, []);

  const getMove = useCallback(async (fen, difficulty = 'club') => {
    if (!isReady) return null;

    setIsThinking(true);
    const depth = DIFFICULTY_DEPTH[difficulty] || DIFFICULTY_DEPTH.club;

    try {
      const move = await getStockfishMove(fen, depth);
      if (mountedRef.current) {
        setIsThinking(false);
      }
      return move;
    } catch (err) {
      console.error('Stockfish error:', err);
      if (mountedRef.current) {
        setIsThinking(false);
      }
      return null;
    }
  }, [isReady]);

  return { isReady, isThinking, getMove };
};

export { DIFFICULTY_DEPTH };
export default useStockfish;
