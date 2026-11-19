using TeatroLuminaria.Api.Modelos;

namespace TeatroLuminaria.Api.Compras.Estados;

public static class EstadoAsientoFactory
{
    private static readonly IEstadoAsiento Disponible = new AsientoDisponible();
    private static readonly IEstadoAsiento Bloqueado = new AsientoBloqueado();
    private static readonly IEstadoAsiento Vendido = new AsientoVendido();

    public static IEstadoAsiento Obtener(Asiento asiento)
    {
        if (asiento.Estado == EstadoAsiento.Vendido)
        {
            return Vendido;
        }

        var bloqueoVigente = asiento.Estado == EstadoAsiento.BloqueadoTemporal
                             && asiento.BloqueadoHasta > DateTime.UtcNow;

        return bloqueoVigente ? Bloqueado : Disponible;
    }
}