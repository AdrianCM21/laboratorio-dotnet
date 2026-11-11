// Validación flexible de comandos para el juego de consola.
//
// Cada paso define `rules`:
//   - La primera regla es el comando base: la entrada debe empezar con él.
//   - Las demás reglas deben aparecer en cualquier orden.
// Una regla puede ser un string o { m, label }:
//   - `m` admite alternativas separadas por `|`.
//   - Si `m` empieza con `~`, toda la regla es una expresión regular sobre la entrada
//     (ahí `|` es la alternancia de la regex).
//   - Si no, debe aparecer como secuencia completa de palabras.
//   - `label` describe la parte para el mensaje de "falta ...".

export function normalize(text) {
  return text
    .trim()
    .replace(/^\$\s*/, '')
    .replace(/\s+/g, ' ')
}

function alternatives(rule) {
  const m = typeof rule === 'string' ? rule : rule.m
  // Una regla que empieza con ~ es una sola expresión regular (su | es alternancia de la regex)
  if (m.startsWith('~')) return [m]
  return m.split('|').map(normalize)
}

function matches(cmd, alt) {
  if (alt.startsWith('~')) return new RegExp(alt.slice(1)).test(cmd)
  return ` ${cmd} `.includes(` ${alt} `)
}

function startsWith(cmd, alt) {
  if (alt.startsWith('~')) return new RegExp(alt.slice(1)).test(cmd)
  return cmd === alt || cmd.startsWith(`${alt} `)
}

/**
 * @returns {{ ok: true } | { ok: false, reason: 'empty' | 'base' | 'missing', missing?: string[] }}
 */
export function checkCommand(input, step) {
  const cmd = normalize(input)
  if (!cmd) return { ok: false, reason: 'empty' }

  const [base, ...rest] = step.rules
  if (!alternatives(base).some((alt) => startsWith(cmd, alt))) return { ok: false, reason: 'base' }

  const missing = rest
    .filter((rule) => !alternatives(rule).some((alt) => matches(cmd, alt)))
    .map((rule) => (typeof rule === 'string' ? null : rule.label || null))

  if (missing.length === 0) return { ok: true }
  return { ok: false, reason: 'missing', missing }
}
