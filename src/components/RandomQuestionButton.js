// src/components/RandomQuestionButton.js
import React, { useMemo } from 'react';
import { navigate } from 'gatsby';
import useProgress from '../hooks/useProgress';
import { progressKey, questionRoute } from './QuestionTable';

const RandomQuestionButton = ({ questions }) => {
  const { loaded, isSolved } = useProgress();

  const unsolved = useMemo(
    () => (loaded ? questions.filter(q => !isSolved(progressKey(q))) : []),
    [loaded, questions, isSolved]
  );

  const handleClick = () => {
    if (unsolved.length === 0) return;
    const pick = unsolved[Math.floor(Math.random() * unsolved.length)];
    navigate(questionRoute(pick));
  };

  const disabled = !loaded || unsolved.length === 0;

  return (
    <div className="random-puzzle-wrap">
      <button className="btn random-puzzle-btn" onClick={handleClick} disabled={disabled}>
        🎲 Random Unsolved Question
      </button>
      {loaded && unsolved.length === 0 && (
        <div className="random-puzzle-empty">Nothing unsolved in the current filters.</div>
      )}
    </div>
  );
};

export default RandomQuestionButton;
