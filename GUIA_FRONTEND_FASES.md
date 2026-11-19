# Guía de construcción por fases — Frontend integrado (Persona 4)

Documento de referencia. Quien construya la integración del frontend (persona o IA) debe seguir esta guía fase por fase, en orden, sin saltarse fases. Las fases 0 a 7 NO dependen de la Persona 3. En el **PUNTO DE PARADA** hay que detenerse y revisar lo que entregó la Persona 3 antes de seguir con las fases 8 a 10.

## 0. Reglas generales

1. **Sin commits.** No ejecutar `git add`, `commit`, `push`, ni crear ramas. Los commits los hace la persona responsable al terminar cada fase.
2. **Sin pruebas.** No crear archivos de test.
3. **Simple y rápido.** Usar `fetch` nativo; no instalar librerías nuevas (axios, redux, react-query...) sin autorización. Sin TypeScript. Mantener el estilo y el diseño actuales: es una integración, no un rediseño.
4. **Una fase a la vez.** Al terminar cada fase: resumir lo hecho, indicar cómo verificarla en el navegador, proponer el mensaje de commit y **detenerse** hasta que la persona escriba "continuar".
5. **Monorepo: no tocar el backend.** El frontend vive en la raíz del repositorio (`src/`, `public/`, `package.json`, `vite.config.js`...). La carpeta `backend/` es de otras personas: solo se puede LEER. Si se encuentra un error en el backend, informarlo; nunca corregirlo. No mover, renombrar ni borrar archivos o carpetas existentes sin autorización explícita.
6. **No inventar** endpoints, campos ni respuestas. El contrato real es lo que devuelve el backend (Swagger, `backend/README.md` y el código en `backend/`). Si algo no calza con esta guía, informarlo en una línea y esperar decisión.

## 1. Alcance

**Dentro:** conectar el frontend existente a la API del backend: autenticación, catálogo, detalle de evento, mapa de asientos, panel de administración de eventos y usuarios, y (tras el punto de parada) reserva de asientos, compra, historial y entradas con QR. Corregir los puntos de SOLID ya detectados. Mensajes claros para los flujos alternativos.

**Fuera de esta entrega:** favoritos, notificaciones, métricas, gestión de empleados/roles/permisos y perfil con foto. Esas pantallas se dejan como están (con sus datos locales) y no se rompen; solo informar cuáles son.

## 2. Estado actual del frontend (referencia)

React + Vite en la raíz, puerto de desarrollo 3000 (`npm run dev`). Estructura relevante (verificar nombres reales en `src/`):

- `src/datos/seed.js`: eventos, usuarios y compras quemados.
- `src/contexto/DataContext.jsx` (+ `useData.js`): estado global con persistencia en `localStorage` (clave `luminaria_datos_v1`). Concentra 6 responsabilidades: persistencia, usuarios, eventos, favoritos, selección de asientos y compras.
- `src/contexto/AuthContext.jsx` (+ `useAuth.js`): login y registro locales, con contraseña en claro.
- `src/utilidades/precios.js`: `FILAS_VIP`, `RECARGO_VIP` (1.5), `CARGO_SERVICIO` (0.05), `esAsientoVip`, `calcularTotales`, `formatearPrecio`, `generarCodigoEntrada`.
- `src/componentes/`: `MapaAsientos.jsx` (VIP filas A–C de 8 asientos; generales D–J de 12), `RutaProtegida.jsx`, `Navbar.jsx`.
- `src/paginas/`: inicio, login/registro, dashboard admin, detalle de evento, checkout (`checkout/checkout.jsx`, en minúscula), confirmación y panel de usuario.

## 3. El backend (ya construido por la Persona 2)

Leer `backend/README.md` y la configuración del backend para obtener la URL y el puerto reales de la API (por ejemplo en `backend/Properties/launchSettings.json`). Endpoints disponibles:

| Método | Ruta | Acceso | Notas |
|---|---|---|---|
| GET | /api/salud | Público | Comprobación |
| POST | /api/auth/registro | Público | 409 si el correo existe, 400 si faltan datos |
| POST | /api/auth/login | Público | Devuelve token JWT y datos del usuario (id, nombre, correo, rol). 401 credenciales inválidas, 403 cuenta inactiva |
| GET | /api/auth/me | Autenticado | Datos del usuario del token |
| GET | /api/usuarios | Administrador | Nombre, correo, fecha de registro, estado |
| GET | /api/eventos | Público | Solo Publicados. Filtros `categoria`, `texto`, `desde`, `hasta`. Incluye disponibilidad y `estadoVenta` (EnVenta / Proximamente / Cerrada) |
| GET | /api/eventos/{id} | Público | Detalle |
| GET | /api/eventos/{id}/asientos | Público | Asientos con fila, número, zona y estado. **Si no existe todavía, detenerse y avisar** (lo agrega la Persona 2) |
| POST / PUT | /api/eventos, /api/eventos/{id} | Administrador | Crear y editar |
| PATCH | /api/eventos/{id}/estado | Administrador | Cambiar estado |
| DELETE | /api/eventos/{id} | Administrador | 409 si el evento tiene compras |

Convenciones del backend: errores en JSON `{"mensaje": "..."}`; el token se envía en el encabezado `Authorization: Bearer <token>`; el token expira en 2 horas. Roles: solo Cliente y Administrador. Credenciales de prueba: `admin@luminaria.com` / `Admin123!` y `cliente@luminaria.com` / `Cliente123!`.

## 4. Contrato esperado con la Persona 3 (compra)

Propuesta acordada con la Persona 3. **No es definitivo hasta revisar lo que ella entregue** (fase 8).

| Método | Ruta | Qué hace |
|---|---|---|
| POST | /api/compras/reservar | `{eventoId, asientoIds[]}` bloquea los asientos 5 minutos. 409 si alguno está ocupado o bloqueado |
| POST | /api/compras | `{eventoId, asientoIds[]}` cobra y emite las entradas. Si el pago se rechaza, libera los asientos y devuelve error con el motivo |
| GET | /api/compras/mias | Historial de compras del usuario |
| GET | /api/entradas/mias | Entradas con QR, próximas y pasadas |

## 5. Flujos alternativos con mensaje claro en pantalla

1. Login con credenciales inválidas (401) y cuenta inactiva (403).
2. Registro con correo duplicado (409) y datos inválidos (400).
3. Acceso a una ruta de administrador sin el rol (403 o redirección con aviso).
4. Sesión vencida (401 con token): cerrar sesión, avisar y llevar al login.
5. Evento no disponible o fuera de venta (`estadoVenta`).
6. Asiento ya ocupado o bloqueado por otra persona (409): refrescar el mapa y avisar.
7. Bloqueo de 5 minutos vencido: avisar y liberar la selección.
8. Pago rechazado: mostrar el motivo y permitir reintentar.
9. Error de red o API caída: mensaje claro, sin pantalla en blanco.

## 6. Fases

Cada fase termina con un commit hecho por la persona. Las fases 1 a 6 y 8 a 10 dan los commits mínimos que exige el entregable.

### Fase 0 — Preparación y mapa de integración (solo lectura)
- Revisar `git status` y la rama actual. No cambiar nada.
- Leer los archivos de la sección 2 y el backend (sección 3). Verificar que el backend responda en su URL.
- Entregar un informe corto con tres cosas: (a) tabla "pantalla → qué datos usa hoy → endpoint que lo reemplaza", (b) pantallas que quedan fuera de alcance (favoritos, notificaciones, métricas, empleados/roles, foto de perfil), (c) cualquier diferencia entre el backend real y la sección 3 (por ejemplo, si falta `/api/eventos/{id}/asientos`).
- **Cambio de código:** crear `.env.example` con `VITE_API_URL=<url del backend>` y asegurar que `.env` está en el `.gitignore`.
- **Commit:** `chore(frontend): variable de entorno para la URL de la API`

### Fase 1 — Capa de servicios
- Crear `src/servicios/api.js`: función base sobre `fetch` que usa `VITE_API_URL`, agrega el encabezado `Authorization` con el token, convierte las respuestas de error `{"mensaje"}` en un error con el mensaje y código HTTP, y ante un 401 con token cierra la sesión y redirige al login.
- Crear servicios finos: `src/servicios/auth.js`, `eventos.js` y `usuarios.js`, que solo llaman a la API y devuelven los datos.
- **Verificación:** desde la consola del navegador o una página temporal, `eventos.listar()` devuelve los eventos de la API. No dejar páginas temporales en el código final.
- **Commit:** `feat(frontend): capa de servicios para consumir la API`

### Fase 2 — Autenticación real y paneles
- Reescribir `AuthContext` para usar el servicio de auth: login y registro contra la API, token y usuario guardados en `localStorage` (con try/catch), recuperación de sesión al cargar con `GET /api/auth/me`, cierre de sesión.
- Actualizar `RutaProtegida` para decidir por el rol que devuelve la API (Cliente / Administrador) y por la sesión.
- Mostrar los mensajes de los flujos 1, 2, 3 y 4 de la sección 5.
- Quitar del código la contraseña en claro y el uso de `usuariosSeed` para autenticar.
- **Verificación:** entrar con el administrador y con el cliente; el administrador accede al panel admin y el cliente no; un correo duplicado muestra el aviso; una contraseña mala muestra el error.
- **Commit:** `feat(frontend): login y registro reales con JWT y rutas por rol`

### Fase 3 — Catálogo y detalle de evento
- Inicio/cartelera y detalle de evento obtienen los datos de `GET /api/eventos` y `GET /api/eventos/{id}`; los filtros existentes usan los parámetros de la API cuando existen.
- Mostrar `estadoVenta` (en venta / próximamente / cerrada) y la disponibilidad; deshabilitar la compra si no está en venta.
- Estados de carga y de error en las pantallas (flujo 9).
- Los eventos ya no salen de `seed.js` ni de `localStorage`.
- **Verificación:** la cartelera muestra los eventos de la base de datos; un evento nuevo creado desde Swagger aparece.
- **Commit:** `feat(frontend): catalogo y detalle de evento desde la API`

### Fase 4 — Mapa de asientos con datos reales
- `MapaAsientos` obtiene los asientos de `GET /api/eventos/{id}/asientos` y pinta según el estado (Disponible, BloqueadoTemporal, Vendido). Mantener la selección máxima por compra (`MAX_ASIENTOS` de `precios.js`).
- Corrección de SOLID: el componente debe recibir solo las props que usa (la lista de asientos y los callbacks), no el objeto completo del evento.
- **Verificación:** los asientos vendidos del seed aparecen ocupados; los VIP y los generales se ven en sus zonas.
- **Commit:** `feat(frontend): mapa de asientos con datos reales y props minimas`

### Fase 5 — Panel de administración: eventos y usuarios
- Panel de eventos conectado a la API: listar (incluye Borrador), crear, editar, cambiar estado y borrar. Mostrar el aviso cuando el borrado devuelve 409.
- Panel de usuarios: listar con `GET /api/usuarios`.
- Los demás paneles de administración (empleados, roles, métricas) se dejan como están.
- **Verificación:** crear, editar y cambiar el estado de un evento desde el panel y verlo reflejado en la cartelera pública.
- **Commit:** `feat(frontend): panel admin de eventos y usuarios conectado a la API`

### Fase 6 — Correcciones de SOLID
- Dividir `DataContext`: separar eventos (ya viene de la API), selección de asientos y lo que queda local (favoritos) en contextos o hooks distintos, cada uno con una sola responsabilidad. Dejar `localStorage` solo donde todavía se necesite (favoritos y, hasta la fase 8, las compras simuladas).
- Reemplazar el multiplicador literal `1.5` de `checkout.jsx` por `RECARGO_VIP` de `precios.js`.
- Mantener en `precios.js` las constantes y funciones de tarifación en un solo lugar.
- Los componentes y páginas deben seguir dependiendo de los hooks (`useAuth`, `useData` y los nuevos), nunca de `seed.js` ni de `localStorage` directamente.
- **Verificación:** todo lo anterior sigue funcionando; `npm run lint` pasa sin errores nuevos.
- **Commit:** `refactor(frontend): dividir DataContext y centralizar el recargo VIP`

### Fase 7 — Servicio de compras con implementación simulada
- Crear `src/servicios/compras.js` con una interfaz clara: `reservarAsientos(eventoId, asientoIds)`, `comprar(eventoId, asientoIds)`, `misCompras()` y `misEntradas()`, con las respuestas y errores descritos en la sección 4.
- Crear una implementación simulada en `src/servicios/compras.simulado.js` (datos locales, con un bloqueo de 5 minutos simulado y la opción de simular un pago rechazado) y la real en `compras.api.js`, vacía o con los métodos pendientes. Un solo punto elige cuál usar (variable `VITE_COMPRAS_SIMULADAS=true`).
- Conectar checkout, confirmación, mis compras y mis entradas a ese servicio, con los mensajes de los flujos 6, 7 y 8 de la sección 5 y un temporizador visible del bloqueo de 5 minutos.
- **Verificación:** con `VITE_COMPRAS_SIMULADAS=true`, se completa una compra de punta a punta y se ven las entradas; se puede simular un pago rechazado.
- **Commit:** `feat(frontend): servicio de compras con implementacion simulada`

---

## ⛔ PUNTO DE PARADA — esperar a la Persona 3

**Aquí se detiene todo el trabajo.** Las fases 8, 9 y 10 requieren que la Persona 3 haya entregado y que su rama esté integrada en el repositorio. Al terminar la fase 7, informar:

> "Fase 7 lista. PUNTO DE PARADA: necesito que la Persona 3 entregue su parte. Avísame cuando su rama esté integrada y dime en qué rama estás."

No avanzar a la fase 8 hasta que la persona responda que la Persona 3 entregó. No intentar adivinar ni escribir el backend de compra.

### Fase 8 — Revisión de lo entregado por la Persona 3 (solo lectura)
Antes de escribir código, revisar qué construyó realmente la Persona 3. No modificar el backend.
- Pedir a la persona que confirme que ya hizo `git pull` (o merge) y el nombre de la rama. No ejecutar comandos git que cambien el repositorio.
- Leer en `backend/` los controladores, DTOs y servicios de compras y entradas, las migraciones nuevas (si las hay) y el `README`.
- Si el backend corre, comprobar los endpoints con `curl` o Swagger (solo lectura, o con las credenciales de prueba).
- Entregar un informe con: (a) tabla "contrato esperado (sección 4) vs. lo que realmente existe" con ruta, método, cuerpo de la petición, forma de la respuesta y códigos de error; (b) diferencias y cosas que faltan o no funcionan; (c) cómo se representan el bloqueo de 5 minutos, el rechazo de pago y el QR; (d) cambios en el modelo de datos o en la autenticación.
- Detenerse y esperar la decisión de la persona sobre cualquier diferencia antes de continuar. Si hay errores del backend, se informan a la Persona 3; no se corrigen aquí.
- **Cambio de código:** ninguno.

### Fase 9 — Integración real de la compra
- Implementar `compras.api.js` con los endpoints reales confirmados en la fase 8 y cambiar la configuración a `VITE_COMPRAS_SIMULADAS=false`.
- Flujo completo: reservar asientos → temporizador de 5 minutos → pago → confirmación. Manejar los flujos 6, 7 y 8 con los códigos y mensajes reales (409 al ocupado, bloqueo vencido, pago rechazado con su motivo, y 401 sin sesión).
- Mantener la implementación simulada como respaldo para la demostración.
- **Verificación:** compra real con el cliente de prueba; los asientos pasan a Vendido en el mapa; compra con un asiento ocupado desde otra sesión devuelve el aviso; pago rechazado libera los asientos.
- **Commit:** `feat(frontend): integracion real de reserva y compra`

### Fase 10 — Mis compras, entradas con QR y cierre
- Mis compras y mis entradas con `GET /api/compras/mias` y `GET /api/entradas/mias` (o las rutas reales de la fase 8): separar próximas y pasadas, mostrar el código QR de las entradas próximas.
- Revisar que todos los flujos alternativos de la sección 5 muestran su mensaje y que no quedan pantallas en blanco ni datos quemados en lo que se integró.
- Entregar la **lista de capturas** para el documento, indicando para cada una qué pantalla abrir y con qué usuario: cartelera, detalle, login, error de login, registro, error de correo duplicado, mapa de asientos, asiento ocupado, temporizador, pago rechazado, confirmación, mis entradas con QR, panel admin de eventos, panel admin de usuarios y acceso denegado (cliente en ruta admin).
- Proponer una nota para el `README.md` de la raíz sobre cómo correr el frontend y el backend juntos, pero **pedir autorización antes de editarlo**.
- **Verificación:** recorrido completo con el cliente y con el administrador; `npm run lint` sin errores nuevos.
- **Commit:** `feat(frontend): mis compras y entradas con QR, flujos alternativos revisados`

## 7. Formato de cierre de cada fase

    Hecho: ...
    Archivos: ...
    Cómo probar: ...
    Commit sugerido: tipo(alcance): mensaje
    Escribe "continuar" para la siguiente fase.
