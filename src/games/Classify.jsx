import { useMemo, useState } from 'react'
import { shuffled } from './util.js'

/**
 * Clasificar: cada elemento va a una categoría.
 * { buckets: [{ id, label, desc? }], items: [{ text, bucket, why, code? }] }
 */
export default function Classify({ item, onFinish }) {
  const items = useMemo(() => shuffled(item.items), [item])
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState(null)
  const [ok, setOk] = useState(0)
  const [placed, setPlaced] = useState([]) // { text, bucket, right }

  const cur = items[i]
  const answered = picked !== null
  const isLast = i + 1 === items.length

  function pick(bucketId) {
    if (answered) return
    setPicked(bucketId)
    const right = bucketId === cur.bucket
    if (right) setOk((v) => v + 1)
    setPlaced((p) => [...p, { text: cur.text, bucket: cur.bucket, right }])
  }

  function next() {
    if (isLast) onFinish(Math.round((100 * ok) / items.length))
    else {
      setI(i + 1)
      setPicked(null)
    }
  }

  const bucketLabel = (id) => item.buckets.find((b) => b.id === id).label

  return (
    <div className="play">
      <div className="play-meta">
        <span>
          Elemento {i + 1} de {items.length}
        </span>
        <span className="tabnum">Aciertos: {ok}</span>
      </div>
      <div className="meter" aria-hidden="true">
        <span style={{ width: `${(i / items.length) * 100}%` }} />
      </div>

      <div className="classify-item">
        <span className="eyebrow">{item.question || '¿Dónde va?'}</span>
        {cur.code ? <code className="classify-code">{cur.text}</code> : <p>{cur.text}</p>}
      </div>

      <div className="buckets" role="group" aria-label="Categorías">
        {item.buckets.map((b) => {
          let state = ''
          if (answered && b.id === cur.bucket) state = 'is-right'
          else if (answered && b.id === picked) state = 'is-wrong'
          return (
            <button key={b.id} type="button" className={`bucket ${state}`} onClick={() => pick(b.id)} disabled={answered}>
              <strong>{b.label}</strong>
              {b.desc && <small>{b.desc}</small>}
            </button>
          )
        })}
      </div>

      {answered && (
        <div className={`feedback ${picked === cur.bucket ? 'good' : 'bad'}`} role="status">
          <strong>{picked === cur.bucket ? 'Correcto.' : `Va en ${bucketLabel(cur.bucket)}.`}</strong> {cur.why}
        </div>
      )}

      <div className="play-actions">
        <button type="button" className="btn primary" onClick={next} disabled={!answered}>
          {isLast ? 'Ver resultado' : 'Siguiente'}
        </button>
      </div>

      {placed.length > 0 && (
        <div className="sorted">
          {item.buckets.map((b) => (
            <div key={b.id} className="sorted-col">
              <span className="eyebrow">{b.label}</span>
              {placed
                .filter((p) => p.bucket === b.id)
                .map((p) => (
                  <span key={p.text} className={`chip ${p.right ? '' : 'is-missed'}`}>
                    {p.text}
                  </span>
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
