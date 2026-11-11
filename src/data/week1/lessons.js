// Lecciones de la semana 1. Cada lección es una lista de bloques:
//   { p }      párrafo            { h }     subtítulo
//   { list }   viñetas            { code }  bloque de código (lang opcional)
//   { note }   idea clave         { table } { head: [], rows: [[]] }
//   { stack }  capas apiladas (de arriba hacia abajo)
// En los textos: `codigo` y **negrita**.

export const lessons = [
  {
    id: 'api-rest',
    title: 'Qué es una API y qué es REST',
    minutes: 8,
    blocks: [
      { p: 'Una **API** permite usar un sistema sin pasar por una pantalla. Tu app móvil no entra a la base de datos: le pide los datos a una API.' },
      { p: '**REST** es un estilo para diseñar APIs sobre HTTP. Todo gira alrededor de **recursos** (productos, clientes, pedidos) que tienen una dirección y se manipulan con verbos HTTP.' },
      { h: 'Los 6 principios de REST' },
      {
        table: {
          head: ['Principio', 'Qué significa', 'Ejemplo'],
          rows: [
            ['Client-Server', 'Cliente y servidor están separados y evolucionan por su cuenta.', 'Tu app React Native y tu API .NET se despliegan por separado.'],
            ['Stateless', 'El servidor no recuerda peticiones anteriores. Cada petición lleva todo lo necesario.', 'El token viaja en cada petición.'],
            ['Cacheable', 'La respuesta indica si se puede guardar y reutilizar.', 'Header `Cache-Control: max-age=60`.'],
            ['Uniform Interface', 'Todos los recursos se usan de la misma forma estándar.', '`GET /products/1`, `GET /orders/1`.'],
            ['Layered System', 'Puede haber intermediarios y el cliente no lo nota.', 'Un gateway o proxy delante de la API.'],
            ['Code on Demand', 'El servidor puede enviar código ejecutable. Es opcional.', 'Un script que el cliente descarga y ejecuta.'],
          ],
        },
      },
      { note: 'Si tuvieras que recordar uno solo: **Stateless**. Es lo que permite escalar la API en varios contenedores en la semana 4.' },
    ],
  },
  {
    id: 'anatomia-http',
    title: 'Anatomía de una petición HTTP',
    minutes: 10,
    blocks: [
      { p: 'Toda llamada a una API REST tiene cuatro piezas: la **ruta**, el **verbo**, el **request** y la **response**.' },
      { code: 'GET /api/v1/products/42?category=electronics', lang: 'http' },
      {
        list: [
          '`GET` es el **verbo**: qué quieres hacer.',
          '`/api/v1/products` es la **ruta** del recurso. `v1` es la versión de la API.',
          '`42` es un **parámetro de ruta**: identifica un recurso concreto.',
          '`?category=electronics` es un **query param**: filtra, ordena o pagina.',
        ],
      },
      { h: 'Verbos' },
      {
        table: {
          head: ['Verbo', 'Uso', 'Respuesta típica', '¿Idempotente?'],
          rows: [
            ['GET', 'Leer', '200 OK', 'Sí'],
            ['POST', 'Crear', '201 Created', 'No'],
            ['PUT', 'Reemplazar', '200 OK o 204 No Content', 'Sí'],
            ['DELETE', 'Borrar', '204 No Content', 'Sí'],
          ],
        },
      },
      { note: '**Idempotente** quiere decir que repetir la misma petición deja el servidor igual. Dos `DELETE /products/1` dejan el producto borrado. Dos `POST /products` crean dos productos.' },
      { h: 'Códigos de estado' },
      {
        table: {
          head: ['Código', 'Nombre', 'Cuándo'],
          rows: [
            ['200', 'OK', 'Todo bien y hay cuerpo en la respuesta.'],
            ['201', 'Created', 'Se creó un recurso.'],
            ['204', 'No Content', 'Todo bien y no hay nada que devolver.'],
            ['400', 'Bad Request', 'El cliente envió datos inválidos.'],
            ['401', 'Unauthorized', 'Falta autenticarse.'],
            ['403', 'Forbidden', 'Estás autenticado pero no tienes permiso.'],
            ['404', 'Not Found', 'El recurso no existe.'],
            ['409', 'Conflict', 'Choca con el estado actual, por ejemplo un duplicado.'],
            ['500', 'Internal Server Error', 'Falló el servidor.'],
          ],
        },
      },
      { p: 'Regla rápida: **2xx** salió bien, **4xx** se equivocó el cliente, **5xx** se equivocó el servidor.' },
      { p: '**HATEOAS** es la idea de que la respuesta incluya enlaces a lo que se puede hacer después, por ejemplo el link para ver o borrar el producto recién creado.' },
    ],
  },
  {
    id: 'ecosistema',
    title: 'El ecosistema ASP.NET Core',
    minutes: 8,
    blocks: [
      { p: 'Tu API se apoya en cinco capas. Tú escribes las de arriba; las de abajo ya vienen hechas.' },
      {
        stack: [
          ['5', 'Tus endpoints', 'Tu código: productos, pedidos, reglas de negocio.'],
          ['4', 'Controllers y Actions', 'Clases y métodos que reciben cada petición.'],
          ['3', 'Plantilla Web API', 'La estructura inicial que genera `dotnet new webapi`.'],
          ['2', 'ASP.NET Core', 'El framework web: rutas, JSON, inyección de dependencias.'],
          ['1', '.NET Runtime y SDK', 'El motor que compila y ejecuta C#.'],
        ],
      },
      { h: 'Program.cs de tu proyecto' },
      { p: 'Es el punto de entrada. Tiene dos mitades: primero se **registran servicios**, después se **arma el pipeline** que recorre cada petición.' },
      {
        code: `var builder = WebApplication.CreateBuilder(args);

// 1) Servicios: lo que la app necesita para funcionar
builder.Services.AddControllers();
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
});
builder.Services.AddOpenApi();

var app = builder.Build();

// 2) Pipeline: por dónde pasa cada petición
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();            // documento OpenAPI
    app.MapScalarApiReference(); // interfaz para probar la API
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();            // conecta las rutas con los controllers

app.Run();`,
        lang: 'csharp',
      },
      { note: 'Tu proyecto usa **Scalar** en lugar de Swagger UI. Cumplen la misma función: mostrar y probar tu API a partir del documento OpenAPI.' },
    ],
  },
  {
    id: 'controller',
    title: 'Tu primer controller, línea por línea',
    minutes: 10,
    blocks: [
      { p: 'Un **controller** agrupa los endpoints de un recurso. Cada método público es una **action** que responde a un verbo y una ruta.' },
      {
        code: `[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/products")]
public class ProductsController : Controller
{
    [HttpGet("{id:int}")]
    [ProducesResponseType<Product>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<Product> GetById(int id)
    {
        var product = Products.FirstOrDefault(product => product.Id == id);
        return product is null ? NotFound() : Ok(product);
    }
}`,
        lang: 'csharp',
      },
      {
        table: {
          head: ['Pieza', 'Para qué sirve'],
          rows: [
            ['`[ApiController]`', 'Activa validación automática y respuestas 400 estándar.'],
            ['`[ApiVersion("1.0")]`', 'Declara a qué versión de la API pertenece.'],
            ['`[Route(...)]`', 'Ruta base. Aquí queda `/api/v1/products`.'],
            ['`[HttpGet("{id:int}")]`', 'Responde a GET y exige que `id` sea un entero.'],
            ['`[ProducesResponseType]`', 'Documenta en OpenAPI qué códigos puede devolver.'],
            ['`ActionResult<Product>`', 'Permite devolver un `Product` o un código de error.'],
            ['`Ok()` / `NotFound()`', 'Atajos para responder 200 y 404.'],
          ],
        },
      },
      { h: 'El modelo: un record' },
      {
        code: `public sealed record Product(
    int Id,
    string Name,
    string? Description,
    decimal Price,
    int Stock);`,
        lang: 'csharp',
      },
      {
        list: [
          'Un `record` es una clase pensada para **llevar datos**: inmutable y con igualdad por valor.',
          '`string?` indica que la descripción puede ser `null`.',
          '`decimal` es el tipo correcto para dinero. Nunca `double`.',
        ],
      },
      { note: 'A tu controller le faltan `POST`, `PUT` y `DELETE`. Los vas a escribir en la pestaña **Tareas**.' },
    ],
  },
  {
    id: 'convenciones',
    title: 'Convenciones de nombres y código limpio',
    minutes: 6,
    blocks: [
      { p: 'En .NET los nombres siguen reglas fijas. Respetarlas hace que tu código se lea como el de cualquier otro proyecto C#.' },
      {
        table: {
          head: ['Elemento', 'Regla', 'Ejemplo'],
          rows: [
            ['Clases, records, métodos, propiedades', 'PascalCase', '`ProductsController`, `GetById`'],
            ['Interfaces', 'I + PascalCase', '`IProductRepository`'],
            ['Parámetros y variables locales', 'camelCase', '`productId`'],
            ['Campos privados', '_camelCase', '`_nextId`'],
            ['Métodos asíncronos', 'Terminan en Async', '`GetAllAsync`'],
          ],
        },
      },
      { h: 'Higiene de código' },
      {
        list: [
          '**Organización:** las carpetas reflejan la arquitectura (`Controllers`, `Models`, `Services`).',
          '**Comunicación:** códigos HTTP correctos y mensajes de error descriptivos.',
          '**Rutas:** sustantivos en plural y en minúscula. `/products`, no `/getProducts`.',
          '**Limpieza:** métodos cortos, nombres claros y sin código muerto.',
        ],
      },
      { note: 'El verbo ya lo pone HTTP. Por eso la ruta es `DELETE /products/5` y no `/deleteProduct/5`.' },
    ],
  },
  {
    id: 'ciclo-vida',
    title: 'El ciclo de vida de tu primera API',
    minutes: 6,
    blocks: [
      { p: 'Crear y probar una API siempre sigue los mismos cuatro pasos.' },
      { h: '1. Generar la plantilla' },
      { code: 'dotnet new webapi --use-controllers -n MiApi\ncd MiApi\ndotnet run', lang: 'bash' },
      { h: '2. Crear un endpoint' },
      { p: 'Agregas un controller con sus actions, como `ProductsController`.' },
      { h: '3. Ver la documentación automática' },
      { p: 'Con la app corriendo, abre `/scalar` en el navegador. El documento OpenAPI está en `/openapi/v1.json`.' },
      { h: '4. Validar a mano' },
      { p: 'Prueba cada endpoint desde Scalar, Postman o el archivo `.http` del proyecto:' },
      { code: '@host = http://localhost:5000\n\nGET {{host}}/api/v1/products\n\n###\n\nGET {{host}}/api/v1/products/1', lang: 'http' },
      { note: 'El puerto real está en `Properties/launchSettings.json`. Usa el que te muestre `dotnet run`.' },
    ],
  },
]
