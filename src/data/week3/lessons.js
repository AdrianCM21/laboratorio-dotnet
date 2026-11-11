// Semana 3 · Base de datos: EF Core 10 + PostgreSQL

export const lessons = [
  {
    id: 'w3-intro',
    title: 'Persistencia y EF Core',
    minutes: 10,
    blocks: [
      { p: 'Hasta ahora los productos viven en una lista en memoria: se pierden al reiniciar y cada réplica tendría la suya. Una API **stateless** guarda el estado afuera, en una base de datos.' },
      { p: '**Entity Framework Core** es el ORM de .NET: traduce tus clases C# a tablas y tus consultas LINQ a SQL.' },
      {
        flow: [
          ['Tu código', '`db.Products.Where(...)`'],
          ['EF Core', 'Traduce LINQ a SQL'],
          ['Proveedor', 'Npgsql habla con PostgreSQL'],
          ['PostgreSQL', 'Ejecuta y devuelve filas'],
        ],
      },
      { h: 'Piezas principales' },
      {
        table: {
          head: ['Pieza', 'Qué es'],
          rows: [
            ['`DbContext`', 'La sesión con la base: consulta, rastrea cambios y guarda. Una por petición.'],
            ['`DbSet<T>`', 'Una tabla. `db.Products` es la tabla de productos.'],
            ['Entidad', 'Una clase mapeada a una tabla, como `Product`.'],
            ['Proveedor', 'El paquete del motor: `Npgsql.EntityFrameworkCore.PostgreSQL` para PostgreSQL.'],
            ['Migración', 'Un archivo C# que describe cómo cambiar el esquema.'],
          ],
        },
      },
      { h: 'Paquetes' },
      {
        code: `# En Infrastructure: el proveedor de PostgreSQL
dotnet add src/Catalog.Infrastructure package Npgsql.EntityFrameworkCore.PostgreSQL

# En Api (proyecto de inicio): necesario para las herramientas de migraciones
dotnet add src/Catalog.Api package Microsoft.EntityFrameworkCore.Design

# Herramienta de línea de comandos, una vez por máquina
dotnet tool install --global dotnet-ef`,
        lang: 'bash',
      },
      { note: 'Este curso usa **PostgreSQL** porque corre liviano en Docker y en Kubernetes. Con SQL Server cambia el proveedor (`UseSqlServer`), pero todo lo demás es igual.' },
    ],
  },
  {
    id: 'w3-postgres-docker',
    title: 'PostgreSQL en Docker',
    minutes: 8,
    blocks: [
      { p: 'No instales PostgreSQL en tu máquina: levántalo en un contenedor. En un comando tienes una base limpia y reproducible.' },
      {
        code: `docker run -d --name catalog-db \\
  -e POSTGRES_PASSWORD=devpass \\
  -e POSTGRES_DB=catalog \\
  -p 5432:5432 \\
  -v catalog-data:/var/lib/postgresql/data \\
  postgres:17`,
        lang: 'bash',
      },
      {
        table: {
          head: ['Parte', 'Para qué'],
          rows: [
            ['`-d`', 'Corre en segundo plano.'],
            ['`-e POSTGRES_PASSWORD`', 'Contraseña del usuario `postgres`. Obligatoria para la imagen.'],
            ['`-e POSTGRES_DB`', 'Crea la base `catalog` al iniciar por primera vez.'],
            ['`-p 5432:5432`', 'Puerto de tu máquina → puerto del contenedor.'],
            ['`-v catalog-data:...`', 'Volumen con nombre: los datos sobreviven si borras el contenedor.'],
            ['`postgres:17`', 'Versión fija. Nunca `latest`: un día se actualiza sola y rompe tu entorno.'],
          ],
        },
      },
      { note: 'Desde PostgreSQL 18 la imagen oficial cambió la ruta de datos a `/var/lib/postgresql`. Si usas la 18, monta el volumen ahí. Por eso conviene fijar la versión.' },
      { h: 'Entrar a la base' },
      { code: 'docker exec -it catalog-db psql -U postgres -d catalog\n\ncatalog=# \\dt                  -- lista tablas\ncatalog=# SELECT * FROM products;\ncatalog=# \\q                   -- salir', lang: 'bash' },
    ],
  },
  {
    id: 'w3-modelado',
    title: 'Modelado con Fluent API',
    minutes: 12,
    blocks: [
      { p: 'EF Core deduce mucho por convención (una propiedad `Id` es la clave). Lo que no deduce, lo configuras con **Fluent API** en una clase por entidad. Así Domain queda limpio de atributos de base de datos.' },
      {
        code: `public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
        // Aplica todas las clases IEntityTypeConfiguration de este proyecto
        => modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
}`,
        lang: 'csharp',
      },
      {
        code: `public sealed class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("products");
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name).IsRequired().HasMaxLength(200);
        builder.Property(p => p.Sku).IsRequired().HasMaxLength(50);
        builder.HasIndex(p => p.Sku).IsUnique();          // el SKU no se repite

        builder.Property(p => p.Price).HasPrecision(18, 2); // dinero exacto

        builder.HasOne(p => p.Category)                     // N productos → 1 categoría
               .WithMany(c => c.Products)
               .HasForeignKey(p => p.CategoryId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}`,
        lang: 'csharp',
      },
      {
        table: {
          head: ['Configuración', 'Efecto en la tabla'],
          rows: [
            ['`IsRequired()`', '`NOT NULL`'],
            ['`HasMaxLength(200)`', '`varchar(200)` en lugar de texto ilimitado'],
            ['`HasPrecision(18, 2)`', '`numeric(18,2)`: 2 decimales exactos'],
            ['`HasIndex(...).IsUnique()`', 'Índice único: la base rechaza duplicados'],
            ['`OnDelete(Restrict)`', 'No deja borrar una categoría con productos'],
          ],
        },
      },
      { note: 'Las reglas importantes van en **dos lugares**: en el código (mensaje claro al usuario) y en la base (garantía final ante dos peticiones simultáneas).' },
    ],
  },
  {
    id: 'w3-config',
    title: 'Cadena de conexión y configuración',
    minutes: 12,
    blocks: [
      {
        code: `// Infrastructure/DependencyInjection.cs
services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(configuration.GetConnectionString("Default")));`,
        lang: 'csharp',
      },
      { p: '`GetConnectionString("Default")` lee la clave `ConnectionStrings:Default`. ASP.NET Core arma la configuración apilando fuentes; **la última gana**:' },
      {
        stack: [
          ['5', 'Argumentos de línea de comandos', '`--ConnectionStrings:Default=...`'],
          ['4', 'Variables de entorno', '`ConnectionStrings__Default=...` (dos guiones bajos)'],
          ['3', 'User secrets (solo Development)', 'Fuera del repo, en tu perfil de usuario'],
          ['2', 'appsettings.{Environment}.json', 'Por ejemplo `appsettings.Development.json`'],
          ['1', 'appsettings.json', 'Valores por defecto, sin secretos'],
        ],
      },
      { h: 'Contraseñas fuera del repositorio' },
      {
        compare: {
          lang: 'json',
          bad: `// appsettings.json (en Git)
"ConnectionStrings": {
  "Default": "Host=prod-db;Database=catalog;
              Username=admin;Password=Sup3rS3cret"
}`,
          good: `// appsettings.json (en Git): sin contraseña
"ConnectionStrings": {
  "Default": ""
}
// El valor real llega por user-secrets,
// variable de entorno o Secret de Kubernetes`,
        },
      },
      { h: 'User secrets para desarrollo' },
      {
        code: `dotnet user-secrets init --project src/Catalog.Api
dotnet user-secrets set "ConnectionStrings:Default" \\
  "Host=localhost;Port=5432;Database=catalog;Username=postgres;Password=devpass" \\
  --project src/Catalog.Api`,
        lang: 'bash',
      },
      { h: 'Variables de entorno: el puente a Docker y Kubernetes' },
      { p: 'En variables de entorno el separador `:` se escribe `__`. Esta misma regla la usarás en Docker, Compose y Kubernetes:' },
      { code: 'ConnectionStrings__Default="Host=catalog-db;Database=catalog;Username=postgres;Password=..."', lang: 'bash' },
      { note: 'La rúbrica de Docker da **5 puntos** a «variables de entorno: uso correcto, no hardcode». Lo que configures aquí es la base de esos puntos.' },
    ],
  },
  {
    id: 'w3-migraciones',
    title: 'Migraciones',
    minutes: 12,
    blocks: [
      { p: 'Una **migración** es código que lleva el esquema de la base de un estado al siguiente. Se versiona en Git igual que el resto del código.' },
      {
        flow: [
          ['Cambias una entidad', 'Agregas `Sku` a Product'],
          ['migrations add', 'EF compara el modelo con el último snapshot'],
          ['Revisas el archivo', 'Up() y Down() generados'],
          ['database update', 'Aplica el SQL a la base'],
          ['Commit', 'La migración viaja con el código'],
        ],
      },
      {
        code: `# Con Clean Architecture: el DbContext vive en Infrastructure y la configuración en Api
dotnet ef migrations add InitialCreate \\
  --project src/Catalog.Infrastructure \\
  --startup-project src/Catalog.Api

dotnet ef database update \\
  --project src/Catalog.Infrastructure \\
  --startup-project src/Catalog.Api

# Deshacer la última migración (si no se aplicó)
dotnet ef migrations remove --project src/Catalog.Infrastructure --startup-project src/Catalog.Api`,
        lang: 'bash',
      },
      {
        table: {
          head: ['Opción', 'Significado'],
          rows: [
            ['`--project`', 'Dónde está el DbContext y dónde se guardan las migraciones.'],
            ['`--startup-project`', 'El proyecto ejecutable: de ahí salen la configuración y la cadena de conexión.'],
          ],
        },
      },
      { h: 'Migraciones en producción' },
      {
        list: [
          '`context.Database.Migrate()` al arrancar es cómodo en desarrollo, pero con **3 réplicas** en Kubernetes las tres intentan migrar a la vez.',
          'Mejor: un **migration bundle** ejecutado una sola vez antes del despliegue (por ejemplo, como un Job de Kubernetes).',
          'O un script SQL revisado: `dotnet ef migrations script --idempotent`.',
        ],
      },
      { code: 'dotnet ef migrations bundle --project src/Catalog.Infrastructure --startup-project src/Catalog.Api -o efbundle\n./efbundle --connection "Host=...;Database=catalog;..."', lang: 'bash' },
    ],
  },
  {
    id: 'w3-consultas',
    title: 'Consultas eficientes',
    minutes: 14,
    blocks: [
      { p: 'Mientras trabajas con `IQueryable`, EF Core arma SQL. En cuanto materializas (`ToListAsync`, `FirstOrDefaultAsync`, `foreach`), ejecuta la consulta y lo que sigue corre **en memoria**.' },
      {
        compare: {
          lang: 'csharp',
          bad: `// Trae TODA la tabla y filtra en C#
var all = await db.Products.ToListAsync(ct);
var caros = all.Where(p => p.Price > 100).ToList();`,
          good: `// El filtro viaja a la base como WHERE
var caros = await db.Products
    .Where(p => p.Price > 100)
    .ToListAsync(ct);`,
        },
      },
      { h: 'Solo lectura: AsNoTracking y proyección' },
      {
        code: `public async Task<PagedResponse<ProductResponse>> ListAsync(int page, int pageSize, CancellationToken ct)
{
    var query = db.Products.AsNoTracking();       // no rastrea cambios: más rápido

    var total = await query.CountAsync(ct);
    var items = await query
        .OrderBy(p => p.Id)                       // paginar exige un orden estable
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(p => new ProductResponse(         // SELECT solo de las columnas necesarias
            p.Id, p.Name, p.Description, p.Price, p.Stock))
        .ToListAsync(ct);

    return new PagedResponse<ProductResponse>(items, page, pageSize, total);
}`,
        lang: 'csharp',
      },
      { h: 'El problema N+1' },
      {
        compare: {
          lang: 'csharp',
          bad: `var products = await db.Products.ToListAsync(ct);
foreach (var p in products)
{
    // 1 consulta extra por producto:
    // 100 productos = 101 consultas
    p.CategoryName = (await db.Categories
        .FindAsync(p.CategoryId)).Name;
}`,
          good: `// 1 sola consulta con JOIN
var items = await db.Products
    .Select(p => new {
        p.Id,
        p.Name,
        Category = p.Category.Name
    })
    .ToListAsync(ct);`,
        },
      },
      {
        table: {
          head: ['Método', 'Cuándo'],
          rows: [
            ['`FindAsync(id)`', 'Buscar por clave. Revisa primero lo ya cargado en el contexto.'],
            ['`FirstOrDefaultAsync(...)`', 'Buscar por cualquier condición.'],
            ['`AnyAsync(...)`', 'Saber si existe, sin traer la fila.'],
            ['`Include(...)`', 'Traer entidades relacionadas para modificarlas.'],
            ['`Select(...)`', 'Lecturas: proyecta directo al DTO.'],
          ],
        },
      },
    ],
  },
  {
    id: 'w3-repositorio',
    title: 'Repositorio con EF Core',
    minutes: 10,
    blocks: [
      { p: 'La semana 2 creaste `IProductRepository` con una implementación en memoria. Ahora escribes la versión real en Infrastructure. Application no cambia ni una línea.' },
      {
        code: `internal sealed class EfProductRepository(AppDbContext db) : IProductRepository
{
    public Task<Product?> GetByIdAsync(int id, CancellationToken ct)
        => db.Products.FirstOrDefaultAsync(p => p.Id == id, ct);

    public Task<bool> ExistsBySkuAsync(string sku, CancellationToken ct)
        => db.Products.AnyAsync(p => p.Sku == sku, ct);

    public async Task AddAsync(Product product, CancellationToken ct)
    {
        db.Products.Add(product);
        await db.SaveChangesAsync(ct);   // aquí recién se ejecuta el INSERT
    }

    public async Task RemoveAsync(Product product, CancellationToken ct)
    {
        db.Products.Remove(product);
        await db.SaveChangesAsync(ct);
    }
}`,
        lang: 'csharp',
      },
      {
        list: [
          '`DbContext` ya es un **Unit of Work**: acumula cambios y `SaveChangesAsync` los guarda en una transacción.',
          'Registra el repositorio como **Scoped**, igual que el DbContext.',
          'El `DbContext` no es thread-safe: nunca lances dos consultas en paralelo con el mismo contexto.',
        ],
      },
      { h: 'Datos iniciales' },
      { code: "builder.HasData(\n    new { Id = 1, Name = \"Notebook\", Sku = \"NB-001\", Price = 1200m, Stock = 10, CategoryId = 1 });", lang: 'csharp' },
      { p: '`HasData` sirve para datos fijos de referencia (categorías, estados). Se convierte en parte de una migración.' },
    ],
  },
  {
    id: 'w3-errores-salud',
    title: 'Errores de base de datos y health checks',
    minutes: 10,
    blocks: [
      { h: 'Duplicados: de excepción de base a 409' },
      { p: 'Aunque verifiques el SKU antes de insertar, dos peticiones simultáneas pueden pasar el chequeo. El índice único de la base es la última defensa; traduce su error a un 409.' },
      {
        code: `try
{
    await db.SaveChangesAsync(ct);
}
catch (DbUpdateException ex) when (ex.InnerException is PostgresException
{ SqlState: PostgresErrorCodes.UniqueViolation })      // código 23505
{
    throw new ConflictException("Ya existe un producto con ese SKU.");
}`,
        lang: 'csharp',
      },
      { h: 'Health checks' },
      { p: 'Kubernetes (semana 4) necesita preguntarle a tu API si está viva y si está lista para recibir tráfico. Se exponen dos endpoints:' },
      {
        code: `// Paquete: Microsoft.Extensions.Diagnostics.HealthChecks.EntityFrameworkCore
builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>(tags: ["ready"]);

// Viva: el proceso responde. No revisa dependencias.
app.MapHealthChecks("/health/live", new HealthCheckOptions { Predicate = _ => false });

// Lista: además puede hablar con la base de datos.
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});`,
        lang: 'csharp',
      },
      { note: 'Si la base se cae, `/health/ready` falla y Kubernetes deja de enviar tráfico a ese pod, pero **no lo reinicia**: reiniciar no arregla la base de datos. Por eso `live` no revisa dependencias.' },
    ],
  },
]
