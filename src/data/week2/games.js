// Juegos de la semana 2

const p = (name) => `src/${name}/${name}.csproj`

export const games = [
  {
    id: 'w2-consola-solucion',
    type: 'terminal',
    title: 'Consola: solución por capas',
    description: 'Arma desde cero la solución con Domain, Application, Infrastructure y Api.',
    concept: 'Clean Architecture',
    steps: [
      {
        goal: 'Crea un archivo de solución llamado Catalog.',
        rules: ['dotnet new sln', { m: '-n Catalog|--name Catalog', label: 'el nombre con -n' }],
        answer: 'dotnet new sln -n Catalog',
        output: 'The template "Solution File" was created successfully.',
        why: 'Desde .NET 10 la solución se crea en formato .slnx (XML), como el BootcampCLTNoviembre.slnx de tu proyecto.',
        hint: 'dotnet new <plantilla> -n <nombre>. La plantilla de solución se llama sln.',
      },
      {
        goal: 'Crea la biblioteca de clases Catalog.Domain dentro de src/Catalog.Domain.',
        rules: [
          'dotnet new classlib',
          { m: '-n Catalog.Domain|--name Catalog.Domain', label: 'el nombre con -n' },
          { m: '-o src/Catalog.Domain|--output src/Catalog.Domain', label: 'la carpeta con -o' },
        ],
        answer: 'dotnet new classlib -n Catalog.Domain -o src/Catalog.Domain',
        output: 'The template "Class Library" was created successfully.',
        why: 'classlib es una biblioteca sin punto de entrada: perfecta para capas que no se ejecutan solas.',
        hint: 'Plantilla classlib, -n para el nombre, -o para la carpeta.',
      },
      {
        goal: 'Crea Catalog.Application en src/Catalog.Application.',
        rules: [
          'dotnet new classlib',
          { m: '-n Catalog.Application|--name Catalog.Application', label: 'el nombre' },
          { m: '-o src/Catalog.Application|--output src/Catalog.Application', label: 'la carpeta' },
        ],
        answer: 'dotnet new classlib -n Catalog.Application -o src/Catalog.Application',
        output: 'The template "Class Library" was created successfully.',
        why: 'Application tendrá los casos de uso, DTOs e interfaces.',
      },
      {
        goal: 'Crea Catalog.Infrastructure en src/Catalog.Infrastructure.',
        rules: [
          'dotnet new classlib',
          { m: '-n Catalog.Infrastructure|--name Catalog.Infrastructure', label: 'el nombre' },
          { m: '-o src/Catalog.Infrastructure|--output src/Catalog.Infrastructure', label: 'la carpeta' },
        ],
        answer: 'dotnet new classlib -n Catalog.Infrastructure -o src/Catalog.Infrastructure',
        output: 'The template "Class Library" was created successfully.',
        why: 'Infrastructure tendrá EF Core y todo lo que habla con el mundo exterior.',
      },
      {
        goal: 'Crea la Web API con controllers Catalog.Api en src/Catalog.Api.',
        rules: [
          'dotnet new webapi',
          { m: '--use-controllers|-controllers', label: 'la opción de controllers' },
          { m: '-n Catalog.Api|--name Catalog.Api', label: 'el nombre' },
          { m: '-o src/Catalog.Api|--output src/Catalog.Api', label: 'la carpeta' },
        ],
        answer: 'dotnet new webapi --use-controllers -n Catalog.Api -o src/Catalog.Api',
        output: 'The template "ASP.NET Core Web API" was created successfully.',
        why: 'La Api es el único proyecto ejecutable: la capa más externa.',
      },
      {
        goal: 'Agrega los cuatro proyectos a la solución de una vez (usa el comodín src/*/*.csproj).',
        rules: ['dotnet sln add|dotnet sln Catalog.slnx add', { m: '~src/', label: 'las rutas de los proyectos' }],
        answer: 'dotnet sln add src/*/*.csproj',
        output: `Project \`${p('Catalog.Api')}\` added to the solution.\nProject \`${p('Catalog.Application')}\` added to the solution.\nProject \`${p('Catalog.Domain')}\` added to the solution.\nProject \`${p('Catalog.Infrastructure')}\` added to the solution.`,
        why: 'La terminal expande el comodín a los cuatro .csproj. Ahora el IDE y dotnet build ven toda la solución.',
        hint: 'dotnet sln add <rutas>.',
      },
      {
        goal: 'Haz que Application referencie a Domain.',
        rules: [
          'dotnet add|dotnet reference add',
          { m: '~Catalog\\.Application(/Catalog\\.Application\\.csproj)?( |$)', label: 'el proyecto Application' },
          { m: '~reference', label: 'la palabra reference' },
          { m: '~src/Catalog\\.Domain', label: 'la ruta de Domain' },
        ],
        answer: `dotnet add ${p('Catalog.Application')} reference ${p('Catalog.Domain')}`,
        output: `Reference \`..\\Catalog.Domain\\Catalog.Domain.csproj\` added to the project.`,
        why: 'Application usa las entidades de Domain. Domain no referencia a nadie.',
        hint: 'dotnet add <proyecto que recibe> reference <proyecto referenciado>.',
      },
      {
        goal: 'Haz que Infrastructure referencie a Application.',
        rules: [
          'dotnet add|dotnet reference add',
          { m: '~Catalog\\.Infrastructure(/Catalog\\.Infrastructure\\.csproj)?( |$)', label: 'el proyecto Infrastructure' },
          { m: '~reference', label: 'la palabra reference' },
          { m: '~src/Catalog\\.Application', label: 'la ruta de Application' },
        ],
        answer: `dotnet add ${p('Catalog.Infrastructure')} reference ${p('Catalog.Application')}`,
        output: `Reference \`..\\Catalog.Application\\Catalog.Application.csproj\` added to the project.`,
        why: 'Infrastructure implementa las interfaces que define Application. Por transitividad también ve Domain.',
      },
      {
        goal: 'Haz que Api referencie a Application y a Infrastructure en un solo comando.',
        rules: [
          'dotnet add|dotnet reference add',
          { m: '~(Catalog\\.Api(/Catalog\\.Api\\.csproj)? reference|--project src/Catalog\\.Api)', label: 'el proyecto Api' },
          { m: '~src/Catalog\\.Application', label: 'Application' },
          { m: '~src/Catalog\\.Infrastructure', label: 'Infrastructure' },
        ],
        answer: `dotnet add ${p('Catalog.Api')} reference ${p('Catalog.Application')} ${p('Catalog.Infrastructure')}`,
        output: 'Reference `..\\Catalog.Application\\Catalog.Application.csproj` added to the project.\nReference `..\\Catalog.Infrastructure\\Catalog.Infrastructure.csproj` added to the project.',
        why: 'Api necesita Infrastructure solo para registrar sus servicios en DI (la «composition root»).',
      },
      {
        goal: 'Compila toda la solución.',
        rules: ['dotnet build'],
        answer: 'dotnet build',
        output: 'Catalog.Domain -> .../Catalog.Domain.dll\nCatalog.Application -> .../Catalog.Application.dll\nCatalog.Infrastructure -> .../Catalog.Infrastructure.dll\nCatalog.Api -> .../Catalog.Api.dll\n\nBuild succeeded.',
        why: 'Fíjate en el orden: compila primero lo que no depende de nadie.',
      },
    ],
  },
  {
    id: 'w2-capas',
    type: 'classify',
    title: '¿En qué capa va?',
    description: 'Ubica cada pieza en la capa correcta de Clean Architecture.',
    concept: 'Clean Architecture',
    question: '¿En qué capa va esta pieza?',
    buckets: [
      { id: 'domain', label: 'Domain', desc: 'Entidades y reglas' },
      { id: 'application', label: 'Application', desc: 'Casos de uso y DTOs' },
      { id: 'infrastructure', label: 'Infrastructure', desc: 'EF Core y servicios externos' },
      { id: 'api', label: 'Api', desc: 'HTTP y arranque' },
    ],
    items: [
      { text: 'La entidad Product con la regla «el precio debe ser mayor a 0»', bucket: 'domain', why: 'Las reglas que siempre se cumplen viven en la entidad.' },
      { text: 'El enum ProductStatus (Active, Discontinued)', bucket: 'domain', why: 'Es parte del lenguaje del negocio.' },
      { text: 'DomainException', bucket: 'domain', why: 'La lanza el dominio cuando se rompe una regla.' },
      { text: 'CreateProductRequest (el DTO de entrada)', bucket: 'application', why: 'Define qué datos acepta el caso de uso.' },
      { text: 'ProductService con el caso de uso «crear producto»', bucket: 'application', why: 'Orquesta: valida, usa el repositorio, guarda.' },
      { text: 'El validador de CreateProductRequest', bucket: 'application', why: 'Valida la entrada del caso de uso.' },
      { text: 'AppDbContext de EF Core', bucket: 'infrastructure', why: 'Es un detalle técnico de persistencia.' },
      { text: 'EfProductRepository', bucket: 'infrastructure', why: 'Implementa la interfaz de Application usando EF Core.' },
      { text: 'Las migraciones de la base de datos', bucket: 'infrastructure', why: 'Van junto al DbContext que las genera.' },
      { text: 'Un cliente HTTP para la pasarela de pagos', bucket: 'infrastructure', why: 'Toda comunicación con sistemas externos es infraestructura.' },
      { text: 'ProductsController', bucket: 'api', why: 'Traduce HTTP a llamadas al caso de uso.' },
      { text: 'GlobalExceptionHandler', bucket: 'api', why: 'Convierte excepciones en respuestas HTTP: es asunto de la capa web.' },
      { text: 'La configuración de middlewares y DI en Program.cs', bucket: 'api', why: 'Api es la «composition root»: arma la aplicación.' },
    ],
  },
  {
    id: 'w2-binding',
    type: 'choice',
    title: '¿De dónde viene el dato?',
    description: 'Elige el atributo de model binding correcto.',
    concept: 'Model binding',
    rounds: [
      { prompt: 'El 42 en GET /products/42', options: ['[FromRoute]', '[FromQuery]', '[FromBody]', '[FromHeader]'], answer: '[FromRoute]', why: 'Es un segmento de la ruta: {id:int}.' },
      { prompt: 'El 2 en GET /products?page=2', options: ['[FromRoute]', '[FromQuery]', '[FromBody]', '[FromHeader]'], answer: '[FromQuery]', why: 'Todo lo que va después del ? es query string.' },
      { prompt: 'El JSON del producto en un POST', options: ['[FromRoute]', '[FromQuery]', '[FromBody]', '[FromHeader]'], answer: '[FromBody]', why: 'El cuerpo de la petición.' },
      { prompt: 'El valor de X-Request-Id', options: ['[FromRoute]', '[FromQuery]', '[FromBody]', '[FromHeader]'], answer: '[FromHeader]', why: 'Los headers se leen con [FromHeader(Name = "X-Request-Id")].' },
      { prompt: 'Un ILogger que solo usa una action', options: ['[FromBody]', '[FromQuery]', '[FromServices]', '[FromHeader]'], answer: '[FromServices]', why: 'Pide el servicio al contenedor de DI solo para ese método.' },
      { prompt: 'Un record ProductQuery con Category, Page y PageSize en un GET', options: ['[FromRoute]', '[FromQuery]', '[FromBody]', '[FromServices]'], answer: '[FromQuery]', why: 'Un GET no lleva body. Sin [FromQuery], [ApiController] intentaría leerlo del body.' },
    ],
  },
  {
    id: 'w2-lifetimes',
    type: 'choice',
    title: 'Ciclo de vida correcto',
    description: 'Elige cómo registrar cada servicio en DI.',
    concept: 'Inyección de dependencias',
    rounds: [
      { prompt: 'AppDbContext de EF Core', options: ['Singleton', 'Scoped', 'Transient'], answer: 'Scoped', why: 'Una instancia por petición: no es thread-safe y guarda cambios de esa petición. AddDbContext ya lo registra así.' },
      { prompt: 'EfProductRepository, que recibe el AppDbContext', options: ['Singleton', 'Scoped', 'Transient'], answer: 'Scoped', why: 'Debe vivir lo mismo que el DbContext que usa.' },
      { prompt: 'Las opciones de configuración leídas al arrancar', options: ['Singleton', 'Scoped', 'Transient'], answer: 'Singleton', why: 'No cambian por petición: una instancia alcanza.' },
      { prompt: 'Un formateador de precios sin estado que se usa poco', options: ['Singleton', 'Scoped', 'Transient'], answer: 'Transient', why: 'Liviano y sin estado. Singleton también funcionaría; Transient es la opción más simple.' },
      { prompt: 'Un caché en memoria compartido por toda la app', options: ['Singleton', 'Scoped', 'Transient'], answer: 'Singleton', why: 'Si fuera Scoped, cada petición tendría su propio caché vacío.' },
      { prompt: 'Un Singleton necesita usar el DbContext. ¿Qué haces?', options: ['Lo inyecto directo', 'Inyecto IServiceScopeFactory y creo un scope', 'Cambio el DbContext a Singleton'], answer: 'Inyecto IServiceScopeFactory y creo un scope', why: 'Inyectarlo directo genera una dependencia cautiva. Crear un scope te da un DbContext nuevo y bien liberado.' },
    ],
  },
  {
    id: 'w2-bugs-controller',
    type: 'bugfix',
    title: 'Encuentra el error: controllers',
    description: 'Cada archivo tiene una línea que rompe una buena práctica de la rúbrica.',
    concept: 'Diseño de APIs',
    rounds: [
      {
        file: 'ProductsController.cs',
        code: `[HttpPost]
[ProducesResponseType<ProductResponse>(StatusCodes.Status201Created)]
public async Task<ActionResult<ProductResponse>> Create(
    CreateProductRequest request, CancellationToken ct)
{
    var created = await service.CreateAsync(request, ct);
    return Ok(created);
}`,
        bad: 7,
        why: 'Crear un recurso debe responder 201 Created con el header Location, no 200.',
        fix: 'return CreatedAtAction(nameof(GetById), new { id = created.Id, version = "1.0" }, created);',
      },
      {
        file: 'ProductsController.cs',
        code: `[HttpGet("{id:int}")]
public async Task<ActionResult<ProductResponse>> GetById(int id, CancellationToken ct)
{
    try
    {
        return Ok(await service.GetByIdAsync(id, ct));
    }
    catch (Exception ex)
    {
        return StatusCode(500, ex.ToString());
    }
}`,
        bad: 10,
        why: 'Devuelve el stack trace completo al cliente: es un leak. Además convierte un «no encontrado» en 500.',
        fix: '// Quita el try/catch. El GlobalExceptionHandler responde 404 o 500\n// con ProblemDetails y sin detalles internos.\nreturn Ok(await service.GetByIdAsync(id, ct));',
      },
      {
        file: 'ProductsController.cs',
        code: `[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/products")]
public sealed class ProductsController(IProductService service) : ControllerBase
{
    [HttpGet("getAll")]
    public async Task<ActionResult<PagedResponse<ProductResponse>>> GetAll(
        [FromQuery] ProductQuery query, CancellationToken ct)
        => Ok(await service.ListAsync(query, ct));
}`,
        bad: 6,
        why: 'El verbo ya dice la acción. La ruta queda /products/getAll: un verbo dentro de la URL.',
        fix: '[HttpGet]  // GET /api/v1/products',
      },
      {
        file: 'ProductsController.cs',
        code: `[HttpGet("{id:int}")]
public ActionResult<ProductResponse> GetById(int id)
{
    var product = service.GetByIdAsync(id, CancellationToken.None).Result;
    return Ok(product);
}`,
        bad: 4,
        why: '.Result bloquea un hilo del servidor mientras espera. Bajo carga, la API se queda sin hilos.',
        fix: 'public async Task<ActionResult<ProductResponse>> GetById(int id, CancellationToken ct)\n    => Ok(await service.GetByIdAsync(id, ct));',
      },
      {
        file: 'ProductsController.cs',
        code: `[HttpPost]
public async Task<ActionResult<Product>> Create(Product product, CancellationToken ct)
{
    db.Products.Add(product);
    await db.SaveChangesAsync(ct);
    return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
}`,
        bad: 2,
        why: 'Recibe y devuelve la entidad: el cliente puede mandar Id u otros campos internos (overposting) y el contrato queda atado a la base de datos.',
        fix: 'public async Task<ActionResult<ProductResponse>> Create(CreateProductRequest request, CancellationToken ct)',
      },
      {
        file: 'ProductService.cs',
        code: `public async Task<ProductResponse> CreateAsync(CreateProductRequest request, CancellationToken ct)
{
    if (await repository.ExistsBySkuAsync(request.Sku, ct))
        throw new NotFoundException($"Ya existe el SKU {request.Sku}.");

    var product = new Product(request.Name, request.Sku, request.Price, request.Stock);
    await repository.AddAsync(product, ct);
    return product.ToResponse();
}`,
        bad: 4,
        why: 'Un duplicado no es «no encontrado». NotFoundException terminaría en 404; un conflicto con el estado actual es 409.',
        fix: 'throw new ConflictException($"Ya existe el SKU {request.Sku}.");',
      },
    ],
  },
  {
    id: 'w2-pipeline',
    type: 'order',
    title: 'Orden del pipeline',
    description: 'Ordena los middlewares de Program.cs de primero a último.',
    concept: 'Middleware',
    items: ['app.UseExceptionHandler()', 'app.UseHttpsRedirection()', 'app.UseAuthentication()', 'app.UseAuthorization()', 'app.MapControllers()'],
  },
  {
    id: 'w2-fill-errores',
    type: 'fill',
    title: 'Completa: errores y respuestas',
    description: 'Completa el código del manejo de errores y del endpoint POST.',
    concept: 'Manejo de errores',
    rounds: [
      {
        file: 'Program.cs',
        task: 'Registra ProblemDetails y el handler global, y actívalo en el pipeline.',
        code: `builder.Services.[[0]]();
builder.Services.AddExceptionHandler<[[1]]>();

var app = builder.Build();
app.[[2]]();
app.UseHttpsRedirection();
app.MapControllers();`,
        blanks: [
          { options: ['AddProblemDetails', 'AddControllers', 'AddOpenApi', 'AddLogging'], answer: 'AddProblemDetails' },
          { options: ['GlobalExceptionHandler', 'ProductsController', 'ProblemDetails', 'Exception'], answer: 'GlobalExceptionHandler' },
          { options: ['UseExceptionHandler', 'UseDeveloperExceptionPage', 'UseRouting', 'UseStatusCodePages'], answer: 'UseExceptionHandler' },
        ],
        why: 'AddProblemDetails da el formato estándar, AddExceptionHandler registra tu handler y UseExceptionHandler lo activa como primer middleware.',
      },
      {
        file: 'GlobalExceptionHandler.cs',
        task: 'Asigna el código de estado de cada excepción.',
        code: `var status = exception switch
{
    NotFoundException => StatusCodes.[[0]],
    ConflictException => StatusCodes.[[1]],
    DomainException   => StatusCodes.[[2]],
    _                 => StatusCodes.[[3]]
};`,
        blanks: [
          { options: ['Status404NotFound', 'Status400BadRequest', 'Status409Conflict', 'Status500InternalServerError'], answer: 'Status404NotFound' },
          { options: ['Status404NotFound', 'Status400BadRequest', 'Status409Conflict', 'Status500InternalServerError'], answer: 'Status409Conflict' },
          { options: ['Status404NotFound', 'Status400BadRequest', 'Status409Conflict', 'Status500InternalServerError'], answer: 'Status400BadRequest' },
          { options: ['Status404NotFound', 'Status400BadRequest', 'Status409Conflict', 'Status500InternalServerError'], answer: 'Status500InternalServerError' },
        ],
        why: 'Todo lo inesperado cae en 500, y en ese caso el detalle real solo va al log.',
      },
      {
        file: 'ProductsController.cs',
        task: 'Completa el endpoint POST para que el contrato OpenAPI quede correcto.',
        code: `[HttpPost]
[ProducesResponseType<ProductResponse>(StatusCodes.[[0]])]
[ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
public async Task<ActionResult<ProductResponse>> Create(
    [[1]] request, CancellationToken ct)
{
    var created = await service.CreateAsync(request, ct);
    return [[2]](nameof(GetById), new { id = created.Id, version = "1.0" }, created);
}`,
        blanks: [
          { options: ['Status201Created', 'Status200OK', 'Status204NoContent', 'Status202Accepted'], answer: 'Status201Created' },
          { options: ['CreateProductRequest', 'Product', 'ProductResponse', 'AppDbContext'], answer: 'CreateProductRequest' },
          { options: ['CreatedAtAction', 'Ok', 'Created', 'AcceptedAtAction'], answer: 'CreatedAtAction' },
        ],
        why: 'CreatedAtAction responde 201 y arma el header Location apuntando a GetById.',
      },
    ],
  },
  {
    id: 'w2-excepcion-status',
    type: 'match',
    title: 'Situación y código',
    description: 'Une cada situación con el código HTTP que debe devolver.',
    concept: 'Códigos HTTP',
    pairs: [
      ['El producto 99 no existe', '404 Not Found'],
      ['Falta el nombre en el JSON', '400 Bad Request'],
      ['El SKU ya está registrado', '409 Conflict'],
      ['Se borró correctamente', '204 No Content'],
      ['Se creó el producto', '201 Created'],
      ['Se cayó la base de datos', '500 Internal Server Error'],
    ],
  },
]
