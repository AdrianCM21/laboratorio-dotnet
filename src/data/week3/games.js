// Juegos de la semana 3

const EF = '--project src/Catalog.Infrastructure --startup-project src/Catalog.Api'
const efRules = [
  { m: '~--project src/Catalog\\.Infrastructure|-p src/Catalog\\.Infrastructure', label: 'el proyecto del DbContext (--project)' },
  { m: '~--startup-project src/Catalog\\.Api|-s src/Catalog\\.Api', label: 'el proyecto de inicio (--startup-project)' },
]

export const games = [
  {
    id: 'w3-consola-db',
    type: 'terminal',
    title: 'Consola: PostgreSQL y migraciones',
    description: 'Levanta la base en Docker, instala EF Core y crea tu primera migración.',
    concept: 'EF Core',
    steps: [
      {
        goal: 'Levanta PostgreSQL 17 en segundo plano: contenedor catalog-db, contraseña devpass, base catalog, puerto 5432 y volumen catalog-data en /var/lib/postgresql/data.',
        rules: [
          'docker run',
          { m: '-d|--detach', label: 'segundo plano (-d)' },
          { m: '--name catalog-db|--name=catalog-db', label: 'el nombre --name catalog-db' },
          { m: '-e POSTGRES_PASSWORD=devpass|--env POSTGRES_PASSWORD=devpass', label: 'la contraseña (-e POSTGRES_PASSWORD)' },
          { m: '-e POSTGRES_DB=catalog|--env POSTGRES_DB=catalog', label: 'la base (-e POSTGRES_DB)' },
          { m: '-p 5432:5432|--publish 5432:5432', label: 'el puerto -p 5432:5432' },
          { m: '-v catalog-data:/var/lib/postgresql/data|--volume catalog-data:/var/lib/postgresql/data', label: 'el volumen -v' },
          { m: '~ postgres:17$', label: 'la imagen postgres:17 al final' },
        ],
        answer: 'docker run -d --name catalog-db -e POSTGRES_PASSWORD=devpass -e POSTGRES_DB=catalog -p 5432:5432 -v catalog-data:/var/lib/postgresql/data postgres:17',
        output: "Unable to find image 'postgres:17' locally\n17: Pulling from library/postgres\nStatus: Downloaded newer image for postgres:17\n3f9a1c7e2b8d4e6f0a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f6071",
        why: 'Cada -e configura la imagen; el volumen guarda los datos aunque borres el contenedor. La imagen siempre va al final.',
        hint: 'docker run -d --name ... -e ... -e ... -p ... -v ... postgres:17',
      },
      {
        goal: 'Comprueba que el contenedor está corriendo.',
        rules: ['docker ps|docker container ls'],
        answer: 'docker ps',
        output: 'CONTAINER ID   IMAGE         STATUS         PORTS                    NAMES\n3f9a1c7e2b8d   postgres:17   Up 5 seconds   0.0.0.0:5432->5432/tcp   catalog-db',
        why: 'STATUS «Up» y el puerto publicado: la base está lista.',
      },
      {
        goal: 'Instala la herramienta dotnet-ef de forma global.',
        rules: ['dotnet tool install', { m: '--global|-g', label: 'la opción --global' }, { m: 'dotnet-ef', label: 'el nombre de la herramienta' }],
        answer: 'dotnet tool install --global dotnet-ef',
        output: "You can invoke the tool using the following command: dotnet-ef\nTool 'dotnet-ef' was successfully installed.",
        why: 'Habilita el comando «dotnet ef» en toda la máquina. Para actualizarla: dotnet tool update --global dotnet-ef.',
      },
      {
        goal: 'Agrega el proveedor Npgsql.EntityFrameworkCore.PostgreSQL al proyecto src/Catalog.Infrastructure.',
        rules: [
          'dotnet add|dotnet package add',
          { m: '~package', label: 'la palabra package' },
          { m: 'Npgsql.EntityFrameworkCore.PostgreSQL', label: 'el nombre del paquete' },
          { m: '~src/Catalog\\.Infrastructure', label: 'el proyecto Infrastructure' },
        ],
        answer: 'dotnet add src/Catalog.Infrastructure package Npgsql.EntityFrameworkCore.PostgreSQL',
        output: "info : Adding PackageReference for package 'Npgsql.EntityFrameworkCore.PostgreSQL' into project 'src/Catalog.Infrastructure/Catalog.Infrastructure.csproj'.\ninfo : PackageReference for package 'Npgsql.EntityFrameworkCore.PostgreSQL' added.",
        why: 'El proveedor va donde vive el DbContext: Infrastructure.',
        hint: 'dotnet add <proyecto> package <paquete>',
      },
      {
        goal: 'Agrega Microsoft.EntityFrameworkCore.Design al proyecto de inicio src/Catalog.Api.',
        rules: [
          'dotnet add|dotnet package add',
          { m: '~package', label: 'la palabra package' },
          { m: 'Microsoft.EntityFrameworkCore.Design', label: 'el nombre del paquete' },
          { m: '~src/Catalog\\.Api', label: 'el proyecto Api' },
        ],
        answer: 'dotnet add src/Catalog.Api package Microsoft.EntityFrameworkCore.Design',
        output: "info : PackageReference for package 'Microsoft.EntityFrameworkCore.Design' added.",
        why: 'dotnet ef lo necesita en el proyecto de inicio para poder construir y ejecutar tu app en tiempo de diseño.',
      },
      {
        goal: 'Crea la migración InitialCreate (DbContext en Infrastructure, inicio en Api).',
        rules: ['dotnet ef migrations add InitialCreate', ...efRules],
        answer: `dotnet ef migrations add InitialCreate ${EF}`,
        output: "Build started...\nBuild succeeded.\nDone. To undo this action, use 'ef migrations remove'",
        why: 'Genera Migrations/xxxx_InitialCreate.cs y el snapshot del modelo. Revísalo antes de aplicarlo.',
        hint: 'dotnet ef migrations add <Nombre> --project <...> --startup-project <...>',
      },
      {
        goal: 'Aplica la migración a la base de datos.',
        rules: ['dotnet ef database update', ...efRules],
        answer: `dotnet ef database update ${EF}`,
        output: "Build started...\nBuild succeeded.\nApplying migration '20261111220000_InitialCreate'.\nDone.",
        why: 'Ejecuta el SQL de las migraciones pendientes y las registra en la tabla __EFMigrationsHistory.',
      },
      {
        goal: 'Abre psql dentro del contenedor catalog-db como usuario postgres en la base catalog.',
        rules: [
          'docker exec',
          { m: '~-it|-i -t|-ti', label: 'modo interactivo (-it)' },
          { m: 'catalog-db', label: 'el contenedor' },
          { m: 'psql', label: 'el programa psql' },
          { m: '-U postgres|--username=postgres', label: 'el usuario (-U)' },
          { m: '-d catalog|--dbname=catalog', label: 'la base (-d)' },
        ],
        answer: 'docker exec -it catalog-db psql -U postgres -d catalog',
        output: 'psql (17.6)\nType "help" for help.',
        why: 'docker exec ejecuta un programa dentro de un contenedor que ya está corriendo.',
      },
      {
        goal: 'Lista las tablas de la base.',
        prompt: 'catalog=#',
        rules: ['\\dt|\\d'],
        answer: '\\dt',
        output: '                 List of relations\n Schema |         Name          | Type  |  Owner\n--------+-----------------------+-------+----------\n public | __EFMigrationsHistory | table | postgres\n public | categories            | table | postgres\n public | products              | table | postgres\n(3 rows)',
        why: 'Ahí está tu tabla products y el historial de migraciones de EF Core.',
        hint: 'Los comandos de psql empiezan con barra invertida. «dt» = describe tables.',
      },
      {
        goal: 'Consulta todas las filas de la tabla products.',
        prompt: 'catalog=#',
        rules: ['~^(select|SELECT) \\* (from|FROM) (public\\.)?"?products"?;?$'],
        answer: 'select * from products;',
        output: ' id |   name   |  sku   |  price  | stock | category_id\n----+----------+--------+---------+-------+-------------\n  1 | Notebook | NB-001 | 1200.00 |    10 |           1\n(1 row)',
        why: 'Los datos semilla de HasData ya están. El precio sale con 2 decimales gracias a HasPrecision(18, 2).',
      },
    ],
  },
  {
    id: 'w3-donde-corre',
    type: 'classify',
    title: '¿En la base o en memoria?',
    description: 'Decide si el filtro se ejecuta en PostgreSQL o en C#.',
    concept: 'IQueryable vs IEnumerable',
    question: '¿Dónde se ejecuta el filtrado?',
    buckets: [
      { id: 'db', label: 'En la base de datos', desc: 'Se traduce a SQL' },
      { id: 'mem', label: 'En memoria', desc: 'Primero trae filas, luego filtra en C#' },
    ],
    items: [
      { code: true, text: 'await db.Products.Where(p => p.Price > 100).ToListAsync()', bucket: 'db', why: 'Where sobre IQueryable antes de materializar: viaja como WHERE.' },
      { code: true, text: '(await db.Products.ToListAsync()).Where(p => p.Price > 100)', bucket: 'mem', why: 'ToListAsync ya trajo toda la tabla; el Where corre en C#.' },
      { code: true, text: 'db.Products.AsEnumerable().Where(p => p.Price > 100)', bucket: 'mem', why: 'AsEnumerable corta la traducción a SQL: todo lo que sigue es en memoria.' },
      { code: true, text: 'await db.Products.OrderBy(p => p.Id).Skip(20).Take(10).ToListAsync()', bucket: 'db', why: 'Se traduce a ORDER BY ... OFFSET 20 LIMIT 10.' },
      { code: true, text: 'IEnumerable<Product> q = db.Products;\nq.Where(p => p.Price > 100).ToList();', bucket: 'mem', why: 'Trampa clásica: el tipo declarado es IEnumerable, así que se usa Enumerable.Where y se trae toda la tabla.' },
      { code: true, text: 'await db.Products.CountAsync(p => p.Stock == 0)', bucket: 'db', why: 'SELECT COUNT(*) ... WHERE stock = 0. Solo vuelve un número.' },
      { code: true, text: 'await db.Products.Select(p => new { p.Id, p.Name }).ToListAsync()', bucket: 'db', why: 'La proyección se traduce a SELECT id, name.' },
      { code: true, text: 'var list = await db.Products.ToListAsync();\nvar total = list.Count;', bucket: 'mem', why: 'Trae todas las filas solo para contarlas. Usa CountAsync().' },
    ],
  },
  {
    id: 'w3-fill-modelo',
    type: 'fill',
    title: 'Completa: modelo y registro',
    description: 'Configura la entidad con Fluent API y registra el DbContext.',
    concept: 'Modelado',
    rounds: [
      {
        file: 'ProductConfiguration.cs',
        task: 'Nombre obligatorio de hasta 200, precio exacto con 2 decimales y SKU único.',
        code: `public void Configure(EntityTypeBuilder<Product> builder)
{
    builder.Property(p => p.Name).[[0]]().HasMaxLength([[1]]);
    builder.Property(p => p.Price).[[2]](18, 2);
    builder.HasIndex(p => p.Sku).[[3]]();
}`,
        blanks: [
          { options: ['IsRequired', 'IsUnique', 'HasKey', 'IsOptional'], answer: 'IsRequired' },
          { options: ['200', '18', '2', 'int.MaxValue'], answer: '200' },
          { options: ['HasPrecision', 'HasMaxLength', 'HasColumnType', 'HasDefaultValue'], answer: 'HasPrecision' },
          { options: ['IsUnique', 'IsRequired', 'HasFilter', 'IsClustered'], answer: 'IsUnique' },
        ],
        why: 'IsRequired → NOT NULL, HasMaxLength → varchar(200), HasPrecision → numeric(18,2), IsUnique → índice único.',
      },
      {
        file: 'DependencyInjection.cs',
        task: 'Registra el DbContext con PostgreSQL leyendo la cadena «Default».',
        code: `services.[[0]]<AppDbContext>(options =>
    options.[[1]](configuration.[[2]]("Default")));

services.[[3]]<IProductRepository, EfProductRepository>();`,
        blanks: [
          { options: ['AddDbContext', 'AddSingleton', 'AddHostedService', 'AddScoped'], answer: 'AddDbContext' },
          { options: ['UseNpgsql', 'UseSqlServer', 'UseSqlite', 'UseInMemoryDatabase'], answer: 'UseNpgsql' },
          { options: ['GetConnectionString', 'GetValue', 'GetSection', 'Bind'], answer: 'GetConnectionString' },
          { options: ['AddScoped', 'AddSingleton', 'AddTransient', 'AddDbContext'], answer: 'AddScoped' },
        ],
        why: 'AddDbContext ya registra el contexto como Scoped; el repositorio que lo usa también va Scoped.',
      },
      {
        file: 'ProductRepository.cs',
        task: 'Lectura paginada eficiente.',
        code: `var items = await db.Products
    .[[0]]()
    .OrderBy(p => p.Id)
    .[[1]]((page - 1) * pageSize)
    .[[2]](pageSize)
    .Select(p => new ProductResponse(p.Id, p.Name, p.Description, p.Price, p.Stock))
    .[[3]](ct);`,
        blanks: [
          { options: ['AsNoTracking', 'AsTracking', 'Include', 'AsEnumerable'], answer: 'AsNoTracking' },
          { options: ['Skip', 'Take', 'Where', 'Offset'], answer: 'Skip' },
          { options: ['Take', 'Skip', 'Limit', 'First'], answer: 'Take' },
          { options: ['ToListAsync', 'ToList', 'FirstAsync', 'AsQueryable'], answer: 'ToListAsync' },
        ],
        why: 'Solo lectura sin rastreo, orden estable, Skip/Take para paginar y ToListAsync para no bloquear.',
      },
    ],
  },
  {
    id: 'w3-bugs-ef',
    type: 'bugfix',
    title: 'Encuentra el error: EF Core',
    description: 'Errores frecuentes que cuestan rendimiento, datos o seguridad.',
    concept: 'EF Core',
    rounds: [
      {
        file: 'appsettings.json',
        code: `{
  "Logging": { "LogLevel": { "Default": "Information" } },
  "ConnectionStrings": {
    "Default": "Host=prod-db;Database=catalog;Username=admin;Password=Sup3rS3cret"
  },
  "AllowedHosts": "*"
}`,
        bad: 4,
        why: 'La contraseña de producción queda en Git para siempre, aunque la borres después.',
        fix: '"Default": ""   // el valor real llega por user-secrets, variable de entorno o Secret',
      },
      {
        file: 'EfProductRepository.cs',
        code: `public async Task AddAsync(Product product, CancellationToken ct)
{
    db.Products.Add(product);
    db.SaveChangesAsync(ct);
}`,
        bad: 4,
        why: 'Falta el await: el método termina antes de guardar, los errores se pierden y el DbContext puede liberarse a mitad del INSERT.',
        fix: 'await db.SaveChangesAsync(ct);',
      },
      {
        file: 'ProductService.cs',
        code: `public async Task<IReadOnlyList<ProductResponse>> GetExpensiveAsync(CancellationToken ct)
{
    var products = await db.Products.ToListAsync(ct);
    return products
        .Where(p => p.Price > 1000)
        .Select(p => p.ToResponse())
        .ToList();
}`,
        bad: 3,
        why: 'ToListAsync trae toda la tabla antes de filtrar. Con 100.000 productos, traes 100.000 filas para usar 50.',
        fix: 'var products = await db.Products.Where(p => p.Price > 1000).ToListAsync(ct);',
      },
      {
        file: 'Program.cs',
        code: `builder.Services.AddControllers();
builder.Services.AddSingleton<AppDbContext>();
builder.Services.AddScoped<IProductRepository, EfProductRepository>();`,
        bad: 2,
        why: 'Un DbContext Singleton se comparte entre peticiones simultáneas: no es thread-safe y acumula entidades para siempre.',
        fix: 'builder.Services.AddDbContext<AppDbContext>(o => o.UseNpgsql(builder.Configuration.GetConnectionString("Default")));',
      },
      {
        file: 'OrderService.cs',
        code: `var orders = await db.Orders.AsNoTracking().ToListAsync(ct);
foreach (var order in orders)
{
    order.Customer = await db.Customers.FindAsync([order.CustomerId], ct);
}
return orders;`,
        bad: 4,
        why: 'N+1: una consulta extra por cada pedido. 500 pedidos son 501 consultas.',
        fix: 'var orders = await db.Orders.AsNoTracking().Include(o => o.Customer).ToListAsync(ct);',
      },
      {
        file: 'ProductService.cs',
        code: `public async Task<ProductResponse> GetByIdAsync(int id, CancellationToken ct)
{
    var product = await db.Products.FirstOrDefaultAsync(p => p.Id == id, ct);
    return product.ToResponse();
}`,
        bad: 4,
        why: 'Si no existe, product es null y lanza NullReferenceException: el cliente recibe 500 en vez de 404.',
        fix: 'return product?.ToResponse() ?? throw new NotFoundException($"No existe el producto {id}.");',
      },
    ],
  },
  {
    id: 'w3-config-gana',
    type: 'choice',
    title: '¿Qué valor gana?',
    description: 'Configuración en capas: decide qué valor termina usando la app.',
    concept: 'Configuración',
    rounds: [
      {
        prompt: 'appsettings.json dice Port=5432 y la variable de entorno ConnectionStrings__Default dice Port=6543. ¿Cuál se usa?',
        options: ['5432 (appsettings.json)', '6543 (variable de entorno)', 'La app falla por conflicto'],
        answer: '6543 (variable de entorno)',
        why: 'Las variables de entorno se cargan después que los JSON: la última fuente gana.',
      },
      {
        prompt: 'En Development, appsettings.Development.json y user-secrets definen la misma clave. ¿Cuál gana?',
        options: ['appsettings.Development.json', 'user-secrets', 'appsettings.json'],
        answer: 'user-secrets',
        why: 'User secrets se carga después de los JSON, solo en Development.',
      },
      {
        prompt: '¿Cómo se escribe ConnectionStrings:Default como variable de entorno?',
        options: ['ConnectionStrings:Default', 'ConnectionStrings__Default', 'CONNECTIONSTRINGS_DEFAULT', 'ConnectionStrings.Default'],
        answer: 'ConnectionStrings__Default',
        why: 'Los dos puntos se reemplazan por doble guion bajo; funciona en Linux, Windows, Docker y Kubernetes.',
      },
      {
        prompt: 'En producción (dentro de un contenedor), ¿dónde va la contraseña de la base?',
        options: ['appsettings.Production.json', 'Una variable de entorno que viene de un Secret', 'User secrets', 'Un ENV en el Dockerfile'],
        answer: 'Una variable de entorno que viene de un Secret',
        why: 'User secrets es solo para desarrollo y un ENV en el Dockerfile queda grabado en la imagen.',
      },
      {
        prompt: '¿Qué lee configuration.GetConnectionString("Default")?',
        options: ['La clave Default', 'La clave ConnectionStrings:Default', 'La variable DATABASE_URL', 'La primera cadena que encuentre'],
        answer: 'La clave ConnectionStrings:Default',
        why: 'Es un atajo de configuration["ConnectionStrings:Default"].',
      },
    ],
  },
  {
    id: 'w3-flujo-migracion',
    type: 'order',
    title: 'Flujo de una migración',
    description: 'Ordena los pasos para cambiar el esquema de forma segura.',
    concept: 'Migraciones',
    items: [
      'Cambiar la entidad o su configuración',
      'dotnet ef migrations add AgregarSku',
      'Revisar el archivo de migración generado',
      'dotnet ef database update',
      'Probar la API contra la base actualizada',
      'Commit del código junto con la migración',
    ],
  },
  {
    id: 'w3-terminos',
    type: 'match',
    title: 'Vocabulario de EF Core',
    description: 'Une cada término con su definición.',
    concept: 'EF Core',
    pairs: [
      ['DbContext', 'Sesión con la base: consulta y guarda cambios'],
      ['DbSet<T>', 'Representa una tabla'],
      ['Migración', 'Cambio de esquema versionado en código'],
      ['AsNoTracking', 'Lectura sin rastrear cambios'],
      ['Include', 'Carga una entidad relacionada en la misma consulta'],
      ['SaveChangesAsync', 'Ejecuta los INSERT/UPDATE/DELETE pendientes'],
    ],
  },
]
