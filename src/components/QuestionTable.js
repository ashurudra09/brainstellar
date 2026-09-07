// src/components/QuestionTable.js
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'gatsby';
import useProgress from '../hooks/useProgress';
import { DIFFICULTIES, DIFFICULTY_ORDER, DOMAINS } from '../data/domains';
import QuestionFilters from './QuestionFilters';

export const progressKey = q => `${q.domain}:${q.qid}`;
export const questionRoute = q => `/q/${q.domain}/${q.qid}`;

// `domain` is a single domain's config (from src/data/domains.js) when this
// table is scoped to one domain's page -- it drives the difficulty/category
// chip lists and hides the (then-redundant) domain column/filter. Pass
// nothing for a cross-domain table (hub, /all).
const QuestionTable = ({ questions, domain, onVisibleChange }) => {
  const { loaded, isSolved, isStarred, isRevisit, isDueForReview, getNotes, toggleSolved, toggleStarred } = useProgress();
  const [statusFilter, setStatusFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [topicFilter, setTopicFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const showDomainColumn = !domain;

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
    const filtered = questions.filter(item => {
      if (difficultyFilter !== 'all' && item.difficulty !== difficultyFilter) return false;
      if (topicFilter !== 'all' && (domain ? item.category : item.domain) !== topicFilter) return false;
      if (q &&
          !item.title.toLowerCase().includes(q) &&
          !(item.category || '').toLowerCase().includes(q) &&
          !String(item.qid).toLowerCase().includes(q) &&
          !item.domain.toLowerCase().includes(q)
      ) return false;

      const key = progressKey(item);
      if (statusFilter === 'unsolved') return !isSolved(key);
      if (statusFilter === 'solved') return isSolved(key);
      if (statusFilter === 'starred') return isStarred(key);
      if (statusFilter === 'notes') return getNotes(key).trim().length > 0;
      if (statusFilter === 'revisit') return isRevisit(key);
      if (statusFilter === 'due') return isDueForReview(key);
      return true;
    });

    if (!sortKey) return filtered;

    // Difficulty-less questions (e.g. Behavioural) always sort last,
    // regardless of direction.
    if (sortKey === 'difficulty') {
      const withDifficulty = filtered.filter(item => item.difficulty);
      const withoutDifficulty = filtered.filter(item => !item.difficulty);
      withDifficulty.sort((a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty]);
      if (sortDir === 'desc') withDifficulty.reverse();
      return [...withDifficulty, ...withoutDifficulty];
    }

    const sorted = [...filtered].sort((a, b) => {
      if (sortKey === 'category') return (a.category || '').localeCompare(b.category || '');
      if (sortKey === 'domain') return a.domain.localeCompare(b.domain);
      return 0;
    });
    if (sortDir === 'desc') sorted.reverse();
    return sorted;
  }, [questions, domain, statusFilter, difficultyFilter, topicFilter, search, sortKey, sortDir,
      isSolved, isStarred, isRevisit, isDueForReview, getNotes]);

  useEffect(() => {
    if (onVisibleChange) onVisibleChange(visible);
  }, [visible, onVisibleChange]);

  // Counts are over the whole question set, not the current filter, so
  // numbers stay put while you click around and never read as "0".
  const facetCounts = useMemo(() => {
    const topic = {};
    const difficulty = {};
    const topicOf = domain ? q => q.category : q => q.domain;
    questions.forEach(q => {
      const t = topicOf(q);
      if (t) topic[t] = (topic[t] || 0) + 1;
      if (q.difficulty) difficulty[q.difficulty] = (difficulty[q.difficulty] || 0) + 1;
    });
    return { topic, difficulty, total: questions.length };
  }, [questions, domain]);

  const handleReset = useCallback(() => {
    setSearch('');
    setStatusFilter('all');
    setDifficultyFilter('all');
    setTopicFilter('all');
  }, []);

  const sortIndicator = key => (sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '');
  const sortableHeaderProps = key => ({
    role: 'button',
    tabIndex: 0,
    onClick: () => toggleSort(key),
    onKeyDown: e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleSort(key);
      }
    },
  });

  const columnCount = 5 + (showDomainColumn ? 1 : 0);

  return (
    <div className="puzzle-table-wrap">
      <QuestionFilters
        domain={domain}
        counts={facetCounts}
        search={search} setSearch={setSearch}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        difficultyFilter={difficultyFilter} setDifficultyFilter={setDifficultyFilter}
        topicFilter={topicFilter} setTopicFilter={setTopicFilter}
        onReset={handleReset}
      />

      <table className="puzzle-table">
        <thead>
          <tr>
            <th className="pt-col-status">Status</th>
            <th className="pt-col-star">Star</th>
            <th className="pt-col-puzzle">Question</th>
            <th className="pt-col-difficulty pt-col-sortable" {...sortableHeaderProps('difficulty')}>
              Difficulty{sortIndicator('difficulty')}
            </th>
            <th className="pt-col-category pt-col-sortable" {...sortableHeaderProps('category')}>
              Category{sortIndicator('category')}
            </th>
            {showDomainColumn && (
              <th className="pt-col-domain pt-col-sortable" {...sortableHeaderProps('domain')}>
                Domain{sortIndicator('domain')}
              </th>
            )}
            <th className="pt-col-notes">Notes</th>
          </tr>
        </thead>
        <tbody>
          {visible.length === 0 && (
            <tr>
              <td colSpan={columnCount} className="puzzle-table-empty">No questions match these filters.</td>
            </tr>
          )}

          {visible.map(item => {
            const key = progressKey(item);
            const solved = loaded && isSolved(key);
            const starred = loaded && isStarred(key);
            const hasNotes = loaded && getNotes(key).trim().length > 0;
            const domainConfig = DOMAINS.find(d => d.slug === item.domain);

            return (
              <tr key={key} className={solved ? 'puzzle-row-solved' : ''}>
                <td className="pt-col-status">
                  <span
                    className={`pt-status-toggle ${solved ? 'pt-status-solved' : ''}`}
                    role="button"
                    tabIndex={0}
                    aria-pressed={solved}
                    title={solved ? 'Mark unsolved' : 'Mark solved'}
                    onClick={() => toggleSolved(key)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleSolved(key);
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
                    onClick={() => toggleStarred(key)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleStarred(key);
                      }
                    }}
                  >
                    {starred ? '★' : '☆'}
                  </span>
                </td>
                <td className="pt-col-puzzle">
                  <Link to={questionRoute(item)}>{item.title}</Link>
                </td>
                <td className="pt-col-difficulty">
                  {item.difficulty &&
                    <span className="pt-difficulty-badge" style={{ '--accent': DIFFICULTIES.find(d => d.key === item.difficulty)?.accent }}>{item.difficulty}</span>
                  }
                </td>
                <td className="pt-col-category">{item.category}</td>
                {showDomainColumn && (
                  <td className="pt-col-domain">{domainConfig ? `${domainConfig.icon} ${domainConfig.label}` : item.domain}</td>
                )}
                <td className="pt-col-notes">{hasNotes ? '📝' : ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default QuestionTable;
