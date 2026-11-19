using TeatroLuminaria.Api.Modelos;

namespace TeatroLuminaria.Api.Compras.Observer;

/// <summary>
/// Listener del Observer. No hay servidor de correo real en este proyecto, así que la
/// "notificación" es simulada: queda escrita en el log de la aplicación.
/// </summary>
public class ServicioNotificacionCorreo(ILogger<ServicioNotificacionCorreo> logger) : IPagoListener
{
    public Task PagoAprobadoAsync(Compra compra, List<Asiento> asientos)
    {
        logger.LogInformation(
            "Correo simulado -> Compra #{CompraId} (usuario {UsuarioId}) confirmada: {CantidadAsientos} asiento(s), total ${Total:0.00}.",
            compra.Id,
            compra.UsuarioId,
            asientos.Count,
            compra.Total);

        return Task.CompletedTask;
    }
}
