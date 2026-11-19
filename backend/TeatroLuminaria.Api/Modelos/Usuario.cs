namespace TeatroLuminaria.Api.Modelos;

public class Usuario
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public string ContrasenaHash { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public string? FotoUrl { get; set; }

    public int RolId { get; set; }
    public Rol Rol { get; set; } = null!;

    public EstadoUsuario Estado { get; set; } = EstadoUsuario.Activo;
    public DateTime FechaRegistro { get; set; }

    public ICollection<Compra> Compras { get; set; } = new List<Compra>();
    public ICollection<Favorito> Favoritos { get; set; } = new List<Favorito>();
    public ICollection<Notificacion> Notificaciones { get; set; } = new List<Notificacion>();
}
