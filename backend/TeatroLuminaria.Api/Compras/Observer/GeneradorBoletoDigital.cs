using TeatroLuminaria.Api.Modelos;

namespace TeatroLuminaria.Api.Compras.Observer;

/// <summary>
/// Listener del Observer que genera el boleto digital (Entrada + QR) de cada asiento
/// cuando el pago se aprueba. La construcción real del boleto (con BoletoDigitalBuilder
/// y el QR) se completa en el siguiente bloque (B2); por ahora deja constancia de que la
/// notificación llegó, sin romper el flujo de compra.
/// </summary>
public class GeneradorBoletoDigital(ILogger<GeneradorBoletoDigital> logger) : IPagoListener
{
    public Task PagoAprobadoAsync(Compra compra, List<Asiento> asientos)
    {
        logger.LogInformation(
            "GeneradorBoletoDigital notificado para la compra #{CompraId}: {CantidadAsientos} boleto(s) pendientes de construir.",
            compra.Id,
            asientos.Count);

        return Task.CompletedTask;
    }
}
