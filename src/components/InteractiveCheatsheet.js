import React, { useEffect, useMemo, useState } from 'react'

// Renders a notes + quiz cheatsheet from data (see src/cheatsheets/). Quiz
// answers are kept per-browser in localStorage; the server render is the Notes
// tab with no quiz state, so nothing touches `window` before mount.
export default function InteractiveCheatsheet({ slug, data }) {
  const storageKey = `brainstellar-cs:${slug}:v1`
  const [view, setView] = useState('notes')
  const [filter, setFilter] = useState('All')
  const [answers, setAnswers] = useState({})

  useEffect(() => {
    try { setAnswers(JSON.parse(localStorage.getItem(storageKey) || '{}')) } catch (e) { /* storage unavailable */ }
    if (window.location.hash === '#quiz') setView('quiz')
  }, [storageKey])

  const topics = useMemo(() => ['All', ...new Set(data.quiz.map(q => q.topic))], [data])

  const save = next => {
    setAnswers(next)
    try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch (e) { /* ignore */ }
  }

  const visible = data.quiz
    .map((q, i) => ({ q, i }))
    .filter(({ q }) => filter === 'All' || q.topic === filter)
  const done = visible.filter(({ i }) => answers[i] != null).length
  const right = visible.filter(({ q, i }) => answers[i] === q.answer).length

  const reset = () => {
    const next = { ...answers }
    visible.forEach(({ i }) => delete next[i])
    save(next)
  }

  const show = v => { setView(v); window.scrollTo(0, 0) }

  return (
    <div>
      <nav className="cs-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={view === 'notes'} className={`push${view === 'notes' ? ' pushed' : ''}`} onClick={() => show('notes')}>Notes</button>
        <button type="button" role="tab" aria-selected={view === 'quiz'} className={`push${view === 'quiz' ? ' pushed' : ''}`} onClick={() => show('quiz')}>Quiz</button>
        {view === 'notes' && (
          <div className="cs-jump">
            {data.topics.map(t => <a key={t.id} href={`#${t.id}`}>{t.short}</a>)}
          </div>
        )}
      </nav>

      <div hidden={view !== 'notes'}>
        {data.topics.map(t => (
          <section key={t.id} id={t.id} className="cs-topic">
            <h2>{t.title}</h2>
            <div className="cs-stack" dangerouslySetInnerHTML={{ __html: t.html }} />
          </section>
        ))}
      </div>

      <div hidden={view !== 'quiz'}>
        <div className="cs-bar">
          {topics.map(t => {
            const n = data.quiz.filter(q => t === 'All' || q.topic === t).length
            return (
              <button key={t} type="button" aria-pressed={filter === t} className={`filter-chip${filter === t ? ' filter-chip-active' : ''}`} onClick={() => setFilter(t)}>
                {t} <span className="qf-count">{n}</span>
              </button>
            )
          })}
        </div>
        <div className="cs-bar">
          <span className="cs-score"><b>{right}</b> correct · {done}/{visible.length} answered</span>
          <button type="button" className="btn btn-sm link-white" onClick={reset}>Reset this topic</button>
        </div>

        <div className="cs-stack">
          {visible.map(({ q, i }) => {
            const pick = answers[i]
            const answered = pick != null
            return (
              <article key={i} className="cs-card">
                <div className="cs-qmeta"><span className="cs-qnum">Q{i + 1}</span><span className="tag">{q.topic}</span></div>
                <p className="cs-q">{q.q}</p>
                <div className="cs-opts">
                  {q.options.map((o, j) => {
                    let cls = 'cs-opt'
                    if (answered && j === q.answer) cls += ' cs-opt-right'
                    else if (answered && j === pick) cls += ' cs-opt-wrong'
                    return <button key={j} type="button" className={cls} disabled={answered} onClick={() => save({ ...answers, [i]: j })}>{o}</button>
                  })}
                </div>
                {answered && (
                  <div className="cs-why"><b>{pick === q.answer ? 'Correct. ' : 'Not quite. '}</b>{q.why}</div>
                )}
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
