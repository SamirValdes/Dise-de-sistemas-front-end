namespace TeatroLuminaria.Api.Modelos;

public class Entrada
{
    public int Id { get; set; }

    public int CompraId { get; set; }
    public Compra Compra { get; set; } = null!;

    public int AsientoId { get; set; }
    public Asiento Asiento { get; set; } = null!;

    public string CodigoUnico { get; set; } = string.Empty;
    public string? CodigoQr { get; set; }
    public EstadoEntrada Estado { get; set; } = EstadoEntrada.Valida;
    public DateTime FechaEmision { get; set; }
}
