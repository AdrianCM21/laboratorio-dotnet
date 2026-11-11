export const tasks = [
  {
    id: 'w3-postgres',
    title: 'Levanta PostgreSQL 17 en Docker con volumen',
    detail: 'Contenedor `catalog-db`, base `catalog`, puerto 5432 y volumen con nombre.',
    hint: [{ code: 'docker run -d --name catalog-db -e POSTGRES_PASSWORD=devpass -e POSTGRES_DB=catalog \\\n  -p 5432:5432 -v catalog-data:/var/lib/postgresql/data postgres:17', lang: 'bash' }],
  },
  {
    id: 'w3-paquetes',
    title: 'Instala dotnet-ef y los paquetes',
    detail: 'Npgsql en Infrastructure, `Microsoft.EntityFrameworkCore.Design` en Api.',
  },
  {
    id: 'w3-dbcontext',
    title: 'Crea AppDbContext y una configuración por entidad',
    detail: 'Precio con `HasPrecision(18, 2)`, nombre obligatorio, SKU único y relación con Category.',
  },
  {
    id: 'w3-secrets',
    title: 'Configura la cadena de conexión con user-secrets',
    detail: '`appsettings.json` queda con la cadena vacía. Verifica con `git diff` que no subes contraseñas.',
    hint: [{ code: 'dotnet user-secrets init --project src/<Api>\ndotnet user-secrets set "ConnectionStrings:Default" "Host=localhost;Port=5432;Database=catalog;Username=postgres;Password=devpass" --project src/<Api>', lang: 'bash' }],
  },
  {
    id: 'w3-migracion',
    title: 'Crea y aplica la migración InitialCreate',
    detail: 'Revisa el archivo generado y confirma las tablas con `\\dt` en psql.',
  },
  {
    id: 'w3-repo-ef',
    title: 'Reemplaza el repositorio en memoria por EfProductRepository',
    detail: 'Solo cambia el registro en `AddInfrastructure`. Si tuviste que tocar Application, revisa las capas.',
  },
  {
    id: 'w3-lecturas',
    title: 'Optimiza las lecturas',
    detail: '`AsNoTracking`, proyección directa al DTO y paginación con `OrderBy` + `Skip` + `Take`.',
  },
  {
    id: 'w3-seed',
    title: 'Carga categorías iniciales con HasData',
    detail: 'Genera una migración nueva para los datos semilla.',
  },
  {
    id: 'w3-409',
    title: 'Traduce el SKU duplicado a 409',
    detail: 'Captura `DbUpdateException` con `PostgresErrorCodes.UniqueViolation` y lanza `ConflictException`. Pruébalo con dos POST iguales.',
  },
  {
    id: 'w3-health',
    title: 'Agrega /health/live y /health/ready',
    detail: 'Detén el contenedor de la base: `ready` debe fallar y `live` seguir en 200.',
    hint: [{ code: 'docker stop catalog-db\ncurl -i http://localhost:5080/health/ready   # 503\ncurl -i http://localhost:5080/health/live    # 200\ndocker start catalog-db', lang: 'bash' }],
  },
  {
    id: 'w3-commit',
    title: 'Commit de la semana 3',
    detail: 'Incluye la carpeta `Migrations`. Nunca incluyas contraseñas.',
    hint: [{ code: 'git add .\ngit commit -m "feat: persistencia con EF Core y PostgreSQL"', lang: 'bash' }],
  },
]
