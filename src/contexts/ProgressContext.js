// src/contexts/ProgressContext.js
import React, { createContext, useState, useEffect, useRef, useCallback, useMemo, useContext } from 'react';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getDb } from '../firebase';
import { AuthContext } from './AuthContext';
import mergeProgress from '../utils/mergeProgress';

export const ProgressContext = createContext();

const STORAGE_KEY = 'brainstellar-progress';
const DEFAULT_REVIEW_INTERVALS = [7, 14, 30, 60];
const DAY_MS = 24 * 60 * 60 * 1000;

const emptyState = () => ({
  version: 2,
  questions: {},
  settings: { reviewIntervals: DEFAULT_REVIEW_INTERVALS },
});

const EMPTY_ENTRY = { solved: false, starred: false, revisit: false, notes: '', reviewCount: 0 };

// v1 stored { version: 1, puzzles: { "1033": {...} } } with bare quant
// puzzleIds as keys. v2 keys every question by "{domain}:{qid}" so ids
// don't collide across domains, and adds the revisit/review-schedule
// fields. Migration is idempotent: a v2 document (or one with no data at
// all) passes through unchanged.
const migrate = data => {
  if (!data) return emptyState();
  if (data.version === 2 && data.questions) {
    return {
      version: 2,
      questions: data.questions,
      settings: { reviewIntervals: DEFAULT_REVIEW_INTERVALS, ...(data.settings || {}) },
    };
  }

  const questions = {};
  Object.entries(data.puzzles || {}).forEach(([id, entry]) => {
    questions[`quant:${id}`] = { ...EMPTY_ENTRY, ...entry };
  });
  return { version: 2, questions, settings: { reviewIntervals: DEFAULT_REVIEW_INTERVALS } };
};

const readLocalStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore corrupt/unavailable localStorage
  }
  return null;
};

export const ProgressProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [progress, setProgress] = useState(emptyState());
  const [loaded, setLoaded] = useState(false);
  const [synced, setSynced] = useState(true);
  const saveTimer = useRef(null);
  // Only the dev server exposes /__progress; gatsby build/serve fall back to
  // localStorage alone.
  const useFileBackend = useRef(true);
  const progressRef = useRef(progress);
  progressRef.current = progress;
  // uid of the account currently driving saves/subscription, or null when
  // signed out. Tracked outside React state since it's read from inside
  // update()'s setProgress updater, not rendered itself.
  const uidRef = useRef(null);
  const saveRef = useRef(null);

  // Signed-out persistence: existing localStorage + dev-only /__progress
  // path, unchanged. While signed in this is never called -- 4d requires
  // not mirroring to localStorage so a shared device can't leak one
  // account's progress to the next signed-out visitor.
  const persistLocal = useCallback(next => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      // ignore unavailable localStorage (e.g. private browsing quota)
      setSynced(false);
    }

    if (!useFileBackend.current) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch('/__progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      })
        .then(res => {
          if (!res.ok) throw new Error('progress save failed');
          setSynced(true);
        })
        .catch(() => {
          useFileBackend.current = false;
          setSynced(false);
        });
    }, 600);
  }, []);

  // Signed-in persistence: writes only the touched entry, merged into the
  // user's document, so device A toggling one question can't clobber
  // device B's concurrent edit to a different one.
  const persistCloud = useCallback((next, key) => {
    const db = getDb();
    const uid = uidRef.current;
    if (!db || !uid) return;
    setDoc(
      doc(db, 'users', uid),
      { version: 2, questions: { [key]: next.questions[key] }, settings: next.settings, updatedAt: serverTimestamp() },
      { merge: true }
    )
      .then(() => setSynced(true))
      .catch(() => setSynced(false));
  }, []);

  const loadLocal = useCallback(() => {
    let cancelled = false;

    fetch('/__progress')
      .then(res => {
        if (!res.ok) throw new Error('progress endpoint unavailable');
        return res.json();
      })
      .then(data => {
        if (cancelled) return;
        useFileBackend.current = true;
        setProgress(migrate(data));
        setLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        useFileBackend.current = false;
        setProgress(migrate(readLocalStorage()));
        setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Initial load always starts from the signed-out path -- Firebase auth
  // state restoration is async, so this loads first and the sign-in effect
  // below reconciles moments later if a session turns out to be active.
  useEffect(() => {
    saveRef.current = persistLocal;
    return loadLocal();
  }, [loadLocal, persistLocal]);

  // Reconcile local + cloud on sign-in, subscribe to remote changes, and
  // fall back to the untouched pre-sign-in local view on sign-out.
  useEffect(() => {
    if (!user) {
      if (uidRef.current) {
        uidRef.current = null;
        saveRef.current = persistLocal;
        loadLocal();
      }
      return undefined;
    }

    const db = getDb();
    if (!db) return undefined;

    const ref = doc(db, 'users', user.uid);
    let cancelled = false;

    getDoc(ref)
      .then(snap => {
        if (cancelled) return;
        const merged = mergeProgress(progressRef.current, snap.exists() ? snap.data() : null);
        setProgress(merged);
        uidRef.current = user.uid;
        saveRef.current = persistCloud;
        return setDoc(
          ref,
          { version: 2, questions: merged.questions, settings: merged.settings, updatedAt: serverTimestamp() },
          { merge: true }
        );
      })
      .catch(() => setSynced(false));

    // Remote snapshots set state directly, without going through saveRef --
    // feeding them back into a save would be local write -> server ack ->
    // setProgress -> write -> ... forever.
    const unsubscribe = onSnapshot(ref, snap => {
      if (!snap.exists()) return;
      setProgress(migrate(snap.data()));
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [user, persistLocal, persistCloud, loadLocal]);

  // Persistence lives here, not in a useEffect keyed on `progress`: see the
  // sign-in effect above for why that shape is an infinite write loop once
  // a remote onSnapshot exists.
  const update = useCallback((key, patch) => {
    setProgress(prev => {
      const prevEntry = prev.questions[key] || EMPTY_ENTRY;
      const nextEntry = { ...prevEntry, ...patch, updatedAt: Date.now() };
      const next = { ...prev, questions: { ...prev.questions, [key]: nextEntry } };
      if (saveRef.current) saveRef.current(next, key);
      return next;
    });
  }, []);

  const entry = useCallback(key => progress.questions[key] || EMPTY_ENTRY, [progress]);
  const isSolved = useCallback(key => !!entry(key).solved, [entry]);
  const isStarred = useCallback(key => !!entry(key).starred, [entry]);
  const isRevisit = useCallback(key => !!entry(key).revisit, [entry]);
  const getNotes = useCallback(key => entry(key).notes || '', [entry]);

  const toggleSolved = useCallback(key => {
    const wasSolved = isSolved(key);
    update(key, { solved: !wasSolved, solvedAt: !wasSolved ? Date.now() : null });
  }, [isSolved, update]);

  const toggleStarred = useCallback(key => {
    update(key, { starred: !isStarred(key) });
  }, [isStarred, update]);

  const toggleRevisit = useCallback(key => {
    update(key, { revisit: !isRevisit(key) });
  }, [isRevisit, update]);

  const setNotes = useCallback((key, text) => {
    update(key, { notes: text });
  }, [update]);

  const markReviewed = useCallback(key => {
    const current = entry(key);
    update(key, { reviewCount: (current.reviewCount || 0) + 1, lastReviewedAt: Date.now() });
  }, [entry, update]);

  const setReviewIntervals = useCallback(intervals => {
    setProgress(prev => ({ ...prev, settings: { ...prev.settings, reviewIntervals: intervals } }));
  }, []);

  const counts = useMemo(() => {
    const entries = Object.entries(progress.questions);
    const intervals = progress.settings.reviewIntervals;
    const now = Date.now();

    const isDue = v => {
      if (!v.starred || !v.solved) return false;
      const base = v.lastReviewedAt ?? v.solvedAt;
      if (!base) return false;
      const days = intervals[Math.min(v.reviewCount || 0, intervals.length - 1)];
      return now - base > days * DAY_MS;
    };

    return {
      solvedIds: new Set(entries.filter(([, v]) => v.solved).map(([id]) => id)),
      starredIds: new Set(entries.filter(([, v]) => v.starred).map(([id]) => id)),
      revisitKeys: new Set(entries.filter(([, v]) => v.revisit).map(([id]) => id)),
      dueKeys: new Set(entries.filter(([, v]) => isDue(v)).map(([id]) => id)),
    };
  }, [progress]);

  const isDueForReview = useCallback(key => counts.dueKeys.has(key), [counts]);

  const value = useMemo(() => ({
    loaded,
    synced,
    entry,
    isSolved,
    isStarred,
    isRevisit,
    getNotes,
    toggleSolved,
    toggleStarred,
    toggleRevisit,
    setNotes,
    markReviewed,
    isDueForReview,
    counts,
    settings: progress.settings,
    setReviewIntervals,
  }), [loaded, synced, entry, isSolved, isStarred, isRevisit, getNotes, toggleSolved, toggleStarred,
      toggleRevisit, setNotes, markReviewed, isDueForReview, counts, progress.settings, setReviewIntervals]);

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};

