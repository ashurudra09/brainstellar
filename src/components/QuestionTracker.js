// src/components/QuestionTracker.js
import React, { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import useProgress from '../hooks/useProgress';
import Button from './Button';

// The B/I/U toolbar produces nothing else; stripping every attribute closes
// the onerror/href XSS vectors that a pasted <img>/<a> would otherwise carry.
const SANITIZE_CONFIG = { ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'br', 'div', 'span', 'p'], ALLOWED_ATTR: [] };

export const PuzzleStatusToggles = ({ puzzleId }) => {
  const { loaded, synced, isSolved, isStarred, isRevisit, isDueForReview, toggleSolved, toggleStarred, toggleRevisit, markReviewed } = useProgress();
  const solved = loaded && isSolved(puzzleId);
  const starred = loaded && isStarred(puzzleId);
  const revisit = loaded && isRevisit(puzzleId);
  const due = loaded && isDueForReview(puzzleId);

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
      <button
        className={`push tracker-toggle tracker-revisit ${revisit ? 'pushed' : ''}`}
        onClick={() => toggleRevisit(puzzleId)}
      >
        {revisit ? '🔖 Revisit' : 'Mark for Revisit'}
      </button>
      {starred && solved && (
        <button
          className={`push tracker-toggle tracker-reviewed ${due ? 'tracker-reviewed-due' : ''}`}
          onClick={() => markReviewed(puzzleId)}
          title="Reset the review schedule for this question"
        >
          {due ? 'Due — Mark Reviewed' : 'Mark Reviewed'}
        </button>
      )}
      {loaded && !synced && (
        <span className="tracker-sync-warning" title="Your last change couldn't be saved">⚠ not synced</span>
      )}
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
    if (loaded && editorRef.current) editorRef.current.innerHTML = DOMPurify.sanitize(getNotes(puzzleId), SANITIZE_CONFIG);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const handleInput = () => setNotes(puzzleId, DOMPurify.sanitize(editorRef.current.innerHTML, SANITIZE_CONFIG));

  const format = command => {
    document.execCommand(command);
    editorRef.current.focus();
  };

  const handlePaste = e => {
    e.preventDefault();
    document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
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
            onPaste={handlePaste}
            data-placeholder="Notes for future reference..."
          />
        </div>
      }
    />
  );
};
