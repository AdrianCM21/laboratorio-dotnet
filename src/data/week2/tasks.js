// Tareas de la semana 2 sobre tu proyecto del bootcamp

export const tasks = [
  {
    id: 'w2-capas',
    title: 'Separa el proyecto en 4 capas',
    detail: 'Crea Domain, Application e Infrastructure junto a tu Api, agrégalos a la solución y configura las referencias.',
    hint: [
      { p: 'Usa el mismo orden de la consola «Solución por capas». Tu solución ya es `.slnx`.' },
      { code: 'dotnet new classlib -n BootcampCLTNoviembre.Domain -o src/BootcampCLTNoviembre.Domain\n# ...Application e Infrastructure igual\ndotnet sln add src/*/*.csproj', lang: 'bash' },
    ],
  },
  {
    id: 'w2-entidad',
    title: 'Mueve Product a Domain como entidad con reglas',
    detail: 'Setters privados, constructor que valida el precio y una `DomainException`.',
  },
  {
    id: 'w2-dtos',
    title: 'Crea los DTOs y deja de exponer la entidad',
    detail: '`CreateProductRequest`, `UpdateProductRequest` y `ProductResponse` en Application, con DataAnnotations.',
    hint: [
      {
        code: `public sealed record CreateProductRequest(
    [Required, StringLength(200)] string Name,
    [StringLength(1000)] string? Description,
    [Range(0.01, 1_000_000)] decimal Price,
    [Range(0, int.MaxValue)] int Stock);`,
        lang: 'csharp',
      },
    ],
  },
  {
    id: 'w2-validacion',
    title: 'Prueba la validación automática',
    detail: 'Envía un POST con precio negativo y nombre vacío. Debe responder **400** con `errors` por campo.',
  },
  {
    id: 'w2-repo',
    title: 'Interfaz de repositorio + implementación en memoria',
    detail: '`IProductRepository` en Application; `InMemoryProductRepository` en Infrastructure registrado como Singleton. La semana 3 lo reemplazas por EF Core sin tocar Application.',
    hint: [
      {
        code: `public interface IProductRepository
{
    Task<Product?> GetByIdAsync(int id, CancellationToken ct);
    Task<IReadOnlyList<Product>> ListAsync(int page, int pageSize, CancellationToken ct);
    Task<int> CountAsync(CancellationToken ct);
    Task AddAsync(Product product, CancellationToken ct);
    Task RemoveAsync(Product product, CancellationToken ct);
}`,
        lang: 'csharp',
      },
    ],
  },
  {
    id: 'w2-service',
    title: 'Crea ProductService en Application',
    detail: 'El controller solo traduce HTTP; el servicio orquesta y lanza `NotFoundException` o `ConflictException`.',
  },
  {
    id: 'w2-errores',
    title: 'Agrega ProblemDetails y GlobalExceptionHandler',
    detail: 'Prueba un 404 (id inexistente) y fuerza un 500: la respuesta no debe mostrar stack trace.',
    hint: [{ code: 'builder.Services.AddProblemDetails();\nbuilder.Services.AddExceptionHandler<GlobalExceptionHandler>();\n// ...\napp.UseExceptionHandler();\napp.UseStatusCodePages();', lang: 'csharp' }],
  },
  {
    id: 'w2-paginacion',
    title: 'Pagina el GET /products',
    detail: '`?page=&pageSize=` con `pageSize` máximo de 100 y respuesta con `totalCount`.',
    hint: [
      {
        code: `public sealed record PagedResponse<T>(
    IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount);

var pageSize = Math.Clamp(query.PageSize, 1, 100);`,
        lang: 'csharp',
      },
    ],
  },
  {
    id: 'w2-openapi',
    title: 'Completa el contrato OpenAPI',
    detail: 'Activa `GenerateDocumentationFile`, comenta cada action con `///` y declara todos los `[ProducesResponseType]`. Revisa en `/scalar` que cada endpoint muestre sus errores.',
  },
  {
    id: 'w2-async',
    title: 'Async de punta a punta con CancellationToken',
    detail: 'Cada action es `async Task<...>`, recibe `CancellationToken` y lo pasa hacia abajo. Cambia `Controller` por `ControllerBase`.',
  },
  {
    id: 'w2-http',
    title: 'Actualiza el archivo .http con todos los casos',
    detail: 'Incluye los casos felices y los de error: 400, 404 y 409.',
  },
  {
    id: 'w2-commit',
    title: 'Commit de la semana 2',
    detail: 'Un commit por cambio lógico se lee mejor que uno gigante.',
    hint: [{ code: 'git add .\ngit commit -m "refactor: separar solución en capas (Clean Architecture)"\ngit commit -m "feat: ProblemDetails y manejo global de errores"', lang: 'bash' }],
  },
]
