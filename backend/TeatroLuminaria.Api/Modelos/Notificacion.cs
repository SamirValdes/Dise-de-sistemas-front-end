namespace TeatroLuminaria.Api.Modelos;

public class Notificacion
{
    public int Id { get; set; }

    public int UsuarioId { get; set; }
    public Usuario Usuario { get; set; } = null!;

    public int? EventoId { get; set; }
    public Evento? Evento { get; set; }

    public TipoNotificacion Tipo { get; set; }
    public string Mensaje { get; set; } = string.Empty;
    public bool Leida { get; set; }
    public DateTime Fecha { get; set; }
}
