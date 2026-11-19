namespace TeatroLuminaria.Api.Dtos;

public record EntradaRespuesta(
    int Id,
    string EventoNombre,
    DateOnly EventoFecha,
    TimeOnly EventoHora,
    string Fila,
    int Numero,
    string Zona,
    string CodigoUnico,
    string? CodigoQr);

public record MisEntradasRespuesta(List<EntradaRespuesta> Proximas, List<EntradaRespuesta> Pasadas);
