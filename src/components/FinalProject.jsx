import { areas, scale, gradeFor } from '../data/rubric.js'
import { Inline } from './Blocks.jsx'

/** Autoevaluación del proyecto final con la rúbrica del bootcamp. */
export default function FinalProject({ progress, onSet, onGoWeek }) {
  const scores = progress.rubric || {}
  const value = (id) => scores[id] ?? 0
  const areaTotal = (a) => a.criteria.reduce((s, c) => s + value(c.id), 0)
  const areaMax = (a) => a.criteria.reduce((s, c) => s + c.max, 0)
  const total = areas.reduce((s, a) => s + areaTotal(a), 0)
  const grade = gradeFor(total)

  return (
    <div className="final">
      <section className="week-head">
        <div>
          <p className="eyebrow">Rúbrica oficial · 100 puntos</p>
          <h2 className="week-title">Proyecto final</h2>
          <p className="lead">
            Puntúa tu proyecto criterio por criterio. Sé estricto: lo que quede bajo es tu lista de pendientes.
          </p>
        </div>
        <div className="grade-box tabnum" aria-live="polite">
          <span className="grade-num">{grade.grade}</span>
          <span>
            <strong>{total} / 100</strong>
            <small>{grade.label}</small>
          </span>
        </div>
      </section>

      <ol className="scale" aria-label="Escala de notas">
        {[...scale].reverse().map((s, k, arr) => {
          const next = arr[k + 1]
          const range = next ? `${s.min}–${next.min - 1}` : `${s.min}–100`
          return (
            <li key={s.grade} className={s.grade === grade.grade ? 'is-current' : ''}>
              <b className="tabnum">{s.grade}</b>
              <span className="tabnum">{range}</span>
            </li>
          )
        })}
      </ol>

      <div className="areas">
        {areas.map((a) => {
          const t = areaTotal(a)
          const m = areaMax(a)
          return (
            <section key={a.id} className="area">
              <header className="area-head">
                <div>
                  <h3>{a.title}</h3>
                  <button type="button" className="link" onClick={() => onGoWeek(a.week)}>
                    Repasar en la semana {a.week.split('-')[1]}
                  </button>
                </div>
                <span className="area-score tabnum">
                  {t}
                  <small> / {m}</small>
                </span>
              </header>
              <div className="meter" aria-hidden="true">
                <span style={{ width: `${(t / m) * 100}%` }} />
              </div>

              <ul className="criteria">
                {a.criteria.map((c) => (
                  <li key={c.id}>
                    <div className="criterion-text">
                      <strong>{c.title}</strong>
                      <small>{c.desc}</small>
                      <p className="target">
                        <span className="target-label">Para el máximo:</span> <Inline text={c.target} />
                      </p>
                    </div>
                    <div className="points" role="radiogroup" aria-label={`Puntaje de ${c.title}`}>
                      {Array.from({ length: c.max + 1 }, (_, n) => (
                        <button
                          key={n}
                          type="button"
                          role="radio"
                          aria-checked={value(c.id) === n}
                          className={`pt tabnum ${value(c.id) === n ? 'is-on' : ''}`}
                          onClick={() => onSet('rubric', c.id, n)}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}
