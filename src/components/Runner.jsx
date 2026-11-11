import { useState } from 'react'
import Choice from '../games/Choice.jsx'
import UrlGame from '../games/UrlGame.jsx'
import Match from '../games/Match.jsx'
import Order from '../games/Order.jsx'
import Terminal from '../games/Terminal.jsx'
import BugHunt from '../games/BugHunt.jsx'
import Fill from '../games/Fill.jsx'
import Classify from '../games/Classify.jsx'
import { PASS } from '../hooks/useProgress.js'

const COMPONENTS = {
  choice: Choice,
  url: UrlGame,
  match: Match,
  order: Order,
  terminal: Terminal,
  bugfix: BugHunt,
  fill: Fill,
  classify: Classify,
}

export const GAME_KIND = {
  choice: 'Opción múltiple',
  url: 'Toca la parte',
  match: 'Unir',
  order: 'Ordenar',
  terminal: 'Consola',
  bugfix: 'Encuentra el error',
  fill: 'Completa el código',
  classify: 'Clasificar',
}

/** Ejecuta un juego (o el quiz) y muestra el resultado al terminar. */
export default function Runner({ item, group, onSave, onBack, best = 0 }) {
  const [attempt, setAttempt] = useState(0)
  const [score, setScore] = useState(null)

  const isQuiz = group === 'quiz'
  const Game = isQuiz ? Choice : COMPONENTS[item.type]

  function finish(pct) {
    onSave(group, item.id, pct)
    setScore(pct)
  }

  return (
    <section className="runner">
      <button type="button" className="back" onClick={onBack}>
        ← {isQuiz ? 'Volver' : 'Todos los juegos'}
      </button>
      <h2>{item.title}</h2>
      {item.description && <p className="lead">{item.description}</p>}

      {score === null ? (
        <Game key={attempt} item={item} shuffle={isQuiz} onFinish={finish} />
      ) : (
        <div className={`result ${score >= PASS ? 'good' : 'bad'}`} role="status">
          <p className="eyebrow">{score >= PASS ? 'Aprobado' : 'Todavía no'}</p>
          <p className="score tabnum">{score}%</p>
          <p>
            {score >= PASS
              ? 'Concepto dominado. Puedes repetirlo cuando quieras.'
              : `Necesitas ${PASS}% para aprobar. Repasa la lección y vuelve a intentarlo.`}
          </p>
          <p className="muted tabnum">Mejor puntaje: {Math.max(best, score)}%</p>
          <div className="play-actions">
            <button
              type="button"
              className="btn primary"
              onClick={() => {
                setScore(null)
                setAttempt(attempt + 1)
              }}
            >
              Jugar de nuevo
            </button>
            <button type="button" className="btn" onClick={onBack}>
              Volver
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
