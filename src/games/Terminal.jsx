import { useEffect, useRef, useState } from 'react'
import { checkCommand, normalize } from './terminalMatch.js'

const DEFAULT_PROMPT = 'adrian@lab:~/catalog$'

/**
 * Consola simulada: el estudiante escribe el comando real para cumplir cada objetivo.
 * Paso: { goal, rules, answer, output?, why, hint?, prompt? }
 */
export default function Terminal({ item, onFinish }) {
  const steps = item.steps
  const [i, setI] = useState(0)
  const [lines, setLines] = useState(() => [
    { t: 'info', text: `Misión: ${item.title}. Escribe el comando y presiona Enter. «ayuda» repite el objetivo, «clear» limpia la pantalla.` },
  ])
  const [value, setValue] = useState('')
  const [history, setHistory] = useState([])
  const [hIdx, setHIdx] = useState(-1)
  const [revealed, setRevealed] = useState([]) // pasos donde se vio la solución
  const [hintShown, setHintShown] = useState(false)
  const [finished, setFinished] = useState(false)
  const screenRef = useRef(null)
  const inputRef = useRef(null)

  const step = steps[i]
  const prompt = (step && step.prompt) || DEFAULT_PROMPT

  useEffect(() => {
    const el = screenRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true })
  }, [i])

  function print(...entries) {
    setLines((prev) => [...prev, ...entries])
  }

  function advance() {
    setHintShown(false)
    if (i + 1 === steps.length) {
      setFinished(true)
      print({ t: 'ok', text: '✔ Misión completa.' })
    } else {
      setI(i + 1)
    }
  }

  function submit(e) {
    e.preventDefault()
    if (finished) return
    const raw = value
    setValue('')
    setHIdx(-1)
    const cmd = normalize(raw)
    if (cmd) setHistory((h) => [cmd, ...h].slice(0, 50))

    if (cmd === 'clear') {
      setLines([])
      return
    }
    if (cmd === 'ayuda' || cmd === 'help') {
      print({ t: 'in', prompt, text: cmd }, { t: 'info', text: `Objetivo: ${step.goal}` })
      return
    }

    const res = checkCommand(raw, step)
    if (res.reason === 'empty') {
      print({ t: 'in', prompt, text: '' })
      return
    }

    if (res.ok) {
      const out = [{ t: 'in', prompt, text: cmd }]
      if (step.output) out.push({ t: 'out', text: step.output })
      out.push({ t: 'ok', text: `✔ ${step.why}` })
      print(...out)
      advance()
      return
    }

    let msg
    if (res.reason === 'base') {
      msg = 'Ese no es el comando que necesitas aquí. Revisa la herramienta y la acción.'
    } else {
      const named = res.missing.filter(Boolean)
      if (named.length === res.missing.length && named.length > 0) msg = `El comando va bien, pero falta: ${named.join(', ')}.`
      else msg = `El comando va bien, pero le faltan ${res.missing.length} parte(s) o alguna está mal escrita.`
    }
    print({ t: 'in', prompt, text: cmd }, { t: 'err', text: msg })
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const n = Math.min(hIdx + 1, history.length - 1)
      if (n >= 0) {
        setHIdx(n)
        setValue(history[n])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const n = hIdx - 1
      setHIdx(Math.max(n, -1))
      setValue(n >= 0 ? history[n] : '')
    }
  }

  function showHint() {
    setHintShown(true)
    print({ t: 'info', text: `Pista: ${step.hint || 'Revisa la lección: el comando aparece explicado ahí.'}` })
    inputRef.current?.focus({ preventScroll: true })
  }

  function reveal() {
    if (!revealed.includes(i)) setRevealed([...revealed, i])
    print({ t: 'info', text: `Solución: ${step.answer}` }, { t: 'info', text: 'Escríbelo para seguir. Este paso no suma puntos.' })
    inputRef.current?.focus({ preventScroll: true })
  }

  const solved = finished ? steps.length : i
  const score = Math.round((100 * (steps.length - revealed.length)) / steps.length)

  return (
    <div className="play">
      <div className="play-meta">
        <span>
          Paso {Math.min(i + 1, steps.length)} de {steps.length}
        </span>
        <span className="tabnum">Soluciones vistas: {revealed.length}</span>
      </div>
      <div className="meter" aria-hidden="true">
        <span style={{ width: `${(solved / steps.length) * 100}%` }} />
      </div>

      {!finished && (
        <div className="goal">
          <span className="eyebrow">Objetivo</span>
          <p>{step.goal}</p>
        </div>
      )}

      <div className="term" onClick={() => inputRef.current?.focus({ preventScroll: true })}>
        <div className="term-bar" aria-hidden="true">
          <i />
          <i />
          <i />
          <span>bash</span>
        </div>
        <div className="term-screen" ref={screenRef} aria-live="polite">
          {lines.map((l, k) =>
            l.t === 'in' ? (
              <div key={k} className="term-line">
                <span className="term-prompt">{l.prompt}</span> {l.text}
              </div>
            ) : (
              <div key={k} className={`term-line t-${l.t}`}>
                {l.text}
              </div>
            ),
          )}
          {!finished && (
            <form className="term-input" onSubmit={submit}>
              <label htmlFor={`term-${item.id}`} className="term-prompt">
                {prompt}
              </label>
              <input
                id={`term-${item.id}`}
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={onKeyDown}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck="false"
                aria-label="Comando"
              />
            </form>
          )}
        </div>
      </div>

      <div className="play-actions">
        {finished ? (
          <button type="button" className="btn primary" onClick={() => onFinish(score)}>
            Ver resultado
          </button>
        ) : (
          <>
            <button type="button" className="btn" onClick={showHint} disabled={hintShown}>
              Pista
            </button>
            <button type="button" className="btn" onClick={reveal}>
              Ver solución
            </button>
          </>
        )}
      </div>
    </div>
  )
}
