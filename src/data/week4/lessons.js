// Semana 4 · Docker y Kubernetes
// Rúbrica: Docker 15 pts (Dockerfile 5 · variables 5 · ejecución local 5)
//          Kubernetes + Helm 25 pts (manifiestos 7 · ConfigMaps/Secrets 6 · Helm 6 · despliegue 6)

export const lessons = [
  {
    id: 'w4-contenedores',
    title: 'Contenedores: imagen, capa y registro',
    minutes: 10,
    blocks: [
      { p: 'Un **contenedor** es un proceso aislado que trae todo lo que necesita: runtime, librerías y tu app. Si corre en tu máquina, corre igual en el servidor.' },
      {
        flow: [
          ['Dockerfile', 'Receta de construcción'],
          ['docker build', 'Ejecuta la receta'],
          ['Imagen', 'Plantilla inmutable, en capas'],
          ['docker run', 'Crea un proceso a partir de la imagen'],
          ['Contenedor', 'Tu API corriendo'],
        ],
      },
      {
        table: {
          head: ['Concepto', 'Qué es', 'Analogía'],
          rows: [
            ['Imagen', 'Plantilla de solo lectura con tu app y su entorno', 'La clase'],
            ['Contenedor', 'Una instancia en ejecución de la imagen', 'El objeto'],
            ['Capa', 'Cada instrucción del Dockerfile agrega una capa cacheable', 'Un commit'],
            ['Tag', 'Nombre y versión: `catalog-api:1.0`', 'Una etiqueta de Git'],
            ['Registro', 'Servidor de imágenes: Docker Hub, GHCR, MCR', 'GitHub para imágenes'],
          ],
        },
      },
      { h: 'Contenedor vs máquina virtual' },
      { p: 'Una VM virtualiza hardware y arranca un sistema operativo completo (minutos, gigabytes). Un contenedor comparte el kernel del host y solo empaqueta lo necesario (segundos, megabytes).' },
      { note: 'Los contenedores son **efímeros**: lo que escribas dentro se pierde al borrarlos. Los datos van en volúmenes o en servicios externos, y los logs a la salida estándar.' },
    ],
  },
  {
    id: 'w4-dockerfile',
    title: 'Dockerfile multietapa para .NET',
    minutes: 15,
    blocks: [
      { p: 'La rúbrica pide «multistage, imágenes livianas». Un Dockerfile **multietapa** compila con la imagen pesada del SDK y copia solo el resultado a una imagen chica de runtime.' },
      {
        code: `# ---------- Etapa 1: compilar ----------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# 1) Solo los .csproj: esta capa cambia poco y queda en caché
COPY ["src/Catalog.Api/Catalog.Api.csproj", "src/Catalog.Api/"]
COPY ["src/Catalog.Application/Catalog.Application.csproj", "src/Catalog.Application/"]
COPY ["src/Catalog.Domain/Catalog.Domain.csproj", "src/Catalog.Domain/"]
COPY ["src/Catalog.Infrastructure/Catalog.Infrastructure.csproj", "src/Catalog.Infrastructure/"]
RUN dotnet restore "src/Catalog.Api/Catalog.Api.csproj"

# 2) El resto del código: cambia en cada commit
COPY . .
RUN dotnet publish "src/Catalog.Api/Catalog.Api.csproj" \\
    -c Release -o /app/publish --no-restore /p:UseAppHost=false

# ---------- Etapa 2: ejecutar ----------
FROM mcr.microsoft.com/dotnet/aspnet:10.0-noble-chiseled AS final
WORKDIR /app
COPY --from=build /app/publish .
USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "Catalog.Api.dll"]`,
        lang: 'dockerfile',
      },
      {
        table: {
          head: ['Línea', 'Por qué'],
          rows: [
            ['`FROM ...sdk:10.0 AS build`', 'El SDK compila. Esta etapa no llega a la imagen final.'],
            ['`COPY *.csproj` + `restore`', 'Si no cambian las dependencias, Docker reutiliza el restore cacheado.'],
            ['`COPY . .` después', 'Cambiar código solo invalida las capas de aquí en adelante.'],
            ['`-c Release`', 'Compilación optimizada. Nunca Debug en producción.'],
            ['`/p:UseAppHost=false`', 'No genera el ejecutable nativo: se arranca con `dotnet`.'],
            ['`aspnet:10.0-noble-chiseled`', 'Runtime sin shell ni gestor de paquetes: chica y segura.'],
            ['`USER $APP_UID`', 'Corre como usuario sin privilegios (UID 1654), no como root.'],
            ['`EXPOSE 8080`', 'Desde .NET 8 las imágenes escuchan en 8080, no en 80.'],
            ['`ENTRYPOINT` en formato JSON', 'El proceso recibe las señales de apagado correctamente.'],
          ],
        },
      },
      { note: 'Las imágenes chiseled ya corren sin privilegios por defecto. Escribir `USER $APP_UID` lo deja explícito y funciona igual con cualquier variante de imagen.' },
    ],
  },
  {
    id: 'w4-peso',
    title: 'Bajar el peso de la imagen',
    minutes: 12,
    blocks: [
      { p: 'Una imagen más chica se descarga y arranca más rápido, ocupa menos en el registro y tiene menos paquetes con vulnerabilidades. Estos son los tamaños **comprimidos** que publica Microsoft para una API de ejemplo en .NET 10:' },
      {
        bars: {
          title: 'Imagen final según base y tipo de publicación (.NET 10, API de ejemplo)',
          unit: 'MB',
          rows: [
            ['aspnet:10.0', 92.48, 'Ubuntu completo, framework-dependent'],
            ['aspnet:10.0-noble-chiseled', 52.81, 'Chiseled, framework-dependent'],
            ['aspnet:10.0-alpine', 51.93, 'Alpine, framework-dependent'],
            ['runtime-deps:10.0-noble-chiseled', 21.86, 'Self-contained + trimming'],
            ['runtime-deps:10.0-noble-chiseled', 11.6, 'Native AOT'],
          ],
          note: 'Fuente: reporte de tamaños de dotnet/dotnet-docker (noviembre de 2025). Tu app dará números distintos; la proporción se mantiene.',
        },
      },
      { h: 'Técnicas, de mayor a menor impacto' },
      {
        table: {
          head: ['Técnica', 'Ahorro', 'Costo'],
          rows: [
            ['Multietapa (no enviar el SDK)', 'Enorme: el SDK trae compilador y herramientas', 'Ninguno. Es obligatorio.'],
            ['Base chiseled o alpine', '~40 % frente a la base completa', 'Sin shell: no puedes entrar con `docker exec ... sh`.'],
            ['Self-contained + trimming', 'Otro ~60 %', 'El trimming puede romper código que usa reflexión.'],
            ['Native AOT', 'La más chica', 'Restricciones fuertes: reflexión, parte de EF Core y algunas librerías.'],
            ['`.dockerignore`', 'Contexto chico y builds rápidos', 'Ninguno.'],
          ],
        },
      },
      { h: 'Variantes -extra' },
      { p: 'Chiseled y alpine no traen **ICU** ni zonas horarias. Si tu app formatea fechas y números con la cultura `es-PY` o convierte zonas horarias, usa `aspnet:10.0-noble-chiseled-extra` o `aspnet:10.0-alpine-extra`.' },
      { h: 'Inspeccionar' },
      { code: 'docker images catalog-api          # tamaño total\ndocker history catalog-api:1.0     # tamaño de cada capa\ndocker scout quickview catalog-api:1.0   # vulnerabilidades conocidas', lang: 'bash' },
      { note: 'Para el proyecto, `aspnet:10.0-noble-chiseled` multietapa es el equilibrio recomendado: chica, segura y sin restricciones de código.' },
    ],
  },
  {
    id: 'w4-cache',
    title: '.dockerignore y caché de capas',
    minutes: 8,
    blocks: [
      { p: '`docker build` envía al motor todo el directorio (el **contexto**). Sin `.dockerignore` viajan `bin/`, `obj/`, `.git/` y hasta tus secretos locales.' },
      { code: '# .dockerignore\n**/bin/\n**/obj/\n.git/\n.vs/\n.vscode/\n**/*.user\n**/appsettings.Development.json\n.env\nDockerfile*\ndocker-compose*\nREADME.md', lang: 'text' },
      { h: 'Cómo funciona el caché' },
      { p: 'Docker reutiliza una capa si la instrucción y sus archivos no cambiaron. En cuanto una capa cambia, **todas las siguientes** se reconstruyen. Por eso lo que cambia poco va arriba.' },
      {
        compare: {
          lang: 'dockerfile',
          bad: `COPY . .
# Cualquier cambio en un .cs invalida
# el restore: se baja todo NuGet otra vez
RUN dotnet restore
RUN dotnet publish -c Release -o /app`,
          good: `COPY ["src/Catalog.Api/Catalog.Api.csproj", "src/Catalog.Api/"]
# ...resto de .csproj
RUN dotnet restore "src/Catalog.Api/Catalog.Api.csproj"
COPY . .
# Un cambio en un .cs reusa el restore
RUN dotnet publish ... --no-restore`,
        },
      },
      { note: 'Excluir `obj/` también evita un error clásico: copiar el `project.assets.json` de tu máquina (Windows o macOS) dentro de la imagen Linux.' },
    ],
  },
  {
    id: 'w4-env',
    title: 'Configuración con variables de entorno',
    minutes: 10,
    blocks: [
      { p: 'La rúbrica da 5 puntos a «variables de entorno: uso correcto, no hardcode». La **misma imagen** debe servir para desarrollo, pruebas y producción; lo que cambia llega por variables de entorno.' },
      {
        table: {
          head: ['Variable', 'Para qué'],
          rows: [
            ['`ASPNETCORE_ENVIRONMENT`', 'Development, Staging o Production. Decide qué appsettings carga.'],
            ['`ASPNETCORE_HTTP_PORTS`', 'Puerto de escucha. En las imágenes de .NET 8+ vale 8080 por defecto.'],
            ['`ConnectionStrings__Default`', 'Cadena de conexión. `__` reemplaza a `:`.'],
            ['`Serilog__MinimumLevel__Default`', 'Nivel de log sin recompilar (semana 5).'],
          ],
        },
      },
      {
        code: `# Una por una
docker run -d -p 8080:8080 \\
  -e ASPNETCORE_ENVIRONMENT=Production \\
  -e "ConnectionStrings__Default=Host=catalog-db;Database=catalog;Username=postgres;Password=devpass" \\
  catalog-api:1.0

# Desde un archivo (que NO va a Git)
docker run -d -p 8080:8080 --env-file .env catalog-api:1.0`,
        lang: 'bash',
      },
      {
        compare: {
          lang: 'dockerfile',
          bad: `# Queda grabado en la imagen: cualquiera
# que la descargue lo ve con docker inspect
ENV ConnectionStrings__Default="Host=db;Password=Sup3rS3cret"`,
          good: `# La imagen no lleva secretos.
# Se inyectan al ejecutar:
#   docker run -e ... / --env-file
#   compose: environment / .env
#   Kubernetes: Secret`,
        },
      },
      { note: 'Versiona un `.env.example` con las claves y valores de ejemplo, y agrega `.env` al `.gitignore`.' },
    ],
  },
  {
    id: 'w4-compose',
    title: 'Docker Compose: API, base y Seq juntos',
    minutes: 14,
    blocks: [
      { p: 'Compose describe en un archivo varios contenedores que trabajan juntos. Es tu «ejecución local reproducible»: quien clone el repo levanta todo con un comando.' },
      {
        code: `# compose.yaml
services:
  api:
    build: .
    image: catalog-api:dev
    ports:
      - "8080:8080"
    environment:
      ASPNETCORE_ENVIRONMENT: Development
      ConnectionStrings__Default: "Host=db;Port=5432;Database=catalog;Username=postgres;Password=\${POSTGRES_PASSWORD}"
      Serilog__WriteTo__Seq__Args__serverUrl: "http://seq:5341"
    depends_on:
      db:
        condition: service_healthy   # espera a que Postgres acepte conexiones
    restart: unless-stopped

  db:
    image: postgres:17
    environment:
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
      POSTGRES_DB: catalog
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d catalog"]
      interval: 5s
      timeout: 3s
      retries: 10
    restart: unless-stopped

  seq:
    image: datalust/seq:latest   # en tu proyecto, fija la versión que uses
    environment:
      ACCEPT_EULA: "Y"
      SEQ_FIRSTRUN_ADMINPASSWORD: \${SEQ_ADMIN_PASSWORD}
    ports:
      - "8081:80"                # interfaz web en http://localhost:8081
    volumes:
      - seq-data:/data

volumes:
  db-data:
  seq-data:`,
        lang: 'yaml',
      },
      {
        list: [
          '**Red interna:** cada servicio se alcanza por su nombre. La API usa `Host=db`, no `localhost`.',
          '**`\${POSTGRES_PASSWORD}`** se lee del archivo `.env` junto al compose, que no va a Git.',
          '**`depends_on` + `service_healthy`** evita que la API arranque antes que la base.',
          '**Volúmenes con nombre:** los datos sobreviven a `docker compose down`.',
        ],
      },
      { h: 'Políticas de reinicio' },
      {
        table: {
          head: ['restart', 'Comportamiento'],
          rows: [
            ['`no`', 'Nunca reinicia (por defecto).'],
            ['`on-failure`', 'Reinicia solo si el proceso termina con error.'],
            ['`always`', 'Reinicia siempre, incluso si lo detuviste, cuando arranca Docker.'],
            ['`unless-stopped`', 'Como always, salvo que lo hayas detenido a mano. La opción más usada.'],
          ],
        },
      },
      { code: 'docker compose up -d --build    # construye y levanta todo\ndocker compose ps               # estado y salud\ndocker compose logs -f api      # logs en vivo de un servicio\ndocker compose down             # baja todo, conserva volúmenes\ndocker compose down -v          # baja todo y BORRA los volúmenes', lang: 'bash' },
      { note: 'La imagen chiseled no tiene `curl`, así que la API no lleva `healthcheck` en compose. En Kubernetes la salud la revisa el propio clúster con probes HTTP.' },
    ],
  },
  {
    id: 'w4-buenas-practicas',
    title: 'Checklist de buenas prácticas Docker',
    minutes: 8,
    blocks: [
      {
        table: {
          head: ['Práctica', 'Por qué'],
          rows: [
            ['Multietapa', 'El SDK nunca llega a producción.'],
            ['Versiones fijas (`sdk:10.0`, `postgres:17`)', '`latest` cambia sin aviso y rompe builds.'],
            ['Usuario sin privilegios', 'Si alguien explota la app, no es root dentro del contenedor.'],
            ['Un proceso por contenedor', 'Escalar, reiniciar y loguear cada pieza por separado.'],
            ['Logs a stdout/stderr', 'Docker y Kubernetes los recolectan. Nada de archivos de log dentro.'],
            ['Sin secretos en la imagen', 'Las capas son públicas para quien tenga la imagen.'],
            ['`.dockerignore`', 'Builds rápidos y sin filtrar archivos locales.'],
            ['Tags inmutables (`1.4.2`, SHA del commit)', 'Sabes exactamente qué corre y puedes volver atrás.'],
            ['Escanear vulnerabilidades', '`docker scout` o el escáner de tu registro.'],
          ],
        },
      },
      { note: 'Esta tabla cubre los criterios de la rúbrica de Docker: Dockerfile correcto, variables de entorno y ejecución reproducible.' },
    ],
  },
  {
    id: 'w4-k8s-conceptos',
    title: 'Kubernetes: conceptos esenciales',
    minutes: 14,
    blocks: [
      { p: 'Docker corre contenedores en una máquina. **Kubernetes** los orquesta en un clúster: decide dónde corren, los reinicia si fallan, los escala y los actualiza sin cortar el servicio.' },
      { p: 'Funciona por **estado deseado**: declaras «quiero 3 réplicas de catalog-api:1.2» en YAML y un bucle de control trabaja todo el tiempo para que la realidad coincida.' },
      {
        flow: [
          ['Cliente', 'Pide /api/v1/products'],
          ['Service', 'IP y nombre DNS estables'],
          ['Pods', 'Réplicas de la API'],
          ['Contenedor', 'catalog-api:1.2'],
        ],
      },
      {
        table: {
          head: ['Objeto', 'Responsabilidad'],
          rows: [
            ['Pod', 'Unidad mínima: uno o más contenedores que comparten red. Efímero.'],
            ['Deployment', 'Mantiene N réplicas de un Pod y gestiona las actualizaciones.'],
            ['ReplicaSet', 'Lo crea el Deployment; garantiza la cantidad de Pods.'],
            ['Service', 'Punto de acceso estable que reparte tráfico entre los Pods por labels.'],
            ['ConfigMap', 'Configuración no sensible.'],
            ['Secret', 'Configuración sensible: contraseñas, tokens.'],
            ['Namespace', 'Agrupa y aísla recursos dentro del clúster.'],
          ],
        },
      },
      { h: 'Auto-reparación' },
      {
        list: [
          'Si un contenedor muere, el kubelet lo **reinicia** (en un Deployment la política es siempre `Always`).',
          'Si un Pod desaparece (o lo borras), el ReplicaSet crea **otro** para volver a N réplicas.',
          'Si la liveness probe falla, Kubernetes **reinicia** el contenedor.',
          'Si la readiness probe falla, el Pod sale del Service hasta recuperarse.',
        ],
      },
      { note: 'Los Pods se identifican por **labels**, no por nombre. El Deployment y el Service encuentran sus Pods con un `selector` que coincide con esas labels.' },
    ],
  },
  {
    id: 'w4-minikube',
    title: 'Minikube: Kubernetes en tu máquina',
    minutes: 10,
    blocks: [
      { p: 'La rúbrica exige que el proyecto «corra en Minikube sin errores». Minikube crea un clúster de un nodo en tu máquina.' },
      {
        code: `minikube start --driver=docker     # crea el clúster
kubectl get nodes                   # debe mostrar un nodo Ready

# Tu imagen está en el Docker de tu máquina, no en el de Minikube:
minikube image load catalog-api:1.0

kubectl apply -f k8s/               # aplica todos los manifiestos
minikube service catalog-api --url  # URL para probar un Service NodePort
minikube dashboard                  # panel web del clúster`,
        lang: 'bash',
      },
      { h: 'La trampa de las imágenes locales' },
      {
        table: {
          head: ['Tag de la imagen', 'imagePullPolicy por defecto', 'Resultado con una imagen cargada a mano'],
          rows: [
            ['`catalog-api:latest` o sin tag', '`Always`', '`ImagePullBackOff`: intenta descargarla de Docker Hub.'],
            ['`catalog-api:1.0`', '`IfNotPresent`', 'Usa la imagen cargada. ✓'],
          ],
        },
      },
      { note: 'Alternativa a `image load`: `eval $(minikube docker-env)` hace que tu terminal construya directo dentro del Docker de Minikube.' },
    ],
  },
  {
    id: 'w4-manifiestos',
    title: 'Manifiestos: Deployment y Service',
    minutes: 16,
    blocks: [
      { p: 'La rúbrica da **7 puntos** a «Deployment, Service bien definidos». Este es un Deployment completo, listo para producción:' },
      {
        code: `# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: catalog-api
  labels:
    app: catalog-api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: catalog-api            # debe coincidir con las labels del template
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1                 # como mucho 1 Pod extra durante la actualización
      maxUnavailable: 0           # nunca baja de 2 Pods listos
  template:
    metadata:
      labels:
        app: catalog-api
    spec:
      containers:
        - name: api
          image: catalog-api:1.0
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 8080
          envFrom:
            - configMapRef:
                name: catalog-config
          env:
            - name: ConnectionStrings__Default
              valueFrom:
                secretKeyRef:
                  name: catalog-secrets
                  key: ConnectionStrings__Default
          resources:
            requests:             # lo que el scheduler reserva
              cpu: 100m
              memory: 128Mi
            limits:               # el techo: si pasa la memoria, OOMKilled
              memory: 256Mi
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /health/live
              port: 8080
            periodSeconds: 15
            failureThreshold: 3`,
        lang: 'yaml',
      },
      {
        code: `# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: catalog-api
spec:
  type: NodePort          # en Minikube; en la nube suele ser ClusterIP + Ingress
  selector:
    app: catalog-api      # envía tráfico a los Pods con esta label
  ports:
    - port: 80            # puerto del Service
      targetPort: 8080    # puerto del contenedor`,
        lang: 'yaml',
      },
      {
        table: {
          head: ['Tipo de Service', 'Acceso'],
          rows: [
            ['`ClusterIP`', 'Solo dentro del clúster. Por defecto. Ideal para la base de datos.'],
            ['`NodePort`', 'Abre un puerto en el nodo. Práctico en Minikube.'],
            ['`LoadBalancer`', 'Pide un balanceador al proveedor de nube.'],
          ],
        },
      },
      { note: 'Errores que más se repiten: un `selector` que no coincide con las labels (el Service no encuentra Pods) y un `targetPort` distinto al puerto real de la app (8080).' },
    ],
  },
  {
    id: 'w4-config-secrets',
    title: 'ConfigMaps y Secrets',
    minutes: 12,
    blocks: [
      { p: 'La rúbrica da **6 puntos** a ConfigMaps y Secrets «usados correctamente y externos a la app». La imagen no cambia entre ambientes; cambia lo que le inyectas.' },
      {
        code: `# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: catalog-config
data:
  ASPNETCORE_ENVIRONMENT: Production
  Serilog__WriteTo__Seq__Args__serverUrl: http://seq:5341`,
        lang: 'yaml',
      },
      {
        code: `# El Secret se crea por comando: la contraseña no queda en ningún archivo del repo
kubectl create secret generic catalog-secrets \\
  --from-literal=ConnectionStrings__Default='Host=postgres;Database=catalog;Username=postgres;Password=Sup3rS3cret'

kubectl get secret catalog-secrets -o yaml   # verás el valor en base64`,
        lang: 'bash',
      },
      {
        table: {
          head: ['', 'ConfigMap', 'Secret'],
          rows: [
            ['Para', 'Ambiente, URLs, niveles de log, flags', 'Contraseñas, tokens, certificados, API keys'],
            ['Almacenamiento', 'Texto plano', 'Base64 (codificado, **no cifrado**)'],
            ['En Git', 'Sí', 'Nunca el valor real'],
          ],
        },
      },
      { note: 'Base64 no es seguridad: cualquiera lo decodifica. La protección real son los permisos (RBAC) del clúster y el cifrado en reposo. En equipos se usan herramientas como Sealed Secrets o External Secrets.' },
      { h: 'Aplicar cambios de configuración' },
      { p: 'Las variables de entorno se leen al arrancar. Si cambias un ConfigMap, los Pods existentes **no** se enteran: reinícialos.' },
      { code: 'kubectl apply -f k8s/configmap.yaml\nkubectl rollout restart deployment/catalog-api', lang: 'bash' },
    ],
  },
  {
    id: 'w4-operar',
    title: 'Probes, escalado y diagnóstico',
    minutes: 14,
    blocks: [
      { h: 'Las tres probes' },
      {
        table: {
          head: ['Probe', 'Pregunta', 'Si falla'],
          rows: [
            ['`startupProbe`', '¿Ya terminó de arrancar?', 'Espera; las otras probes no corren todavía.'],
            ['`readinessProbe`', '¿Puede recibir tráfico ahora?', 'Lo saca del Service. No lo reinicia.'],
            ['`livenessProbe`', '¿Sigue vivo o se colgó?', 'Reinicia el contenedor.'],
          ],
        },
      },
      { note: 'Nunca apuntes la liveness a un chequeo de la base de datos: si la base se cae, Kubernetes reiniciaría todos tus Pods en bucle sin arreglar nada.' },
      { h: 'Escalar, actualizar y volver atrás' },
      {
        code: `kubectl scale deployment/catalog-api --replicas=3
kubectl set image deployment/catalog-api api=catalog-api:1.1   # actualización progresiva
kubectl rollout status deployment/catalog-api                   # espera a que termine
kubectl rollout history deployment/catalog-api
kubectl rollout undo deployment/catalog-api                     # vuelve a la versión anterior`,
        lang: 'bash',
      },
      { h: 'Diagnóstico' },
      {
        code: `kubectl get pods -o wide                 # estado de cada Pod
kubectl describe pod <pod>               # eventos: por qué no arranca
kubectl logs <pod>                       # logs del contenedor
kubectl logs <pod> --previous            # logs del contenedor que se cayó
kubectl get events --sort-by=.lastTimestamp
kubectl port-forward service/catalog-api 8080:80   # probar sin exponer`,
        lang: 'bash',
      },
      {
        table: {
          head: ['Estado', 'Causa probable', 'Qué revisar'],
          rows: [
            ['`ImagePullBackOff`', 'No encuentra la imagen', 'Tag, `minikube image load`, `imagePullPolicy`'],
            ['`CrashLoopBackOff`', 'La app arranca y se cae', '`kubectl logs <pod> --previous`'],
            ['`CreateContainerConfigError`', 'Falta un ConfigMap, Secret o una clave', '`kubectl describe pod`'],
            ['`Pending`', 'No hay recursos o nodo disponible', '`requests` de CPU/memoria'],
            ['`OOMKilled`', 'Superó el límite de memoria', '`limits.memory`, fugas de memoria'],
            ['Running pero 0/1 READY', 'Falla la readiness probe', 'Ruta y puerto de la probe, la base de datos'],
          ],
        },
      },
    ],
  },
  {
    id: 'w4-helm',
    title: 'Helm: plantillas reutilizables',
    minutes: 16,
    blocks: [
      { p: 'La rúbrica da **6 puntos** a «values.yaml, templates reutilizables». Helm es el gestor de paquetes de Kubernetes: convierte tus manifiestos en plantillas y los valores que cambian van en `values.yaml`.' },
      {
        code: `charts/catalog/
  Chart.yaml            # nombre y versión del chart
  values.yaml           # valores por defecto
  values-dev.yaml       # lo que cambia en desarrollo
  templates/
    _helpers.tpl        # nombres y labels reutilizables
    deployment.yaml
    service.yaml
    configmap.yaml`,
        lang: 'text',
      },
      {
        code: `# values.yaml
replicaCount: 2

image:
  repository: catalog-api
  tag: "1.0"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80

config:
  ASPNETCORE_ENVIRONMENT: Production
  Serilog__WriteTo__Seq__Args__serverUrl: http://seq:5341

existingSecret: catalog-secrets

resources:
  requests: { cpu: 100m, memory: 128Mi }
  limits: { memory: 256Mi }`,
        lang: 'yaml',
      },
      {
        code: `# templates/deployment.yaml (fragmento)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "catalog.fullname" . }}
  labels:
    {{- include "catalog.labels" . | nindent 4 }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      {{- include "catalog.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      labels:
        {{- include "catalog.selectorLabels" . | nindent 8 }}
      annotations:
        # si cambia el ConfigMap, cambia este hash y los Pods se reinician solos
        checksum/config: {{ include (print $.Template.BasePath "/configmap.yaml") . | sha256sum }}
    spec:
      containers:
        - name: api
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          envFrom:
            - configMapRef:
                name: {{ include "catalog.fullname" . }}
          resources:
            {{- toYaml .Values.resources | nindent 12 }}`,
        lang: 'yaml',
      },
      {
        code: `# templates/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ include "catalog.fullname" . }}
data:
  {{- range $key, $value := .Values.config }}
  {{ $key }}: {{ $value | quote }}
  {{- end }}`,
        lang: 'yaml',
      },
      { h: 'Comandos' },
      {
        code: `helm create catalog                          # genera un chart de ejemplo para adaptar
helm lint charts/catalog                     # valida el chart
helm template catalog charts/catalog -f charts/catalog/values-dev.yaml   # muestra el YAML final sin aplicarlo
helm upgrade --install catalog charts/catalog -f charts/catalog/values-dev.yaml
helm upgrade --install catalog charts/catalog --set image.tag=1.1       # cambia un valor puntual
helm list                                    # releases instalados
helm history catalog                         # revisiones
helm rollback catalog 1                      # vuelve a la revisión 1
helm uninstall catalog`,
        lang: 'bash',
      },
      { note: '`helm upgrade --install` instala si no existe y actualiza si existe: es el comando ideal para un pipeline de CD porque siempre funciona.' },
    ],
  },
]
