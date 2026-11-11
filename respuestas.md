# Respuestas — Entrega: API del gimnasio FitVal con NestJS y PostgreSQL

## Ejercicio 0
```text
remote: - Changes must be made through a pull request.
! [remote rejected] main -> main (push declined due to repository rule violations)
```

## Pregunta 1
El cliente recibe un código `500` con `{"statusCode":500,"message":"Internal server error"}`. En la terminal de NestJS se ve el error de conexión detallado (`ECONNREFUSED 127.0.0.1:5433`) junto con el stack trace completo. Es mejor así por seguridad: evita exponer detalles internos de la infraestructura y posibles vectores de ataque al exterior, mostrando un error genérico al cliente mientras permite a los desarrolladores auditar y depurar el fallo internamente.

## Pregunta 2
Con la versión vulnerable salen 7 clases (todas las existentes) y con la versión parametrizada (`$1`) salen 0 clases.
En la versión vulnerable se inyecta directamente el texto produciendo la consulta: `WHERE c.activity ILIKE '%zzz' OR 1=1 --%' ORDER BY c.starts_at`. La condición `OR 1=1` se evalúa como siempre verdadera para cada fila y los dos guiones `--` comentan el resto anulando el filtro. En cambio, con `$1` PostgreSQL trata la cadena recibida como un valor literal sin interpretar caracteres de control SQL.

## Pregunta 3
Comprobamos en la API la existencia del monitor para devolver un error `400 Bad Request` descriptivo si el `trainerId` no existe. Si no lo hiciéramos, PostgreSQL rechazaría el `INSERT` por violación de clave ajena y NestJS respondería con un `500 Internal Server Error`, dando la falsa impresión de que el servidor ha fallado internamente cuando en realidad el cliente envió un dato inválido en el body.

## Pregunta 4
Porque la petición es válida sintácticamente y el identificador existe en la base de datos (no es un error de formato o parámetro mal enviado que requiera `400`), pero entra en colisión con el estado actual del recurso y las restricciones de negocio (la clase tiene reservas activas que no se pueden perder), lo que según el estándar HTTP corresponde a un conflicto (`409 Conflict`).

## Pregunta 5
El payload del token contiene únicamente el identificador de usuario y los metadatos temporales de emisión y caducidad: `{ "sub": 1, "iat": ..., "exp": ... }`.
No incluimos el rol dentro del token para permitir que cualquier cambio de permisos o rol (por ejemplo, promover a un socio a `staff` o revocar acceso) tenga efecto inmediato en la base de datos sin requerir que el usuario vuelva a iniciar sesión o esperar a que expire el token JWT.

## Pregunta 6
Funciona sin necesidad de volver a iniciar sesión porque el token JWT almacena únicamente `{ sub: id }`, y el guard (`StaffGuard`) consulta en cada petición el rol fresco directamente desde la base de datos mediante `UsersService`. Si el rol estuviera incrustado dentro del payload del token, seguiría conteniendo `'member'` y el usuario continuaría recibiendo un `403 Forbidden` hasta que el token expirase o volviese a iniciar sesión para generar un nuevo token con el rol `'staff'`.
