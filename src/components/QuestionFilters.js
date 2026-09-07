// src/components/QuestionFilters.js
import React, { useState } from 'react';
import { DIFFICULTIES, DOMAINS } from '../data/domains';

const NEUTRAL_ACCENT = '#808080';

export const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unsolved', label: 'Unsolved' },
  { key: 'solved', label: 'Solved' },
  { key: 'starred', label: 'Starred' },
  { key: 'notes', label: 'Has notes' },
  { key: 'revisit', label: 'Revisit' },
  { key: 'due', label: 'Due for review' },
];

const svgProps = {
  className: 'qf-icon',
  viewBox: '0 0 24 24',
  width: 16,
  height: 16,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

const IconSearch = () => (
  <svg {...svgProps}><circle cx="11" cy="11" r="7" /><path d="M20.5 20.5 16 16" /></svg>
);
const IconFunnel = () => (
  <svg {...svgProps}><path d="M3 5h18l-7 8.2V20l-4 1.5v-8.3z" /></svg>
);
const IconClear = () => (
  <svg {...svgProps}><path d="M18 6 6 18M6 6l12 12" /></svg>
);
const IconChevron = () => (
  <svg {...svgProps}><path d="m6 9 6 6 6-6" /></svg>
);

// Fully controlled: every filter value lives in QuestionTable so the `visible`
// memo stays the single source of truth. The only state here is the purely
// cosmetic expand/collapse of the topic row.
const QuestionFilters = ({
  domain, counts,
  search, setSearch,
  statusFilter, setStatusFilter,
  difficultyFilter, setDifficultyFilter,
  topicFilter, setTopicFilter,
  onReset,
}) => {
  const [expanded, setExpanded] = useState(false);

  // One chip row either way: categories on a domain page, domains on /all.
  const topics = domain
    ? domain.categories.map(c => ({ key: c, label: c, accent: NEUTRAL_ACCENT }))
    : DOMAINS.map(d => ({ key: d.slug, label: `${d.icon} ${d.label}`, accent: d.accent }));

  const difficulties = domain
    ? DIFFICULTIES.filter(d => domain.difficulties.includes(d.key))
    : DIFFICULTIES;

  const activeCount = [
    search.trim() !== '', statusFilter !== 'all',
    difficultyFilter !== 'all', topicFilter !== 'all',
  ].filter(Boolean).length;

  return (
    <div className="qf">
      <div className="qf-toolbar">
        <div className="qf-search">
          <IconSearch />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search title, category, qid, domain..."
            aria-label="Search questions"
          />
        </div>

        {/* ponytail: native <details> is the popover -- free toggle + keyboard.
            No click-outside close; clicking the funnel again closes it. */}
        <details
          className="qf-popover"
          onKeyDown={e => { if (e.key === 'Escape') e.currentTarget.open = false; }}
        >
          <summary className="qf-iconbtn" title="Filters" aria-label="Filters">
            <IconFunnel />
            {activeCount > 0 && <span className="qf-badge">{activeCount}</span>}
          </summary>

          <div className="qf-panel">
            <label className="qf-panel-row">
              <span>Difficulty</span>
              <select value={difficultyFilter} onChange={e => setDifficultyFilter(e.target.value)}>
                <option value="all">All</option>
                {difficulties.map(d => (
                  <option key={d.key} value={d.key}>
                    {d.label} ({counts.difficulty[d.key] || 0})
                  </option>
                ))}
              </select>
            </label>

            <label className="qf-panel-row">
              <span>Status</span>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                {STATUS_FILTERS.map(f => (
                  <option key={f.key} value={f.key}>{f.label}</option>
                ))}
              </select>
            </label>
          </div>
        </details>

        <button
          type="button" className="qf-iconbtn" onClick={onReset}
          title="Clear filters" aria-label="Clear filters"
        >
          <IconClear />
        </button>
      </div>

      <div className={`qf-topics ${expanded ? 'is-expanded' : ''}`}>
        <div className="qf-topic-chips">
          <button
            type="button"
            className={`filter-chip ${topicFilter === 'all' ? 'filter-chip-active' : ''}`}
            style={{ '--accent': NEUTRAL_ACCENT }}
            onClick={() => setTopicFilter('all')}
          >
            All <span className="qf-count">{counts.total}</span>
          </button>

          {topics.map(t => (
            <button
              key={t.key}
              type="button"
              className={`filter-chip ${topicFilter === t.key ? 'filter-chip-active' : ''}`}
              style={{ '--accent': t.accent }}
              onClick={() => setTopicFilter(t.key)}
            >
              {t.label} <span className="qf-count">{counts.topic[t.key] || 0}</span>
            </button>
          ))}
        </div>

        {/* ponytail: count heuristic, not a measurement. Add a ResizeObserver
            only if some domain lands near the boundary and looks silly. */}
        {topics.length > 6 && (
          <button
            type="button" className="qf-expand"
            aria-expanded={expanded}
            onClick={() => setExpanded(v => !v)}
          >
            {expanded ? 'Collapse' : 'Expand'}<IconChevron />
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionFilters;
