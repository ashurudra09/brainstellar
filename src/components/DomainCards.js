// src/components/DomainCards.js
import React, { useMemo } from 'react';
import { Link } from 'gatsby';
import useProgress from '../hooks/useProgress';
import { progressKey } from './QuestionTable';
import { DOMAINS } from '../data/domains';

// A card grid linking to each domain's page, with a solved/total tally per
// domain. `questions` is the full cross-domain question list from the hub.
const DomainCards = ({ questions }) => {
  const { loaded, counts } = useProgress();

  const statsByDomain = useMemo(() => {
    const stats = {};
    DOMAINS.forEach(d => { stats[d.slug] = { total: 0, solved: 0 }; });
    questions.forEach(q => {
      const bucket = stats[q.domain];
      if (!bucket) return;
      bucket.total += 1;
      if (counts.solvedIds.has(progressKey(q))) bucket.solved += 1;
    });
    return stats;
  }, [questions, counts]);

  return (
    <div className="domain-cards">
      {DOMAINS.map(d => {
        const stat = statsByDomain[d.slug];
        return (
          <Link key={d.slug} to={`/q/${d.slug}`} className="domain-card" style={{ '--accent': d.accent }}>
            <div className="domain-card-icon">{d.icon}</div>
            <div className="domain-card-label">{d.label}</div>
            <div className="domain-card-count">{loaded ? stat.solved : '–'} / {stat.total}</div>
          </Link>
        );
      })}
    </div>
  );
};

export default DomainCards;
