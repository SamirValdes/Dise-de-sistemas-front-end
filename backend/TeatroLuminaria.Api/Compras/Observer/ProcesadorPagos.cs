using TeatroLuminaria.Api.Modelos;

namespace TeatroLuminaria.Api.Compras.Observer;

/// <summary>
/// Sujeto del patrón Observer: cuando ServicioCompras aprueba un pago, avisa a todos los
/// IPagoListener registrados (hoy: notificación simulada por correo y generación del
/// boleto digital), sin que ServicioCompras tenga que conocerlos uno por uno.
/// </summary>
public class ProcesadorPagos(IEnumerable<IPagoListener> listeners)
{
    public async Task NotificarPagoAprobadoAsync(Compra compra, List<Asiento> asientos)
    {
        foreach (var listener in listeners)
        {
            await listener.PagoAprobadoAsync(compra, asientos);
        }
    }
}
