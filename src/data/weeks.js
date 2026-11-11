import week1 from './week1/index.js'
import week2 from './week2/index.js'
import week3 from './week3/index.js'
import week4 from './week4/index.js'
import week5 from './week5/index.js'

// Las 5 semanas del bootcamp. Para agregar contenido a una semana,
// edita los archivos de su carpeta (lessons, games, tasks, quiz).
export const weeks = [
  {
    id: 'semana-1',
    number: 1,
    title: 'Fundamentos',
    summary: 'REST, HTTP, el ecosistema ASP.NET Core y tu primera API.',
    rubric: 'Base de «API y Arquitectura»',
    content: week1,
  },
  {
    id: 'semana-2',
    number: 2,
    title: 'APIs ASP.NET Core',
    summary: 'Diseño REST, DTOs, inyección de dependencias, Clean Architecture, errores y OpenAPI.',
    rubric: 'API y Arquitectura · 25 pts',
    content: week2,
  },
  {
    id: 'semana-3',
    number: 3,
    title: 'Base de datos',
    summary: 'EF Core con PostgreSQL: modelado, migraciones, consultas eficientes y configuración segura.',
    rubric: 'Sostiene API y Arquitectura · prepara Docker',
    content: week3,
  },
  {
    id: 'semana-4',
    number: 4,
    title: 'Docker y Kubernetes',
    summary: 'Imágenes livianas, Compose, Minikube, manifiestos, ConfigMaps, Secrets, probes y Helm.',
    rubric: 'Docker 15 pts · Kubernetes + Helm 25 pts',
    content: week4,
  },
  {
    id: 'semana-5',
    number: 5,
    title: 'Observabilidad y CI/CD',
    summary: 'Serilog, Seq en Kubernetes, GitHub Actions, despliegue automatizado y versionado.',
    rubric: 'Observabilidad 20 pts · CI/CD 15 pts',
    content: week5,
  },
]
