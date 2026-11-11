// Rúbrica del proyecto final (archivo «Evaluacion Proyecto Final.xlsx» del bootcamp).
// `target` es una guía propia de esta app: qué mostrar para apuntar al máximo.

export const areas = [
  {
    id: 'api',
    title: 'API y Arquitectura',
    week: 'semana-2',
    criteria: [
      { id: 'rest', title: 'Diseño REST correcto', desc: 'Rutas semánticas, verbos HTTP adecuados, versionado', max: 6, target: 'Sustantivos en plural, verbos correctos, 201/204/404/409 bien usados, /api/v1/ en todas las rutas.' },
      { id: 'openapi', title: 'Contrato OpenAPI', desc: 'Swagger claro, responses definidos, status codes correctos', max: 5, target: 'Cada endpoint con ProducesResponseType de éxito y de error, comentarios XML y DTOs con nombres claros.' },
      { id: 'clean', title: 'Clean Architecture', desc: 'Separación por capas, responsabilidades claras', max: 7, target: 'Domain, Application, Infrastructure y Api con referencias hacia adentro; controllers delgados.' },
      { id: 'errores', title: 'Manejo de errores', desc: 'Errores controlados, sin leaks', max: 7, target: 'IExceptionHandler + ProblemDetails, 500 sin detalles internos, 409 para duplicados.' },
    ],
  },
  {
    id: 'docker',
    title: 'Docker',
    week: 'semana-4',
    criteria: [
      { id: 'dockerfile', title: 'Dockerfile correcto', desc: 'Multistage, imágenes livianas', max: 5, target: 'Multietapa, chiseled, .csproj antes del código, Release, USER $APP_UID, .dockerignore.' },
      { id: 'env', title: 'Variables de entorno', desc: 'Uso correcto (no hardcode)', max: 5, target: 'Ningún secreto en código, appsettings ni imagen; .env.example versionado.' },
      { id: 'local', title: 'Ejecución local', desc: 'Contenedor funcional y reproducible', max: 5, target: 'docker compose up -d --build levanta API, base y Seq sin pasos extra.' },
    ],
  },
  {
    id: 'k8s',
    title: 'Kubernetes + Helm',
    week: 'semana-4',
    criteria: [
      { id: 'manifiestos', title: 'Manifiestos Kubernetes', desc: 'Deployment, Service bien definidos', max: 7, target: 'Labels coherentes, 2+ réplicas, resources, readiness y liveness, targetPort 8080.' },
      { id: 'configsecrets', title: 'ConfigMaps & Secrets', desc: 'Uso correcto y externo a la app', max: 6, target: 'Configuración en ConfigMap, credenciales en Secret creado fuera del repo.' },
      { id: 'helm', title: 'Helm', desc: 'values.yaml, templates reutilizables', max: 6, target: 'Chart con _helpers.tpl, values por ambiente, checksum del ConfigMap; pasa helm lint.' },
      { id: 'deploy', title: 'Despliegue funcional', desc: 'Corre en Minikube sin errores', max: 6, target: 'Todos los Pods READY, la API responde por port-forward o minikube service.' },
    ],
  },
  {
    id: 'obs',
    title: 'Observabilidad',
    week: 'semana-5',
    criteria: [
      { id: 'serilog', title: 'Logging estructurado', desc: 'Serilog con propiedades', max: 6, target: 'Message templates en todo el código, request logging y enrichers.' },
      { id: 'seqk8s', title: 'Centralización de logs', desc: 'Seq en Kubernetes', max: 5, target: 'Seq instalado con Helm y persistencia; la API envía a http://seq:5341.' },
      { id: 'niveles', title: 'Métricas', desc: 'Uso correcto de tipos de log (Information/Warning/Error)', max: 5, target: 'Information para lo normal, Warning para lo anómalo, Error solo con excepción.' },
      { id: 'visual', title: 'Visualización', desc: 'Visualizar en Seq los logs', max: 4, target: 'Signals «Errores» y «Lentas» y un dashboard por StatusCode.' },
    ],
  },
  {
    id: 'cicd',
    title: 'CI/CD',
    week: 'semana-5',
    criteria: [
      { id: 'ci', title: 'Pipeline CI', desc: 'Restore/Build', max: 5, target: 'Workflow en verde con restore, build y test en cada push y PR.' },
      { id: 'cd', title: 'CD', desc: 'Deploy automatizado (local o simulado)', max: 5, target: 'kind + Helm --wait en el pipeline, o un deploy.sh documentado.' },
      { id: 'practicas', title: 'Buenas prácticas', desc: 'Versionado, repo limpio, README', max: 5, target: 'Tag v1.0.0, imágenes con SHA, commits claros, README completo.' },
    ],
  },
]

// Escala de notas del bootcamp
export const scale = [
  { min: 90, grade: 5, label: 'Dominio técnico y criterio profesional' },
  { min: 75, grade: 4, label: 'Sobresaliente' },
  { min: 60, grade: 3, label: 'Cumple lo esencial, base sólida' },
  { min: 40, grade: 2, label: 'Funciona, pero con falencias' },
  { min: 0, grade: 1, label: 'No cumple criterios mínimos' },
]

export const gradeFor = (total) => scale.find((s) => total >= s.min)
