# Laboratorio API .NET

App de estudio para el Bootcamp de APIs .NET Core (CLT, noviembre). Cubre las 5 semanas
del bootcamp con lecciones, juegos, tareas sobre tu proyecto y un quiz por semana, más
una autoevaluación con la rúbrica oficial del proyecto final.

| Semana | Tema | Rúbrica |
|---|---|---|
| 1 | Fundamentos: REST, HTTP, ASP.NET Core | Base de API y Arquitectura |
| 2 | APIs ASP.NET Core: DTOs, DI, Clean Architecture, errores, OpenAPI | API y Arquitectura · 25 |
| 3 | Base de datos: EF Core + PostgreSQL | Sostiene la API |
| 4 | Docker, Compose, Kubernetes (Minikube) y Helm | Docker 15 · K8s + Helm 25 |
| 5 | Serilog, Seq, GitHub Actions, CD y versionado | Observabilidad 20 · CI/CD 15 |

Además:

- **Comandos:** chuleta buscable generada desde todas las consolas.
- **Proyecto final:** autoevaluación de los 100 puntos con la escala de notas 1–5.

El avance se guarda en el navegador (localStorage).

## Usar

```bash
npm install
npm run dev        # http://localhost:5173
```

`SINGLE=1 npm run build` genera `dist/index.html` en un solo archivo.

## Tipos de juego

| type | Juego | Datos |
|---|---|---|
| `choice` | Opción múltiple | `rounds: [{ prompt, options, answer, why }]` |
| `url` | Toca la parte de la petición | `rounds: [{ ask, tokens: [[texto, tipo]], answer, why }]` |
| `match` | Unir | `pairs: [[término, definición]]` |
| `order` | Ordenar | `items: [...]` en el orden correcto |
| `terminal` | Consola: escribe el comando real | `steps: [{ goal, rules, answer, output, why, hint? }]` |
| `bugfix` | Encuentra la línea con el error | `rounds: [{ file, code, bad, why, fix }]` |
| `fill` | Completa el código | `rounds: [{ file, code con [[n]], blanks: [{ options, answer }], why }]` |
| `classify` | Clasificar en categorías | `buckets: [{ id, label }]`, `items: [{ text, bucket, why }]` |

### Reglas de la consola

`rules[0]` es el comando base (la entrada debe empezar con él). Las demás reglas deben
aparecer en cualquier orden. Alternativas con `|`; una regla que empieza con `~` es una
expresión regular. `label` es lo que se le dice al estudiante si falta esa parte.

```js
rules: [
  'docker run',
  { m: '-d|--detach', label: 'segundo plano (-d)' },
  { m: '-p 8080:8080|--publish 8080:8080', label: 'el puerto' },
  { m: '~ catalog-api:1\\.0$', label: 'la imagen al final' },
]
```

## Estructura

```
src/
  data/
    weeks.js             # las 5 semanas
    rubric.js            # rúbrica del proyecto final y escala de notas
    week1..week5/
      lessons.js         # bloques: p, h, list, code, note, table, stack, compare, bars, flow
      games.js
      tasks.js
      quiz.js
  games/                 # un componente por tipo de juego + terminalMatch.js
  components/            # lecciones, juegos, tareas, quiz, proyecto final, comandos
  hooks/useProgress.js   # progreso en localStorage
```

## Fuentes de datos técnicos

- Tamaños de imagen: reporte de tamaños de `dotnet/dotnet-docker` (.NET 10, noviembre 2025).
- Seq en Docker y Helm: documentación de Datalust y `helm.datalust.co`.
- Versiones de GitHub Actions: Marketplace (revisar la última versión mayor antes de usar).
