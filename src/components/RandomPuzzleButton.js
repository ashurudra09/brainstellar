// src/components/RandomPuzzleButton.js
import React, { useContext, useMemo } from 'react';
import { navigate } from 'gatsby';
import { ProgressContext } from '../contexts/ProgressContext';

const RandomPuzzleButton = ({ puzzles }) => {
  const { loaded, isSolved } = useContext(ProgressContext);

  const unsolved = useMemo(
    () => (loaded ? puzzles.filter(p => !isSolved(p.puzzleId)) : []),
    [loaded, puzzles, isSolved]
  );

  const handleClick = () => {
    if (unsolved.length === 0) return;
    const pick = unsolved[Math.floor(Math.random() * unsolved.length)];
    navigate(`/puzzles/${pick.puzzleId}`);
  };

  const disabled = !loaded || unsolved.length === 0;

  return (
    <div className="random-puzzle-wrap">
      <button className="btn random-puzzle-btn" onClick={handleClick} disabled={disabled}>
        🎲 Random Unsolved Puzzle
      </button>
      {loaded && unsolved.length === 0 && (
        <div className="random-puzzle-empty">Nothing unsolved in the current filters.</div>
      )}
    </div>
  );
};

export default RandomPuzzleButton;
