// src/components/PuzzleTracker.js
import React, { useContext, useEffect, useState } from 'react';
import { ProgressContext } from '../contexts/ProgressContext';
import Button from './Button';

export const PuzzleStatusToggles = ({ puzzleId }) => {
  const { loaded, isSolved, isStarred, toggleSolved, toggleStarred } = useContext(ProgressContext);
  const solved = loaded && isSolved(puzzleId);
  const starred = loaded && isStarred(puzzleId);

  return (
    <div className="puzzle-tracker-toggles">
      <button
        className={`push tracker-toggle ${solved ? 'pushed' : ''}`}
        onClick={() => toggleSolved(puzzleId)}
      >
        {solved ? '✔ Solved' : 'Mark Solved'}
      </button>
      <button
        className={`push tracker-toggle tracker-star ${starred ? 'pushed' : ''}`}
        onClick={() => toggleStarred(puzzleId)}
      >
        {starred ? '★ Starred' : '☆ Star'}
      </button>
    </div>
  );
};

export const PuzzleNotes = ({ puzzleId }) => {
  const { loaded, getNotes, setNotes } = useContext(ProgressContext);
  const [notesDraft, setNotesDraft] = useState('');

  useEffect(() => {
    if (loaded) setNotesDraft(getNotes(puzzleId));
    // getNotes/puzzleId intentionally excluded: only re-sync the draft when the
    // context finishes loading, not on every keystroke that flows back through it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const handleNotesChange = e => {
    const value = e.target.value;
    setNotesDraft(value);
    setNotes(puzzleId, value);
  };

  return (
    <Button
      id={`notes${puzzleId}`}
      label="Notes"
      passClass="one-liner"
      content={
        <textarea
          className="puzzle-notes-textarea"
          placeholder="Notes for future reference..."
          value={notesDraft}
          onChange={handleNotesChange}
        />
      }
    />
  );
};
