using TeatroLuminaria.Api.Modelos;

namespace TeatroLuminaria.Api.Compras.Observer;

/// <summary>Patrón Observer: algo que reacciona cuando un pago se aprueba.</summary>
public interface IPagoListener
{
    Task PagoAprobadoAsync(Compra compra, List<Asiento> asientos);
}
