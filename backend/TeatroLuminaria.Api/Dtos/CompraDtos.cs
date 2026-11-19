namespace TeatroLuminaria.Api.Dtos;

public record ReservarRequest(int EventoId, List<int> AsientoIds);

public record ReservaRespuesta(int EventoId, List<int> AsientoIds, DateTime BloqueadoHasta);