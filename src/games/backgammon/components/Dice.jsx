const Dice = ({ dice, movesRemaining, onRoll, canRoll }) => {
  const renderDie = (value, index, isUsed) => {
    const dots = [];
    const positions = {
      1: [[50, 50]],
      2: [[25, 25], [75, 75]],
      3: [[25, 25], [50, 50], [75, 75]],
      4: [[25, 25], [75, 25], [25, 75], [75, 75]],
      5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
      6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
    };

    const dotPositions = positions[value] || [];
    dotPositions.forEach(([x, y], i) => {
      dots.push(
        <circle
          key={i}
          cx={x}
          cy={y}
          r={8}
          fill={isUsed ? '#666' : '#1a1a1a'}
        />
      );
    });

    return (
      <svg
        key={index}
        className={`die ${isUsed ? 'used' : ''}`}
        viewBox="0 0 100 100"
        width="50"
        height="50"
      >
        <rect
          x="5"
          y="5"
          width="90"
          height="90"
          rx="10"
          fill={isUsed ? '#888' : '#f5f5f5'}
          stroke={isUsed ? '#666' : '#333'}
          strokeWidth="2"
        />
        {dots}
      </svg>
    );
  };

  // Determine which dice are used
  const getDiceWithStatus = () => {
    if (dice.length === 0) return [];

    // For doubles, show 4 dice
    if (dice.length === 4 && dice[0] === dice[1]) {
      const usedCount = 4 - movesRemaining.length;
      return dice.map((d, i) => ({ value: d, isUsed: i < usedCount }));
    }

    // Regular roll - 2 dice
    const result = [];
    const remaining = [...movesRemaining];

    for (const d of dice) {
      const idx = remaining.indexOf(d);
      if (idx !== -1) {
        remaining.splice(idx, 1);
        result.push({ value: d, isUsed: false });
      } else {
        result.push({ value: d, isUsed: true });
      }
    }

    return result;
  };

  const diceWithStatus = getDiceWithStatus();

  return (
    <div className="dice-container">
      {dice.length === 0 ? (
        <button
          className="roll-button"
          onClick={onRoll}
          disabled={!canRoll}
        >
          Roll Dice
        </button>
      ) : (
        <div className="dice">
          {diceWithStatus.map((d, i) => renderDie(d.value, i, d.isUsed))}
        </div>
      )}
    </div>
  );
};

export default Dice;
