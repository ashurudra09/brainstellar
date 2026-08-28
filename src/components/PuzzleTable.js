// src/components/PuzzleTable.js
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'gatsby';
import { ProgressContext } from '../contexts/ProgressContext';

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unsolved', label: 'Unsolved' },
  { key: 'solved', label: 'Solved' },
  { key: 'starred', label: 'Starred' },
  { key: 'notes', label: 'Has notes' },
];

const DIFFICULTY_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'easy', label: 'Easy' },
  { key: 'medium', label: 'Medium' },
  { key: 'hard', label: 'Hard' },
  { key: 'deadly', label: 'Deadly' },
];

const DIFFICULTY_ORDER = { easy: 0, medium: 1, hard: 2, deadly: 3 };

const PuzzleTable = ({ puzzles, onVisibleChange }) => {
  const { loaded, isSolved, isStarred, getNotes, toggleSolved, toggleStarred } = useContext(ProgressContext);
  const [statusFilter, setStatusFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const toggleSort = key => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
    } else {
      setSortDir(dir => (dir === 'asc' ? 'desc' : 'asc'));
    }
  };

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = puzzles.filter(p => {
      if (difficultyFilter !== 'all' && p.difficulty !== difficultyFilter) return false;
      if (q && !p.title.toLowerCase().includes(q) && !p.category.toLowerCase().includes(q)) return false;

      if (statusFilter === 'unsolved') return !isSolved(p.puzzleId);
      if (statusFilter === 'solved') return isSolved(p.puzzleId);
      if (statusFilter === 'starred') return isStarred(p.puzzleId);
      if (statusFilter === 'notes') return getNotes(p.puzzleId).trim().length > 0;
      return true;
    });

    if (!sortKey) return filtered;

    const sorted = [...filtered].sort((a, b) => {
      if (sortKey === 'difficulty') return DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty];
      if (sortKey === 'category') return a.category.localeCompare(b.category);
      return 0;
    });
    if (sortDir === 'desc') sorted.reverse();
    return sorted;
  }, [puzzles, statusFilter, difficultyFilter, search, sortKey, sortDir, isSolved, isStarred, getNotes]);

  useEffect(() => {
    if (onVisibleChange) onVisibleChange(visible);
  }, [visible, onVisibleChange]);

  return (
    <div className="puzzle-table-wrap">
      <div className="puzzle-filters">
        <input
          type="text"
          className="puzzle-search"
          placeholder="Search by title or category..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div className="puzzle-filter-chips">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.key}
              className={`filter-chip ${statusFilter === f.key ? 'filter-chip-active' : ''}`}
              onClick={() => setStatusFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="puzzle-filter-chips">
          {DIFFICULTY_FILTERS.map(f => (
            <button
              key={f.key}
              className={`filter-chip filter-chip-${f.key} ${difficultyFilter === f.key ? 'filter-chip-active' : ''}`}
              onClick={() => setDifficultyFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <table className="puzzle-table">
        <thead>
          <tr>
            <th className="pt-col-status">Status</th>
            <th className="pt-col-star">Star</th>
            <th className="pt-col-puzzle">Puzzle</th>
            <th
              className="pt-col-difficulty pt-col-sortable"
              role="button"
              tabIndex={0}
              onClick={() => toggleSort('difficulty')}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleSort('difficulty');
                }
              }}
            >
              Difficulty{sortKey === 'difficulty' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
            </th>
            <th
              className="pt-col-category pt-col-sortable"
              role="button"
              tabIndex={0}
              onClick={() => toggleSort('category')}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleSort('category');
                }
              }}
            >
              Category{sortKey === 'category' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
            </th>
            <th className="pt-col-notes">Notes</th>
          </tr>
        </thead>
        <tbody>
          {visible.length === 0 && (
            <tr>
              <td colSpan={6} className="puzzle-table-empty">No puzzles match these filters.</td>
            </tr>
          )}

          {visible.map(p => {
            const solved = loaded && isSolved(p.puzzleId);
            const starred = loaded && isStarred(p.puzzleId);
            const hasNotes = loaded && getNotes(p.puzzleId).trim().length > 0;

            return (
              <tr key={p.puzzleId} className={solved ? 'puzzle-row-solved' : ''}>
                <td className="pt-col-status">
                  <span
                    className={`pt-status-toggle ${solved ? 'pt-status-solved' : ''}`}
                    role="button"
                    tabIndex={0}
                    aria-pressed={solved}
                    title={solved ? 'Mark unsolved' : 'Mark solved'}
                    onClick={() => toggleSolved(p.puzzleId)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleSolved(p.puzzleId);
                      }
                    }}
                  >
                    {solved ? '✔' : ''}
                  </span>
                </td>
                <td className="pt-col-star">
                  <span
                    className={`pt-star-toggle ${starred ? 'pt-star-active' : ''}`}
                    role="button"
                    tabIndex={0}
                    aria-pressed={starred}
                    title={starred ? 'Unstar' : 'Star'}
                    onClick={() => toggleStarred(p.puzzleId)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleStarred(p.puzzleId);
                      }
                    }}
                  >
                    {starred ? '★' : '☆'}
                  </span>
                </td>
                <td className="pt-col-puzzle">
                  <Link to={`/puzzles/${p.puzzleId}`}>{p.title}</Link>
                </td>
                <td className="pt-col-difficulty">
                  <span className={`pt-difficulty-badge pt-difficulty-${p.difficulty}`}>{p.difficulty}</span>
                </td>
                <td className="pt-col-category">{p.category}</td>
                <td className="pt-col-notes">{hasNotes ? '📝' : ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PuzzleTable;
