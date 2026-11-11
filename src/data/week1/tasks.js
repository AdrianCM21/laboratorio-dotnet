// Tareas prácticas sobre el proyecto BootcampCLTNoviembre.
// `hint` (opcional) usa los mismos bloques que las lecciones.

export const tasks = [
  {
    id: 'sdk',
    title: 'Verifica que tienes el SDK de .NET 10',
    detail: 'El proyecto apunta a `net10.0`.',
    hint: [{ code: 'dotnet --version', lang: 'bash' }],
  },
  {
    id: 'run',
    title: 'Corre el proyecto base',
    detail: 'Desde la carpeta que contiene el `.csproj`.',
    hint: [{ code: 'cd BootcampCLTNoviembre/BootcampCLTNoviembre\ndotnet run', lang: 'bash' }],
  },
  {
    id: 'scalar',
    title: 'Abre Scalar y prueba GET /api/v1/products',
    detail: 'Con la app corriendo, entra a `/scalar`. Debe responder 200 con dos productos.',
  },
  {
    id: 'not-found',
    title: 'Provoca un 404',
    detail: 'Pide `GET /api/v1/products/99` y confirma el código de estado.',
  },
  {
    id: 'post',
    title: 'Agrega POST /products',
    detail: 'Debe crear el producto y responder **201 Created**.',
    hint: [
      {
        code: `public sealed record CreateProductRequest(
    string Name, string? Description, decimal Price, int Stock);

[HttpPost]
[ProducesResponseType<Product>(StatusCodes.Status201Created)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
public ActionResult<Product> Create(CreateProductRequest request)
{
    var product = new Product(
        ++_nextId, request.Name, request.Description, request.Price, request.Stock);
    Products.Add(product);

    // 201 + header Location apuntando al recurso nuevo
    return CreatedAtAction(
        nameof(GetById), new { id = product.Id, version = "1.0" }, product);
}`,
        lang: 'csharp',
      },
      { p: 'Para que compile, `_nextId` ya no puede ser `readonly` (en tu proyecto ya es un `static int` normal).' },
    ],
  },
  {
    id: 'put',
    title: 'Agrega PUT /products/{id}',
    detail: 'Reemplaza el producto. **204** si existe, **404** si no.',
    hint: [
      {
        code: `[HttpPut("{id:int}")]
[ProducesResponseType(StatusCodes.Status204NoContent)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
public IActionResult Update(int id, CreateProductRequest request)
{
    var index = Products.FindIndex(product => product.Id == id);
    if (index < 0) return NotFound();

    Products[index] = new Product(
        id, request.Name, request.Description, request.Price, request.Stock);
    return NoContent();
}`,
        lang: 'csharp',
      },
    ],
  },
  {
    id: 'delete',
    title: 'Agrega DELETE /products/{id}',
    detail: '**204** si lo borró, **404** si no existe.',
    hint: [
      {
        code: `[HttpDelete("{id:int}")]
[ProducesResponseType(StatusCodes.Status204NoContent)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
public IActionResult Delete(int id)
{
    var removed = Products.RemoveAll(product => product.Id == id);
    return removed == 0 ? NotFound() : NoContent();
}`,
        lang: 'csharp',
      },
    ],
  },
  {
    id: 'model-file',
    title: 'Mueve el record Product a Models/Product.cs',
    detail: 'Hoy está dentro del controller. La estructura de carpetas debe reflejar la arquitectura.',
  },
  {
    id: 'http-file',
    title: 'Escribe las peticiones en el archivo .http',
    detail: 'Una por cada endpoint, para repetir las pruebas con un clic.',
    hint: [
      {
        code: `POST {{BootcampCLTNoviembre_HostAddress}}/api/v1/products
Content-Type: application/json

{
  "name": "Teclado",
  "description": "Teclado mecánico",
  "price": 80.00,
  "stock": 15
}`,
        lang: 'http',
      },
    ],
  },
  {
    id: 'commit',
    title: 'Haz commit de la semana 1',
    detail: 'Un repo limpio y versionado suma puntos en la rúbrica de CI/CD.',
    hint: [{ code: 'git add .\ngit commit -m "feat: CRUD de productos en memoria"', lang: 'bash' }],
  },
]
