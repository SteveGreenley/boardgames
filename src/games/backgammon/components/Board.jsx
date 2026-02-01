import { WHITE, BLACK } from '../utils/gameLogic';

const Board = ({ gameState, selectedPoint, validMoves, onPointClick, onBarClick, currentPlayer, isPlayerTurn }) => {
  const { board, whiteBar, blackBar, whiteOff, blackOff } = gameState;

  const isValidMoveTarget = (point) => {
    return validMoves.some(move => move.to === point);
  };

  const isValidMoveSource = (point) => {
    return validMoves.some(move => move.from === point);
  };

  const renderPieces = (count, isTop) => {
    const absCount = Math.abs(count);
    const color = count > 0 ? 'white' : 'black';
    const maxVisible = 5;
    const displayCount = Math.min(absCount, maxVisible);

    return (
      <div className={`pieces-stack ${isTop ? 'stack-down' : 'stack-up'}`}>
        {Array.from({ length: displayCount }).map((_, i) => (
          <div key={i} className={`piece ${color}`}>
            {i === displayCount - 1 && absCount > maxVisible && (
              <span className="piece-count">{absCount}</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderPoint = (index, isTop) => {
    const count = board[index];
    const isSelected = selectedPoint === index;
    const isTarget = isValidMoveTarget(index);
    const isSource = isValidMoveSource(index);
    const pointColor = index % 2 === 0 ? 'dark' : 'light';

    return (
      <div
        key={index}
        className={`point ${pointColor} ${isTop ? 'top' : 'bottom'} ${isSelected ? 'selected' : ''} ${isTarget ? 'valid-target' : ''} ${isSource ? 'valid-source' : ''}`}
        onClick={() => onPointClick(index)}
      >
        <div className="point-triangle" />
        <div className="point-pieces">
          {count !== 0 && renderPieces(count, isTop)}
        </div>
        <span className="point-number">{index + 1}</span>
      </div>
    );
  };

  const renderBar = () => {
    const canClickWhiteBar = currentPlayer === WHITE && isPlayerTurn && whiteBar > 0 && validMoves.some(m => m.from === 'bar');
    const canClickBlackBar = currentPlayer === BLACK && isPlayerTurn && blackBar > 0 && validMoves.some(m => m.from === 'bar');

    return (
      <div className="bar">
        <div
          className={`bar-section bar-top ${canClickBlackBar ? 'valid-source' : ''}`}
          onClick={() => canClickBlackBar && onBarClick()}
        >
          <div className="bar-pieces">
            {Array.from({ length: blackBar }).map((_, i) => (
              <div key={i} className="piece black" />
            ))}
            {blackBar > 5 && <span className="bar-count">{blackBar}</span>}
          </div>
        </div>
        <div
          className={`bar-section bar-bottom ${canClickWhiteBar ? 'valid-source' : ''}`}
          onClick={() => canClickWhiteBar && onBarClick()}
        >
          <div className="bar-pieces">
            {Array.from({ length: Math.min(whiteBar, 5) }).map((_, i) => (
              <div key={i} className="piece white" />
            ))}
            {whiteBar > 5 && <span className="bar-count">{whiteBar}</span>}
          </div>
        </div>
      </div>
    );
  };

  const renderOff = () => {
    const canBearOff = isValidMoveTarget('off');

    return (
      <div className={`bearing-off ${canBearOff ? 'valid-target' : ''}`} onClick={() => canBearOff && onPointClick('off')}>
        <div className="off-section off-black">
          <div className="off-pieces">
            {Array.from({ length: Math.min(blackOff, 15) }).map((_, i) => (
              <div key={i} className="off-piece black" />
            ))}
          </div>
          {blackOff > 0 && <span className="off-count">{blackOff}</span>}
        </div>
        <div className="off-section off-white">
          <div className="off-pieces">
            {Array.from({ length: Math.min(whiteOff, 15) }).map((_, i) => (
              <div key={i} className="off-piece white" />
            ))}
          </div>
          {whiteOff > 0 && <span className="off-count">{whiteOff}</span>}
        </div>
      </div>
    );
  };

  // Standard backgammon board layout from White's perspective
  // Top row: points 13-18 (left) and 19-24 (right), left to right
  // Bottom row: points 12-7 (left) and 6-1 (right), left to right
  const topLeftPoints = [12, 13, 14, 15, 16, 17]; // Points 13-18
  const topRightPoints = [18, 19, 20, 21, 22, 23]; // Points 19-24
  const bottomLeftPoints = [11, 10, 9, 8, 7, 6]; // Points 12-7
  const bottomRightPoints = [5, 4, 3, 2, 1, 0]; // Points 6-1

  return (
    <div className="backgammon-board">
      <div className="board-inner">
        <div className="board-half left">
          <div className="points-row top">
            {topLeftPoints.map(i => renderPoint(i, true))}
          </div>
          <div className="points-row bottom">
            {bottomLeftPoints.map(i => renderPoint(i, false))}
          </div>
        </div>

        {renderBar()}

        <div className="board-half right">
          <div className="points-row top">
            {topRightPoints.map(i => renderPoint(i, true))}
          </div>
          <div className="points-row bottom">
            {bottomRightPoints.map(i => renderPoint(i, false))}
          </div>
        </div>

        {renderOff()}
      </div>
    </div>
  );
};

export default Board;
