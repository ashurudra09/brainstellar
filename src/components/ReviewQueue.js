// src/components/ReviewQueue.js
import React, { useMemo } from 'react';
import { Link } from 'gatsby';
import useProgress from '../hooks/useProgress';
import { progressKey, questionRoute } from './QuestionTable';

const EMPTY_MESSAGE = {
  due: 'Nothing due for review right now.',
  revisit: "You haven't marked anything to revisit.",
};

// mode: 'due' (escalating-interval review queue) or 'revisit' (the manual,
// permanent revisit list). Both draw from the same cross-domain question
// list the hub already has loaded.
const ReviewQueue = ({ mode, questions }) => {
  const { loaded, counts, markReviewed } = useProgress();

  const keys = mode === 'due' ? counts.dueKeys : counts.revisitKeys;
  const items = useMemo(
    () => questions.filter(q => keys.has(progressKey(q))),
    [questions, keys]
  );

  if (!loaded) return null;

  if (items.length === 0) {
    return <p className="review-queue-empty">{EMPTY_MESSAGE[mode]}</p>;
  }

  return (
    <ul className="review-queue">
      {items.map(q => {
        const key = progressKey(q);
        return (
          <li key={key}>
            <Link to={questionRoute(q)}>{q.title}</Link>
            {mode === 'due' && (
              <button className="review-queue-mark-reviewed" onClick={() => markReviewed(key)}>
                Mark reviewed
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default ReviewQueue;
