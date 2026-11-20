# Compra, pago y entradas — patrones y contrato real

## Patrones

| Patrón | Clase(s) | Archivo |
|---|---|---|
| State | `IEstadoAsiento`, `AsientoDisponible`, `AsientoBloqueado`, `AsientoVendido`, `EstadoAsientoFactory` | `Compras/Estados/` |
| Adapter | `IPasarelaPago`, `AdaptadorPasarelaSimulada` | `Compras/Pasarela/` |
| Strategy | `IEstrategiaPrecios`, `PrecioVIPStrategy`, `PrecioGeneralStrategy` | `Servicios/` |
| Observer | `IPagoListener`, `ProcesadorPagos`, `ServicioNotificacionCorreo`, `GeneradorBoletoDigital` | `Compras/Observer/` |
| Builder | `BoletoDigitalBuilder` | `Compras/Builder/` |

`ServicioCompras.ComprarAsync` orquesta todo: usa el State de cada asiento para validar y transicionar, Strategy para el precio según la zona, Adapter para cobrar, y al aprobarse el pago llama a `ProcesadorPagos` (Observer), que notifica a `ServicioNotificacionCorreo` (log simulado) y a `GeneradorBoletoDigital`, que usa `BoletoDigitalBuilder` para crear una `Entrada` (con QR real vía QRCoder) por cada asiento.

## Flujos alternativos

| Flujo | Código HTTP | Cómo se distingue |
|---|---|---|
| Asiento vendido o bloqueado por otra persona (al reservar o comprar) | 409 | Mensaje contiene "bloqueado por otra persona" |
| Reserva vencida o inexistente (al comprar) | 409 | Mensaje contiene "ya venció" |
| Pago rechazado (`simularRechazo: true`) | 402 | — |
| Más de 8 asientos, o ninguno seleccionado | 400 | — |
| Evento no publicado o fuera del período de venta | 400 | — |
| Evento no encontrado | 404 | — |
| Sin token / token vencido | 401 | — |
| Conflicto de concurrencia (otro proceso cambió el asiento entre la validación y el guardado) | 409 | Mensaje distinto: "cambió de estado durante el pago" |

## Contrato real de los endpoints

- No existe un recurso "reserva": el bloqueo vive en el propio `Asiento` (`BloqueadoPorUsuarioId` + `BloqueadoHasta`), no hay `reservaId`.
- Los asientos se identifican por su `Id` numérico (campo `id` en `AsientoRespuesta`, dentro de `GET /api/eventos/{id}`), no por su código de fila+número.
- `POST /api/compras/reservar { eventoId, asientoIds }` → `{ eventoId, asientoIds, bloqueadoHasta }`.
- `POST /api/compras { eventoId, asientoIds, simularRechazo? }` → `{ id, eventoId, subtotal, cargoServicio, total, estado, asientoIds }`.
- `GET /api/compras/mias` → lista de `{ id, eventoId, eventoNombre, fecha, subtotal, cargoServicio, total, estado, cantidadAsientos }`.
- `GET /api/entradas/mias` → `{ proximas: [...], pasadas: [...] }`, cada entrada `{ id, eventoNombre, eventoFecha, eventoHora, fila, numero, zona, codigoUnico, codigoQr }` (`codigoQr` es un PNG en base64, o `null` si no se generó).
