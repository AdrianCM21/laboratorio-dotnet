import { useMemo, useState } from 'react'
import { weeks } from '../data/weeks.js'
import { CodeBlock } from './Blocks.jsx'

const TOOL_ORDER = ['dotnet', 'git', 'gh', 'curl', 'docker', 'minikube', 'kubectl', 'helm', 'psql']
const TOOL_LABEL = {
  dotnet: 'CLI de .NET',
  git: 'Git',
  gh: 'GitHub CLI',
  curl: 'curl',
  docker: 'Docker y Compose',
  minikube: 'Minikube',
  kubectl: 'kubectl',
  helm: 'Helm',
  psql: 'psql (dentro de PostgreSQL)',
}

function toolOf(cmd) {
  if (cmd.startsWith('\\') || /^select /i.test(cmd)) return 'psql'
  return cmd.split(' ')[0]
}

/** Chuleta de comandos, generada a partir de todas las consolas de la app. */
export default function Commands({ onGoWeek }) {
  const [q, setQ] = useState('')

  const all = useMemo(() => {
    const seen = new Set()
    const list = []
    for (const w of weeks) {
      for (const g of w.content?.games || []) {
        if (g.type !== 'terminal') continue
        for (const s of g.steps) {
          if (seen.has(s.answer)) continue
          seen.add(s.answer)
          const tool = toolOf(s.answer)
          if (!TOOL_ORDER.includes(tool)) continue
          list.push({ cmd: s.answer, goal: s.goal, why: s.why, tool, week: w })
        }
      }
    }
    return list
  }, [])

  const term = q.trim().toLowerCase()
  const shown = term
    ? all.filter((c) => `${c.cmd} ${c.goal} ${c.why}`.toLowerCase().includes(term))
    : all

  return (
    <div className="commands">
      <section className="week-head">
        <div>
          <p className="eyebrow">{all.length} comandos de las consolas</p>
          <h2 className="week-title">Comandos</h2>
          <p className="lead">Todo lo que practicaste en las consolas, agrupado por herramienta y con su explicación.</p>
        </div>
      </section>

      <label className="search" htmlFor="cmd-search">
        <span className="eyebrow">Buscar</span>
        <input
          id="cmd-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="rollout, secret, migrations, logs…"
          autoComplete="off"
        />
      </label>

      {shown.length === 0 && <p className="muted">No hay comandos que coincidan con «{q}».</p>}

      {TOOL_ORDER.map((tool) => {
        const items = shown.filter((c) => c.tool === tool)
        if (items.length === 0) return null
        return (
          <section key={tool} className="tool">
            <h3>
              {TOOL_LABEL[tool]} <small className="tabnum">{items.length}</small>
            </h3>
            <ul className="cmd-list">
              {items.map((c) => (
                <li key={c.cmd}>
                  <CodeBlock code={c.cmd} lang={tool === 'psql' ? 'psql' : 'bash'} />
                  <p>
                    <strong>{c.goal}</strong> {c.why}
                  </p>
                  <button type="button" className="link small" onClick={() => onGoWeek(c.week.id)}>
                    Semana {c.week.number} · {c.week.title}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
