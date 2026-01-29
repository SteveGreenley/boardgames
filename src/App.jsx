import { useState, useEffect } from 'react';
import Board from './components/Board';
import Status from './components/Status';
import { PLAYER, COMPUTER, getBestMove, checkWinner } from './utils/gameLogic';

const App = () => {
  const [cells, setCells] = useState(Array(9).fill(''));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameResult, setGameResult] = useState(null);

  const handleCellClick = (index) => {
    if (!isPlayerTurn || cells[index] || gameResult) return;

    const newCells = [...cells];
    newCells[index] = PLAYER;
    setCells(newCells);

    const result = checkWinner(newCells);
    if (result) {
      setGameResult(result);
    } else {
      setIsPlayerTurn(false);
    }
  };

  useEffect(() => {
    if (isPlayerTurn || gameResult) return;

    const timer = setTimeout(() => {
      const move = getBestMove(cells);
      if (move !== -1) {
        const newCells = [...cells];
        newCells[move] = COMPUTER;
        setCells(newCells);

        const result = checkWinner(newCells);
        if (result) {
          setGameResult(result);
        } else {
          setIsPlayerTurn(true);
        }
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [isPlayerTurn, cells, gameResult]);

  const restart = () => {
    setCells(Array(9).fill(''));
    setIsPlayerTurn(true);
    setGameResult(null);
  };

  return (
    <div className="container">
      <h1>Tic Tac Toe</h1>
      <Status gameResult={gameResult} isPlayerTurn={isPlayerTurn} />
      <Board
        cells={cells}
        onCellClick={handleCellClick}
        winningPattern={gameResult?.pattern}
      />
      <button onClick={restart}>New Game</button>
    </div>
  );
};

export default App;
