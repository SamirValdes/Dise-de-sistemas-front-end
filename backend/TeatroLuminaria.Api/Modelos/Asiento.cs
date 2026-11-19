using System.ComponentModel.DataAnnotations;

namespace TeatroLuminaria.Api.Modelos;

public class Asiento
{
    public int Id { get; set; }

    public int EventoId { get; set; }
    public Evento Evento { get; set; } = null!;

    public string Fila { get; set; } = string.Empty;
    public int Numero { get; set; }
    public ZonaAsiento Zona { get; set; }
    public EstadoAsiento Estado { get; set; } = EstadoAsiento.Disponible;

    public DateTime? BloqueadoHasta { get; set; }

    public int? BloqueadoPorUsuarioId { get; set; }
    public Usuario? BloqueadoPorUsuario { get; set; }

    public Entrada? Entrada { get; set; }

    [Timestamp]
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
}
