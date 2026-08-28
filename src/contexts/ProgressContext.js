// src/contexts/ProgressContext.js
import React, { createContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';

export const ProgressContext = createContext();

const STORAGE_KEY = 'brainstellar-progress';
const EMPTY_STATE = { version: 1, puzzles: {} };
const EMPTY_ENTRY = { solved: false, starred: false, notes: '' };

const readLocalStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore corrupt/unavailable localStorage
  }
  return EMPTY_STATE;
};

export const ProgressProvider = ({ children }) => {
  const [progress, setProgress] = useState(EMPTY_STATE);
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef(null);
  // Only the dev server exposes /__progress; gatsby build/serve fall back to
  // localStorage alone.
  const useFileBackend = useRef(true);

  useEffect(() => {
    let cancelled = false;

    fetch('/__progress')
      .then(res => {
        if (!res.ok) throw new Error('progress endpoint unavailable');
        return res.json();
      })
      .then(data => {
        if (cancelled) return;
        useFileBackend.current = true;
        setProgress(data && data.puzzles ? data : EMPTY_STATE);
        setLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        useFileBackend.current = false;
        setProgress(readLocalStorage());
        setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(next => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      // ignore unavailable localStorage (e.g. private browsing quota)
    }

    if (!useFileBackend.current) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch('/__progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      }).catch(() => {
        useFileBackend.current = false;
      });
    }, 600);
  }, []);

  const update = useCallback((puzzleId, patch) => {
    setProgress(prev => {
      const id = String(puzzleId);
      const prevEntry = prev.puzzles[id] || EMPTY_ENTRY;
      const nextEntry = { ...prevEntry, ...patch };
      const next = { ...prev, puzzles: { ...prev.puzzles, [id]: nextEntry } };
      persist(next);
      return next;
    });
  }, [persist]);

  const entry = useCallback(puzzleId => progress.puzzles[String(puzzleId)] || EMPTY_ENTRY, [progress]);
  const isSolved = useCallback(puzzleId => !!entry(puzzleId).solved, [entry]);
  const isStarred = useCallback(puzzleId => !!entry(puzzleId).starred, [entry]);
  const getNotes = useCallback(puzzleId => entry(puzzleId).notes || '', [entry]);

  const toggleSolved = useCallback(puzzleId => {
    const wasSolved = isSolved(puzzleId);
    update(puzzleId, { solved: !wasSolved, solvedAt: !wasSolved ? Date.now() : undefined });
  }, [isSolved, update]);

  const toggleStarred = useCallback(puzzleId => {
    update(puzzleId, { starred: !isStarred(puzzleId) });
  }, [isStarred, update]);

  const setNotes = useCallback((puzzleId, text) => {
    update(puzzleId, { notes: text });
  }, [update]);

  const counts = useMemo(() => {
    const entries = Object.entries(progress.puzzles);
    const solvedIds = new Set(entries.filter(([, v]) => v.solved).map(([id]) => id));
    const starredIds = new Set(entries.filter(([, v]) => v.starred).map(([id]) => id));
    return { solvedIds, starredIds };
  }, [progress]);

  const value = useMemo(() => ({
    loaded,
    entry,
    isSolved,
    isStarred,
    getNotes,
    toggleSolved,
    toggleStarred,
    setNotes,
    counts,
  }), [loaded, entry, isSolved, isStarred, getNotes, toggleSolved, toggleStarred, setNotes, counts]);

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};
