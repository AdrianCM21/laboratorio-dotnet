import { useMemo, useState } from 'react'
import { shuffled } from './util.js'

/**
 * Completa el código: cada [[n]] del código es un desplegable.
 * Ronda: { file, code, blanks: [{ options, answer }], why }
 */
export default function Fill({ item, onFinish }) {
  const rounds = item.rounds
  const [i, setI] = useState(0)
  const [values, setValues] = useState({})
  const [checked, setChecked] = useState(false)
  const [right, setRight] = useState(0)

  const r = rounds[i]
  const options = useMemo(() => r.blanks.map((b) => shuffled(b.options)), [r])
  const parts = r.code.split(/\[\[(\d+)\]\]/g)
  const filled = r.blanks.every((_, n) => values[n])
  const roundRight = r.blanks.filter((b, n) => values[n] === b.answer).length
  const total = rounds.reduce((s, x) => s + x.blanks.length, 0)
  const isLast = i + 1 === rounds.length

  function check() {
    setChecked(true)
    setRight((v) => v + roundRight)
  }

  function next() {
    if (isLast) onFinish(Math.round((100 * right) / total))
    else {
      setI(i + 1)
      setValues({})
      setChecked(false)
    }
  }

  return (
    <div className="play">
      <div className="play-meta">
        <span>
          Fragmento {i + 1} de {rounds.length}
        </span>
        <span className="tabnum">
          Huecos correctos: {right} de {total}
        </span>
      </div>
      <div className="meter" aria-hidden="true">
        <span style={{ width: `${(i / rounds.length) * 100}%` }} />
      </div>

      <h3 className="prompt">{r.task || 'Completa los huecos.'}</h3>

      <figure className="code">
        <figcaption>
          <span>{r.file}</span>
        </figcaption>
        <pre className="fill-pre">
          <code>
            {parts.map((part, k) => {
              if (k % 2 === 0) return <span key={k}>{part}</span>
              const n = Number(part)
              const b = r.blanks[n]
              const state = checked ? (values[n] === b.answer ? 'is-right' : 'is-wrong') : ''
              return (
                <span key={k} className="blank-wrap">
                  <select
                    id={`fill-${item.id}-${i}-${n}`}
                    className={`blank ${state}`}
                    value={values[n] || ''}
                    disabled={checked}
                    aria-label={`Hueco ${n + 1}`}
                    onChange={(e) => setValues({ ...values, [n]: e.target.value })}
                  >
                    <option value="" disabled>
                      ▾ elegir
                    </option>
                    {options[n].map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                  {checked && values[n] !== b.answer && <span className="blank-answer">{b.answer}</span>}
                </span>
              )
            })}
          </code>
        </pre>
      </figure>

      {checked && (
        <div className={`feedback ${roundRight === r.blanks.length ? 'good' : 'bad'}`} role="status">
          <strong>
            {roundRight} de {r.blanks.length} correctos.
          </strong>{' '}
          {r.why}
        </div>
      )}

      <div className="play-actions">
        {checked ? (
          <button type="button" className="btn primary" onClick={next}>
            {isLast ? 'Ver resultado' : 'Siguiente'}
          </button>
        ) : (
          <button type="button" className="btn primary" onClick={check} disabled={!filled}>
            Comprobar
          </button>
        )}
      </div>
    </div>
  )
}
