import { useState } from 'react'
import { shuffledDifferent } from './util.js'

/** Arma el orden correcto tocando los elementos uno por uno. */
export default function Order({ item, onFinish }) {
  const correct = item.items
  const [pool, setPool] = useState(() => shuffledDifferent(correct))
  const [seq, setSeq] = useState([])
  const [attempts, setAttempts] = useState(0)
  const [result, setResult] = useState(null) // arreglo de booleanos tras comprobar

  const full = seq.length === correct.length

  function add(x) {
    if (result) return
    setSeq([...seq, x])
    setPool(pool.filter((p) => p !== x))
  }

  function remove(idx) {
    if (result) return
    const x = seq[idx]
    setSeq(seq.filter((_, k) => k !== idx))
    setPool([...pool, x])
  }

  function check() {
    const marks = seq.map((x, k) => x === correct[k])
    const n = attempts + 1
    setAttempts(n)
    if (marks.every(Boolean)) {
      onFinish(Math.max(50, 100 - 10 * (n - 1)))
    } else {
      setResult(marks)
    }
  }

  function retry() {
    setPool(shuffledDifferent(correct))
    setSeq([])
    setResult(null)
  }

  return (
    <div className="play">
      <div className="play-meta">
        <span>
          {seq.length} de {correct.length} colocados
        </span>
        <span className="tabnum">{attempts} intentos</span>
      </div>

      <h3 className="prompt">Tu orden</h3>
      <ol className="slots">
        {correct.map((_, k) => {
          const x = seq[k]
          const cls = result ? (result[k] ? 'is-right' : 'is-wrong') : x ? 'is-filled' : ''
          return (
            <li key={k} className={`slot ${cls}`}>
              <b className="tabnum">{k + 1}</b>
              {x ? (
                <button type="button" className="slot-btn" onClick={() => remove(k)} disabled={!!result}>
                  {x}
                </button>
              ) : (
                <span className="slot-empty">Vacío</span>
              )}
            </li>
          )
        })}
      </ol>

      {pool.length > 0 && (
        <>
          <h3 className="prompt small">Elementos</h3>
          <div className="pool">
            {pool.map((x) => (
              <button key={x} type="button" className="option" onClick={() => add(x)}>
                {x}
              </button>
            ))}
          </div>
        </>
      )}

      {result && (
        <div className="feedback bad" role="status">
          <strong>Casi.</strong> Los marcados en rojo están en la posición equivocada.
        </div>
      )}

      <div className="play-actions">
        {result ? (
          <button type="button" className="btn primary" onClick={retry}>
            Intentar de nuevo
          </button>
        ) : (
          <button type="button" className="btn primary" onClick={check} disabled={!full}>
            Comprobar
          </button>
        )}
      </div>
    </div>
  )
}
