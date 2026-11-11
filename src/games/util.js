export function shuffled(list) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Mezcla garantizando que el resultado no quede igual al original. */
export function shuffledDifferent(list) {
  if (list.length < 2) return [...list]
  let a = shuffled(list)
  while (a.every((x, i) => x === list[i])) a = shuffled(list)
  return a
}
