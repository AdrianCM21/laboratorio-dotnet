import { useCallback, useEffect, useState } from 'react'

const KEY = 'dotnet-lab-progress-v1'
const EMPTY = { lessons: {}, games: {}, tasks: {}, quiz: {}, rubric: {} }
export const PASS = 80 // % mínimo para dar un juego o quiz por aprobado

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY
  } catch {
    return EMPTY
  }
}

/** Progreso del estudiante, guardado en el navegador. */
export function useProgress() {
  const [progress, setProgress] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(progress))
    } catch {
      /* sin almacenamiento: la app sigue funcionando en memoria */
    }
  }, [progress])

  const toggle = useCallback((group, id) => {
    setProgress((p) => ({ ...p, [group]: { ...p[group], [id]: !p[group][id] } }))
  }, [])

  const markDone = useCallback((group, id) => {
    setProgress((p) => ({ ...p, [group]: { ...p[group], [id]: true } }))
  }, [])

  // Guarda solo el mejor puntaje (0-100)
  const saveScore = useCallback((group, id, pct) => {
    setProgress((p) => ({
      ...p,
      [group]: { ...p[group], [id]: Math.max(p[group][id] || 0, pct) },
    }))
  }, [])

  // Valor libre (por ejemplo, el puntaje de autoevaluación de un criterio)
  const setValue = useCallback((group, id, value) => {
    setProgress((p) => ({ ...p, [group]: { ...p[group], [id]: value } }))
  }, [])

  const reset = useCallback(() => setProgress(EMPTY), [])

  return { progress, toggle, markDone, saveScore, setValue, reset }
}

/** Resumen de avance de una semana: cuántos ítems hay y cuántos están completos. */
export function weekStats(week, progress) {
  if (!week.content) return { done: 0, total: 0, pct: 0 }
  const { lessons, games, tasks, quiz } = week.content
  const done =
    lessons.filter((l) => progress.lessons[l.id]).length +
    games.filter((g) => (progress.games[g.id] || 0) >= PASS).length +
    tasks.filter((t) => progress.tasks[t.id]).length +
    ((progress.quiz[quiz.id] || 0) >= PASS ? 1 : 0)
  const total = lessons.length + games.length + tasks.length + 1
  return { done, total, pct: Math.round((done / total) * 100) }
}
