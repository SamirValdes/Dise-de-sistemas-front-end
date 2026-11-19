using TeatroLuminaria.Api.Modelos;

namespace TeatroLuminaria.Api.Compras.Estados;

public class AsientoBloqueado : IEstadoAsiento
{
    public void Seleccionar(Asiento asiento, int usuarioId)
    {
        if (asiento.BloqueadoPorUsuarioId != usuarioId)
        {
            throw ReglaNegocioException.Conflicto(
                $"El asiento {asiento.Fila}{asiento.Numero} está bloqueado por otra persona.");
        }

        // Si es el mismo usuairio se renueva
        asiento.BloqueadoHasta = DateTime.UtcNow.AddMinutes(AsientoDisponible.MinutosBloqueo);
    }

    public void Pagar(Asiento asiento)
    {
        asiento.Estado = EstadoAsiento.Vendido;
        asiento.BloqueadoHasta = null;
        asiento.BloqueadoPorUsuarioId = null;
    }

    public void Liberar(Asiento asiento)
    {
        asiento.Estado = EstadoAsiento.Disponible;
        asiento.BloqueadoHasta = null;
        asiento.BloqueadoPorUsuarioId = null;
    }
}