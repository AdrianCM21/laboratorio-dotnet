import { useState } from 'react'
import { Blocks } from './Blocks.jsx'

export default function Lessons({ lessons, progress, onToggle, onDone }) {
  const [openId, setOpenId] = useState(null)
  const idx = lessons.findIndex((l) => l.id === openId)

  if (idx >= 0) {
    const lesson = lessons[idx]
    const prev = lessons[idx - 1]
    const next = lessons[idx + 1]
    const done = !!progress.lessons[lesson.id]
    return (
      <article className="reader">
        <button type="button" className="back" onClick={() => setOpenId(null)}>
          ← Todas las lecciones
        </button>
        <p className="eyebrow">
          Lección {idx + 1} de {lessons.length} · {lesson.minutes} min
        </p>
        <h2>{lesson.title}</h2>
        <Blocks blocks={lesson.blocks} />

        <div className="reader-foot">
          <button
            type="button"
            className={`btn ${done ? '' : 'primary'}`}
            onClick={() => {
              if (done) onToggle('lessons', lesson.id)
              else onDone('lessons', lesson.id)
            }}
          >
            {done ? 'Lección leída ✓ (desmarcar)' : 'Marcar como leída'}
          </button>
          <div className="pager">
            {prev && (
              <button type="button" className="btn" onClick={() => setOpenId(prev.id)}>
                ← {prev.title}
              </button>
            )}
            {next && (
              <button type="button" className="btn" onClick={() => setOpenId(next.id)}>
                {next.title} →
              </button>
            )}
          </div>
        </div>
      </article>
    )
  }

  return (
    <ul className="cards">
      {lessons.map((l, i) => {
        const done = !!progress.lessons[l.id]
        return (
          <li key={l.id}>
            <button type="button" className={`card ${done ? 'is-done' : ''}`} onClick={() => setOpenId(l.id)}>
              <span className="card-no tabnum">{i + 1}</span>
              <span className="card-body">
                <strong>{l.title}</strong>
                <small>{l.minutes} min de lectura</small>
              </span>
              <span className="card-state">{done ? 'Leída' : 'Pendiente'}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
