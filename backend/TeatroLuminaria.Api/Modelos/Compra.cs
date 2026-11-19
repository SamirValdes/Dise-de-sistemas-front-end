namespace TeatroLuminaria.Api.Modelos;

public class Compra
{
    public int Id { get; set; }

    public int UsuarioId { get; set; }
    public Usuario Usuario { get; set; } = null!;

    public int EventoId { get; set; }
    public Evento Evento { get; set; } = null!;

    public decimal Subtotal { get; set; }
    public decimal CargoServicio { get; set; }
    public decimal Total { get; set; }
    public EstadoCompra Estado { get; set; } = EstadoCompra.Pendiente;
    public DateTime Fecha { get; set; }

    public ICollection<Pago> Pagos { get; set; } = new List<Pago>();
    public ICollection<Entrada> Entradas { get; set; } = new List<Entrada>();
}
