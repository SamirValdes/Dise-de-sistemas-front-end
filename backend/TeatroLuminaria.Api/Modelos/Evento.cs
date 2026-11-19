namespace TeatroLuminaria.Api.Modelos;

public class Evento
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public DateOnly Fecha { get; set; }
    public TimeOnly Hora { get; set; }
    public string? ImagenUrl { get; set; }
    public string Categoria { get; set; } = string.Empty;
    public string? InformacionAdicional { get; set; }
    public decimal PrecioBase { get; set; }
    public DateOnly FechaInicioVenta { get; set; }
    public DateOnly FechaFinVenta { get; set; }
    public EstadoEvento Estado { get; set; } = EstadoEvento.Borrador;

    /// <summary>Generación de asientos: ver MapaAsientos.jsx. Filas A-C son VIP, D-J generales.</summary>
    public int FilasVip { get; set; }
    public int ColumnasVip { get; set; }
    public int FilasGenerales { get; set; }
    public int ColumnasGenerales { get; set; }

    public string? Duracion { get; set; }
    public string? Sala { get; set; }

    public DateTime FechaCreacion { get; set; }
    public DateTime FechaActualizacion { get; set; }

    public ICollection<Asiento> Asientos { get; set; } = new List<Asiento>();
    public ICollection<Compra> Compras { get; set; } = new List<Compra>();
    public ICollection<Favorito> Favoritos { get; set; } = new List<Favorito>();
    public ICollection<Notificacion> Notificaciones { get; set; } = new List<Notificacion>();
}
