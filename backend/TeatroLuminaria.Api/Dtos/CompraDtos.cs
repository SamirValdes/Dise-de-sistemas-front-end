namespace TeatroLuminaria.Api.Dtos;

public record ReservarRequest(int EventoId, List<int> AsientoIds);

public record ReservaRespuesta(int EventoId, List<int> AsientoIds, DateTime BloqueadoHasta);

public record ComprarRequest(int EventoId, List<int> AsientoIds, bool SimularRechazo = false);

public record CompraRespuesta(
    int Id,
    int EventoId,
    decimal Subtotal,
    decimal CargoServicio,
    decimal Total,
    string Estado,
    List<int> AsientoIds);

public record CompraHistorialRespuesta(
    int Id,
    int EventoId,
    string EventoNombre,
    DateTime Fecha,
    decimal Subtotal,
    decimal CargoServicio,
    decimal Total,
    string Estado,
    int CantidadAsientos);