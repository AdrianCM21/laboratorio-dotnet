import { useMemo, useState } from 'react'
import { shuffled } from './util.js'

/** Une cada término de la izquierda con su significado de la derecha. */
export default function Match({ item, onFinish }) {
  const pairs = item.pairs
  const rights = useMemo(() => shuffled(pairs.map((p) => p[1])), [pairs])
  const [sel, setSel] = useState(null)
  const [done, setDone] = useState([]) // términos ya unidos
  const [mistakes, setMistakes] = useState(0)
  const [msg, setMsg] = useState('Elige un término y luego su significado.')

  const doneRights = done.map((t) => pairs.find((p) => p[0] === t)[1])

  function pickLeft(term) {
    if (done.includes(term)) return
    setSel(term)
    setMsg('Ahora elige su significado.')
  }

  function pickRight(text) {
    if (doneRights.includes(text)) return
    if (!sel) {
      setMsg('Primero elige un término de la izquierda.')
      return
    }
    const correct = pairs.find((p) => p[0] === sel)[1] === text
    if (correct) {
      const nextDone = [...done, sel]
      setDone(nextDone)
      setSel(null)
      setMsg('Correcto.')
      if (nextDone.length === pairs.length) onFinish(Math.max(0, 100 - 10 * mistakes))
    } else {
      setMistakes((m) => m + 1)
      setSel(null)
      setMsg('No coincide. Prueba de nuevo.')
    }
  }

  return (
    <div className="play">
      <div className="play-meta">
        <span>
          {done.length} de {pairs.length} unidos
        </span>
        <span className="tabnum">{mistakes} errores</span>
      </div>
      <div className="meter" aria-hidden="true">
        <span style={{ width: `${(done.length / pairs.length) * 100}%` }} />
      </div>

      <div className="match">
        <div className="match-col">
          {pairs.map(([term]) => (
            <button
              key={term}
              type="button"
              className={`option ${done.includes(term) ? 'is-right' : ''} ${sel === term ? 'is-picked' : ''}`}
              onClick={() => pickLeft(term)}
              disabled={done.includes(term)}
            >
              {term}
            </button>
          ))}
        </div>
        <div className="match-col">
          {rights.map((text) => (
            <button
              key={text}
              type="button"
              className={`option ${doneRights.includes(text) ? 'is-right' : ''}`}
              onClick={() => pickRight(text)}
              disabled={doneRights.includes(text)}
            >
              {text}
            </button>
          ))}
        </div>
      </div>

      <div className="feedback neutral" role="status">
        {msg}
      </div>
    </div>
  )
}
