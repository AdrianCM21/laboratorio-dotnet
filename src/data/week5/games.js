// Juegos de la semana 5

export const games = [
  {
    id: 'w5-niveles',
    type: 'classify',
    title: '¿Qué nivel de log?',
    description: 'Elige el nivel correcto para cada evento.',
    concept: 'Niveles de log',
    question: '¿Con qué nivel registras este evento?',
    buckets: [
      { id: 'debug', label: 'Debug', desc: 'Detalle para desarrollar' },
      { id: 'info', label: 'Information', desc: 'Flujo normal' },
      { id: 'warn', label: 'Warning', desc: 'Anómalo pero sigue' },
      { id: 'error', label: 'Error', desc: 'Falló una operación' },
      { id: 'fatal', label: 'Fatal', desc: 'La app no puede seguir' },
    ],
    items: [
      { text: 'Se creó el producto 42', bucket: 'info', why: 'Un hecho normal del negocio.' },
      { text: 'Un pedido se pagó correctamente', bucket: 'info', why: 'Flujo esperado, útil para auditoría.' },
      { text: 'El stock del producto 7 bajó de 5 unidades', bucket: 'warn', why: 'No es una falla, pero alguien debería enterarse.' },
      { text: 'Falló la conexión a la base y se reintentará', bucket: 'warn', why: 'Si el reintento funciona, no hubo falla. Si se agotan los reintentos, eso sí es Error.' },
      { text: 'Excepción no controlada al guardar un pedido', bucket: 'error', why: 'Una operación falló. Se loguea con la excepción.' },
      { text: 'Timeout llamando a la pasarela de pagos', bucket: 'error', why: 'El pago no se pudo procesar.' },
      { text: 'La app no arranca: falta la cadena de conexión', bucket: 'fatal', why: 'No puede seguir funcionando.' },
      { text: 'La consulta SQL generada por EF Core', bucket: 'debug', why: 'Útil al desarrollar, ruido en producción.' },
      { text: 'El cliente pidió el producto 999, que no existe (404)', bucket: 'info', why: 'El sistema respondió bien. No es un Error tuyo.' },
      { text: 'Validación fallida: precio negativo en un POST', bucket: 'warn', why: 'Entrada inválida del cliente: vale registrarla, no es una falla del sistema. Information también es aceptable.' },
    ],
  },
  {
    id: 'w5-templates',
    type: 'choice',
    title: 'El log bien escrito',
    description: 'Elige la línea de log correcta.',
    concept: 'Message templates',
    rounds: [
      {
        prompt: 'Registrar que se creó un producto con su id y precio.',
        options: [
          'logger.LogInformation($"Producto {id} creado con precio {price}");',
          'logger.LogInformation("Producto {ProductId} creado con precio {Price}", id, price);',
          'logger.LogInformation("Producto " + id + " creado con precio " + price);',
          'Console.WriteLine($"Producto {id} creado");',
        ],
        answer: 'logger.LogInformation("Producto {ProductId} creado con precio {Price}", id, price);',
        why: 'Template con propiedades. Interpolar o concatenar produce solo texto.',
      },
      {
        prompt: 'Registrar una excepción al procesar el pedido orderId.',
        options: [
          'logger.LogError("Error: " + ex.Message);',
          'logger.LogError(ex, "Falló el procesamiento del pedido {OrderId}", orderId);',
          'logger.LogWarning(ex.ToString());',
          'logger.LogError("Falló {OrderId} {Exception}", orderId, ex.Message);',
        ],
        answer: 'logger.LogError(ex, "Falló el procesamiento del pedido {OrderId}", orderId);',
        why: 'La excepción va como primer argumento: Seq guarda el stack trace completo en @Exception.',
      },
      {
        prompt: 'Registrar el inicio de sesión de un usuario.',
        options: [
          'logger.LogInformation("Login de {Email} con clave {Password}", email, password);',
          'logger.LogInformation("Inicio de sesión del usuario {UserId}", userId);',
          'logger.LogDebug("Login {@Request}", request);',
          'logger.LogError("Login {UserId}", userId);',
        ],
        answer: 'logger.LogInformation("Inicio de sesión del usuario {UserId}", userId);',
        why: 'Nunca contraseñas. El objeto completo con @ podría incluirla también.',
      },
      {
        prompt: 'Guardar el DTO de una petición como objeto con sus campos.',
        options: [
          'logger.LogInformation("Petición {Request}", request);',
          'logger.LogInformation("Petición {@Request}", request);',
          'logger.LogInformation($"Petición {request}");',
          'logger.LogInformation("Petición " + JsonSerializer.Serialize(request));',
        ],
        answer: 'logger.LogInformation("Petición {@Request}", request);',
        why: 'El @ le pide a Serilog que desestructure el objeto en propiedades.',
      },
      {
        prompt: '¿Qué nombre de propiedad es el más consistente?',
        options: ['{id}', '{productid}', '{ProductId}', '{product_id}'],
        answer: '{ProductId}',
        why: 'PascalCase y el mismo nombre en toda la app: una sola consulta encuentra todo.',
      },
    ],
  },
  {
    id: 'w5-bugs-logging',
    type: 'bugfix',
    title: 'Encuentra el error: logging',
    description: 'Logs que cuestan puntos en «Observabilidad».',
    concept: 'Logging',
    rounds: [
      {
        file: 'ProductService.cs',
        code: `public async Task<ProductResponse> CreateAsync(CreateProductRequest request, CancellationToken ct)
{
    var product = new Product(request.Name, request.Sku, request.Price, request.Stock);
    await repository.AddAsync(product, ct);
    logger.LogInformation($"Producto {product.Id} creado con SKU {product.Sku}");
    return product.ToResponse();
}`,
        bad: 5,
        why: 'Interpolación: Seq recibe texto sin propiedades. No podrás filtrar por ProductId ni por Sku.',
        fix: 'logger.LogInformation("Producto {ProductId} creado con SKU {Sku}", product.Id, product.Sku);',
      },
      {
        file: 'AuthService.cs',
        code: `public async Task<TokenResponse> LoginAsync(LoginRequest request, CancellationToken ct)
{
    logger.LogInformation("Intento de login {Email} {Password}", request.Email, request.Password);
    var user = await users.FindByEmailAsync(request.Email, ct);
    return tokens.Create(user);
}`,
        bad: 3,
        why: 'La contraseña queda guardada en Seq, legible para cualquiera con acceso a los logs.',
        fix: 'logger.LogInformation("Intento de login de {Email}", request.Email);',
      },
      {
        file: 'PaymentService.cs',
        code: `try
{
    await gateway.ChargeAsync(order.Total, ct);
}
catch (HttpRequestException ex)
{
    logger.LogError("Falló el cobro del pedido " + order.Id + ": " + ex.Message);
    throw;
}`,
        bad: 7,
        why: 'Pierde el stack trace (solo guarda el mensaje) y concatena texto en lugar de usar propiedades.',
        fix: 'logger.LogError(ex, "Falló el cobro del pedido {OrderId}", order.Id);',
      },
      {
        file: 'ProductService.cs',
        code: `public async Task<ProductResponse> GetByIdAsync(int id, CancellationToken ct)
{
    var product = await repository.GetByIdAsync(id, ct);
    if (product is null)
    {
        logger.LogError("No existe el producto {ProductId}", id);
        throw new NotFoundException($"No existe el producto {id}.");
    }
    return product.ToResponse();
}`,
        bad: 6,
        why: 'Un id inexistente no es una falla del sistema. Si cada 404 es Error, las alertas de errores reales se pierden en el ruido.',
        fix: 'logger.LogInformation("Producto {ProductId} no encontrado", id);',
      },
      {
        file: 'OrdersController.cs',
        code: `[HttpPost]
public async Task<ActionResult<OrderResponse>> Create(CreateOrderRequest request, CancellationToken ct)
{
    Console.WriteLine("Creando pedido para el cliente " + request.CustomerId);
    var order = await service.CreateAsync(request, ct);
    return CreatedAtAction(nameof(GetById), new { id = order.Id, version = "1.0" }, order);
}`,
        bad: 4,
        why: 'Console.WriteLine no pasa por Serilog: sin nivel, sin propiedades, sin contexto y no llega a Seq.',
        fix: 'logger.LogInformation("Creando pedido para el cliente {CustomerId}", request.CustomerId);',
      },
    ],
  },
  {
    id: 'w5-fill-serilog',
    type: 'fill',
    title: 'Completa: configuración de Serilog',
    description: 'Program.cs y appsettings.json listos para Seq.',
    concept: 'Serilog',
    rounds: [
      {
        file: 'Program.cs',
        task: 'Registra Serilog leyendo la configuración y loguea cada petición.',
        code: `builder.Services.[[0]]((services, lc) => lc
    .ReadFrom.[[1]](builder.Configuration)
    .ReadFrom.Services(services)
    .Enrich.[[2]]());

var app = builder.Build();
app.UseExceptionHandler();
app.[[3]]();
app.MapControllers();`,
        blanks: [
          { options: ['AddSerilog', 'AddLogging', 'AddSeq', 'UseSerilog'], answer: 'AddSerilog' },
          { options: ['Configuration', 'Json', 'Settings', 'AppSettings'], answer: 'Configuration' },
          { options: ['FromLogContext', 'WithThreadId', 'FromServices', 'WithProperty'], answer: 'FromLogContext' },
          { options: ['UseSerilogRequestLogging', 'UseHttpLogging', 'UseRouting', 'UseSeq'], answer: 'UseSerilogRequestLogging' },
        ],
        why: 'FromLogContext permite que BeginScope y LogContext agreguen propiedades. UseSerilogRequestLogging emite un evento por petición.',
      },
      {
        file: 'appsettings.json',
        task: 'Silencia el ruido del framework y envía a Seq.',
        code: `"Serilog": {
  "Using": [ "Serilog.Sinks.Console", "[[0]]" ],
  "MinimumLevel": {
    "Default": "[[1]]",
    "Override": { "Microsoft.AspNetCore": "[[2]]" }
  },
  "WriteTo": {
    "Console": { "Name": "Console" },
    "Seq": { "Name": "Seq", "Args": { "[[3]]": "http://localhost:5341" } }
  }
}`,
        blanks: [
          { options: ['Serilog.Sinks.Seq', 'Seq.Client', 'Serilog.Seq', 'Datalust.Seq'], answer: 'Serilog.Sinks.Seq' },
          { options: ['Information', 'Verbose', 'Error', 'Fatal'], answer: 'Information' },
          { options: ['Warning', 'Debug', 'Information', 'Verbose'], answer: 'Warning' },
          { options: ['serverUrl', 'url', 'endpoint', 'host'], answer: 'serverUrl' },
        ],
        why: 'Information como base, Warning para el framework (sin eso, cada petición genera una docena de líneas), y el sink de Seq necesita serverUrl.',
      },
    ],
  },
  {
    id: 'w5-consultas-seq',
    type: 'choice',
    title: 'Consultas en Seq',
    description: 'Elige el filtro de Seq que responde a cada pregunta.',
    concept: 'Seq',
    rounds: [
      { prompt: 'Solo los eventos de nivel Error.', options: ["@Level = 'Error'", "Level == Error", "level:error", "@Message = 'Error'"], answer: "@Level = 'Error'", why: '@Level es una propiedad incorporada de cada evento.' },
      { prompt: 'Todo lo que pasó con el producto 42.', options: ['ProductId = 42', "@Message like '%42%'", 'Id = 42', "ProductId = '42'"], answer: 'ProductId = 42', why: 'Funciona porque usaste templates: ProductId es una propiedad numérica.' },
      { prompt: 'Peticiones que respondieron 500 o más.', options: ['StatusCode >= 500', "StatusCode = '5xx'", '@Level = 500', 'Status > 499ms'], answer: 'StatusCode >= 500', why: 'UseSerilogRequestLogging agrega StatusCode a cada petición.' },
      { prompt: 'Peticiones que tardaron más de 1 segundo.', options: ['Elapsed > 1000', 'Elapsed > 1', "Duration > '1s'", '@Elapsed > 1000'], answer: 'Elapsed > 1000', why: 'Elapsed está en milisegundos.' },
      { prompt: 'Mensajes que mencionan «timeout».', options: ["@Message like '%timeout%'", "@Message = 'timeout'", "timeout", "Message contains timeout"], answer: "@Message like '%timeout%'", why: 'like con % busca el texto en cualquier parte del mensaje.' },
    ],
  },
  {
    id: 'w5-consola-seq',
    type: 'terminal',
    title: 'Consola: Seq en Docker y en Kubernetes',
    description: 'Levanta Seq localmente y luego dentro del clúster.',
    concept: 'Seq',
    steps: [
      {
        goal: 'Levanta Seq en Docker: nombre seq, en segundo plano, aceptando la EULA, con volumen seq-data en /data y el puerto 5341 del host apuntando al 80 del contenedor.',
        rules: [
          'docker run',
          { m: '-d|--detach', label: 'segundo plano (-d)' },
          { m: '--name seq|--name=seq', label: 'el nombre (--name seq)' },
          { m: '-e ACCEPT_EULA=Y|--env ACCEPT_EULA=Y', label: 'aceptar la EULA (-e ACCEPT_EULA=Y)' },
          { m: '-v seq-data:/data|--volume seq-data:/data', label: 'el volumen (-v seq-data:/data)' },
          { m: '-p 5341:80|--publish 5341:80', label: 'el puerto (-p 5341:80)' },
          { m: '~ datalust/seq(:[\\w.-]+)?$', label: 'la imagen datalust/seq al final' },
        ],
        answer: 'docker run -d --name seq -e ACCEPT_EULA=Y -v seq-data:/data -p 5341:80 datalust/seq',
        output: "Unable to find image 'datalust/seq:latest' locally\nlatest: Pulling from datalust/seq\nStatus: Downloaded newer image for datalust/seq:latest\n7c1e0b9a2d3f...",
        why: 'Abre http://localhost:5341. Agrega -e SEQ_FIRSTRUN_ADMINPASSWORD=... para que pida usuario desde el primer arranque.',
        hint: 'docker run -d --name ... -e ... -v ... -p ... datalust/seq',
      },
      {
        goal: 'Agrega el repositorio de charts de Datalust con el nombre datalust (https://helm.datalust.co).',
        rules: ['helm repo add', { m: 'datalust', label: 'el nombre datalust' }, { m: 'https://helm.datalust.co', label: 'la URL del repositorio' }],
        answer: 'helm repo add datalust https://helm.datalust.co',
        output: '"datalust" has been added to your repositories',
        why: 'Igual que agregar una fuente de paquetes NuGet, pero de charts.',
      },
      {
        goal: 'Actualiza el índice de los repositorios de Helm.',
        rules: ['helm repo update'],
        answer: 'helm repo update',
        output: 'Hang tight while we grab the latest from your chart repositories...\n...Successfully got an update from the "datalust" chart repository\nUpdate Complete. ⎈Happy Helming!⎈',
        why: 'Descarga la lista actualizada de charts y versiones.',
      },
      {
        goal: 'Instala (o actualiza) el release seq con el chart datalust/seq y el archivo seq-values.yaml.',
        rules: ['helm upgrade|helm install', { m: '~--install|^helm install', label: '--install' }, { m: '~ seq ', label: 'el nombre del release (seq)' }, { m: 'datalust/seq', label: 'el chart datalust/seq' }, { m: '-f seq-values.yaml|--values seq-values.yaml', label: 'el archivo de valores' }],
        answer: 'helm upgrade --install seq datalust/seq -f seq-values.yaml',
        output: 'Release "seq" does not exist. Installing it now.\nNAME: seq\nSTATUS: deployed\nREVISION: 1',
        why: 'seq-values.yaml acepta la EULA, define la contraseña inicial y activa la persistencia.',
      },
      {
        goal: 'Lista los Services para confirmar el nombre y los puertos de Seq.',
        rules: ['kubectl get svc|kubectl get service|kubectl get services'],
        answer: 'kubectl get svc',
        output: 'NAME          TYPE        CLUSTER-IP      PORT(S)            AGE\ncatalog-api   NodePort    10.96.120.15    80:31234/TCP       2h\npostgres      ClusterIP   10.96.44.201    5432/TCP           2h\nseq           ClusterIP   10.96.88.73     80/TCP,5341/TCP    30s',
        why: 'El Service se llama seq y expone 80 (interfaz) y 5341 (ingesta). La API enviará a http://seq:5341.',
      },
      {
        goal: 'Configura en el deployment catalog-api la variable Serilog__WriteTo__Seq__Args__serverUrl=http://seq:5341.',
        rules: ['kubectl set env', { m: '~(deployment|deploy)[/ ]catalog-api', label: 'el deployment' }, { m: 'Serilog__WriteTo__Seq__Args__serverUrl=http://seq:5341', label: 'la variable con su valor' }],
        answer: 'kubectl set env deployment/catalog-api Serilog__WriteTo__Seq__Args__serverUrl=http://seq:5341',
        output: 'deployment.apps/catalog-api env updated',
        why: 'Cambiar el env reinicia los Pods. En el proyecto, déjalo fijo en el ConfigMap o en values.yaml para que no se pierda.',
      },
      {
        goal: 'Abre la interfaz de Seq en tu puerto local 8081.',
        rules: ['kubectl port-forward', { m: '~(svc|service)/seq', label: 'el Service (svc/seq)' }, { m: '8081:80', label: 'los puertos 8081:80' }],
        answer: 'kubectl port-forward svc/seq 8081:80',
        output: 'Forwarding from 127.0.0.1:8081 -> 80\nForwarding from [::1]:8081 -> 80',
        why: 'Abre http://localhost:8081: ahí verás los logs de todos los Pods de tu API.',
      },
    ],
  },
  {
    id: 'w5-orden-pipeline',
    type: 'order',
    title: 'Pasos del pipeline',
    description: 'Ordena los pasos del pipeline de CI/CD.',
    concept: 'CI/CD',
    items: [
      'actions/checkout',
      'actions/setup-dotnet',
      'dotnet restore',
      'dotnet build --no-restore',
      'dotnet test --no-build',
      'docker build y push de la imagen',
      'helm upgrade --install',
      'kubectl rollout status',
    ],
  },
  {
    id: 'w5-fill-workflow',
    type: 'fill',
    title: 'Completa: workflow de GitHub Actions',
    description: 'Un pipeline de CI que corre en cada push y PR.',
    concept: 'GitHub Actions',
    rounds: [
      {
        file: '.github/workflows/ci.yml',
        task: 'Completa el job de build.',
        code: `on:
  [[0]]:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: [[1]]
    steps:
      - uses: [[2]]
      - uses: actions/setup-dotnet@v5
        with:
          dotnet-version: '[[3]]'
      - run: dotnet restore
      - run: dotnet build [[4]] -c Release`,
        blanks: [
          { options: ['push', 'commit', 'merge', 'schedule'], answer: 'push' },
          { options: ['ubuntu-latest', 'docker', 'minikube', 'dotnet-10'], answer: 'ubuntu-latest' },
          { options: ['actions/checkout@v6', 'actions/git@v6', 'git clone', 'actions/download@v6'], answer: 'actions/checkout@v6' },
          { options: ['10.0.x', '8.0.x', 'latest', 'net10.0'], answer: '10.0.x' },
          { options: ['--no-restore', '--no-build', '--restore', '--force'], answer: '--no-restore' },
        ],
        why: 'Sin checkout el runner no tiene tu código; la versión del SDK debe coincidir con net10.0; --no-restore evita repetir el paso anterior.',
      },
      {
        file: '.github/workflows/ci.yml',
        task: 'Completa el job que publica la imagen.',
        code: `  image:
    [[0]]: build
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: [[1]]
    steps:
      - uses: actions/checkout@v6
      - uses: docker/login-action@v4
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ [[2]] }}`,
        blanks: [
          { options: ['needs', 'after', 'depends_on', 'requires'], answer: 'needs' },
          { options: ['write', 'read', 'none', 'admin'], answer: 'write' },
          { options: ['secrets.GITHUB_TOKEN', 'github.token_password', 'env.PASSWORD', '"MiClave123"'], answer: 'secrets.GITHUB_TOKEN' },
        ],
        why: 'needs encadena jobs; packages: write permite publicar en GHCR; el token automático evita guardar contraseñas.',
      },
    ],
  },
  {
    id: 'w5-bugs-workflow',
    type: 'bugfix',
    title: 'Encuentra el error: pipelines',
    description: 'Workflows que fallan o filtran secretos.',
    concept: 'CI/CD',
    rounds: [
      {
        file: '.github/workflows/ci.yml',
        code: `steps:
  - uses: actions/checkout@v6
  - uses: actions/setup-dotnet@v5
    with:
      dotnet-version: '8.0.x'
  - run: dotnet restore
  - run: dotnet build --no-restore -c Release`,
        bad: 5,
        why: 'El proyecto apunta a net10.0: con el SDK 8 el restore falla con «The current .NET SDK does not support targeting .NET 10.0».',
        fix: "      dotnet-version: '10.0.x'",
      },
      {
        file: '.github/workflows/ci.yml',
        code: `steps:
  - uses: actions/checkout@v6
  - uses: actions/setup-dotnet@v5
    with:
      dotnet-version: '10.0.x'
  - run: dotnet build --no-restore -c Release
  - run: dotnet restore`,
        bad: 6,
        why: 'build con --no-restore corre antes del restore: no encuentra los paquetes y falla.',
        fix: '  - run: dotnet restore\n  - run: dotnet build --no-restore -c Release',
      },
      {
        file: '.github/workflows/ci.yml',
        code: `- uses: docker/login-action@v4
  with:
    registry: ghcr.io
    username: AdrianCM21
    password: ghp_TOKEN_DE_EJEMPLO_PEGADO_EN_EL_REPO
- uses: docker/build-push-action@v7`,
        bad: 5,
        why: 'Un token personal en el repo: cualquiera con acceso puede publicar en tu nombre. Revócalo de inmediato.',
        fix: '    password: ${{ secrets.GITHUB_TOKEN }}',
      },
      {
        file: '.github/workflows/ci.yml',
        code: `- uses: docker/build-push-action@v7
  with:
    context: .
    push: true
    tags: ghcr.io/AdrianCM21/catalog-api:latest`,
        bad: 5,
        why: 'GHCR exige el nombre en minúsculas, y solo latest no te dice qué commit corre ni permite volver atrás.',
        fix: '    tags: ${{ steps.meta.outputs.tags }}   # sha-abc1234 y 1.2.0, en minúsculas',
      },
    ],
  },
  {
    id: 'w5-consola-release',
    type: 'terminal',
    title: 'Consola: publicar una versión',
    description: 'Del cambio en tu máquina a una versión etiquetada.',
    concept: 'Git y versionado',
    steps: [
      {
        goal: 'Revisa qué archivos cambiaste.',
        rules: ['git status'],
        answer: 'git status',
        output: "On branch main\nChanges not staged for commit:\n  modified:   src/Catalog.Api/Program.cs\n  modified:   src/Catalog.Application/Products/ProductService.cs\nUntracked files:\n  .github/workflows/ci.yml",
        why: 'Antes de un commit confirma que no se cuela nada que no deba (como .env).',
      },
      {
        goal: 'Agrega todos los cambios al área de preparación.',
        rules: ['git add', { m: '.|-A|--all', label: 'qué agregar (. o -A)' }],
        answer: 'git add .',
        why: '.gitignore se encarga de excluir bin/, obj/ y .env.',
      },
      {
        goal: 'Haz un commit con el mensaje «ci: pipeline de build y publicación de imagen».',
        rules: ['git commit', { m: '~-m ["\']ci: pipeline de build y publicaci[oó]n de imagen["\']', label: 'el mensaje con -m' }],
        answer: 'git commit -m "ci: pipeline de build y publicación de imagen"',
        output: '[main 4f2a9c1] ci: pipeline de build y publicación de imagen\n 3 files changed, 64 insertions(+), 2 deletions(-)\n create mode 100644 .github/workflows/ci.yml',
        why: 'El prefijo ci: dice qué tipo de cambio es (Conventional Commits).',
      },
      {
        goal: 'Sube la rama main a origin.',
        rules: ['git push', { m: 'origin', label: 'el remoto origin' }, { m: 'main', label: 'la rama main' }],
        answer: 'git push origin main',
        output: 'To github.com:AdrianCM21/catalog-api.git\n   9b3e1d0..4f2a9c1  main -> main',
        why: 'Este push dispara el workflow de CI.',
      },
      {
        goal: 'Mira las ejecuciones del workflow con la CLI de GitHub.',
        rules: ['gh run list|gh run watch'],
        answer: 'gh run list',
        output: 'STATUS  TITLE                                          WORKFLOW  BRANCH  EVENT  ELAPSED\n✓       ci: pipeline de build y publicación de imagen  ci        main    push   2m14s',
        why: 'Verde: build y tests pasaron y la imagen se publicó. gh run watch lo sigue en vivo.',
      },
      {
        goal: 'Crea la etiqueta anotada v1.0.0 con el mensaje «Primera versión entregable».',
        rules: ['git tag', { m: '-a v1.0.0|--annotate v1.0.0', label: 'la etiqueta anotada (-a v1.0.0)' }, { m: '~-m ["\']Primera versi[oó]n entregable["\']', label: 'el mensaje con -m' }],
        answer: 'git tag -a v1.0.0 -m "Primera versión entregable"',
        why: 'Una etiqueta anotada guarda autor, fecha y mensaje. Es la referencia oficial de la versión.',
      },
      {
        goal: 'Sube la etiqueta v1.0.0 a origin.',
        rules: ['git push', { m: 'origin', label: 'el remoto' }, { m: 'v1.0.0|--tags', label: 'la etiqueta' }],
        answer: 'git push origin v1.0.0',
        output: 'To github.com:AdrianCM21/catalog-api.git\n * [new tag]         v1.0.0 -> v1.0.0',
        why: "El workflow escucha tags: ['v*'], así que publica la imagen también con la etiqueta 1.0.0.",
      },
    ],
  },
  {
    id: 'w5-terminos',
    type: 'match',
    title: 'Vocabulario de CI/CD',
    description: 'Une cada término con su definición.',
    concept: 'CI/CD',
    pairs: [
      ['Integración continua', 'Compilar y probar en cada push o PR'],
      ['Despliegue continuo', 'Desplegar automáticamente lo que pasa el pipeline'],
      ['Runner', 'La máquina donde corre un job'],
      ['Job', 'Grupo de pasos que corre en un runner'],
      ['Artefacto', 'Resultado del build: por ejemplo, la imagen'],
      ['Secret', 'Valor sensible que el workflow usa sin mostrarlo'],
    ],
  },
  {
    id: 'w5-semver',
    type: 'choice',
    title: '¿Qué versión sigue?',
    description: 'Aplica versionado semántico a cada cambio. Versión actual: 1.4.2.',
    concept: 'Versionado',
    rounds: [
      { prompt: 'Corriges el 500 que salía al repetir un SKU (ahora es 409).', options: ['1.4.3', '1.5.0', '2.0.0'], answer: '1.4.3', why: 'Corrección compatible: PARCHE.' },
      { prompt: 'Agregas el endpoint GET /api/v1/categories.', options: ['1.4.3', '1.5.0', '2.0.0'], answer: '1.5.0', why: 'Funcionalidad nueva que no rompe a nadie: MENOR.' },
      { prompt: 'Quitas el campo description de ProductResponse.', options: ['1.4.3', '1.5.0', '2.0.0'], answer: '2.0.0', why: 'Rompe a los clientes que lo leían: MAYOR (y conviene una ruta /api/v2).' },
      { prompt: 'Agregas un campo opcional sku a la respuesta.', options: ['1.4.3', '1.5.0', '2.0.0'], answer: '1.5.0', why: 'Agregar campos opcionales es compatible: MENOR.' },
      { prompt: 'Cambias price de número a texto en el JSON.', options: ['1.4.3', '1.5.0', '2.0.0'], answer: '2.0.0', why: 'Cambiar un tipo rompe a los clientes: MAYOR.' },
    ],
  },
]
