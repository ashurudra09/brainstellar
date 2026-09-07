// src/components/ProgressStats.js
import React, { useMemo } from 'react';
import useProgress from '../hooks/useProgress';
import { progressKey } from './QuestionTable';
import { DIFFICULTIES, DOMAINS } from '../data/domains';

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Pass `domain` (an entry from src/data/domains.js) to scope the donut to
// one domain and show per-difficulty bars underneath it, as on a domain
// page. Omit it for the hub, which shows per-domain tiles instead.
const ProgressStats = ({ questions, domain }) => {
  const { loaded, counts } = useProgress();

  const stats = useMemo(() => {
    const totalSolved = questions.filter(q => counts.solvedIds.has(progressKey(q))).length;

    if (domain) {
      const byDifficulty = {};
      domain.difficulties.forEach(key => { byDifficulty[key] = { total: 0, solved: 0 }; });
      questions.forEach(q => {
        const bucket = byDifficulty[q.difficulty];
        if (!bucket) return;
        bucket.total += 1;
        if (counts.solvedIds.has(progressKey(q))) bucket.solved += 1;
      });
      return { byDifficulty, totalSolved, total: questions.length };
    }

    const byDomain = {};
    DOMAINS.forEach(d => { byDomain[d.slug] = { total: 0, solved: 0 }; });
    questions.forEach(q => {
      const bucket = byDomain[q.domain];
      if (!bucket) return;
      bucket.total += 1;
      if (counts.solvedIds.has(progressKey(q))) bucket.solved += 1;
    });
    return { byDomain, totalSolved, total: questions.length };
  }, [questions, counts, domain]);

  const donutPct = stats.total ? stats.totalSolved / stats.total : 0;
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
            {`/ ${stats.total}`}
          </text>
        </svg>
        <div className="progress-donut-caption">Solved</div>
      </div>

      <div className="progress-tiles">
        {domain
          ? domain.difficulties.map(key => {
              const d = DIFFICULTIES.find(x => x.key === key);
              const bucket = stats.byDifficulty[key];
              const pct = bucket.total ? Math.round((bucket.solved / bucket.total) * 100) : 0;
              return (
                <div className="progress-tile" style={{ '--accent': d.accent }} key={key}>
                  <div className="progress-tile-label">{d.label}</div>
                  <div className="progress-tile-count">{loaded ? bucket.solved : '–'} / {bucket.total}</div>
                  <div className="progress-tile-bar"><div className="progress-tile-bar-fill" style={{ width: `${loaded ? pct : 0}%` }} /></div>
                </div>
              );
            })
          : DOMAINS.map(d => {
              const bucket = stats.byDomain[d.slug];
              const pct = bucket.total ? Math.round((bucket.solved / bucket.total) * 100) : 0;
              return (
                <div className="progress-tile" style={{ '--accent': d.accent }} key={d.slug}>
                  <div className="progress-tile-label">{d.icon} {d.label}</div>
                  <div className="progress-tile-count">{loaded ? bucket.solved : '–'} / {bucket.total}</div>
                  <div className="progress-tile-bar"><div className="progress-tile-bar-fill" style={{ width: `${loaded ? pct : 0}%` }} /></div>
                </div>
              );
            })}

        {domain && (
          <div className="progress-tile progress-tile-starred">
            <div className="progress-tile-label">Starred</div>
            <div className="progress-tile-count">
              {loaded ? questions.filter(q => counts.starredIds.has(progressKey(q))).length : '–'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressStats;
