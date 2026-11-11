// Juegos de la semana 4

const DEPLOY = { m: '~(deployment|deploy|deployments)[/ ]catalog-api', label: 'el deployment catalog-api' }

export const games = [
  {
    id: 'w4-consola-docker',
    type: 'terminal',
    title: 'Consola: Docker paso a paso',
    description: 'Construye, ejecuta, inspecciona y limpia tu imagen.',
    concept: 'Docker CLI',
    steps: [
      {
        goal: 'Construye la imagen del Dockerfile de esta carpeta con la etiqueta catalog-api:1.0.',
        rules: ['docker build|docker buildx build', { m: '-t catalog-api:1.0|--tag catalog-api:1.0', label: 'la etiqueta con -t' }, { m: '~ \\.$|\\. ', label: 'el contexto (el punto final)' }],
        answer: 'docker build -t catalog-api:1.0 .',
        output: '[+] Building 41.2s (17/17) FINISHED\n => [build 4/8] RUN dotnet restore "src/Catalog.Api/Catalog.Api.csproj"   18.3s\n => [build 8/8] RUN dotnet publish ...                                     14.9s\n => [final 3/3] COPY --from=build /app/publish .                            0.2s\n => naming to docker.io/library/catalog-api:1.0',
        why: 'El punto final es el contexto: la carpeta que se envía al motor (filtrada por .dockerignore).',
        hint: 'docker build -t <nombre:versión> <contexto>',
      },
      {
        goal: 'Cambias un .cs y vuelves a construir la misma etiqueta. Hazlo.',
        rules: ['docker build|docker buildx build', { m: '-t catalog-api:1.0|--tag catalog-api:1.0', label: 'la etiqueta' }, { m: '~ \\.$|\\. ', label: 'el contexto' }],
        answer: 'docker build -t catalog-api:1.0 .',
        output: '[+] Building 16.8s (17/17) FINISHED\n => CACHED [build 4/8] RUN dotnet restore "src/Catalog.Api/Catalog.Api.csproj"\n => [build 8/8] RUN dotnet publish ...                                     14.1s',
        why: 'Fíjate en CACHED: como copiaste los .csproj antes del código, el restore se reutilizó. Tardó 16 s en vez de 41 s.',
      },
      {
        goal: 'Lista las imágenes del repositorio catalog-api para ver su tamaño.',
        rules: ['docker images|docker image ls', { m: 'catalog-api', label: 'el nombre del repositorio' }],
        answer: 'docker images catalog-api',
        output: 'REPOSITORY    TAG   IMAGE ID       CREATED          SIZE\ncatalog-api   1.0   9b1d2e3f4a5b   10 seconds ago   126MB',
        why: 'SIZE es el tamaño descomprimido en disco. Compáralo con una versión basada en aspnet:10.0 completa.',
      },
      {
        goal: 'Ejecuta la imagen en segundo plano: nombre catalog-api, puerto 8080:8080 y ASPNETCORE_ENVIRONMENT=Development.',
        rules: [
          'docker run',
          { m: '-d|--detach', label: 'segundo plano (-d)' },
          { m: '--name catalog-api|--name=catalog-api', label: 'el nombre (--name)' },
          { m: '-p 8080:8080|--publish 8080:8080', label: 'el puerto (-p 8080:8080)' },
          { m: '-e ASPNETCORE_ENVIRONMENT=Development|--env ASPNETCORE_ENVIRONMENT=Development', label: 'la variable de entorno (-e)' },
          { m: '~ catalog-api:1\\.0$', label: 'la imagen catalog-api:1.0 al final' },
        ],
        answer: 'docker run -d --name catalog-api -p 8080:8080 -e ASPNETCORE_ENVIRONMENT=Development catalog-api:1.0',
        output: 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f9',
        why: '-p puerto_del_host:puerto_del_contenedor. La imagen siempre va al final; lo que va después son argumentos para la app.',
        hint: 'docker run -d --name ... -p ... -e ... <imagen>',
      },
      {
        goal: 'Comprueba que el contenedor está corriendo.',
        rules: ['docker ps|docker container ls'],
        answer: 'docker ps',
        output: 'CONTAINER ID   IMAGE             STATUS         PORTS                    NAMES\na1b2c3d4e5f6   catalog-api:1.0   Up 8 seconds   0.0.0.0:8080->8080/tcp   catalog-api',
        why: 'Si no aparece, usa docker ps -a: muestra también los contenedores que terminaron.',
      },
      {
        goal: 'Sigue los logs del contenedor en vivo.',
        rules: ['docker logs|docker container logs', { m: '-f|--follow', label: 'la opción para seguir (-f)' }, { m: 'catalog-api', label: 'el nombre del contenedor' }],
        answer: 'docker logs -f catalog-api',
        output: 'info: Microsoft.Hosting.Lifetime[14]\n      Now listening on: http://[::]:8080\ninfo: Microsoft.Hosting.Lifetime[0]\n      Hosting environment: Development',
        why: 'La app escribe a stdout y Docker lo guarda. «Now listening on [::]:8080» confirma el puerto por defecto de .NET 8+.',
      },
      {
        goal: 'Pide el health check de liveness en http://localhost:8080/health/live.',
        rules: ['curl', { m: '~localhost:8080/health/live', label: 'la URL' }],
        answer: 'curl http://localhost:8080/health/live',
        output: 'Healthy',
        why: 'Desde tu máquina usas el puerto publicado por -p.',
      },
      {
        goal: 'Muestra el historial de capas de la imagen y su tamaño.',
        rules: ['docker history|docker image history', { m: 'catalog-api:1.0', label: 'la imagen' }],
        answer: 'docker history catalog-api:1.0',
        output: 'IMAGE          CREATED BY                                      SIZE\n9b1d2e3f4a5b   ENTRYPOINT ["dotnet" "Catalog.Api.dll"]         0B\n<missing>      USER 1654                                       0B\n<missing>      COPY /app/publish . # buildkit                  4.1MB\n<missing>      WORKDIR /app                                    0B\n<missing>      ... capas de aspnet:10.0-noble-chiseled ...     122MB',
        why: 'Tu app pesa 4 MB; el resto es la base. Por eso elegir la base es lo que más impacta el peso.',
      },
      {
        goal: 'Detén el contenedor.',
        rules: ['docker stop|docker container stop', { m: 'catalog-api', label: 'el nombre' }],
        answer: 'docker stop catalog-api',
        output: 'catalog-api',
        why: 'stop envía SIGTERM y espera a que la app cierre ordenadamente (10 s por defecto).',
      },
      {
        goal: 'Elimina el contenedor detenido.',
        rules: ['docker rm|docker container rm', { m: 'catalog-api', label: 'el nombre' }],
        answer: 'docker rm catalog-api',
        output: 'catalog-api',
        why: 'La imagen sigue existiendo; solo borraste esta instancia. Puedes crear otra con docker run.',
      },
    ],
  },
  {
    id: 'w4-orden-dockerfile',
    type: 'order',
    title: 'Arma el Dockerfile óptimo',
    description: 'Ordena las instrucciones para aprovechar el caché y dejar una imagen final liviana.',
    concept: 'Dockerfile multietapa',
    items: [
      'FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build',
      'COPY *.csproj de cada proyecto',
      'RUN dotnet restore',
      'COPY . .',
      'RUN dotnet publish -c Release -o /app/publish',
      'FROM mcr.microsoft.com/dotnet/aspnet:10.0-noble-chiseled',
      'COPY --from=build /app/publish .',
      'USER $APP_UID',
      'ENTRYPOINT ["dotnet", "Catalog.Api.dll"]',
    ],
  },
  {
    id: 'w4-bugs-dockerfile',
    type: 'bugfix',
    title: 'Encuentra el error: Dockerfile',
    description: 'Cada Dockerfile funciona, pero rompe una buena práctica que te quita puntos.',
    concept: 'Buenas prácticas Docker',
    rounds: [
      {
        file: 'Dockerfile',
        code: `FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish src/Catalog.Api/Catalog.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Catalog.Api.dll"]`,
        bad: 6,
        why: 'La etapa final usa el SDK: la imagen lleva compilador y herramientas que no necesita. Pesa varias veces más y expone más vulnerabilidades.',
        fix: 'FROM mcr.microsoft.com/dotnet/aspnet:10.0-noble-chiseled AS final',
      },
      {
        file: 'Dockerfile',
        code: `FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore src/Catalog.Api/Catalog.Api.csproj
RUN dotnet publish src/Catalog.Api/Catalog.Api.csproj -c Release -o /app/publish --no-restore`,
        bad: 3,
        why: 'Copiar todo antes del restore invalida el caché: cada cambio en un .cs vuelve a descargar todos los paquetes NuGet.',
        fix: 'COPY ["src/Catalog.Api/Catalog.Api.csproj", "src/Catalog.Api/"]\n# ...los demás .csproj\nRUN dotnet restore src/Catalog.Api/Catalog.Api.csproj\nCOPY . .',
      },
      {
        file: 'Dockerfile',
        code: `FROM mcr.microsoft.com/dotnet/aspnet:10.0-noble-chiseled AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ConnectionStrings__Default="Host=db;Database=catalog;Username=postgres;Password=Sup3rS3cret"
USER $APP_UID
ENTRYPOINT ["dotnet", "Catalog.Api.dll"]`,
        bad: 5,
        why: 'La contraseña queda grabada en una capa de la imagen: cualquiera que la descargue la ve con docker inspect o docker history.',
        fix: '# Se quita del Dockerfile y se inyecta al ejecutar:\n# docker run -e ConnectionStrings__Default=... | compose .env | Secret de Kubernetes',
      },
      {
        file: 'Dockerfile',
        code: `FROM mcr.microsoft.com/dotnet/sdk:latest AS build
WORKDIR /src
COPY ["src/Catalog.Api/Catalog.Api.csproj", "src/Catalog.Api/"]
RUN dotnet restore "src/Catalog.Api/Catalog.Api.csproj"`,
        bad: 1,
        why: 'latest cambia sin aviso: el día que salga .NET 11, tu build cambia de SDK solo y puede romperse.',
        fix: 'FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build',
      },
      {
        file: 'Dockerfile',
        code: `FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish src/Catalog.Api/Catalog.Api.csproj -c Debug -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0-noble-chiseled
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Catalog.Api.dll"]`,
        bad: 4,
        why: 'Una imagen de producción compilada en Debug: sin optimizaciones y con información de depuración.',
        fix: 'RUN dotnet publish src/Catalog.Api/Catalog.Api.csproj -c Release -o /app/publish',
      },
      {
        file: 'Dockerfile',
        code: `FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
USER root
EXPOSE 8080
ENTRYPOINT ["dotnet", "Catalog.Api.dll"]`,
        bad: 4,
        why: 'Corre como root. Si alguien explota una vulnerabilidad de la app, tiene control total del contenedor.',
        fix: 'USER $APP_UID',
      },
    ],
  },
  {
    id: 'w4-imagen-base',
    type: 'choice',
    title: 'Elige la imagen base',
    description: 'Cada situación pide una imagen distinta. Elige la que conviene.',
    concept: 'Peso de imagen',
    rounds: [
      {
        prompt: 'La etapa que compila el proyecto.',
        options: ['sdk:10.0', 'aspnet:10.0', 'aspnet:10.0-noble-chiseled', 'runtime-deps:10.0-noble-chiseled'],
        answer: 'sdk:10.0',
        why: 'Solo el SDK tiene el compilador y dotnet restore/publish.',
      },
      {
        prompt: 'La imagen final de una API normal con EF Core: chica y segura, sin cambiar el código.',
        options: ['sdk:10.0', 'aspnet:10.0', 'aspnet:10.0-noble-chiseled', 'runtime-deps:10.0-noble-chiseled'],
        answer: 'aspnet:10.0-noble-chiseled',
        why: 'Trae el runtime de ASP.NET Core sin shell ni paquetes extra. Es el equilibrio recomendado.',
      },
      {
        prompt: 'La API formatea fechas y montos con la cultura es-PY y convierte zonas horarias.',
        options: ['aspnet:10.0-noble-chiseled', 'aspnet:10.0-noble-chiseled-extra', 'runtime-deps:10.0-alpine', 'sdk:10.0'],
        answer: 'aspnet:10.0-noble-chiseled-extra',
        why: 'La variante -extra agrega ICU y tzdata, que la chiseled normal no trae.',
      },
      {
        prompt: 'En desarrollo necesitas entrar al contenedor con una shell para investigar.',
        options: ['aspnet:10.0', 'aspnet:10.0-noble-chiseled', 'runtime-deps:10.0-noble-chiseled', 'Cualquiera'],
        answer: 'aspnet:10.0',
        why: 'Las chiseled no tienen shell: docker exec ... sh falla. La completa sí la trae.',
      },
      {
        prompt: 'Publicas self-contained con trimming y quieres la imagen más chica sin Native AOT.',
        options: ['aspnet:10.0', 'runtime-deps:10.0-noble-chiseled', 'sdk:10.0', 'aspnet:10.0-alpine'],
        answer: 'runtime-deps:10.0-noble-chiseled',
        why: 'Una app self-contained trae su propio runtime: la base solo aporta las dependencias del sistema.',
      },
    ],
  },
  {
    id: 'w4-fill-compose',
    type: 'fill',
    title: 'Completa: compose.yaml',
    description: 'API, base de datos y reinicio automático bien configurados.',
    concept: 'Docker Compose',
    rounds: [
      {
        file: 'compose.yaml',
        task: 'La API debe esperar a que Postgres esté sano y reiniciarse si se cae.',
        code: `services:
  api:
    build: .
    ports:
      - "[[0]]"
    environment:
      ConnectionStrings__Default: "Host=[[1]];Database=catalog;Username=postgres;Password=\${POSTGRES_PASSWORD}"
    depends_on:
      db:
        condition: [[2]]
    restart: [[3]]

  db:
    image: postgres:17
    healthcheck:
      test: ["CMD-SHELL", "[[4]] -U postgres -d catalog"]
      interval: 5s
      retries: 10`,
        blanks: [
          { options: ['8080:8080', '80:80', '8080', '5432:5432'], answer: '8080:8080' },
          { options: ['db', 'localhost', '127.0.0.1', 'postgres:17'], answer: 'db' },
          { options: ['service_healthy', 'service_started', 'service_completed_successfully', 'always'], answer: 'service_healthy' },
          { options: ['unless-stopped', 'no', 'never', 'on-success'], answer: 'unless-stopped' },
          { options: ['pg_isready', 'curl', 'psql --ping', 'docker ps'], answer: 'pg_isready' },
        ],
        why: 'Dentro de la red de compose la base se llama db. service_healthy espera al healthcheck, y pg_isready es la herramienta de Postgres para eso.',
      },
    ],
  },
  {
    id: 'w4-consola-compose',
    type: 'terminal',
    title: 'Consola: Docker Compose',
    description: 'Levanta y opera el entorno completo de desarrollo.',
    concept: 'Docker Compose',
    steps: [
      {
        goal: 'Construye las imágenes y levanta todos los servicios en segundo plano.',
        rules: ['docker compose up|docker-compose up', { m: '-d|--detach', label: 'segundo plano (-d)' }, { m: '--build', label: 'la opción para reconstruir (--build)' }],
        answer: 'docker compose up -d --build',
        output: '[+] Building 18.4s (17/17) FINISHED\n[+] Running 4/4\n ✔ Network catalog_default  Created\n ✔ Container catalog-db-1   Healthy\n ✔ Container catalog-seq-1  Started\n ✔ Container catalog-api-1  Started',
        why: 'Fíjate que la API arrancó después de que la base quedó Healthy: eso hace depends_on con service_healthy.',
      },
      {
        goal: 'Mira el estado de los servicios.',
        rules: ['docker compose ps|docker-compose ps'],
        answer: 'docker compose ps',
        output: 'NAME            SERVICE   STATUS                   PORTS\ncatalog-api-1   api       Up 12 seconds            0.0.0.0:8080->8080/tcp\ncatalog-db-1    db        Up 20 seconds (healthy)  5432/tcp\ncatalog-seq-1   seq       Up 12 seconds            0.0.0.0:8081->80/tcp',
        why: 'La base no publica su puerto al host: solo la ven los otros servicios. Menos superficie expuesta.',
      },
      {
        goal: 'Sigue los logs solo del servicio api.',
        rules: ['docker compose logs|docker-compose logs', { m: '-f|--follow', label: 'seguir (-f)' }, { m: 'api', label: 'el servicio api' }],
        answer: 'docker compose logs -f api',
        output: 'api-1  | info: Microsoft.Hosting.Lifetime[14] Now listening on: http://[::]:8080\napi-1  | info: Catalog.Api Producto 3 creado con precio 80.00',
        why: 'Sin el nombre del servicio verías los logs de todos mezclados.',
      },
      {
        goal: 'Reinicia solo el servicio api.',
        rules: ['docker compose restart|docker-compose restart', { m: 'api', label: 'el servicio' }],
        answer: 'docker compose restart api',
        output: '[+] Restarting 1/1\n ✔ Container catalog-api-1  Started',
        why: 'Útil tras cambiar configuración. Si cambiaste código, usa up -d --build para reconstruir.',
      },
      {
        goal: 'Baja todo el entorno, conservando los datos de la base.',
        rules: ['docker compose down|docker-compose down', { m: '~^(?!.*(-v|--volumes)).*$', label: 'sin borrar volúmenes (no uses -v)' }],
        answer: 'docker compose down',
        output: '[+] Running 4/4\n ✔ Container catalog-api-1  Removed\n ✔ Container catalog-seq-1  Removed\n ✔ Container catalog-db-1   Removed\n ✔ Network catalog_default  Removed',
        why: 'Los volúmenes db-data y seq-data quedan. Con -v los borrarías y perderías los datos.',
      },
    ],
  },
  {
    id: 'w4-reinicio',
    type: 'choice',
    title: 'Reinicio y auto-reparación',
    description: 'Qué pasa cuando algo se cae, en Docker y en Kubernetes.',
    concept: 'Resiliencia',
    rounds: [
      {
        prompt: 'Quieres que la API vuelva sola si se cae o si reinicias la máquina, pero no si la detuviste tú.',
        options: ['restart: no', 'restart: on-failure', 'restart: always', 'restart: unless-stopped'],
        answer: 'restart: unless-stopped',
        why: 'Respeta un docker stop manual; always la volvería a levantar al reiniciar Docker.',
      },
      {
        prompt: 'En Kubernetes borras un Pod de un Deployment con 2 réplicas. ¿Qué pasa?',
        options: ['Quedan 1 réplica', 'El ReplicaSet crea otro Pod', 'El Deployment se borra', 'Hay que aplicar el YAML de nuevo'],
        answer: 'El ReplicaSet crea otro Pod',
        why: 'Estado deseado: 2 réplicas. El controlador lo corrige solo.',
      },
      {
        prompt: 'La liveness probe falla 3 veces seguidas. ¿Qué hace Kubernetes?',
        options: ['Lo saca del Service', 'Reinicia el contenedor', 'Borra el Deployment', 'Nada'],
        answer: 'Reinicia el contenedor',
        why: 'Liveness responde «¿sigue vivo?». Si no, reiniciar es la solución.',
      },
      {
        prompt: 'La readiness probe falla porque la base de datos no responde. ¿Qué hace Kubernetes?',
        options: ['Reinicia el contenedor', 'Deja de enviarle tráfico hasta que se recupere', 'Escala a más réplicas', 'Borra el Pod'],
        answer: 'Deja de enviarle tráfico hasta que se recupere',
        why: 'Readiness no reinicia. Reiniciar la API no arregla la base.',
      },
      {
        prompt: 'Un Pod muestra CrashLoopBackOff. ¿Qué significa?',
        options: [
          'No encuentra la imagen',
          'La app arranca, se cae, y Kubernetes espera cada vez más antes de reintentar',
          'Falta memoria en el nodo',
          'El Service no tiene Pods',
        ],
        answer: 'La app arranca, se cae, y Kubernetes espera cada vez más antes de reintentar',
        why: 'Mira el motivo con kubectl logs <pod> --previous.',
      },
    ],
  },
  {
    id: 'w4-configmap-secret',
    type: 'classify',
    title: '¿ConfigMap o Secret?',
    description: 'Decide dónde va cada valor de configuración.',
    concept: 'ConfigMaps y Secrets',
    question: '¿Dónde guardarías este valor?',
    buckets: [
      { id: 'cm', label: 'ConfigMap', desc: 'No sensible' },
      { id: 'secret', label: 'Secret', desc: 'Sensible' },
    ],
    items: [
      { text: 'ASPNETCORE_ENVIRONMENT=Production', bucket: 'cm', why: 'No compromete nada si se filtra.' },
      { text: 'La contraseña de PostgreSQL', bucket: 'secret', why: 'Credencial: siempre Secret.' },
      { text: 'La URL de Seq: http://seq:5341', bucket: 'cm', why: 'Es una dirección interna, no una credencial.' },
      { text: 'La API key de la pasarela de pagos', bucket: 'secret', why: 'Con ella cualquiera opera en tu nombre.' },
      { text: 'El nivel mínimo de log (Information)', bucket: 'cm', why: 'Configuración de comportamiento.' },
      { text: 'El certificado TLS y su clave privada', bucket: 'secret', why: 'Kubernetes tiene incluso un tipo de Secret específico: kubernetes.io/tls.' },
      { text: 'La cadena de conexión completa con usuario y contraseña', bucket: 'secret', why: 'Contiene la contraseña: toda la cadena va al Secret.' },
      { text: 'El tamaño máximo de página: 100', bucket: 'cm', why: 'Parámetro de negocio sin riesgo.' },
    ],
  },
  {
    id: 'w4-objetos-k8s',
    type: 'match',
    title: 'Objetos de Kubernetes',
    description: 'Une cada objeto con su responsabilidad.',
    concept: 'Kubernetes',
    pairs: [
      ['Pod', 'Uno o más contenedores que comparten red'],
      ['Deployment', 'Mantiene N réplicas y gestiona actualizaciones'],
      ['Service', 'Nombre y dirección estables hacia los Pods'],
      ['ConfigMap', 'Configuración no sensible'],
      ['Secret', 'Configuración sensible'],
      ['Namespace', 'Agrupa y aísla recursos'],
    ],
  },
  {
    id: 'w4-consola-k8s',
    type: 'terminal',
    title: 'Consola: despliegue en Minikube',
    description: 'Del clúster vacío a la API escalada, actualizada y revertida.',
    concept: 'kubectl',
    steps: [
      {
        goal: 'Crea el clúster local de Minikube usando el driver de Docker.',
        rules: ['minikube start', { m: '--driver=docker|--driver docker|--vm-driver=docker', label: 'el driver de Docker' }],
        answer: 'minikube start --driver=docker',
        output: '😄  minikube v1.37.0 on Ubuntu 24.04\n✨  Using the docker driver based on user configuration\n🔥  Creating docker container (CPUs=2, Memory=4000MB) ...\n🏄  Done! kubectl is now configured to use "minikube" cluster',
        why: 'Minikube corre el nodo de Kubernetes dentro de un contenedor Docker y configura kubectl para apuntar a él.',
      },
      {
        goal: 'Carga tu imagen local catalog-api:1.0 dentro de Minikube.',
        rules: ['minikube image load', { m: 'catalog-api:1.0', label: 'la imagen con su tag' }],
        answer: 'minikube image load catalog-api:1.0',
        why: 'El Docker de Minikube es otro: sin este paso, el Pod quedaría en ImagePullBackOff.',
      },
      {
        goal: 'Crea el Secret catalog-secrets con la clave ConnectionStrings__Default (valor: Host=postgres;Database=catalog;Username=postgres;Password=devpass).',
        rules: [
          'kubectl create secret generic',
          { m: 'catalog-secrets', label: 'el nombre del Secret' },
          { m: '~--from-literal=["\']?ConnectionStrings__Default=', label: 'la clave con --from-literal' },
        ],
        answer: "kubectl create secret generic catalog-secrets --from-literal=ConnectionStrings__Default='Host=postgres;Database=catalog;Username=postgres;Password=devpass'",
        output: 'secret/catalog-secrets created',
        why: 'Las comillas simples evitan que la terminal interprete los punto y coma. El valor no queda en ningún archivo del repo.',
        hint: 'kubectl create secret generic <nombre> --from-literal=<clave>=<valor>',
      },
      {
        goal: 'Aplica todos los manifiestos de la carpeta k8s/.',
        rules: ['kubectl apply', { m: '-f k8s/|-f k8s|-f ./k8s|-f ./k8s/|--filename k8s/', label: 'la carpeta con -f' }],
        answer: 'kubectl apply -f k8s/',
        output: 'configmap/catalog-config created\ndeployment.apps/catalog-api created\nservice/catalog-api created',
        why: 'apply es declarativo: crea lo que falta y actualiza lo que cambió. Puedes repetirlo sin miedo.',
      },
      {
        goal: 'Lista los Pods.',
        rules: ['kubectl get pods|kubectl get pod|kubectl get po'],
        answer: 'kubectl get pods',
        output: 'NAME                           READY   STATUS    RESTARTS   AGE\ncatalog-api-7d9f8b6c5d-4kq2x   1/1     Running   0          20s\ncatalog-api-7d9f8b6c5d-x8m7p   1/1     Running   0          20s',
        why: 'READY 1/1 significa que la readiness probe pasó: ese Pod ya recibe tráfico.',
      },
      {
        goal: 'Mira los logs del deployment catalog-api.',
        rules: ['kubectl logs', DEPLOY],
        answer: 'kubectl logs deployment/catalog-api',
        output: 'Found 2 pods, using pod/catalog-api-7d9f8b6c5d-4kq2x\ninfo: Microsoft.Hosting.Lifetime[14]\n      Now listening on: http://[::]:8080',
        why: 'Con deployment/<nombre> no necesitas copiar el nombre aleatorio del Pod.',
      },
      {
        goal: 'Escala el deployment a 3 réplicas.',
        rules: ['kubectl scale', DEPLOY, { m: '--replicas=3|--replicas 3', label: 'la cantidad (--replicas=3)' }],
        answer: 'kubectl scale deployment/catalog-api --replicas=3',
        output: 'deployment.apps/catalog-api scaled',
        why: 'Escalado manual e inmediato. Para que quede permanente, cambia replicas en el YAML (o en values.yaml de Helm).',
      },
      {
        goal: 'Actualiza el contenedor api a la imagen catalog-api:1.1.',
        rules: ['kubectl set image', DEPLOY, { m: 'api=catalog-api:1.1', label: 'contenedor=imagen (api=catalog-api:1.1)' }],
        answer: 'kubectl set image deployment/catalog-api api=catalog-api:1.1',
        output: 'deployment.apps/catalog-api image updated',
        why: 'Arranca un rolling update: Pods nuevos entran a medida que pasan la readiness, y los viejos salen.',
      },
      {
        goal: 'Espera a que termine la actualización.',
        rules: ['kubectl rollout status', DEPLOY],
        answer: 'kubectl rollout status deployment/catalog-api',
        output: 'Waiting for deployment "catalog-api" rollout to finish: 1 of 3 updated replicas are available...\nWaiting for deployment "catalog-api" rollout to finish: 2 of 3 updated replicas are available...\ndeployment "catalog-api" successfully rolled out',
        why: 'En un pipeline de CD, este comando falla si la nueva versión no levanta: así detectas un mal despliegue.',
      },
      {
        goal: 'La versión 1.1 tiene un bug. Vuelve a la versión anterior.',
        rules: ['kubectl rollout undo', DEPLOY],
        answer: 'kubectl rollout undo deployment/catalog-api',
        output: 'deployment.apps/catalog-api rolled back',
        why: 'Kubernetes guarda el historial de ReplicaSets: volver atrás es otro rolling update hacia la versión anterior.',
      },
      {
        goal: 'Expón el Service catalog-api en tu puerto local 8080 (el Service escucha en el 80).',
        rules: ['kubectl port-forward', { m: '~(service|svc)/catalog-api', label: 'el Service (service/catalog-api)' }, { m: '8080:80', label: 'los puertos local:servicio' }],
        answer: 'kubectl port-forward service/catalog-api 8080:80',
        output: 'Forwarding from 127.0.0.1:8080 -> 8080\nForwarding from [::1]:8080 -> 8080',
        why: 'Ahora http://localhost:8080/scalar llega a tu API dentro del clúster, sin exponerla públicamente.',
      },
    ],
  },
  {
    id: 'w4-fill-deployment',
    type: 'fill',
    title: 'Completa: Deployment y Service',
    description: 'Los campos que más se equivocan en los manifiestos.',
    concept: 'Manifiestos',
    rounds: [
      {
        file: 'k8s/deployment.yaml',
        task: 'Completa el Deployment.',
        code: `apiVersion: [[0]]
kind: Deployment
metadata:
  name: catalog-api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: [[1]]
  template:
    metadata:
      labels:
        app: catalog-api
    spec:
      containers:
        - name: api
          image: catalog-api:1.0
          ports:
            - containerPort: [[2]]
          readinessProbe:
            httpGet:
              path: [[3]]
              port: 8080
          env:
            - name: ConnectionStrings__Default
              valueFrom:
                [[4]]:
                  name: catalog-secrets
                  key: ConnectionStrings__Default`,
        blanks: [
          { options: ['apps/v1', 'v1', 'batch/v1', 'networking.k8s.io/v1'], answer: 'apps/v1' },
          { options: ['catalog-api', 'api', 'catalog', 'deployment'], answer: 'catalog-api' },
          { options: ['8080', '80', '443', '5000'], answer: '8080' },
          { options: ['/health/ready', '/health/live', '/', '/scalar'], answer: '/health/ready' },
          { options: ['secretKeyRef', 'configMapKeyRef', 'fieldRef', 'secretRef'], answer: 'secretKeyRef' },
        ],
        why: 'Deployment vive en apps/v1, el selector debe coincidir con las labels del template, la app escucha en 8080 y la contraseña sale de un Secret.',
      },
      {
        file: 'k8s/service.yaml',
        task: 'Completa el Service.',
        code: `apiVersion: v1
kind: [[0]]
metadata:
  name: catalog-api
spec:
  type: [[1]]
  selector:
    app: catalog-api
  ports:
    - port: 80
      targetPort: [[2]]`,
        blanks: [
          { options: ['Service', 'Ingress', 'Endpoint', 'Pod'], answer: 'Service' },
          { options: ['NodePort', 'ExternalName', 'Headless', 'Deployment'], answer: 'NodePort' },
          { options: ['8080', '80', '5341', '5432'], answer: '8080' },
        ],
        why: 'NodePort permite entrar desde fuera en Minikube; targetPort es el puerto real del contenedor.',
      },
    ],
  },
  {
    id: 'w4-bugs-yaml',
    type: 'bugfix',
    title: 'Encuentra el error: manifiestos',
    description: 'Manifiestos que se aplican sin error pero no funcionan.',
    concept: 'Kubernetes',
    rounds: [
      {
        file: 'k8s/deployment.yaml',
        code: `spec:
  replicas: 2
  selector:
    matchLabels:
      app: catalog-api
  template:
    metadata:
      labels:
        app: catalog
    spec:
      containers:
        - name: api
          image: catalog-api:1.0`,
        bad: 9,
        why: 'La label del template no coincide con el selector. Kubernetes rechaza el Deployment: «selector does not match template labels».',
        fix: '        app: catalog-api',
      },
      {
        file: 'k8s/service.yaml',
        code: `apiVersion: v1
kind: Service
metadata:
  name: catalog-api
spec:
  selector:
    app: catalog-api
  ports:
    - port: 80
      targetPort: 80`,
        bad: 10,
        why: 'La app escucha en 8080 (por defecto en .NET 8+). El Service envía al 80 y la conexión se rechaza.',
        fix: '      targetPort: 8080',
      },
      {
        file: 'k8s/configmap.yaml',
        code: `apiVersion: v1
kind: ConfigMap
metadata:
  name: catalog-config
data:
  ASPNETCORE_ENVIRONMENT: Production
  DB_PASSWORD: Sup3rS3cret
  Serilog__WriteTo__Seq__Args__serverUrl: http://seq:5341`,
        bad: 7,
        why: 'Una contraseña en un ConfigMap: queda en texto plano en el repo y visible para cualquiera con permiso de lectura.',
        fix: '# Va en un Secret creado con kubectl create secret generic ...',
      },
      {
        file: 'k8s/deployment.yaml',
        code: `      containers:
        - name: api
          image: catalog-api:latest
          ports:
            - containerPort: 8080`,
        bad: 3,
        why: 'Con :latest, imagePullPolicy es Always: Minikube ignora la imagen que cargaste y la busca en Docker Hub → ImagePullBackOff. Además no sabes qué versión corre.',
        fix: '          image: catalog-api:1.0',
      },
      {
        file: 'k8s/deployment.yaml',
        code: `          livenessProbe:
            httpGet:
              path: /health/ready
              port: 8080
            periodSeconds: 10`,
        bad: 3,
        why: 'La liveness revisa la base de datos. Si la base se cae, Kubernetes reinicia todos los Pods en bucle sin arreglar nada.',
        fix: '              path: /health/live',
      },
    ],
  },
  {
    id: 'w4-estados',
    type: 'choice',
    title: 'Diagnóstico de Pods',
    description: 'Lee el estado del Pod y elige la causa más probable.',
    concept: 'Troubleshooting',
    rounds: [
      { prompt: 'STATUS: ImagePullBackOff', options: ['No encuentra la imagen', 'La app se cae al arrancar', 'Falta un Secret', 'Sin memoria'], answer: 'No encuentra la imagen', why: 'Revisa el tag, minikube image load y imagePullPolicy.' },
      { prompt: 'STATUS: CrashLoopBackOff', options: ['No encuentra la imagen', 'La app se cae al arrancar', 'El Service está mal', 'El nodo está lleno'], answer: 'La app se cae al arrancar', why: 'kubectl logs <pod> --previous muestra la excepción.' },
      { prompt: 'STATUS: CreateContainerConfigError', options: ['Falta un ConfigMap, Secret o una de sus claves', 'La imagen es muy grande', 'Error de compilación', 'El puerto está ocupado'], answer: 'Falta un ConfigMap, Secret o una de sus claves', why: 'kubectl describe pod te dice cuál.' },
      { prompt: 'STATUS: Pending durante minutos', options: ['No hay nodo con recursos suficientes', 'La app está lenta', 'La probe falla', 'El Secret es inválido'], answer: 'No hay nodo con recursos suficientes', why: 'Revisa los requests de CPU y memoria y los eventos del Pod.' },
      { prompt: 'Último estado: OOMKilled', options: ['Superó su límite de memoria', 'Le faltó CPU', 'Se borró a mano', 'Falló la liveness'], answer: 'Superó su límite de memoria', why: 'Sube limits.memory o busca la fuga de memoria.' },
      { prompt: 'STATUS: Running, pero READY 0/1', options: ['Falla la readiness probe', 'Falta la imagen', 'Está en otro namespace', 'Le falta CPU'], answer: 'Falla la readiness probe', why: 'Revisa ruta y puerto de la probe, y si la base de datos responde.' },
    ],
  },
  {
    id: 'w4-consola-helm',
    type: 'terminal',
    title: 'Consola: Helm',
    description: 'Valida, instala, actualiza y revierte tu chart.',
    concept: 'Helm',
    steps: [
      {
        goal: 'Valida el chart que está en charts/catalog.',
        rules: ['helm lint', { m: '~charts/catalog/?$', label: 'la ruta del chart' }],
        answer: 'helm lint charts/catalog',
        output: '==> Linting charts/catalog\n[INFO] Chart.yaml: icon is recommended\n\n1 chart(s) linted, 0 chart(s) failed',
        why: 'Detecta errores de sintaxis y estructura antes de tocar el clúster.',
      },
      {
        goal: 'Renderiza el YAML final del release catalog usando charts/catalog/values-dev.yaml, sin aplicarlo.',
        rules: ['helm template', { m: 'catalog', label: 'el nombre del release' }, { m: '~charts/catalog', label: 'la ruta del chart' }, { m: '~(-f|--values) charts/catalog/values-dev\\.yaml', label: 'el archivo de valores con -f' }],
        answer: 'helm template catalog charts/catalog -f charts/catalog/values-dev.yaml',
        output: '---\n# Source: catalog/templates/configmap.yaml\napiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: catalog\n---\n# Source: catalog/templates/deployment.yaml\napiVersion: apps/v1\nkind: Deployment\n...',
        why: 'Ver el resultado antes de instalar es la mejor forma de depurar plantillas.',
      },
      {
        goal: 'Instala o actualiza el release catalog con values-dev.yaml.',
        rules: ['helm upgrade', { m: '--install|-i', label: 'la opción --install' }, { m: '~ catalog ', label: 'el nombre del release' }, { m: '~charts/catalog', label: 'la ruta del chart' }, { m: '~(-f|--values) charts/catalog/values-dev\\.yaml', label: 'el archivo de valores' }],
        answer: 'helm upgrade --install catalog charts/catalog -f charts/catalog/values-dev.yaml',
        output: 'Release "catalog" does not exist. Installing it now.\nNAME: catalog\nSTATUS: deployed\nREVISION: 1',
        why: 'upgrade --install sirve igual la primera vez y las siguientes: por eso es el comando de los pipelines.',
      },
      {
        goal: 'Despliega la imagen 1.1 cambiando solo image.tag desde la línea de comandos.',
        rules: ['helm upgrade', { m: '--install|-i', label: '--install' }, { m: '~ catalog ', label: 'el release' }, { m: '~charts/catalog', label: 'el chart' }, { m: '--set image.tag=1.1', label: '--set image.tag=1.1' }],
        answer: 'helm upgrade --install catalog charts/catalog --set image.tag=1.1',
        output: 'Release "catalog" has been upgraded. Happy Helming!\nSTATUS: deployed\nREVISION: 2',
        why: 'En CI/CD se usa --set image.tag=<sha del commit> para desplegar exactamente lo que se construyó.',
      },
      {
        goal: 'Muestra el historial de revisiones del release.',
        rules: ['helm history', { m: 'catalog', label: 'el release' }],
        answer: 'helm history catalog',
        output: 'REVISION  STATUS      CHART          APP VERSION  DESCRIPTION\n1         superseded  catalog-0.1.0  1.0          Install complete\n2         deployed    catalog-0.1.0  1.0          Upgrade complete',
        why: 'Cada upgrade crea una revisión a la que puedes volver.',
      },
      {
        goal: 'Vuelve a la revisión 1.',
        rules: ['helm rollback', { m: 'catalog', label: 'el release' }, { m: '~ 1$', label: 'el número de revisión' }],
        answer: 'helm rollback catalog 1',
        output: 'Rollback was a success! Happy Helming!',
        why: 'Revierte todos los recursos del chart juntos, no solo la imagen.',
      },
    ],
  },
  {
    id: 'w4-fill-helm',
    type: 'fill',
    title: 'Completa: plantilla de Helm',
    description: 'Conecta la plantilla con values.yaml.',
    concept: 'Helm',
    rounds: [
      {
        file: 'templates/deployment.yaml',
        task: 'Usa los valores de values.yaml.',
        code: `spec:
  replicas: {{ [[0]] }}
  template:
    spec:
      containers:
        - name: api
          image: "{{ .Values.image.repository }}:{{ [[1]] }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          resources:
            {{- [[2]] .Values.resources | nindent 12 }}`,
        blanks: [
          { options: ['.Values.replicaCount', '.Release.Name', '.Chart.Version', 'replicaCount'], answer: '.Values.replicaCount' },
          { options: ['.Values.image.tag', '.Chart.AppVersion', '.Values.tag', 'latest'], answer: '.Values.image.tag' },
          { options: ['toYaml', 'quote', 'include', 'toJson'], answer: 'toYaml' },
        ],
        why: 'Todo lo de values.yaml se lee con .Values. toYaml + nindent inserta un bloque YAML con la indentación correcta.',
      },
      {
        file: 'templates/configmap.yaml',
        task: 'Recorre el mapa config de values.yaml.',
        code: `data:
  {{- [[0]] $key, $value := .Values.config }}
  {{ $key }}: {{ $value | [[1]] }}
  {{- end }}`,
        blanks: [
          { options: ['range', 'with', 'if', 'each'], answer: 'range' },
          { options: ['quote', 'upper', 'toYaml', 'b64enc'], answer: 'quote' },
        ],
        why: 'range recorre el mapa y quote envuelve cada valor en comillas para que «8080» o «true» sigan siendo texto.',
      },
    ],
  },
]
