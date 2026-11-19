using TeatroLuminaria.Api.Modelos;

namespace TeatroLuminaria.Api.Compras.Estados;

public class AsientoDisponible : IEstadoAsiento
{
    public const int MinutosBloqueo = 5;

    public void Seleccionar(Asiento asiento, int usuarioId)
    {
        asiento.Estado = EstadoAsiento.BloqueadoTemporal;
        asiento.BloqueadoHasta = DateTime.UtcNow.AddMinutes(MinutosBloqueo);
        asiento.BloqueadoPorUsuarioId = usuarioId;
    }

    public void Pagar(Asiento asiento) =>
        throw ReglaNegocioException.Conflicto(
            $"La reserva del asiento {asiento.Fila}{asiento.Numero} no existe o ya venció. Reserva de nuevo.");

    public void Liberar(Asiento asiento)
    {
        
    }
}