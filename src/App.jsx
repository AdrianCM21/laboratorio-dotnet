import { useEffect, useState } from 'react'
import { weeks } from './data/weeks.js'
import { useProgress, weekStats, PASS } from './hooks/useProgress.js'
import Lessons from './components/Lessons.jsx'
import Games from './components/Games.jsx'
import Tasks from './components/Tasks.jsx'
import Quiz from './components/Quiz.jsx'
import FinalProject from './components/FinalProject.jsx'
import Commands from './components/Commands.jsx'

const TABS = [
  { id: 'lecciones', label: 'Lecciones' },
  { id: 'juegos', label: 'Juegos' },
  { id: 'tareas', label: 'Tareas' },
  { id: 'quiz', label: 'Quiz' },
]

const PAGES = ['comandos', 'proyecto']
const VALID = new Set([...weeks.map((w) => w.id), ...PAGES])

function readHash() {
  try {
    const h = window.location.hash.replace('#', '')
    return VALID.has(h) ? h : 'semana-1'
  } catch {
    return 'semana-1'
  }
}

export default function App() {
  const { progress, toggle, markDone, saveScore, setValue, reset } = useProgress()
  const [view, setView] = useState(readHash)
  const [tab, setTab] = useState('lecciones')
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    const onHash = () => setView(readHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // En pantallas angostas la fila de semanas se desplaza: muestra la activa
  useEffect(() => {
    const el = document.querySelector('.stop.is-current')
    const row = el?.parentElement
    if (el && row && row.scrollWidth > row.clientWidth) {
      row.scrollTo({ left: el.offsetLeft - (row.clientWidth - el.clientWidth) / 2, behavior: 'smooth' })
    }
  }, [view])

  function go(id) {
    setView(id)
    setTab('lecciones')
    try {
      if (window.location.hash !== `#${id}`) window.location.hash = id
    } catch {
      /* sin hash: la navegación sigue funcionando en memoria */
    }
    window.scrollTo({ top: 0 })
  }

  const week = weeks.find((w) => w.id === view)
  const stats = week ? weekStats(week, progress) : null
  const overall = weeks.reduce(
    (acc, w) => {
      const s = weekStats(w, progress)
      return { done: acc.done + s.done, total: acc.total + s.total }
    },
    { done: 0, total: 0 },
  )
  const overallPct = overall.total ? Math.round((overall.done / overall.total) * 100) : 0

  function counts(id) {
    const c = week.content
    if (id === 'lecciones') return `${c.lessons.filter((l) => progress.lessons[l.id]).length}/${c.lessons.length}`
    if (id === 'juegos') return `${c.games.filter((g) => (progress.games[g.id] || 0) >= PASS).length}/${c.games.length}`
    if (id === 'tareas') return `${c.tasks.filter((t) => progress.tasks[t.id]).length}/${c.tasks.length}`
    return (progress.quiz[c.quiz.id] || 0) >= PASS ? '✓' : ''
  }

  return (
    <div className="app">
      <header className="top">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            .NET
          </span>
          <div>
            <h1>Laboratorio API .NET</h1>
            <p className="tabnum">Bootcamp CLT · Avance total {overallPct}%</p>
          </div>
        </div>
        <nav className="pages" aria-label="Secciones">
          <button type="button" className={`page-link ${view === 'comandos' ? 'is-active' : ''}`} onClick={() => go('comandos')}>
            Comandos
          </button>
          <button type="button" className={`page-link ${view === 'proyecto' ? 'is-active' : ''}`} onClick={() => go('proyecto')}>
            Proyecto final
          </button>
        </nav>
      </header>

      <nav className="route" aria-label="Semanas">
        {weeks.map((w) => {
          const s = weekStats(w, progress)
          return (
            <button
              key={w.id}
              type="button"
              className={`stop ${w.id === view ? 'is-current' : ''}`}
              onClick={() => go(w.id)}
              aria-current={w.id === view ? 'step' : undefined}
            >
              <span className="stop-no">Semana {w.number}</span>
              <span className="stop-title">{w.title}</span>
              <span className="stop-bar" aria-hidden="true">
                <i style={{ width: `${s.pct}%` }} />
              </span>
              <span className="stop-pct tabnum">{s.pct}%</span>
            </button>
          )
        })}
      </nav>

      <main>
        {view === 'proyecto' && <FinalProject progress={progress} onSet={setValue} onGoWeek={go} />}
        {view === 'comandos' && <Commands onGoWeek={go} />}

        {week && (
          <>
            <section className="week-head">
              <div>
                <p className="eyebrow">
                  Semana {week.number} · {week.rubric}
                </p>
                <h2 className="week-title">{week.title}</h2>
                <p className="lead">{week.summary}</p>
              </div>
              <div className="week-progress tabnum" aria-label={`Avance de la semana: ${stats.pct}%`}>
                <strong>{stats.pct}%</strong>
                <span>
                  {stats.done} de {stats.total} actividades
                </span>
              </div>
            </section>

            <div className="tabs" role="tablist">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  className={tab === t.id ? 'is-active' : ''}
                  onClick={() => setTab(t.id)}
                >
                  {t.label} <small className="tabnum">{counts(t.id)}</small>
                </button>
              ))}
            </div>

            <div className="panel" role="tabpanel" key={`${view}-${tab}`}>
              {tab === 'lecciones' && (
                <Lessons lessons={week.content.lessons} progress={progress} onToggle={toggle} onDone={markDone} />
              )}
              {tab === 'juegos' && <Games games={week.content.games} progress={progress} onSave={saveScore} />}
              {tab === 'tareas' && <Tasks tasks={week.content.tasks} progress={progress} onToggle={toggle} />}
              {tab === 'quiz' && <Quiz quiz={week.content.quiz} progress={progress} onSave={saveScore} />}
            </div>
          </>
        )}
      </main>

      <footer className="foot">
        <span>El avance se guarda en este navegador.</span>
        {confirmReset ? (
          <span className="reset">
            ¿Borrar todo el avance?
            <button
              type="button"
              className="link danger"
              onClick={() => {
                reset()
                setConfirmReset(false)
              }}
            >
              Sí, borrar
            </button>
            <button type="button" className="link" onClick={() => setConfirmReset(false)}>
              Cancelar
            </button>
          </span>
        ) : (
          <button type="button" className="link" onClick={() => setConfirmReset(true)}>
            Reiniciar avance
          </button>
        )}
      </footer>
    </div>
  )
}
