import { useState, useEffect, useCallback } from 'react';
import Board from './components/Board';
import Dice from './components/Dice';
import {
  WHITE,
  BLACK,
  PLAYER,
  COMPUTER,
  createInitialState,
  rollDice,
  getAllValidMoves,
  makeMove,
  isGameOver,
  getWinner,
  getBestMove,
} from './utils/gameLogic';
import useGameState from '../../hooks/useGameState';
import './Backgammon.css';

const INITIAL_STATE = createInitialState();

const Backgammon = () => {
  const [state, setState, resetState] = useGameState('backgammon', INITIAL_STATE);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [validMoves, setValidMoves] = useState([]);

  const isPlayerTurn = state.currentPlayer === PLAYER;
  const canRoll = state.dice.length === 0 && state.movesRemaining.length === 0 && !state.gameOver;

  // Update valid moves when state changes
  useEffect(() => {
    if (state.movesRemaining.length > 0 && !state.gameOver) {
      const moves = getAllValidMoves(state, state.currentPlayer);
      setValidMoves(moves);

      // If no valid moves, end turn
      if (moves.length === 0 && state.dice.length > 0) {
        setTimeout(() => {
          endTurn();
        }, 500);
      }
    } else {
      setValidMoves([]);
    }
  }, [state]);

  const endTurn = useCallback(() => {
    setSelectedPoint(null);
    setValidMoves([]);

    setState(prev => ({
      ...prev,
      dice: [],
      movesRemaining: [],
      currentPlayer: prev.currentPlayer === WHITE ? BLACK : WHITE,
    }));
  }, [setState]);

  // Computer's turn
  useEffect(() => {
    if (isPlayerTurn || state.gameOver) return;

    // Computer needs to roll
    if (state.dice.length === 0 && state.movesRemaining.length === 0) {
      const timer = setTimeout(() => {
        const dice = rollDice();
        setState(prev => ({
          ...prev,
          dice,
          movesRemaining: [...dice],
        }));
      }, 500);
      return () => clearTimeout(timer);
    }

    // Computer makes moves
    if (state.movesRemaining.length > 0) {
      const timer = setTimeout(() => {
        const move = getBestMove(state, COMPUTER);
        if (move) {
          const newState = makeMove(state, move, COMPUTER);

          if (isGameOver(newState)) {
            setState({
              ...newState,
              gameOver: true,
              winner: getWinner(newState),
            });
          } else if (newState.movesRemaining.length === 0) {
            // End computer's turn
            setState({
              ...newState,
              dice: [],
              currentPlayer: WHITE,
            });
          } else {
            setState(newState);
          }
        } else {
          // No valid moves
          endTurn();
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [state, isPlayerTurn, setState, endTurn]);

  const handleRoll = () => {
    if (!canRoll || !isPlayerTurn) return;

    const dice = rollDice();
    setState(prev => ({
      ...prev,
      dice,
      movesRemaining: [...dice],
    }));
  };

  const handlePointClick = (point) => {
    if (!isPlayerTurn || state.gameOver || state.movesRemaining.length === 0) return;

    // If clicking on bearing off
    if (point === 'off') {
      if (selectedPoint !== null) {
        const move = validMoves.find(m => m.from === selectedPoint && m.to === 'off');
        if (move) {
          executeMove(move);
        }
      }
      return;
    }

    // If we have a selection, try to move there
    if (selectedPoint !== null) {
      const move = validMoves.find(m => m.from === selectedPoint && m.to === point);
      if (move) {
        executeMove(move);
        return;
      }
    }

    // Select a point with player's pieces
    const isValidSource = validMoves.some(m => m.from === point);
    if (isValidSource) {
      setSelectedPoint(point);
    } else {
      setSelectedPoint(null);
    }
  };

  const handleBarClick = () => {
    if (!isPlayerTurn || state.gameOver) return;

    const barMoves = validMoves.filter(m => m.from === 'bar');
    if (barMoves.length === 1) {
      executeMove(barMoves[0]);
    } else if (barMoves.length > 1) {
      setSelectedPoint('bar');
    }
  };

  const executeMove = (move) => {
    const newState = makeMove(state, move, PLAYER);
    setSelectedPoint(null);

    if (isGameOver(newState)) {
      setState({
        ...newState,
        gameOver: true,
        winner: getWinner(newState),
      });
    } else if (newState.movesRemaining.length === 0) {
      // End player's turn
      setState({
        ...newState,
        dice: [],
        currentPlayer: BLACK,
      });
    } else {
      setState(newState);
    }
  };

  const handleNewGame = () => {
    setSelectedPoint(null);
    setValidMoves([]);
    resetState();
  };

  const getMessage = () => {
    if (state.gameOver) {
      return state.winner === PLAYER ? 'You win!' : 'Computer wins!';
    }
    if (!isPlayerTurn) {
      return "Computer's turn...";
    }
    if (canRoll) {
      return 'Roll the dice!';
    }
    if (state.movesRemaining.length > 0) {
      if (validMoves.length === 0) {
        return 'No valid moves - ending turn...';
      }
      return 'Make your move';
    }
    return 'Your turn';
  };

  // Get filtered valid moves for selected point
  const displayMoves = selectedPoint !== null
    ? validMoves.filter(m => m.from === selectedPoint)
    : validMoves;

  return (
    <div className="backgammon-container">
      <h1>Backgammon</h1>

      <div className="status">
        <div className="message">{getMessage()}</div>
        <div className="score">
          <span className="score-item">
            <span className="score-piece white" /> Off: {state.whiteOff}
          </span>
          <span className="score-item">
            <span className="score-piece black" /> Off: {state.blackOff}
          </span>
        </div>
      </div>

      <Board
        gameState={state}
        selectedPoint={selectedPoint}
        validMoves={displayMoves}
        onPointClick={handlePointClick}
        onBarClick={handleBarClick}
        currentPlayer={state.currentPlayer}
        isPlayerTurn={isPlayerTurn}
      />

      <Dice
        dice={state.dice}
        movesRemaining={state.movesRemaining}
        onRoll={handleRoll}
        canRoll={canRoll && isPlayerTurn}
      />

      <div className="controls">
        <button onClick={handleNewGame}>New Game</button>
      </div>
    </div>
  );
};

export default Backgammon;
