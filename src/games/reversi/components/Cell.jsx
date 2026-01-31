const Cell = ({ value, onClick, isValidMove }) => {
  const className = [
    'cell',
    value ? 'occupied' : '',
    isValidMove ? 'valid-move' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={className} onClick={onClick}>
      {value && <div className={`piece ${value}`} />}
      {isValidMove && !value && <div className="valid-indicator" />}
    </div>
  );
};

export default Cell;
