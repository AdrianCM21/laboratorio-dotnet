// Semana 2 · APIs ASP.NET Core
// Rúbrica: Diseño REST (6) · Contrato OpenAPI (5) · Clean Architecture (7) · Manejo de errores (7)

export const lessons = [
  {
    id: 'w2-diseno-rest',
    title: 'Diseño REST profesional',
    minutes: 12,
    blocks: [
      { p: 'La rúbrica da **6 puntos** a «rutas semánticas, verbos HTTP adecuados, versionado». Estas son las reglas que lo cubren.' },
      { h: 'Rutas: sustantivos, plural, jerarquía' },
      {
        table: {
          head: ['Acción', 'Ruta', 'Respuesta'],
          rows: [
            ['Listar productos', '`GET /api/v1/products`', '200 + lista paginada'],
            ['Ver un producto', '`GET /api/v1/products/42`', '200 o 404'],
            ['Crear', '`POST /api/v1/products`', '201 + header `Location`'],
            ['Reemplazar', '`PUT /api/v1/products/42`', '204 o 404'],
            ['Modificar parte', '`PATCH /api/v1/products/42`', '204 o 404'],
            ['Borrar', '`DELETE /api/v1/products/42`', '204 o 404'],
            ['Ítems de un pedido', '`GET /api/v1/orders/7/items`', '200'],
          ],
        },
      },
      {
        compare: {
          lang: 'http',
          bad: 'GET  /api/getProducts\nPOST /api/products/create\nGET  /api/Product?id=42\nPOST /api/products/42/delete',
          good: 'GET    /api/v1/products\nPOST   /api/v1/products\nGET    /api/v1/products/42\nDELETE /api/v1/products/42',
        },
      },
      { h: 'Filtrar, ordenar y paginar con query params' },
      { code: 'GET /api/v1/products?category=electronics&minPrice=100&sort=-price&page=2&pageSize=20', lang: 'http' },
      {
        list: [
          'Los filtros nunca van en la ruta: `/products/electronics` parece un id.',
          'Pon un **límite máximo** a `pageSize` (por ejemplo 100). Si no, alguien pide un millón de filas.',
          'Devuelve el total para que el cliente arme la paginación:',
        ],
      },
      { code: '{\n  "items": [ { "id": 21, "name": "Monitor" } ],\n  "page": 2,\n  "pageSize": 20,\n  "totalCount": 134\n}', lang: 'json' },
      { h: 'PUT vs PATCH' },
      { p: '`PUT` reemplaza el recurso completo: si no envías `description`, queda vacía. `PATCH` cambia solo los campos enviados. Ambos son idempotentes si los diseñas bien. En el proyecto basta con `PUT`.' },
      { h: 'Versionado' },
      {
        table: {
          head: ['Estrategia', 'Ejemplo', 'Comentario'],
          rows: [
            ['Segmento en la URL', '`/api/v1/products`', 'La que usa tu proyecto. Visible y fácil de probar.'],
            ['Query string', '`/api/products?api-version=1.0`', 'Válida, menos visible.'],
            ['Header', '`api-version: 1.0`', 'URLs limpias, más difícil de probar en el navegador.'],
          ],
        },
      },
      { note: 'Subes a **v2** solo cuando rompes el contrato: quitar un campo, cambiar un tipo, cambiar el significado de un endpoint. Agregar un campo opcional no rompe nada.' },
    ],
  },
  {
    id: 'w2-binding',
    title: 'Cómo llegan los datos: model binding',
    minutes: 10,
    blocks: [
      { p: '**Model binding** es lo que convierte la petición HTTP en parámetros de tu action. Con `[ApiController]`, ASP.NET Core adivina la fuente, pero conviene saber de dónde sale cada dato.' },
      {
        table: {
          head: ['Atributo', 'Fuente', 'Ejemplo'],
          rows: [
            ['`[FromRoute]`', 'Segmento de la ruta', '`/products/{id}` → `int id`'],
            ['`[FromQuery]`', 'Query string', '`?page=2` → `int page`'],
            ['`[FromBody]`', 'Cuerpo JSON', 'El DTO de un POST o PUT'],
            ['`[FromHeader]`', 'Header HTTP', '`[FromHeader(Name = "X-Request-Id")]`'],
            ['`[FromServices]`', 'Contenedor de DI', 'Un servicio solo para esa action'],
          ],
        },
      },
      { p: 'Reglas de inferencia con `[ApiController]`: un tipo complejo se lee del **body**; un tipo simple que aparece en la plantilla de ruta se lee de la **ruta**; cualquier otro tipo simple, de la **query**.' },
      {
        code: `public sealed record ProductQuery(
    string? Category,
    decimal? MinPrice,
    int Page = 1,
    int PageSize = 20);

[HttpGet]
public async Task<ActionResult<PagedResponse<ProductResponse>>> GetAll(
    [FromQuery] ProductQuery query,           // agrupa todos los filtros
    CancellationToken cancellationToken)      // se cancela si el cliente corta
{
    var page = await service.ListAsync(query, cancellationToken);
    return Ok(page);
}`,
        lang: 'csharp',
      },
      { h: 'Restricciones de ruta' },
      {
        list: [
          '`{id:int}` solo acepta enteros. `/products/abc` devuelve 404 sin llegar a tu código.',
          '`{id:guid}` para identificadores Guid.',
          '`{slug:minlength(3)}` y otras restricciones de largo.',
        ],
      },
      { h: 'CancellationToken' },
      { p: 'Si el cliente cierra la conexión, ASP.NET Core cancela el token. Pásalo a cada llamada async (EF Core, HttpClient) y el servidor deja de trabajar para nadie.' },
    ],
  },
  {
    id: 'w2-dtos',
    title: 'DTOs y validación',
    minutes: 12,
    blocks: [
      { p: 'Un **DTO** (Data Transfer Object) es la forma pública de tus datos. La entidad es la forma interna. Nunca son la misma clase.' },
      { h: 'Por qué no exponer la entidad' },
      {
        list: [
          '**Overposting:** si el POST recibe `Product`, el cliente puede enviar `Id`, `CreatedAt` o `IsDeleted` y pisar valores.',
          '**Acoplamiento:** renombrar una columna rompería a todos los clientes.',
          '**Fugas:** campos internos (costos, flags, relaciones) terminan en el JSON.',
        ],
      },
      {
        code: `// Lo que el cliente envía
public sealed record CreateProductRequest(
    [Required, StringLength(200)] string Name,
    [StringLength(1000)] string? Description,
    [Range(0.01, 1_000_000)] decimal Price,
    [Range(0, int.MaxValue)] int Stock);

// Lo que el cliente recibe
public sealed record ProductResponse(
    int Id, string Name, string? Description, decimal Price, int Stock);`,
        lang: 'csharp',
      },
      { h: 'Validación automática' },
      { p: 'Con `[ApiController]`, si el modelo no es válido la action ni se ejecuta: ASP.NET Core responde **400** con un `ValidationProblemDetails`.' },
      {
        code: `{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Price": [ "The field Price must be between 0.01 and 1000000." ]
  },
  "traceId": "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-00"
}`,
        lang: 'json',
      },
      { h: 'Dos niveles de validación' },
      {
        table: {
          head: ['Nivel', 'Qué valida', 'Dónde'],
          rows: [
            ['Formato', 'Campos obligatorios, largos, rangos', 'DTO con DataAnnotations (o FluentValidation)'],
            ['Negocio', '«No puede haber dos productos con el mismo SKU», «no se vende sin stock»', 'Application o Domain'],
          ],
        },
      },
      { note: 'Mapear entidad ↔ DTO a mano con un método `ToResponse()` es suficiente y explícito. Librerías como Mapster existen, pero no las necesitas para el proyecto.' },
    ],
  },
  {
    id: 'w2-di',
    title: 'Inyección de dependencias',
    minutes: 10,
    blocks: [
      { p: 'ASP.NET Core trae un contenedor de **inyección de dependencias** (DI). Registras un servicio una vez y el framework lo entrega a quien lo pida por constructor.' },
      {
        code: `// Program.cs: registro
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IProductRepository, EfProductRepository>();

// Controller: lo pide por constructor (constructor primario de C# 12)
public sealed class ProductsController(IProductService service) : ControllerBase
{
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductResponse>> GetById(int id, CancellationToken ct)
        => Ok(await service.GetByIdAsync(id, ct));
}`,
        lang: 'csharp',
      },
      { h: 'Ciclos de vida' },
      {
        table: {
          head: ['Lifetime', 'Cuántas instancias', 'Úsalo para'],
          rows: [
            ['`AddSingleton`', 'Una para toda la app', 'Configuración, cachés, clientes sin estado por usuario'],
            ['`AddScoped`', 'Una por petición HTTP', '`DbContext`, repositorios, servicios de aplicación'],
            ['`AddTransient`', 'Una nueva cada vez que se pide', 'Servicios livianos y sin estado'],
          ],
        },
      },
      { note: '**Dependencia cautiva:** un Singleton no puede recibir un Scoped. El Singleton viviría para siempre con un `DbContext` de la primera petición. En Development, ASP.NET Core detecta esto y lanza una excepción al arrancar.' },
      { h: 'Registrar por capa' },
      { p: 'Cada capa expone un método de extensión. `Program.cs` queda corto y cada capa decide sus propios registros.' },
      {
        code: `// Catalog.Infrastructure/DependencyInjection.cs
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<IProductRepository, EfProductRepository>();
        return services;
    }
}

// Program.cs
builder.Services
    .AddApplication()
    .AddInfrastructure(builder.Configuration);`,
        lang: 'csharp',
      },
    ],
  },
  {
    id: 'w2-clean',
    title: 'Clean Architecture',
    minutes: 14,
    blocks: [
      { p: 'La rúbrica da **7 puntos** a «separación por capas, responsabilidades claras». Clean Architecture organiza el código en capas donde **las dependencias siempre apuntan hacia adentro**.' },
      {
        stack: [
          ['4', 'Api', 'Controllers, Program.cs, middlewares, manejo global de errores. Conoce a todos.'],
          ['3', 'Infrastructure', 'EF Core, repositorios concretos, clientes HTTP, archivos. Implementa interfaces de Application.'],
          ['2', 'Application', 'Casos de uso, DTOs, interfaces (repositorios, servicios externos), validaciones.'],
          ['1', 'Domain', 'Entidades, reglas de negocio, excepciones de dominio. No depende de nada.'],
        ],
      },
      { h: 'La regla de dependencia' },
      {
        flow: [
          ['Api', 'referencia Application e Infrastructure'],
          ['Infrastructure', 'referencia Application'],
          ['Application', 'referencia Domain'],
          ['Domain', 'no referencia a nadie'],
        ],
      },
      { p: 'Application define `IProductRepository`; Infrastructure lo implementa con EF Core. Así la lógica de negocio no sabe si los datos vienen de PostgreSQL, de memoria o de una API. Esto es la **inversión de dependencias**.' },
      { h: 'Estructura de carpetas' },
      {
        code: `Catalog.slnx
src/
  Catalog.Domain/
    Products/Product.cs
    Common/DomainException.cs
  Catalog.Application/
    Products/
      CreateProductRequest.cs
      ProductResponse.cs
      IProductRepository.cs
      ProductService.cs
    DependencyInjection.cs
  Catalog.Infrastructure/
    Persistence/AppDbContext.cs
    Persistence/EfProductRepository.cs
    DependencyInjection.cs
  Catalog.Api/
    Controllers/ProductsController.cs
    Errors/GlobalExceptionHandler.cs
    Program.cs
tests/
  Catalog.Application.Tests/`,
        lang: 'text',
      },
      { h: 'Una entidad con reglas' },
      {
        code: `public sealed class Product
{
    public int Id { get; private set; }
    public string Name { get; private set; } = default!;
    public decimal Price { get; private set; }
    public int Stock { get; private set; }

    public Product(string name, decimal price, int stock)
    {
        if (price <= 0) throw new DomainException("El precio debe ser mayor a 0.");
        Name = name;
        Price = price;
        Stock = stock;
    }

    public void RemoveStock(int quantity)
    {
        if (quantity > Stock) throw new DomainException("Stock insuficiente.");
        Stock -= quantity;
    }
}`,
        lang: 'csharp',
      },
      { note: 'La interfaz del repositorio se puede ubicar en Application o en Domain; ambas variantes son comunes. Lo que **nunca** debe pasar es que Domain o Application referencien a Infrastructure.' },
    ],
  },
  {
    id: 'w2-errores',
    title: 'Manejo de errores con ProblemDetails',
    minutes: 14,
    blocks: [
      { p: 'La rúbrica da **7 puntos** a «errores controlados, sin leaks». Significa: cada error responde con el código correcto, en un formato estándar, y **nunca** expone stack traces ni detalles internos.' },
      { h: 'El formato estándar: ProblemDetails (RFC 9457)' },
      {
        code: `{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.5",
  "title": "Recurso no encontrado",
  "status": 404,
  "detail": "No existe el producto 99.",
  "instance": "/api/v1/products/99",
  "traceId": "00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01"
}`,
        lang: 'json',
      },
      { h: 'Excepciones con significado' },
      {
        code: `public class NotFoundException(string message) : Exception(message);
public class ConflictException(string message) : Exception(message);
public class DomainException(string message) : Exception(message);`,
        lang: 'csharp',
      },
      { h: 'Un manejador global' },
      {
        code: `public sealed class GlobalExceptionHandler(
    IProblemDetailsService problemDetails,
    ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext context, Exception exception, CancellationToken ct)
    {
        var (status, title) = exception switch
        {
            NotFoundException => (StatusCodes.Status404NotFound, "Recurso no encontrado"),
            ConflictException => (StatusCodes.Status409Conflict, "Conflicto"),
            DomainException   => (StatusCodes.Status400BadRequest, "Regla de negocio no cumplida"),
            _                 => (StatusCodes.Status500InternalServerError, "Error inesperado")
        };

        if (status == StatusCodes.Status500InternalServerError)
            logger.LogError(exception, "Error no controlado en {Path}", context.Request.Path);

        context.Response.StatusCode = status;
        return await problemDetails.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = context,
            Exception = exception,
            ProblemDetails =
            {
                Status = status,
                Title = title,
                // En 500 no se muestra el mensaje real: puede contener datos internos
                Detail = status == 500 ? "Ocurrió un error. Usa el traceId para reportarlo." : exception.Message
            }
        });
    }
}`,
        lang: 'csharp',
      },
      {
        code: `// Program.cs
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

var app = builder.Build();
app.UseExceptionHandler();   // primero en el pipeline: atrapa todo lo que venga después
app.UseStatusCodePages();    // 404 de rutas inexistentes también salen como ProblemDetails`,
        lang: 'csharp',
      },
      {
        compare: {
          lang: 'csharp',
          bad: `catch (Exception ex)
{
    // Expone el stack trace, nombres de
    // tablas y rutas del servidor
    return StatusCode(500, ex.ToString());
}`,
          good: `// Sin try/catch en el controller:
// lanzas una excepción con significado
// y el handler global responde con
// ProblemDetails y loguea el error.
throw new NotFoundException(
    $"No existe el producto {id}.");`,
        },
      },
      { note: 'Un try/catch en cada action es ruido. Lanza excepciones con significado y deja que un único `IExceptionHandler` decida el código de estado.' },
    ],
  },
  {
    id: 'w2-openapi',
    title: 'OpenAPI: el contrato de tu API',
    minutes: 10,
    blocks: [
      { p: 'La rúbrica da **5 puntos** a «Swagger claro, responses definidos, status codes correctos». OpenAPI es un documento JSON que describe cada endpoint: rutas, parámetros, cuerpos y respuestas. Scalar (o Swagger UI) lo dibuja.' },
      { h: 'Lo que ya tienes' },
      {
        code: `builder.Services.AddOpenApi();       // genera el documento

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();                // /openapi/v1.json
    app.MapScalarApiReference();     // /scalar
}`,
        lang: 'csharp',
      },
      { h: 'Declara todas las respuestas posibles' },
      {
        code: `/// <summary>Crea un producto.</summary>
/// <response code="201">Producto creado.</response>
/// <response code="400">Datos inválidos.</response>
/// <response code="409">Ya existe un producto con ese SKU.</response>
[HttpPost]
[ProducesResponseType<ProductResponse>(StatusCodes.Status201Created)]
[ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
[ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
public async Task<ActionResult<ProductResponse>> Create(
    CreateProductRequest request, CancellationToken ct)
{
    var created = await service.CreateAsync(request, ct);
    return CreatedAtAction(nameof(GetById), new { id = created.Id, version = "1.0" }, created);
}`,
        lang: 'csharp',
      },
      { h: 'Comentarios XML en el documento' },
      { p: 'En .NET 10, el paquete `Microsoft.AspNetCore.OpenApi` incluye un generador que copia tus comentarios `///` al documento. Solo activa el archivo de documentación en el `.csproj`:' },
      { code: '<PropertyGroup>\n  <GenerateDocumentationFile>true</GenerateDocumentationFile>\n  <NoWarn>$(NoWarn);1591</NoWarn> <!-- no exige comentar todo -->\n</PropertyGroup>', lang: 'xml' },
      { note: '`<response>` solo agrega la descripción. El código de estado aparece en el documento únicamente si también está en `[ProducesResponseType]`.' },
      { h: 'Checklist del contrato' },
      {
        list: [
          'Cada endpoint declara su respuesta exitosa con el tipo correcto.',
          'Cada endpoint declara sus errores: 400, 404, 409 según corresponda.',
          'Los DTOs tienen nombres claros (`CreateProductRequest`, `ProductResponse`).',
          'Los ejemplos de Scalar funcionan sin editar nada.',
        ],
      },
    ],
  },
  {
    id: 'w2-pipeline',
    title: 'Middleware y código asíncrono',
    minutes: 10,
    blocks: [
      { p: 'Cada petición recorre una cadena de **middlewares** en el orden en que los registras en `Program.cs`. Cada uno puede actuar antes y después del siguiente.' },
      {
        flow: [
          ['UseExceptionHandler', 'Envuelve todo: atrapa lo que falle después'],
          ['UseHttpsRedirection', 'Redirige http → https'],
          ['UseAuthentication', '¿Quién eres?'],
          ['UseAuthorization', '¿Puedes hacer esto?'],
          ['MapControllers', 'Ejecuta tu action'],
        ],
      },
      { note: 'El orden importa. Si `UseExceptionHandler` va al final, las excepciones de los middlewares anteriores no se atrapan.' },
      { h: 'async/await bien usado' },
      {
        compare: {
          lang: 'csharp',
          bad: `// Bloquea un hilo del servidor
var product = service.GetByIdAsync(id).Result;

// async void: las excepciones se pierden
public async void Save() { ... }`,
          good: `var product = await service.GetByIdAsync(id, ct);

public async Task SaveAsync(CancellationToken ct)
{
    await db.SaveChangesAsync(ct);
}`,
        },
      },
      {
        list: [
          'Async «de punta a punta»: si llamas algo async, tu método también es async.',
          'Nunca `.Result` ni `.Wait()`: bloquean hilos y bajo carga la API se cuelga.',
          'Los métodos async terminan en `Async` y reciben `CancellationToken`.',
          'En APIs, hereda de `ControllerBase`. `Controller` agrega soporte de vistas que no usas.',
        ],
      },
    ],
  },
]
