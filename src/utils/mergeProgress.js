// src/utils/mergeProgress.js
//
// Reconciles local (pre-sign-in) progress with the cloud document on sign-in.
// Entry-level last-write-wins on `updatedAt`, with two exceptions that would
// otherwise silently lose data: booleans are spread (not OR'd) so a fresh
// `false` can beat a stale `true` -- un-solving must be able to sync -- and
// note text from both sides is concatenated rather than picked, since a
// legacy entry with no `updatedAt` always loses ties but its typed notes
// must not vanish.

const EMPTY_ENTRY = { solved: false, starred: false, revisit: false, notes: '', reviewCount: 0 };
const DEFAULT_REVIEW_INTERVALS = [7, 14, 30, 60];

const joinNotes = (a, b) => {
  const left = a || '';
  const right = b || '';
  if (!left) return right;
  if (!right) return left;
  if (left === right) return left;
  return `${left}<br>${right}`;
};

const mergeEntry = (l, c) => {
  const lNewer = (l.updatedAt || 0) > (c.updatedAt || 0);
  const win = lNewer ? l : c;
  const lose = lNewer ? c : l;
  return {
    ...EMPTY_ENTRY,
    ...win,
    notes: joinNotes(win.notes, lose.notes),
    reviewCount: Math.max(l.reviewCount || 0, c.reviewCount || 0),
    updatedAt: Math.max(l.updatedAt || 0, c.updatedAt || 0),
  };
};

const mergeProgress = (local, cloud) => {
  const l = local || {};
  const c = cloud || {};
  const lQuestions = l.questions || {};
  const cQuestions = c.questions || {};

  const questions = {};
  for (const key of new Set([...Object.keys(lQuestions), ...Object.keys(cQuestions)])) {
    const lEntry = lQuestions[key];
    const cEntry = cQuestions[key];
    if (lEntry && cEntry) questions[key] = mergeEntry(lEntry, cEntry);
    else questions[key] = { ...EMPTY_ENTRY, ...(lEntry || cEntry) };
  }

  return {
    version: 2,
    questions,
    settings: { reviewIntervals: DEFAULT_REVIEW_INTERVALS, ...(c.settings || l.settings || {}) },
  };
};

module.exports = mergeProgress;
