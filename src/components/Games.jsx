import { useState } from 'react'
import Runner, { GAME_KIND } from './Runner.jsx'
import { PASS } from '../hooks/useProgress.js'

export default function Games({ games, progress, onSave }) {
  const [openId, setOpenId] = useState(null)
  const open = games.find((g) => g.id === openId)

  if (open) {
    return (
      <Runner
        item={open}
        group="games"
        best={progress.games[open.id] || 0}
        onSave={onSave}
        onBack={() => setOpenId(null)}
      />
    )
  }

  return (
    <ul className="cards two">
      {games.map((g) => {
        const best = progress.games[g.id]
        const passed = (best || 0) >= PASS
        return (
          <li key={g.id}>
            <button type="button" className={`card tall ${passed ? 'is-done' : ''}`} onClick={() => setOpenId(g.id)}>
              <span className="card-body">
                <small className="tag">
                  {GAME_KIND[g.type]} · {g.concept}
                </small>
                <strong>{g.title}</strong>
                <small>{g.description}</small>
              </span>
              <span className="card-state tabnum">
                {best === undefined ? 'Sin jugar' : `Mejor: ${best}%${passed ? ' ✓' : ''}`}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
