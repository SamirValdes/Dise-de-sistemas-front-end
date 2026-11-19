# Guía de construcción por fases — Backend Teatro Luminaria (Persona 2)

Documento de referencia. Quien construya el backend (persona o IA) debe seguir esta guía fase por fase, en orden, sin saltarse fases.

## 0. Reglas generales

1. **Sin commits.** No ejecutar `git add`, `commit`, `push`, ni crear ramas. Los commits los hace la persona responsable al terminar cada fase. Única excepción, con autorización explícita: `git rm -r` de la carpeta duplicada en la Fase 0 (solo deja el cambio preparado; el commit lo hace la persona).
2. **Sin pruebas.** No crear proyectos ni archivos de test.
3. **Simple y rápido.** Un solo proyecto. Sin CQRS, MediatR, AutoMapper ni repositorios genéricos. Controladores o Minimal API simples.
4. **Una fase a la vez.** Al terminar cada fase: resumir lo hecho, indicar cómo verificarla en Swagger, proponer el mensaje de commit y **detenerse** hasta que la persona escriba "continuar".
5. **Monorepo: no tocar el frontend.** Todo el código nuevo va en la carpeta `backend/` de la raíz del repositorio. El frontend solo se puede leer. No mover, renombrar ni borrar ningún archivo o carpeta existente sin pedir autorización explícita (ver sección 0.1).
6. **No inventar funcionalidades** fuera del alcance. Ante la duda, elegir la opción más simple e informarlo en una línea.

## 0.1 Estructura del repositorio (monorepo)

Todo el proyecto vive en un solo repositorio. Hoy el frontend (React + Vite) está en la **raíz** del repositorio:

    (raíz del repo)
    ├── .git, .idea, .gitignore
    ├── Dise-de-sistemas-front-end/   (copia antigua duplicada; se elimina en la Fase 0, con autorización)
    ├── dist/, node_modules/          (generados; no se versionan)
    ├── public/, src/
    ├── eslint.config.js, index.html, package.json, package-lock.json, vite.config.js
    └── README.md

El backend se agrega en una carpeta nueva `backend/` en esa misma raíz, sin mover el frontend:

    (raíz del repo)
    ├── backend/        ← NUEVO: API ASP.NET Core (todo el código C# va aquí)
    ├── src/, public/, package.json, ...   (frontend, sin cambios)
    └── ...

Reglas de este apartado:
- La carpeta anidada `Dise-de-sistemas-front-end/` ya fue inspeccionada: es una copia antigua y duplicada del proyecto (creada por error en un commit de octubre), sin archivos útiles que no estén ya en la raíz. Se elimina en la Fase 0, con autorización de la persona y en un commit propio. Mientras tanto, **no usarla como fuente**: el frontend real es el de la raíz.
- Verificar que el `.gitignore` de la raíz ya ignora `node_modules/` y `dist/`. Si no, avisar. Para el backend, agregar al `.gitignore` de la raíz (o a `backend/.gitignore`) las entradas `bin/`, `obj/` y `appsettings.Development.json`.
- No instalar nada de .NET en la raíz ni mezclar archivos del backend con los del frontend. No tocar `package.json`, `vite.config.js`, `eslint.config.js` ni `src/`.
- **Reorganización con autorización:** la opción más limpia a futuro sería mover el frontend a una carpeta `frontend/` y dejar `frontend/` y `backend/` como hermanos. Eso **no se hace** sin que la persona lo autorice. Si se considera necesario, proponerlo, explicar qué archivos se moverían (ver lista arriba) y qué rutas o scripts habría que ajustar (`vite.config.js`, scripts de `package.json`, `.idea`, README), y esperar un "sí" explícito. Lo mismo vale para cualquier otro cambio de carpetas o archivos existentes.
- Las rutas del frontend mencionadas en esta guía (`src/datos/seed.js`, `src/contexto/DataContext.jsx`, etc.) vienen de la documentación del equipo. Verificar que existan en `src/` y, si difieren, usar las reales e informarlo (por ejemplo, el archivo real del checkout es `src/paginas/checkout/checkout.jsx`, en minúscula).
- Para correr todo en local: el frontend con `npm run dev` desde la raíz (puerto 3000, definido en el script `dev` de `package.json`) y el backend desde `backend/` con `dotnet run`.

## 1. Alcance

**Dentro:** base de datos SQL Server con el modelo completo, autenticación (registro, login, JWT, roles), CRUD de eventos, catálogo público con filtros y disponibilidad.

**Fuera (lo hacen otros compañeros):** compra, pago, QR, correo, favoritos, métricas, notificaciones.

## 2. Stack

- .NET (usar la versión del SDK instalado; verificar con `dotnet --version`), ASP.NET Core Web API.
- Base de datos: **SQL Server** (Express, LocalDB o contenedor Docker).
- EF Core con el paquete `Microsoft.EntityFrameworkCore.SqlServer` y migraciones (`dotnet-ef`).
- JWT Bearer (`Microsoft.AspNetCore.Authentication.JwtBearer`) y `BCrypt.Net-Next` para contraseñas.
- Swashbuckle (Swagger) con botón **Authorize**.
- CORS para `http://localhost:3000` (puerto del script `dev` del frontend) y `http://localhost:5173` (puerto por defecto de Vite). Verificar el puerto real en `package.json`.
- Configuración en `appsettings.json`. Los secretos (clave JWT y contraseña de BD) van en `appsettings.Development.json`, que debe estar en `.gitignore`. Dejar un `appsettings.Example.json` con valores de ejemplo.

Cadenas de conexión de ejemplo:

- LocalDB (Windows): `Server=(localdb)\MSSQLLocalDB;Database=TeatroLuminaria;Trusted_Connection=True;TrustServerCertificate=True`
- Docker / SQL Server en red local: `Server=localhost,1433;Database=TeatroLuminaria;User Id=sa;Password=<clave>;TrustServerCertificate=True`

Docker (Mac, Linux o Windows sin SQL Server):

    docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=<ClaveSegura123!>" -p 1433:1433 --name sqlteatro -d mcr.microsoft.com/mssql/server:2022-latest

## 3. Modelo de datos

Ajustar los nombres y campos a lo que use el frontend (`src/datos/seed.js`, `DataContext.jsx`, `AuthContext.jsx`, `precios.js`, `MapaAsientos.jsx`), pero respetar esta estructura. Guardar los enums como texto (`HasConversion<string>()`).

**Este es el modelo COMPLETO y definitivo de la base de datos.** Se crean todas las tablas en la migración inicial, aunque en esta entrega solo se usen unas pocas. Los demás compañeros (compra, pago, QR, favoritos, notificaciones, empleados) trabajan sobre este modelo y no deben cambiarlo sin avisar.

**Seguridad y usuarios**

| Entidad | Campos |
|---|---|
| Rol | Id, Nombre (único: solo existen dos roles, Cliente y Administrador; no hay rol "empleado"), Descripcion |
| Permiso | Id, Codigo (único, ej. `eventos.gestionar`, `usuarios.ver`, `empleados.gestionar`, `metricas.ver`), Descripcion |
| RolPermiso | RolId, PermisoId (clave compuesta) |
| Usuario | Id, Nombre, Correo (único), ContrasenaHash, Telefono (opcional), FotoUrl (opcional), RolId, Estado (Activo / Inactivo), FechaRegistro |

Los empleados del teatro son los usuarios con rol Administrador (así lo define el documento base: "registrar empleados (administradores)"). No existe un rol ni un campo "empleado" en la base de datos.

**Eventos y asientos**

| Entidad | Campos |
|---|---|
| Evento | Id, Nombre, Descripcion, Fecha, Hora, ImagenUrl, Categoria, InformacionAdicional (opcional), PrecioBase, FechaInicioVenta, FechaFinVenta, Estado (Borrador / Publicado / Cancelado / Finalizado), FilasVip, ColumnasVip, FilasGenerales, ColumnasGenerales, Duracion (opcional, solo si el frontend la muestra), Sala (opcional, solo si el frontend la muestra), FechaCreacion, FechaActualizacion |
| Asiento | Id, EventoId, Fila, Numero, Zona (General / VIP), Estado (Disponible / BloqueadoTemporal / Vendido), BloqueadoHasta (nullable), BloqueadoPorUsuarioId (nullable), RowVersion (`[Timestamp]`, concurrencia) |

Índice único en Asiento por (EventoId, Fila, Numero).

**Compra y entradas**

| Entidad | Campos |
|---|---|
| Compra | Id, UsuarioId, EventoId, Subtotal, CargoServicio, Total, Estado (Pendiente / Pagada / Rechazada / Cancelada), Fecha |
| Pago | Id, CompraId, Pasarela (texto), ReferenciaExterna (nullable), Monto, Estado (Pendiente / Aprobado / Rechazado), MotivoRechazo (nullable), Fecha |
| Entrada | Id, CompraId, AsientoId (único), CodigoUnico (único), CodigoQr (texto o base64, nullable), Estado (Valida / Anulada), FechaEmision |

"Eventos próximos" y "eventos a los que ya asistió" se calculan con la fecha del evento; no se guardan como estado.

**Favoritos y notificaciones**

| Entidad | Campos |
|---|---|
| Favorito | UsuarioId, EventoId (clave compuesta), FechaAgregado |
| Notificacion | Id, UsuarioId, EventoId (nullable), Tipo (CambioEvento / Compra / Otro), Mensaje, Leida (bool), Fecha |

**Relaciones**
- Rol 1—N Usuario; Rol N—M Permiso (por RolPermiso).
- Evento 1—N Asiento; Evento 1—N Compra.
- Usuario 1—N Compra; Compra 1—N Pago; Compra 1—N Entrada; Asiento 1—0..1 Entrada.
- Usuario N—M Evento (Favorito); Usuario 1—N Notificacion.
- Borrado: no permitir borrar un evento con compras (restringir); borrar un evento sin compras elimina sus asientos y favoritos (cascada).

Los asientos se generan al crear un evento, con los campos `FilasVip`, `ColumnasVip`, `FilasGenerales` y `ColumnasGenerales` del evento. Valores del seed, tomados de `MapaAsientos.jsx` y `precios.js`: 3 filas VIP (A–C, `FILAS_VIP`) de 8 asientos y 7 filas generales (D–J) de 12 asientos. No hardcodear esta lógica en el código: usar siempre los campos del evento.

En la base de datos el estado `activo`/`proximo` del seed del front se guarda como `Publicado`. La distinción se calcula en la API con el campo `estadoVenta` (`EnVenta`, `Proximamente` o `Cerrada`) según `FechaInicioVenta` y `FechaFinVenta`; no se agregan estados a la tabla.

## 4. Endpoints a entregar

| Método | Ruta | Acceso | Notas |
|---|---|---|---|
| GET | /api/salud | Público | Comprobación de que la API está viva |
| POST | /api/auth/registro | Público | Crea un Cliente. 409 si el correo existe, 400 si faltan datos o la clave es corta |
| POST | /api/auth/login | Público | Devuelve token JWT y datos del usuario. 401 con credenciales inválidas, 403 si la cuenta está inactiva |
| GET | /api/auth/me | Autenticado | Datos del usuario del token |
| GET | /api/usuarios | Administrador | Nombre, correo, fecha de registro, estado |
| GET | /api/eventos | Público | Solo Publicados. Filtros opcionales `categoria`, `texto`, `desde`, `hasta`. Incluye disponibilidad (asientos Disponibles) y el campo calculado `estadoVenta`. Los administradores también ven Borrador |
| GET | /api/eventos/{id} | Público | Detalle del evento |
| POST | /api/eventos | Administrador | Crea el evento y genera sus asientos |
| PUT | /api/eventos/{id} | Administrador | Edita el evento |
| PATCH | /api/eventos/{id}/estado | Administrador | Cambia el estado |
| DELETE | /api/eventos/{id} | Administrador | 409 si el evento ya tiene compras |

Convenciones:
- Errores en JSON `{"mensaje": "..."}` con el código HTTP correcto.
- Validaciones básicas con DataAnnotations.
- El JWT lleva id, correo y rol, y expira en 2 horas.
- Dos políticas de autorización: `SoloAdmin` y `Autenticado`.

## 5. Datos iniciales (seed)

Se cargan al iniciar si la base está vacía:

- Roles: solo Cliente (sin permisos administrativos) y Administrador (todos los permisos).
- Permisos: `eventos.gestionar`, `usuarios.ver`, `empleados.gestionar`, `roles.gestionar`, `metricas.ver`.
- Administrador: `admin@luminaria.com` / `Admin123!` (rol Administrador)
- Cliente de prueba: `cliente@luminaria.com` / `Cliente123!`
- Los eventos de `src/datos/seed.js`, con sus asientos y los asientos ocupados (`asientosOcupados`, ej. "A1", "D5" → Asiento Vendido). `activo` y `proximo` pasan a `Publicado`.
- **Solo se cargan esos dos usuarios.** Los demás usuarios del seed del frontend (`usuariosSeed`, incluido el rol "empleado") NO se cargan: el equipo los crea después. `comprasSeed` tampoco se carga.

## 6. Fases

Cada fase termina con un commit hecho por la persona. Las fases 1 a 6 cubren los 5 commits mínimos que exige el entregable.

### Fase 0 — Preparación
- Verificar `dotnet --version`, `dotnet ef` (instalar con `dotnet tool install --global dotnet-ef` si falta) y que SQL Server responda.
- Revisar la estructura del monorepo (sección 0.1): listar la raíz y confirmar que `node_modules/` y `dist/` están ignorados. Eliminar la copia duplicada `Dise-de-sistemas-front-end/` así: (a) ejecutar `git status` y, si hay cambios sin commitear (por ejemplo en `package.json`), NO continuar con la eliminación hasta que la persona los resuelva; (b) pedir autorización explícita; (c) con el "sí", ejecutar `git rm -r "Dise-de-sistemas-front-end"` (nunca `rm` normal), sin hacer commit; (d) comprobar con `git status` que solo aparecen borrados dentro de esa carpeta y que `src/`, `package.json` y demás archivos de la raíz no cambiaron; (e) proponer el commit `chore: eliminar copia duplicada del proyecto`, que la persona hace SOLA antes de seguir con el backend, para que la limpieza no se mezcle con cambios del backend. Si algo no coincide con lo esperado, detenerse y avisar.
- Crear la carpeta `backend/` en la raíz del repositorio y agregar al `.gitignore` (de la raíz o de `backend/`) `bin/`, `obj/` y `appsettings.Development.json`.
- **Verificación:** el SDK y la conexión a SQL Server funcionan.
- **Commits:** primero `chore: eliminar copia duplicada del proyecto` (solo la eliminación) y luego `chore(backend): estructura inicial y gitignore`

### Fase 1 — API base
- Crear el proyecto Web API, agregar Swagger con Authorize y CORS para los puertos 3000 y 5173, y el endpoint `GET /api/salud`.
- **Verificación:** `/swagger` abre y `/api/salud` responde.
- **Commit:** `feat(backend): proyecto ASP.NET Core con Swagger y CORS`

### Fase 2 — Modelo y base de datos
- Crear TODAS las entidades de la sección 3 (13 tablas), el `DbContext` y la configuración: índices únicos (Correo, Rol.Nombre, Permiso.Codigo, Asiento por evento/fila/número, Entrada.CodigoUnico, Entrada.AsientoId), claves compuestas, enums como texto, `RowVersion` y reglas de borrado.
- Crear la migración inicial y aplicarla a SQL Server.
- **Verificación:** las tablas existen en la base.
- **Commit:** `feat(db): entidades, DbContext y migracion inicial`

### Fase 3 — Seed
- Cargar el seed de la sección 5 al iniciar la aplicación.
- **Verificación:** la base tiene eventos, asientos y los dos usuarios.
- **Commit:** `feat(db): seed de eventos y usuarios de prueba`

### Fase 4 — Registro y login
- Endpoints de registro y login con hash BCrypt y generación de JWT.
- **Verificación:** en Swagger, registro correcto, login con token, 409 con correo duplicado y 401 con clave mala.
- **Commit:** `feat(auth): registro y login con JWT`

### Fase 5 — Roles y protección de rutas
- Configurar autenticación JWT y las políticas `SoloAdmin` y `Autenticado`. El JWT incluye el rol y la lista de permisos del usuario. Agregar `GET /api/auth/me` y `GET /api/usuarios`. (Los endpoints de gestión de empleados, roles y permisos quedan fuera de esta entrega; las tablas y el seed ya existen.)
- **Verificación:** con el token de un cliente, `/api/usuarios` devuelve 403; con el del administrador, funciona.
- **Commit:** `feat(auth): roles y autorizacion por politica`

### Fase 6 — Eventos
- CRUD de eventos, catálogo público con filtros y disponibilidad, y generación de asientos al crear un evento.
- **Verificación:** el administrador crea, edita, cambia el estado y borra; el público ve solo los eventos publicados y con filtros.
- **Commit:** `feat(eventos): CRUD y catalogo con filtros`

### Fase 7 — Strategy de precios (opcional, solo si la persona lo pide)
- Interfaz `IEstrategiaPrecios` con `PrecioGeneralStrategy` y `PrecioVIPStrategy`, usando el recargo VIP que define `precios.js`. Exponer el precio calculado por asiento en la respuesta de eventos.
- **Commit:** `feat(precios): patron Strategy`

### Fase 8 — Cierre y documentación
- `backend/README.md` con requisitos, configuración, cómo correr (el backend desde `backend/` y el frontend desde la raíz) y credenciales de prueba. Si se quiere dejar una nota en el `README.md` de la raíz explicando que es un monorepo, pedir autorización antes de editarlo.
- Tabla de endpoints y diagrama ER en Mermaid.
- **Verificación:** otra persona levanta el backend solo con el README.
- **Commit:** `docs(backend): README, endpoints y modelo ER`

## 7. Formato de cierre de cada fase

    Hecho: ...
    Archivos: ...
    Cómo probar: ...
    Commit sugerido: tipo(alcance): mensaje
    Escribe "continuar" para la siguiente fase.