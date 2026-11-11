// Quiz final de la semana 1. Usa el mismo formato que los juegos de tipo `choice`.

export const quiz = {
  id: 'quiz-semana-1',
  title: 'Quiz de la semana 1',
  description: '12 preguntas que mezclan todos los temas. Se aprueba con 80 %.',
  rounds: [
    {
      prompt: '¿Qué significa que una API sea stateless?',
      options: [
        'Que no usa base de datos',
        'Que el servidor no guarda memoria entre peticiones',
        'Que no devuelve códigos de estado',
        'Que solo acepta GET',
      ],
      answer: 'Que el servidor no guarda memoria entre peticiones',
      why: 'Cada petición lleva todo lo necesario para procesarse.',
    },
    {
      prompt: '¿Qué línea de Program.cs conecta las rutas con los controllers?',
      options: ['builder.Services.AddOpenApi()', 'app.UseHttpsRedirection()', 'app.MapControllers()', 'app.Run()'],
      answer: 'app.MapControllers()',
      why: 'MapControllers registra las rutas definidas con atributos.',
    },
    {
      prompt: '¿Qué atributo hace que una action responda a GET /products/5?',
      options: ['[HttpGet]', '[HttpGet("{id:int}")]', '[Route("5")]', '[ApiController]'],
      answer: '[HttpGet("{id:int}")]',
      why: '{id:int} captura el 5 y exige que sea un entero.',
    },
    {
      prompt: '¿Qué devuelve NotFound() en un controller?',
      options: ['200', '204', '404', '500'],
      answer: '404',
      why: 'NotFound() es el atajo para 404.',
    },
    {
      prompt: '¿Qué código corresponde a un POST que creó un recurso?',
      options: ['200 OK', '201 Created', '204 No Content', '202 Accepted'],
      answer: '201 Created',
      why: 'En ASP.NET Core se devuelve con CreatedAtAction.',
    },
    {
      prompt: '¿Cuál de estas rutas respeta REST?',
      options: ['GET /getAllProducts', 'POST /products/create', 'GET /products', 'GET /Products/List'],
      answer: 'GET /products',
      why: 'Sustantivo en plural y el verbo lo pone HTTP.',
    },
    {
      prompt: 'En /api/v1/products?category=electronics, ¿qué es category=electronics?',
      options: ['Un parámetro de ruta', 'Un query param', 'Un header', 'El body'],
      answer: 'Un query param',
      why: 'Va después del signo ? y sirve para filtrar.',
    },
    {
      prompt: '¿Cuál es la capa más baja del ecosistema?',
      options: ['Controllers y Actions', 'ASP.NET Core Framework', '.NET Runtime y SDK', 'Plantilla Web API'],
      answer: '.NET Runtime y SDK',
      why: 'Es el motor que compila y ejecuta todo lo demás.',
    },
    {
      prompt: '¿Qué comando genera la plantilla de una API?',
      options: ['dotnet run', 'dotnet new webapi', 'dotnet build', 'dotnet add package'],
      answer: 'dotnet new webapi',
      why: 'dotnet new crea proyectos a partir de plantillas.',
    },
    {
      prompt: '¿Cómo se nombra una interfaz en C#?',
      options: ['productService', 'ProductServiceInterface', 'IProductService', '_productService'],
      answer: 'IProductService',
      why: 'I + PascalCase.',
    },
    {
      prompt: '¿Por qué Price es decimal y no double?',
      options: [
        'Porque decimal ocupa menos memoria',
        'Porque decimal no pierde precisión con dinero',
        'Porque double no existe en C#',
        'Porque JSON no soporta double',
      ],
      answer: 'Porque decimal no pierde precisión con dinero',
      why: 'double redondea en binario; decimal es exacto en base 10.',
    },
    {
      prompt: 'Un cliente envía el mismo DELETE dos veces. ¿Qué propiedad garantiza que el servidor queda igual?',
      options: ['Cacheable', 'Idempotencia', 'HATEOAS', 'Layered System'],
      answer: 'Idempotencia',
      why: 'Repetir una operación idempotente no cambia el resultado.',
    },
  ],
}
