using TeatroLuminaria.Api.Modelos;

namespace TeatroLuminaria.Api.Compras.Estados;

public class AsientoVendido : IEstadoAsiento
{
    public void Seleccionar(Asiento asiento, int usuarioId) =>
        throw ReglaNegocioException.Conflicto($"El asiento {asiento.Fila}{asiento.Numero} ya fue vendido.");

    public void Pagar(Asiento asiento) =>
        throw ReglaNegocioException.Conflicto($"El asiento {asiento.Fila}{asiento.Numero} ya fue vendido.");

    public void Liberar(Asiento asiento) =>
        throw ReglaNegocioException.Conflicto($"El asiento {asiento.Fila}{asiento.Numero} ya fue vendido.");
}