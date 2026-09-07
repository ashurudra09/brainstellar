// src/components/PuzzleTracker.js
import React, { useEffect, useRef } from 'react';
import useProgress from '../hooks/useProgress';
import Button from './Button';

export const PuzzleStatusToggles = ({ puzzleId }) => {
  const { loaded, isSolved, isStarred, toggleSolved, toggleStarred } = useProgress();
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

const FORMAT_COMMANDS = [
  { command: 'bold', label: 'B', style: { fontWeight: 'bold' } },
  { command: 'italic', label: 'I', style: { fontStyle: 'italic' } },
  { command: 'underline', label: 'U', style: { textDecoration: 'underline' } },
];

export const PuzzleNotes = ({ puzzleId }) => {
  const { loaded, getNotes, setNotes } = useProgress();
  const editorRef = useRef(null);

  useEffect(() => {
    // Set innerHTML imperatively (once, on load) instead of a React-controlled
    // value: contentEditable fights React's rendering and resets the cursor
    // on every keystroke if it's kept in sync via state.
    if (loaded && editorRef.current) editorRef.current.innerHTML = getNotes(puzzleId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const handleInput = () => setNotes(puzzleId, editorRef.current.innerHTML);

  const format = command => {
    document.execCommand(command);
    editorRef.current.focus();
  };

  return (
    <Button
      id={`notes${puzzleId}`}
      label="Notes"
      passClass="notes-panel"
      content={
        <div className="puzzle-notes-editor">
          <div className="puzzle-notes-toolbar">
            {FORMAT_COMMANDS.map(({ command, label, style }) => (
              <button
                key={command}
                type="button"
                style={style}
                onMouseDown={e => e.preventDefault()}
                onClick={() => format(command)}
              >
                {label}
              </button>
            ))}
          </div>
          <div
            ref={editorRef}
            className="puzzle-notes-textarea"
            contentEditable
            onInput={handleInput}
            data-placeholder="Notes for future reference..."
          />
        </div>
      }
    />
  );
};
