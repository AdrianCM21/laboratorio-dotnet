import { useState } from 'react'
import { Blocks, Inline } from './Blocks.jsx'

export default function Tasks({ tasks, progress, onToggle }) {
  const [openHint, setOpenHint] = useState(null)
  const done = tasks.filter((t) => progress.tasks[t.id]).length

  return (
    <div>
      <p className="lead">
        Trabajan sobre tu proyecto <code>BootcampCLTNoviembre</code>. {done} de {tasks.length} listas.
      </p>
      <ol className="tasks">
        {tasks.map((t) => {
          const checked = !!progress.tasks[t.id]
          return (
            <li key={t.id} className={checked ? 'is-done' : ''}>
              <label className="task-head">
                <input type="checkbox" id={`task-${t.id}`} checked={checked} onChange={() => onToggle('tasks', t.id)} />
                <span>
                  <strong>{t.title}</strong>
                  <small>
                    <Inline text={t.detail} />
                  </small>
                </span>
              </label>
              {t.hint && (
                <div className="hint">
                  <button
                    type="button"
                    className="link"
                    aria-expanded={openHint === t.id}
                    onClick={() => setOpenHint(openHint === t.id ? null : t.id)}
                  >
                    {openHint === t.id ? 'Ocultar pista' : 'Ver pista'}
                  </button>
                  {openHint === t.id && <Blocks blocks={t.hint} />}
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
