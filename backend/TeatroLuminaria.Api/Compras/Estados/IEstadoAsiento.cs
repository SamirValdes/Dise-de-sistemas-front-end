using TeatroLuminaria.Api.Modelos;

namespace TeatroLuminaria.Api.Compras.Estados;

public interface IEstadoAsiento
{
    void Seleccionar(Asiento asiento, int usuarioId);
    void Pagar(Asiento asiento);
    void Liberar(Asiento asiento);
}