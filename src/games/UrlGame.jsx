import { useState } from 'react'

const KIND = {
  verb: 'Verbo',
  base: 'Base',
  version: 'Versión',
  resource: 'Recurso',
  param: 'Parámetro de ruta',
  query: 'Query param',
}

/** El estudiante toca la parte de la petición que se le pide. */
export default function UrlGame({ item, onFinish }) {
  const rounds = item.rounds
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState(null)
  const [ok, setOk] = useState(0)

  const r = rounds[i]
  const answered = picked !== null
  const isLast = i + 1 === rounds.length

  function pick(idx, kind) {
    if (answered) return
    setPicked(idx)
    if (kind === r.answer) setOk((v) => v + 1)
  }

  function next() {
    if (isLast) {
      onFinish(Math.round((100 * ok) / rounds.length))
    } else {
      setI(i + 1)
      setPicked(null)
    }
  }

  const usedKinds = [...new Set(r.tokens.map((t) => t[1]))]
  const pickedRight = answered && r.tokens[picked][1] === r.answer

  return (
    <div className="play">
      <div className="play-meta">
        <span>
          Petición {i + 1} de {rounds.length}
        </span>
        <span className="tabnum">Aciertos: {ok}</span>
      </div>
      <div className="meter" aria-hidden="true">
        <span style={{ width: `${(i / rounds.length) * 100}%` }} />
      </div>

      <h3 className="prompt">
        Toca <em>{r.ask}</em>
      </h3>

      <div className="request" role="group" aria-label="Petición HTTP">
        {r.tokens.map(([text, kind], idx) => {
          let state = ''
          if (answered) {
            state = `reveal k-${kind}`
            if (kind === r.answer) state += ' is-right'
            else if (idx === picked) state += ' is-wrong'
          }
          return (
            <button key={idx} type="button" className={`token ${state}`} onClick={() => pick(idx, kind)} disabled={answered}>
              {text}
            </button>
          )
        })}
      </div>

      {answered && (
        <>
          <ul className="legend">
            {usedKinds.map((k) => (
              <li key={k} className={`k-${k}`}>
                <i /> {KIND[k]}
              </li>
            ))}
          </ul>
          <div className={`feedback ${pickedRight ? 'good' : 'bad'}`} role="status">
            <strong>{pickedRight ? 'Correcto.' : `Era: ${KIND[r.answer].toLowerCase()}.`}</strong> {r.why}
          </div>
        </>
      )}

      <div className="play-actions">
        <button type="button" className="btn primary" onClick={next} disabled={!answered}>
          {isLast ? 'Ver resultado' : 'Siguiente'}
        </button>
      </div>
    </div>
  )
}
