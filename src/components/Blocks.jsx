import { useState } from 'react'

/** Texto con `código` y **negrita**. */
export function Inline({ text }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((s, i) => {
        if (s.startsWith('`') && s.endsWith('`') && s.length > 1) return <code key={i}>{s.slice(1, -1)}</code>
        if (s.startsWith('**') && s.endsWith('**') && s.length > 3) return <strong key={i}>{s.slice(2, -2)}</strong>
        return <span key={i}>{s}</span>
      })}
    </>
  )
}

export function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* el portapapeles puede estar bloqueado: se puede seleccionar a mano */
    }
  }

  return (
    <figure className="code">
      <figcaption>
        <span>{lang || 'código'}</span>
        <button type="button" onClick={copy}>
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </figcaption>
      <pre>
        <code>{code}</code>
      </pre>
    </figure>
  )
}

/** Dibuja la lista de bloques de una lección o de una pista. */
export function Blocks({ blocks }) {
  return (
    <div className="blocks">
      {blocks.map((b, i) => {
        if (b.h) return <h3 key={i}>{b.h}</h3>
        if (b.p) return <p key={i}><Inline text={b.p} /></p>
        if (b.code) return <CodeBlock key={i} code={b.code} lang={b.lang} />
        if (b.note)
          return (
            <aside key={i} className="note">
              <Inline text={b.note} />
            </aside>
          )
        if (b.list)
          return (
            <ul key={i}>
              {b.list.map((li, k) => (
                <li key={k}><Inline text={li} /></li>
              ))}
            </ul>
          )
        if (b.table)
          return (
            <div key={i} className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {b.table.head.map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {b.table.rows.map((row, r) => (
                    <tr key={r}>
                      {row.map((cell, c) => (
                        <td key={c}><Inline text={cell} /></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        if (b.compare)
          return (
            <div key={i} className="compare">
              <div className="compare-side bad-side">
                <span className="badge bad">{b.compare.badLabel || 'Evitar'}</span>
                <CodeBlock code={b.compare.bad} lang={b.compare.lang} />
              </div>
              <div className="compare-side good-side">
                <span className="badge good">{b.compare.goodLabel || 'Mejor'}</span>
                <CodeBlock code={b.compare.good} lang={b.compare.lang} />
              </div>
            </div>
          )
        if (b.bars) {
          const max = Math.max(...b.bars.rows.map((r) => r[1]))
          return (
            <figure key={i} className="bars">
              {b.bars.title && <figcaption>{b.bars.title}</figcaption>}
              <ul>
                {b.bars.rows.map(([label, value, sub]) => (
                  <li key={label}>
                    <span className="bar-label">
                      <code>{label}</code>
                      {sub && <small>{sub}</small>}
                    </span>
                    <span className="bar-track">
                      <span className="bar-fill" style={{ width: `${(value / max) * 100}%` }} />
                    </span>
                    <span className="bar-value tabnum">
                      {value} {b.bars.unit}
                    </span>
                  </li>
                ))}
              </ul>
              {b.bars.note && <p className="bar-note">{b.bars.note}</p>}
            </figure>
          )
        }
        if (b.flow)
          return (
            <ol key={i} className="flow">
              {b.flow.map(([title, desc]) => (
                <li key={title}>
                  <strong>{title}</strong>
                  {desc && (
                    <span>
                      <Inline text={desc} />
                    </span>
                  )}
                </li>
              ))}
            </ol>
          )
        if (b.stack)
          return (
            <ol key={i} className="stack">
              {b.stack.map(([n, title, desc]) => (
                <li key={n} className={`layer l${n}`}>
                  <b className="tabnum">{n}</b>
                  <div>
                    <strong>{title}</strong>
                    <span><Inline text={desc} /></span>
                  </div>
                </li>
              ))}
            </ol>
          )
        return null
      })}
    </div>
  )
}
