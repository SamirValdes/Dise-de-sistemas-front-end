namespace TeatroLuminaria.Api.Modelos;

public class Favorito
{
    public int UsuarioId { get; set; }
    public Usuario Usuario { get; set; } = null!;

    public int EventoId { get; set; }
    public Evento Evento { get; set; } = null!;

    public DateTime FechaAgregado { get; set; }
}
