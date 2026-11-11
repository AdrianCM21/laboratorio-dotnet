// Semana 5 · Observabilidad y CI/CD
// Rúbrica: Observabilidad 20 pts (Serilog 6 · Seq en Kubernetes 5 · niveles de log 5 · visualización 4)
//          CI/CD 15 pts (pipeline CI 5 · CD 5 · versionado, repo limpio y README 5)

export const lessons = [
  {
    id: 'w5-observabilidad',
    title: 'Observabilidad y logs estructurados',
    minutes: 10,
    blocks: [
      { p: 'Con 3 réplicas en Kubernetes no puedes «entrar a ver qué pasó». **Observabilidad** es poder responder qué está haciendo el sistema mirando lo que emite.' },
      {
        table: {
          head: ['Señal', 'Responde', 'Ejemplo'],
          rows: [
            ['Logs', '¿Qué pasó exactamente?', '«Producto 42 creado por el usuario 7»'],
            ['Métricas', '¿Cuánto y qué tan rápido?', 'Peticiones por segundo, latencia p95'],
            ['Trazas', '¿Por dónde pasó una petición?', 'API → base de datos → servicio de pagos'],
          ],
        },
      },
      { p: 'El bootcamp se enfoca en **logs**. La clave es que sean **estructurados**: además del texto, cada evento lleva propiedades con nombre y tipo que puedes filtrar.' },
      {
        compare: {
          lang: 'text',
          badLabel: 'Texto plano',
          bad: '2026-11-11 22:00:01 INFO Producto 42 creado con precio 80\n\n→ Para buscar los productos de más de 50\n  tienes que parsear el texto con regex.',
          goodLabel: 'Estructurado',
          good: '{\n  "@t": "2026-11-11T22:00:01Z",\n  "@l": "Information",\n  "@mt": "Producto {ProductId} creado con precio {Price}",\n  "ProductId": 42,\n  "Price": 80\n}\n→ Price > 50 es una consulta directa.',
        },
      },
      {
        flow: [
          ['Tu código', '`logger.LogInformation(...)`'],
          ['Serilog', 'Agrega contexto y formatea'],
          ['Sinks', 'Consola + Seq'],
          ['Seq', 'Busca, filtra, alerta'],
        ],
      },
    ],
  },
  {
    id: 'w5-niveles',
    title: 'Niveles de log: usar el correcto',
    minutes: 10,
    blocks: [
      { p: 'La rúbrica da **5 puntos** al «uso correcto de tipos de log (Information/Warning/Error)». El nivel dice qué tan urgente es un evento, y permite filtrar ruido.' },
      {
        table: {
          head: ['Nivel (Serilog / Microsoft)', 'Cuándo', 'Ejemplo'],
          rows: [
            ['Verbose / Trace', 'Detalle extremo, solo para investigar', 'Valores de cada iteración'],
            ['Debug', 'Información útil al desarrollar', 'Consulta generada, caché acertada o fallida'],
            ['**Information**', 'Hechos normales del negocio', 'Producto creado, pedido pagado'],
            ['**Warning**', 'Algo raro que no impide seguir', 'Stock bajo, reintento, validación fallida'],
            ['**Error**', 'Falló una operación', 'Excepción no controlada, timeout de la base'],
            ['Fatal / Critical', 'La app no puede seguir', 'No arranca: falta la cadena de conexión'],
          ],
        },
      },
      {
        list: [
          'Un 404 porque el cliente pidió un id inexistente **no** es Error: el sistema funcionó bien. Information o Warning.',
          'Un Error siempre lleva la excepción: `logger.LogError(ex, ...)`.',
          'En producción el mínimo suele ser Information; en desarrollo, Debug.',
          'Si todo es Error, nada es Error: las alertas pierden sentido.',
        ],
      },
      { note: 'Cuando alguien revise tu Seq en la evaluación, debería ver Information para el flujo normal, Warning para situaciones anómalas y Error solo para fallas reales.' },
    ],
  },
  {
    id: 'w5-templates',
    title: 'Message templates y propiedades',
    minutes: 10,
    blocks: [
      { p: 'La rúbrica da **6 puntos** a «Serilog con propiedades». Las propiedades salen de los **message templates**: el texto con marcadores `{Nombre}` y los valores aparte.' },
      {
        compare: {
          lang: 'csharp',
          bad: `// Interpolación: Seq recibe solo texto.
// Cada mensaje es distinto y no hay propiedades.
logger.LogInformation(
    $"Producto {product.Id} creado con precio {product.Price}");`,
          good: `// Template: un solo tipo de evento,
// con ProductId y Price como propiedades.
logger.LogInformation(
    "Producto {ProductId} creado con precio {Price}",
    product.Id, product.Price);`,
        },
      },
      {
        table: {
          head: ['Regla', 'Ejemplo'],
          rows: [
            ['Propiedades en PascalCase', '`{ProductId}`, no `{productId}` ni `{id}`'],
            ['Nombres consistentes en toda la app', 'Siempre `ProductId`, así una consulta encuentra todo'],
            ['`@` para guardar un objeto completo', '`{@Request}` guarda sus campos, no su `ToString()`'],
            ['Excepción como primer argumento', '`logger.LogError(ex, "Falló el pago {OrderId}", id)`'],
          ],
        },
      },
      { h: 'Nunca loguees' },
      {
        list: [
          'Contraseñas, tokens, API keys ni cadenas de conexión.',
          'Datos personales completos: número de tarjeta, documento, etc.',
          'Cuerpos completos de peticiones con datos sensibles.',
        ],
      },
      { note: 'Usa siempre `ILogger<T>` de Microsoft en tu código. Serilog queda solo en `Program.cs`: si mañana cambias de librería, no tocas ninguna clase.' },
    ],
  },
  {
    id: 'w5-serilog',
    title: 'Configurar Serilog en ASP.NET Core',
    minutes: 14,
    blocks: [
      {
        code: `dotnet add src/Catalog.Api package Serilog.AspNetCore
dotnet add src/Catalog.Api package Serilog.Sinks.Seq
dotnet add src/Catalog.Api package Serilog.Enrichers.Environment`,
        lang: 'bash',
      },
      {
        code: `using Serilog;

// Logger mínimo para registrar errores mientras la app arranca
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.Services.AddSerilog((services, lc) => lc
        .ReadFrom.Configuration(builder.Configuration)   // lee la sección "Serilog"
        .ReadFrom.Services(services)
        .Enrich.FromLogContext());

    // ...resto de servicios

    var app = builder.Build();
    app.UseExceptionHandler();
    app.UseSerilogRequestLogging();   // 1 evento por petición: método, ruta, status, tiempo
    app.MapControllers();
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "La aplicación no pudo arrancar");
}
finally
{
    Log.CloseAndFlush();              // envía lo pendiente antes de salir
}`,
        lang: 'csharp',
      },
      {
        code: `// appsettings.json
"Serilog": {
  "Using": [ "Serilog.Sinks.Console", "Serilog.Sinks.Seq", "Serilog.Enrichers.Environment" ],
  "MinimumLevel": {
    "Default": "Information",
    "Override": {
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore.Database.Command": "Warning"
    }
  },
  "WriteTo": {
    "Console": { "Name": "Console" },
    "Seq": { "Name": "Seq", "Args": { "serverUrl": "http://localhost:5341" } }
  },
  "Enrich": [ "FromLogContext", "WithMachineName" ],
  "Properties": { "Application": "Catalog.Api" }
}`,
        lang: 'json',
      },
      {
        table: {
          head: ['Parte', 'Para qué'],
          rows: [
            ['`Override`', 'Silencia el ruido del framework: sin esto, cada petición genera una docena de líneas.'],
            ['`WriteTo` como objeto', 'Con claves con nombre (`Seq`) puedes sobrescribir un sink por variable de entorno.'],
            ['`WithMachineName`', 'Cada evento lleva el nombre del Pod: ves qué réplica lo generó.'],
            ['`Properties.Application`', 'Distingue tu API de otros servicios que escriban al mismo Seq.'],
          ],
        },
      },
      { h: 'Cambiar el destino según el ambiente' },
      { p: 'Como `WriteTo` usa claves con nombre, en Docker o Kubernetes cambias la URL de Seq con una variable de entorno, sin tocar el JSON:' },
      { code: 'Serilog__WriteTo__Seq__Args__serverUrl=http://seq:5341\nSerilog__MinimumLevel__Default=Debug', lang: 'bash' },
    ],
  },
  {
    id: 'w5-contexto',
    title: 'Contexto y correlación',
    minutes: 8,
    blocks: [
      { p: 'Un evento suelto dice poco. Con **contexto** sabes a qué petición, usuario o pedido pertenece cada línea.' },
      {
        code: `// Todo lo que se loguee dentro del using lleva OrderId
using (logger.BeginScope(new Dictionary<string, object> { ["OrderId"] = order.Id }))
{
    logger.LogInformation("Validando stock");
    logger.LogInformation("Cobrando {Amount}", order.Total);
}`,
        lang: 'csharp',
      },
      {
        code: `// Enriquecer el evento de UseSerilogRequestLogging
app.UseSerilogRequestLogging(options =>
{
    options.EnrichDiagnosticContext = (diagnostic, http) =>
    {
        diagnostic.Set("ClientIp", http.Connection.RemoteIpAddress?.ToString());
        diagnostic.Set("UserAgent", http.Request.Headers.UserAgent.ToString());
    };
});`,
        lang: 'csharp',
      },
      {
        list: [
          'ASP.NET Core agrega `RequestId`, `TraceId` y `SpanId` a cada evento de una petición.',
          'En Seq, haz clic en el `TraceId` de un error para ver **todos** los logs de esa petición.',
          'El `traceId` que devuelve tu ProblemDetails es el mismo: el usuario te lo reporta y lo buscas.',
        ],
      },
    ],
  },
  {
    id: 'w5-seq',
    title: 'Seq: buscar y visualizar logs',
    minutes: 12,
    blocks: [
      { p: 'Seq recibe eventos estructurados y te deja filtrarlos como una base de datos. La rúbrica da **4 puntos** a «visualizar en Seq los logs».' },
      { h: 'Levantarlo en Docker' },
      {
        code: `docker run --name seq -d --restart unless-stopped \\
  -e ACCEPT_EULA=Y \\
  -e SEQ_FIRSTRUN_ADMINPASSWORD=CambiaEsto123 \\
  -v seq-data:/data \\
  -p 5341:80 \\
  datalust/seq`,
        lang: 'bash',
      },
      {
        table: {
          head: ['Puerto del contenedor', 'Sirve'],
          rows: [
            ['80', 'Interfaz web, API e ingesta de eventos'],
            ['5341', 'Solo ingesta (útil para no exponer la interfaz)'],
          ],
        },
      },
      { p: 'Con `-p 5341:80`, abres `http://localhost:5341` en el navegador y tu app también envía ahí.' },
      { h: 'Consultas que vas a usar' },
      {
        table: {
          head: ['Quieres ver', 'Filtro en Seq'],
          rows: [
            ['Solo errores', "`@Level = 'Error'`"],
            ['Todo sobre el producto 42', '`ProductId = 42`'],
            ['Respuestas 5xx', '`StatusCode >= 500`'],
            ['Peticiones lentas (más de 1 s)', '`Elapsed > 1000`'],
            ['Mensajes que mencionan timeout', "`@Message like '%timeout%'`"],
            ['Solo tu API', "`Application = 'Catalog.Api'`"],
          ],
        },
      },
      {
        list: [
          '**Signals:** guarda un filtro (por ejemplo «Errores») para activarlo con un clic.',
          '**Dashboards:** gráficos como «errores por hora» o «peticiones por StatusCode».',
          '**Alertas:** notificación cuando un signal supera un umbral.',
        ],
      },
      { note: 'Para la evaluación, prepara un signal «Errores», un signal «Peticiones lentas» y un dashboard con peticiones por StatusCode. Muestra que sabes encontrar un problema, no solo que Seq recibe datos.' },
    ],
  },
  {
    id: 'w5-seq-k8s',
    title: 'Seq dentro de Kubernetes',
    minutes: 10,
    blocks: [
      { p: 'La rúbrica da **5 puntos** a «Seq en Kubernetes». Datalust publica un chart oficial de Helm.' },
      {
        code: `helm repo add datalust https://helm.datalust.co
helm repo update

helm upgrade --install seq datalust/seq -f seq-values.yaml

kubectl get svc                          # confirma el nombre del Service de Seq
kubectl port-forward svc/seq 8081:80     # interfaz en http://localhost:8081`,
        lang: 'bash',
      },
      {
        code: `# seq-values.yaml
acceptEULA: "Y"
firstRunAdminPassword: "CambiaEsto123"   # mejor: pásalo con --set desde un secreto de CI
persistence:
  enabled: true                          # los logs sobreviven reinicios del Pod`,
        lang: 'yaml',
      },
      {
        table: {
          head: ['Puerto del Service', 'Uso'],
          rows: [
            ['80 (ui)', 'Interfaz web. Accedes con port-forward.'],
            ['5341 (ingestion)', 'Tu API envía los eventos aquí.'],
          ],
        },
      },
      { p: 'Tu API, en el mismo namespace, envía a `http://seq:5341`. Ponlo en el ConfigMap (o en `values.yaml` de tu chart):' },
      { code: 'config:\n  Serilog__WriteTo__Seq__Args__serverUrl: http://seq:5341', lang: 'yaml' },
      {
        flow: [
          ['Pods de la API', 'Serilog → http://seq:5341'],
          ['Service seq', 'Puerto 5341 (ingesta)'],
          ['Pod de Seq', 'Guarda en un volumen'],
          ['Tu navegador', 'port-forward → puerto 80'],
        ],
      },
    ],
  },
  {
    id: 'w5-cicd',
    title: 'CI/CD: conceptos',
    minutes: 8,
    blocks: [
      {
        table: {
          head: ['Práctica', 'Qué automatiza'],
          rows: [
            ['Integración continua (CI)', 'En cada push o PR: restore, build y tests. Detecta errores en minutos.'],
            ['Entrega continua', 'Además deja un artefacto listo (la imagen) para desplegar con un clic.'],
            ['Despliegue continuo', 'Además despliega solo, sin intervención humana.'],
          ],
        },
      },
      {
        flow: [
          ['git push', 'Dispara el pipeline'],
          ['CI', 'restore → build → test'],
          ['Imagen', 'docker build → push al registro'],
          ['CD', 'helm upgrade --install'],
          ['Verificación', 'rollout status'],
        ],
      },
      {
        list: [
          '**Rápido:** si el CI tarda 30 minutos, nadie espera el resultado.',
          '**Reproducible:** el pipeline hace lo mismo que harías a mano, sin pasos manuales.',
          '**Lo mismo que se probó es lo que se despliega:** la imagen se etiqueta con el SHA del commit.',
        ],
      },
    ],
  },
  {
    id: 'w5-actions',
    title: 'Pipeline con GitHub Actions',
    minutes: 14,
    blocks: [
      { p: 'Un workflow es un YAML en `.github/workflows/`. La rúbrica pide como mínimo **restore y build** (5 puntos); sumar tests y la imagen te deja mejor parado.' },
      {
        code: `# .github/workflows/ci.yml
name: ci

on:
  push:
    branches: [main]
    tags: ['v*']
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-dotnet@v5
        with:
          dotnet-version: '10.0.x'
      - run: dotnet restore
      - run: dotnet build --no-restore -c Release
      - run: dotnet test --no-build -c Release

  image:
    needs: build                       # solo si build pasó
    if: github.event_name == 'push'    # no publica imágenes desde PRs
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write                  # para publicar en GHCR
    steps:
      - uses: actions/checkout@v6
      - uses: docker/login-action@v4
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}
      - id: meta
        uses: docker/metadata-action@v6
        with:
          images: ghcr.io/\${{ github.repository }}
          tags: |
            type=sha
            type=semver,pattern={{version}}
      - uses: docker/build-push-action@v7
        with:
          context: .
          push: true
          tags: \${{ steps.meta.outputs.tags }}
          labels: \${{ steps.meta.outputs.labels }}`,
        lang: 'yaml',
      },
      {
        table: {
          head: ['Pieza', 'Para qué'],
          rows: [
            ['`on`', 'Qué eventos disparan el workflow.'],
            ['`jobs`', 'Trabajos; corren en paralelo salvo que uses `needs`.'],
            ['`runs-on`', 'La máquina virtual (runner) donde corre el job.'],
            ['`uses`', 'Una acción reutilizable del Marketplace.'],
            ['`run`', 'Un comando de terminal.'],
            ['`secrets.GITHUB_TOKEN`', 'Token automático; nunca escribas contraseñas en el YAML.'],
            ['`metadata-action`', 'Genera tags (`sha-abc1234`, `1.2.0`) y pasa el nombre a minúsculas, que GHCR exige.'],
          ],
        },
      },
      { note: 'Los números de versión de las acciones cambian. Revisa la última versión mayor en el Marketplace de GitHub antes de copiar. Para máxima seguridad, GitHub recomienda fijar el SHA completo del commit de cada acción.' },
    ],
  },
  {
    id: 'w5-cd',
    title: 'CD: despliegue automatizado o simulado',
    minutes: 12,
    blocks: [
      { p: 'La rúbrica acepta un despliegue «local o simulado» (5 puntos). La opción más demostrable: crear un clúster efímero con **kind** dentro del pipeline, desplegar con Helm y verificar.' },
      {
        code: `  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6

      - uses: helm/kind-action@v1          # crea un clúster Kubernetes en el runner
        with:
          cluster_name: catalog

      - name: Construir y cargar la imagen
        run: |
          docker build -t catalog-api:\${{ github.sha }} .
          kind load docker-image catalog-api:\${{ github.sha }} --name catalog

      - name: Dependencias (Postgres y Secret)
        run: |
          kubectl apply -f k8s/postgres.yaml
          kubectl create secret generic catalog-secrets \\
            --from-literal=ConnectionStrings__Default='\${{ secrets.CI_CONNECTION_STRING }}'

      - name: Desplegar con Helm
        run: |
          helm upgrade --install catalog charts/catalog \\
            --set image.repository=catalog-api \\
            --set image.tag=\${{ github.sha }} \\
            --wait --timeout 5m

      - name: Verificar
        run: kubectl rollout status deployment/catalog --timeout=120s`,
        lang: 'yaml',
      },
      {
        list: [
          '`--wait` hace que Helm espere a que los Pods estén listos: si la app no arranca, **el pipeline falla**.',
          'Sin `cluster_name`, kind-action llama al clúster `chart-testing`; por eso se fija el nombre y se usa en `kind load`.',
          'Alternativa local: un script `deploy.sh` que hace build, `minikube image load` y `helm upgrade --install`.',
        ],
      },
      { code: '#!/usr/bin/env bash\nset -euo pipefail\nTAG=$(git rev-parse --short HEAD)\ndocker build -t catalog-api:$TAG .\nminikube image load catalog-api:$TAG\nhelm upgrade --install catalog charts/catalog --set image.tag=$TAG --wait', lang: 'bash' },
    ],
  },
  {
    id: 'w5-versionado',
    title: 'Versionado, repo limpio y README',
    minutes: 10,
    blocks: [
      { p: 'Los últimos **5 puntos** de CI/CD son «versionado, repo limpio, README».' },
      { h: 'Versionado semántico: MAYOR.MENOR.PARCHE' },
      {
        table: {
          head: ['Cambio', 'Sube', 'Ejemplo'],
          rows: [
            ['Corrección compatible', 'PARCHE', '1.2.0 → 1.2.1'],
            ['Funcionalidad nueva compatible', 'MENOR', '1.2.1 → 1.3.0'],
            ['Cambio que rompe el contrato', 'MAYOR', '1.3.0 → 2.0.0 (y una ruta /api/v2)'],
          ],
        },
      },
      { code: 'git tag -a v1.0.0 -m "Primera versión entregable"\ngit push origin v1.0.0     # dispara el workflow por la regla tags: [\'v*\']', lang: 'bash' },
      { h: 'Commits que se entienden' },
      { code: 'feat: endpoint de paginación de productos\nfix: 409 al repetir SKU en lugar de 500\nrefactor: mover validación a Application\ndocs: README con instrucciones de Minikube\nci: publicar imagen en GHCR', lang: 'text' },
      { h: 'Repo limpio' },
      {
        list: [
          '`.gitignore` de .NET: sin `bin/`, `obj/`, `.vs/`, `.env`.',
          'Sin secretos en ningún commit (si ya subiste uno, cámbialo: borrar el archivo no lo saca del historial).',
          'Sin código comentado ni archivos de prueba sueltos.',
          'Estructura clara: `src/`, `tests/`, `k8s/`, `charts/`, `.github/workflows/`.',
        ],
      },
      { h: 'README que suma puntos' },
      {
        code: `# Catalog API

API REST de catálogo de productos (.NET 10, Clean Architecture).

## Arquitectura
Diagrama de capas y decisiones principales.

## Ejecutar localmente
docker compose up -d --build  →  http://localhost:8080/scalar

## Kubernetes (Minikube)
Pasos exactos: minikube start, image load, secret, helm upgrade --install.

## Observabilidad
Cómo abrir Seq, signals y dashboard incluidos.

## CI/CD
Qué hace cada job del workflow y cómo se versionan las imágenes.

## Variables de entorno
Tabla con cada variable, para qué sirve y un valor de ejemplo.`,
        lang: 'markdown',
      },
    ],
  },
]
