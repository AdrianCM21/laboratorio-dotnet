import { useMemo, useState } from 'react'
import { shuffled } from './util.js'

/** Opción múltiple. Sirve para varios juegos y para el quiz (con `shuffle`). */
export default function Choice({ item, shuffle = false, onFinish }) {
  const rounds = useMemo(
    () => item.rounds.map((r) => ({ ...r, options: shuffle ? shuffled(r.options) : r.options })),
    [item, shuffle],
  )
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState(null)
  const [ok, setOk] = useState(0)

  const r = rounds[i]
  const long = r.options.some((o) => o.length > 16)
  const answered = picked !== null
  const isLast = i + 1 === rounds.length

  function pick(option) {
    if (answered) return
    setPicked(option)
    if (option === r.answer) setOk((v) => v + 1)
  }

  function next() {
    if (isLast) {
      onFinish(Math.round((100 * ok) / rounds.length))
    } else {
      setI(i + 1)
      setPicked(null)
    }
  }

  return (
    <div className="play">
      <div className="play-meta">
        <span>
          Pregunta {i + 1} de {rounds.length}
        </span>
        <span className="tabnum">Aciertos: {ok}</span>
      </div>
      <div className="meter" aria-hidden="true">
        <span style={{ width: `${(i / rounds.length) * 100}%` }} />
      </div>

      <h3 className="prompt">{r.prompt}</h3>

      <div className={`options ${long ? 'is-stack' : 'is-grid'}`} role="group" aria-label="Opciones">
        {r.options.map((o) => {
          let state = ''
          if (answered && o === r.answer) state = 'is-right'
          else if (answered && o === picked) state = 'is-wrong'
          else if (answered) state = 'is-dim'
          return (
            <button key={o} type="button" className={`option ${state}`} onClick={() => pick(o)} disabled={answered}>
              {o}
            </button>
          )
        })}
      </div>

      {answered && (
        <div className={`feedback ${picked === r.answer ? 'good' : 'bad'}`} role="status">
          <strong>{picked === r.answer ? 'Correcto.' : `Era: ${r.answer}.`}</strong> {r.why}
        </div>
      )}

      <div className="play-actions">
        <button type="button" className="btn primary" onClick={next} disabled={!answered}>
          {isLast ? 'Ver resultado' : 'Siguiente'}
        </button>
      </div>
    </div>
  )
}
