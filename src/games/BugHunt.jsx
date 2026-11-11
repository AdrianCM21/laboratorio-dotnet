import { useState } from 'react'
import { CodeBlock } from '../components/Blocks.jsx'

/**
 * Encuentra el error: el estudiante toca la línea con el problema.
 * Ronda: { file, lang, code, bad (número de línea, desde 1), why, fix }
 */
export default function BugHunt({ item, onFinish }) {
  const rounds = item.rounds
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState(null)
  const [ok, setOk] = useState(0)

  const r = rounds[i]
  const lines = r.code.split('\n')
  const answered = picked !== null
  const right = picked === r.bad
  const isLast = i + 1 === rounds.length

  function pick(n) {
    if (answered) return
    setPicked(n)
    if (n === r.bad) setOk((v) => v + 1)
  }

  function next() {
    if (isLast) onFinish(Math.round((100 * ok) / rounds.length))
    else {
      setI(i + 1)
      setPicked(null)
    }
  }

  return (
    <div className="play">
      <div className="play-meta">
        <span>
          Archivo {i + 1} de {rounds.length}
        </span>
        <span className="tabnum">Aciertos: {ok}</span>
      </div>
      <div className="meter" aria-hidden="true">
        <span style={{ width: `${(i / rounds.length) * 100}%` }} />
      </div>

      <h3 className="prompt">{r.task || 'Toca la línea que tiene el problema.'}</h3>

      <figure className="code bug">
        <figcaption>
          <span>{r.file}</span>
        </figcaption>
        <div className="bug-lines" role="group" aria-label={`Líneas de ${r.file}`}>
          {lines.map((text, k) => {
            const n = k + 1
            let state = ''
            if (answered && n === r.bad) state = 'is-right'
            else if (answered && n === picked) state = 'is-wrong'
            return (
              <button key={k} type="button" className={`bug-line ${state}`} onClick={() => pick(n)} disabled={answered}>
                <span className="ln tabnum">{n}</span>
                <code>{text || ' '}</code>
              </button>
            )
          })}
        </div>
      </figure>

      {answered && (
        <>
          <div className={`feedback ${right ? 'good' : 'bad'}`} role="status">
            <strong>{right ? 'Bien visto.' : `El problema estaba en la línea ${r.bad}.`}</strong> {r.why}
          </div>
          {r.fix && <CodeBlock code={r.fix} lang="Corrección" />}
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
