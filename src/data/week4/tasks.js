export const tasks = [
  {
    id: 'w4-dockerignore',
    title: 'Crea el .dockerignore',
    detail: 'Excluye `bin/`, `obj/`, `.git/`, `.env` y los archivos del IDE.',
  },
  {
    id: 'w4-dockerfile',
    title: 'Escribe el Dockerfile multietapa',
    detail: 'SDK para compilar, `aspnet:10.0-noble-chiseled` para ejecutar, `.csproj` antes del código, `-c Release` y `USER $APP_UID`.',
  },
  {
    id: 'w4-peso',
    title: 'Mide el peso con dos bases distintas',
    detail: 'Construye con `aspnet:10.0` y con la chiseled. Anota ambos tamaños en el README: es evidencia para la rúbrica.',
    hint: [{ code: 'docker build -t catalog-api:full --build-arg BASE=aspnet:10.0 .\ndocker build -t catalog-api:1.0 .\ndocker images catalog-api', lang: 'bash' }, { p: 'Para el primer build, declara `ARG BASE=aspnet:10.0-noble-chiseled` antes del primer `FROM` y usa `FROM mcr.microsoft.com/dotnet/${BASE} AS final`.' }],
  },
  {
    id: 'w4-run',
    title: 'Ejecuta el contenedor con variables de entorno',
    detail: 'Sin valores fijos en el código ni en la imagen. Prueba `/health/live` y `/scalar`.',
  },
  {
    id: 'w4-compose',
    title: 'Crea compose.yaml con api, db y seq',
    detail: '`depends_on` con `service_healthy`, `restart: unless-stopped`, volúmenes con nombre y `.env` (con `.env.example` versionado).',
  },
  {
    id: 'w4-compose-up',
    title: 'Clona tu repo en otra carpeta y levántalo con un comando',
    detail: '`docker compose up -d --build` debe bastar. Si necesitas un paso extra, documéntalo en el README.',
  },
  {
    id: 'w4-minikube',
    title: 'Instala Minikube y carga tu imagen',
    detail: '`minikube start` y `minikube image load catalog-api:1.0`.',
  },
  {
    id: 'w4-postgres-k8s',
    title: 'Despliega PostgreSQL en el clúster',
    detail: 'Un Deployment de 1 réplica con un PersistentVolumeClaim y un Service `ClusterIP` llamado `postgres`. La contraseña sale de un Secret.',
  },
  {
    id: 'w4-manifiestos',
    title: 'Escribe los manifiestos de la API en k8s/',
    detail: 'Deployment (2 réplicas, resources, readiness y liveness), Service y ConfigMap. El Secret se crea por comando.',
  },
  {
    id: 'w4-autocuracion',
    title: 'Comprueba la auto-reparación',
    detail: 'Borra un Pod y mira cómo se crea otro. Escala a 3 y vuelve a 2.',
    hint: [{ code: 'kubectl get pods -w            # en una terminal: mira en vivo\nkubectl delete pod <pod>       # en otra: borra uno', lang: 'bash' }],
  },
  {
    id: 'w4-rollout',
    title: 'Haz un rolling update y un rollback',
    detail: 'Publica una versión 1.1, despliégala y revierte con `kubectl rollout undo`.',
  },
  {
    id: 'w4-helm',
    title: 'Convierte los manifiestos en un chart de Helm',
    detail: '`charts/catalog` con `values.yaml`, `values-dev.yaml`, `_helpers.tpl` y el checksum del ConfigMap. Pasa `helm lint`.',
  },
  {
    id: 'w4-helm-deploy',
    title: 'Despliega con Helm y prueba el rollback',
    detail: '`helm upgrade --install`, cambia `image.tag` con `--set`, revisa `helm history` y vuelve con `helm rollback`.',
  },
  {
    id: 'w4-commit',
    title: 'Commit de la semana 4',
    detail: 'Dockerfile, .dockerignore, compose.yaml, .env.example, k8s/ y charts/. Revisa que `.env` no esté en el commit.',
    hint: [{ code: 'git status --ignored    # confirma que .env aparece como ignorado\ngit add .\ngit commit -m "feat: contenedores, manifiestos de Kubernetes y chart de Helm"', lang: 'bash' }],
  },
]
