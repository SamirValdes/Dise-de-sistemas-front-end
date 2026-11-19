namespace TeatroLuminaria.Api.Modelos;

public class Pago
{
    public int Id { get; set; }

    public int CompraId { get; set; }
    public Compra Compra { get; set; } = null!;

    public string Pasarela { get; set; } = string.Empty;
    public string? ReferenciaExterna { get; set; }
    public decimal Monto { get; set; }
    public EstadoPago Estado { get; set; } = EstadoPago.Pendiente;
    public string? MotivoRechazo { get; set; }
    public DateTime Fecha { get; set; }
}
