export const tasks = [
  {
    id: 'w5-serilog',
    title: 'Instala y configura Serilog',
    detail: 'Bootstrap logger, `AddSerilog` leyendo la configuración, `UseSerilogRequestLogging` y `WriteTo` con claves con nombre.',
  },
  {
    id: 'w5-templates',
    title: 'Revisa cada log de tu código',
    detail: 'Templates con propiedades en PascalCase, la excepción como primer argumento y nada de interpolación ni `Console.WriteLine`.',
    hint: [{ code: 'git grep -n \'Log[A-Za-z]*(\\$"\'      # encuentra logs interpolados\ngit grep -n "Console.Write"', lang: 'bash' }],
  },
  {
    id: 'w5-niveles',
    title: 'Ajusta los niveles',
    detail: 'Information para el flujo normal, Warning para lo anómalo, Error solo con excepción. Un 404 no es Error.',
  },
  {
    id: 'w5-seq-compose',
    title: 'Agrega Seq a compose.yaml y verifica que llegan los logs',
    detail: 'La API envía a `http://seq:5341` dentro de la red de compose.',
  },
  {
    id: 'w5-seq-signals',
    title: 'Crea signals y un dashboard en Seq',
    detail: 'Signals «Errores» (`@Level = \'Error\'`) y «Lentas» (`Elapsed > 1000`), y un gráfico de peticiones por StatusCode.',
  },
  {
    id: 'w5-seq-k8s',
    title: 'Instala Seq en Minikube con Helm',
    detail: '`helm upgrade --install seq datalust/seq -f seq-values.yaml` con persistencia. La URL de Seq va en el ConfigMap o en `values.yaml` de tu chart.',
  },
  {
    id: 'w5-ci',
    title: 'Crea el workflow de CI',
    detail: 'restore, build y test en cada push y PR a main. Debe quedar en verde.',
  },
  {
    id: 'w5-imagen',
    title: 'Publica la imagen en GHCR',
    detail: 'Job `image` con `needs: build`, `packages: write` y tags generados por `metadata-action`.',
  },
  {
    id: 'w5-cd',
    title: 'Agrega el despliegue (CD)',
    detail: 'Job con kind + Helm `--wait` en el pipeline, o un `deploy.sh` local con Minikube documentado en el README.',
  },
  {
    id: 'w5-repo',
    title: 'Limpia el repositorio',
    detail: '`.gitignore` completo, sin secretos en el historial, sin código comentado, estructura `src/ tests/ k8s/ charts/ .github/`.',
    hint: [{ code: 'git log -p | grep -iE "password|secret|token" | head   # busca secretos en el historial', lang: 'bash' }],
  },
  {
    id: 'w5-readme',
    title: 'Escribe el README',
    detail: 'Arquitectura, ejecución local, Kubernetes, observabilidad, CI/CD y tabla de variables de entorno. Alguien que no te conoce debería poder levantarlo.',
  },
  {
    id: 'w5-tag',
    title: 'Etiqueta la versión v1.0.0',
    detail: '`git tag -a v1.0.0` y push de la etiqueta. Confirma que la imagen 1.0.0 aparece en GHCR.',
  },
  {
    id: 'w5-autoevaluacion',
    title: 'Autoevalúate con la rúbrica',
    detail: 'Abre **Proyecto final** en esta app y puntúa cada criterio con honestidad. Lo que quede bajo, es tu próxima tarea.',
  },
]
