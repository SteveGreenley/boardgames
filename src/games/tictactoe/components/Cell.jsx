const Cell = ({ value, onClick, isWinner }) => {
  const className = [
    'cell',
    value ? `taken ${value.toLowerCase()}` : '',
    isWinner ? 'winner' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={className} onClick={onClick}>
      {value}
    </div>
  );
};

export default Cell;
