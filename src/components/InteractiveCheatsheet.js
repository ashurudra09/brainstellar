import React, { useEffect, useMemo, useState } from 'react'

// Renders a notes + quiz cheatsheet from data (see src/cheatsheets/). Quiz
// text (q, options, why, intros) is trusted build-time HTML. Question kinds:
// single choice (answer: number), select-all (answer: number[]) and numeric
// (numeric: {lo, hi, text}). Answers persist per browser in localStorage; the
// server render is the Notes tab with no quiz state, so nothing touches
// `window` before mount.
const sameSet = (a, b) => a.length === b.length && a.every(x => b.includes(x))

const isRight = (q, pick) => {
  if (q.numeric) {
    const v = parseFloat(String(pick).replace(/,/g, ''))
    return !isNaN(v) && v >= q.numeric.lo && v <= q.numeric.hi
  }
  return Array.isArray(q.answer) ? Array.isArray(pick) && sameSet(pick, q.answer) : pick === q.answer
}

const Html = ({ as: Tag = 'div', html, ...rest }) => <Tag {...rest} dangerouslySetInnerHTML={{ __html: html }} />

export default function InteractiveCheatsheet({ slug, data }) {
  const storageKey = `brainstellar-cs:${slug}:v1`
  const [view, setView] = useState('notes')
  const [filter, setFilter] = useState('All')
  const [answers, setAnswers] = useState({})
  const [draft, setDraft] = useState({}) // unsubmitted select-all picks / typed numbers
  const mixed = useMemo(() => data.quiz.some(q => q.numeric || Array.isArray(q.answer)), [data])

  useEffect(() => {
    try { setAnswers(JSON.parse(localStorage.getItem(storageKey) || '{}')) } catch (e) { /* storage unavailable */ }
    if (window.location.hash === '#quiz') setView('quiz')
  }, [storageKey])

  const topics = useMemo(() => [...new Set(data.quiz.map(q => q.topic))], [data])
  const localNo = useMemo(() => {
    const seen = {}
    return data.quiz.map(q => (seen[q.topic] = (seen[q.topic] || 0) + 1))
  }, [data])

  const save = next => {
    setAnswers(next)
    try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch (e) { /* ignore */ }
  }
  const submit = (i, pick) => {
    save({ ...answers, [i]: pick })
    setDraft(({ [i]: _, ...rest }) => rest)
  }

  const inFilter = (t, q, i) =>
    t === 'All' || q.topic === t || (t === 'Missed' && answers[i] != null && !isRight(q, answers[i]))
  const visible = data.quiz.map((q, i) => ({ q, i })).filter(({ q, i }) => inFilter(filter, q, i))
  const done = visible.filter(({ i }) => answers[i] != null).length
  const right = visible.filter(({ q, i }) => answers[i] != null && isRight(q, answers[i])).length

  const reset = () => {
    const next = { ...answers }
    visible.forEach(({ i }) => delete next[i])
    save(next)
    setDraft({})
  }

  const show = v => { setView(v); window.scrollTo(0, 0) }

  return (
    <div>
      {data.preface && <Html className="cs-preface" html={data.preface} />}

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
            {t.tag && <span className="tag">{t.tag}</span>}
            {t.intro && <Html className="cs-intro" html={t.intro} />}
            <Html className="cs-stack" html={t.html} />
          </section>
        ))}
      </div>

      <div hidden={view !== 'quiz'}>
        <div className="cs-bar">
          {['All', ...topics, 'Missed'].map(t => {
            const n = data.quiz.filter((q, i) => inFilter(t, q, i)).length
            return (
              <button key={t} type="button" aria-pressed={filter === t} className={`filter-chip${filter === t ? ' filter-chip-active' : ''}`} onClick={() => setFilter(t)}>
                {t} <span className="qf-count">{n}</span>
              </button>
            )
          })}
        </div>
        {data.quizIntros && data.quizIntros[filter] && <Html className="cs-qintro" html={data.quizIntros[filter]} />}
        <div className="cs-bar">
          <span className="cs-score"><b>{right}</b> correct · {done}/{visible.length} answered</span>
          <button type="button" className="btn btn-sm link-white" onClick={reset}>Reset these</button>
        </div>

        <div className="cs-stack">
          {visible.map(({ q, i }) => {
            const pick = answers[i]
            const answered = pick != null
            const ok = answered && isRight(q, pick)
            const multi = Array.isArray(q.answer)
            const correct = multi ? q.answer : [q.answer]
            const sel = draft[i] || []
            return (
              <article key={i} className="cs-card">
                <div className="cs-qmeta">
                  <span className="cs-qnum">{data.localNumbering ? `${q.topic} · Q${localNo[i]}` : `Q${i + 1}`}</span>
                  {mixed
                    ? <span className="cs-kind">{q.numeric ? 'Type the answer' : multi ? 'Select all that apply' : 'Pick one'}</span>
                    : <span className="tag">{q.topic}</span>}
                  {q.note && <span className="tag">{q.note}</span>}
                </div>
                <Html as="p" className="cs-q" html={q.q} />

                {q.numeric ? (
                  <div className="cs-act">
                    {answered
                      ? <span className={`cs-your ${ok ? 'cs-your-right' : 'cs-your-wrong'}`}>{pick}</span>
                      : (
                        <>
                          <input inputMode="decimal" aria-label="Your answer" value={draft[i] || ''}
                            onChange={e => setDraft({ ...draft, [i]: e.target.value })}
                            onKeyDown={e => { if (e.key === 'Enter' && (draft[i] || '').trim()) submit(i, draft[i].trim()) }} />
                          <button type="button" className="btn btn-sm cs-go" disabled={!(draft[i] || '').trim()} onClick={() => submit(i, draft[i].trim())}>Check</button>
                        </>
                      )}
                  </div>
                ) : (
                  <>
                    <div className="cs-opts">
                      {q.options.map((o, j) => {
                        let cls = 'cs-opt'
                        if (answered) {
                          const picked = multi ? pick.includes(j) : pick === j
                          if (correct.includes(j)) cls += picked || !multi ? ' cs-opt-right' : ' cs-opt-miss'
                          else if (picked) cls += ' cs-opt-wrong'
                        } else if (sel.includes(j)) cls += ' cs-opt-sel'
                        const onClick = multi
                          ? () => setDraft({ ...draft, [i]: sel.includes(j) ? sel.filter(x => x !== j) : [...sel, j].sort() })
                          : () => submit(i, j)
                        return (
                          <button key={j} type="button" className={cls} disabled={answered} aria-pressed={multi && !answered ? sel.includes(j) : undefined} onClick={onClick}>
                            <b>{String.fromCharCode(97 + j)}.</b> <span dangerouslySetInnerHTML={{ __html: o }} />
                          </button>
                        )
                      })}
                    </div>
                    {multi && !answered && (
                      <div className="cs-act">
                        <button type="button" className="btn btn-sm cs-go" disabled={!sel.length} onClick={() => submit(i, sel)}>Check</button>
                      </div>
                    )}
                  </>
                )}

                {answered && (
                  <div className="cs-why">
                    <p><b>{ok ? 'Correct.' : 'Not quite.'}</b>
                      {q.numeric ? ` Answer: ${q.numeric.text}.` : !ok && multi ? ' Dashed = correct options you missed.' : ''}</p>
                    <Html html={q.why} />
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
