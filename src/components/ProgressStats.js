// src/components/ProgressStats.js
import React, { useContext, useMemo } from 'react';
import { ProgressContext } from '../contexts/ProgressContext';

const DIFFICULTIES = [
  { key: 'easy', label: 'Easy' },
  { key: 'medium', label: 'Medium' },
  { key: 'hard', label: 'Hard' },
  { key: 'deadly', label: 'Deadly' },
];

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const ProgressStats = ({ puzzles }) => {
  const { loaded, counts } = useContext(ProgressContext);

  const stats = useMemo(() => {
    const byDifficulty = {};
    DIFFICULTIES.forEach(d => {
      byDifficulty[d.key] = { total: 0, solved: 0 };
    });

    puzzles.forEach(p => {
      const bucket = byDifficulty[p.difficulty];
      if (!bucket) return;
      bucket.total += 1;
      if (counts.solvedIds.has(String(p.puzzleId))) bucket.solved += 1;
    });

    const totalSolved = Object.values(byDifficulty).reduce((sum, b) => sum + b.solved, 0);

    return { byDifficulty, totalSolved, totalPuzzles: puzzles.length };
  }, [puzzles, counts]);

  const donutPct = stats.totalPuzzles ? stats.totalSolved / stats.totalPuzzles : 0;
  const dashoffset = CIRCUMFERENCE * (1 - (loaded ? donutPct : 0));

  return (
    <div className="progress-stats">
      <div className="progress-donut">
        <svg viewBox="0 0 100 100" width="120" height="120">
          <circle cx="50" cy="50" r={RADIUS} className="progress-donut-track" />
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            className="progress-donut-fill"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashoffset}
            transform="rotate(-90 50 50)"
          />
          <text x="50" y="47" textAnchor="middle" className="progress-donut-number">
            {loaded ? stats.totalSolved : '–'}
          </text>
          <text x="50" y="65" textAnchor="middle" className="progress-donut-label">
            {`/ ${stats.totalPuzzles}`}
          </text>
        </svg>
        <div className="progress-donut-caption">Solved</div>
      </div>

      <div className="progress-tiles">
        {DIFFICULTIES.map(d => {
          const bucket = stats.byDifficulty[d.key];
          const pct = bucket.total ? Math.round((bucket.solved / bucket.total) * 100) : 0;
          return (
            <div className={`progress-tile progress-tile-${d.key}`} key={d.key}>
              <div className="progress-tile-label">{d.label}</div>
              <div className="progress-tile-count">
                {loaded ? bucket.solved : '–'} / {bucket.total}
              </div>
              <div className="progress-tile-bar">
                <div className="progress-tile-bar-fill" style={{ width: `${loaded ? pct : 0}%` }} />
              </div>
            </div>
          );
        })}

        <div className="progress-tile progress-tile-starred">
          <div className="progress-tile-label">Starred</div>
          <div className="progress-tile-count">{loaded ? counts.starredIds.size : '–'}</div>
        </div>
      </div>
    </div>
  );
};

export default ProgressStats;
