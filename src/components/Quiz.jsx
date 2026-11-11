import { useState } from 'react'
import Runner from './Runner.jsx'
import { PASS } from '../hooks/useProgress.js'

export default function Quiz({ quiz, progress, onSave }) {
  const [running, setRunning] = useState(false)
  const best = progress.quiz[quiz.id]

  if (running) {
    return <Runner item={quiz} group="quiz" best={best || 0} onSave={onSave} onBack={() => setRunning(false)} />
  }

  const passed = (best || 0) >= PASS
  return (
    <div className="quiz-intro">
      <h2>{quiz.title}</h2>
      <p className="lead">{quiz.description}</p>
      <p className="tabnum">
        {best === undefined ? 'Aún no lo hiciste.' : `Mejor puntaje: ${best}%${passed ? ' · aprobado' : ''}`}
      </p>
      <p className="muted">Te recomendamos terminarlo después de las lecciones y los juegos.</p>
      <div className="play-actions">
        <button type="button" className="btn primary" onClick={() => setRunning(true)}>
          {best === undefined ? 'Empezar quiz' : 'Repetir quiz'}
        </button>
      </div>
    </div>
  )
}
