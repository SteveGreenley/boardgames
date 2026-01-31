import { isKing } from '../utils/gameLogic';

const Cell = ({ value, onClick, isLight, isSelected, isValidMove }) => {
  const className = [
    'cell',
    isLight ? 'light' : 'dark',
    isSelected ? 'selected' : '',
    isValidMove ? 'valid-move' : '',
  ].filter(Boolean).join(' ');

  const getPieceClass = () => {
    if (!value) return '';
    if (value === 'red' || value === 'red-king') return 'piece red';
    if (value === 'black' || value === 'black-king') return 'piece black';
    return '';
  };

  return (
    <div className={className} onClick={onClick}>
      {value && (
        <div className={getPieceClass()}>
          {isKing(value) && <span className="crown">♔</span>}
        </div>
      )}
      {isValidMove && !value && <div className="valid-indicator" />}
    </div>
  );
};

export default Cell;
