using TeatroLuminaria.Api.Modelos;

namespace TeatroLuminaria.Api.Compras.Observer;

/// <summary>
/// Listener del Observer: cuando el pago se aprueba, construye una Entrada (con su QR) por
/// cada asiento de la compra, usando BoletoDigitalBuilder, y las guarda.
/// </summary>
public class GeneradorBoletoDigital(AppDbContext contexto) : IPagoListener
{
    public async Task PagoAprobadoAsync(Compra compra, List<Asiento> asientos)
    {
        foreach (var asiento in asientos)
        {
            var entrada = new BoletoDigitalBuilder()
                .ParaCompra(compra)
                .ParaAsiento(asiento)
                .Construir();

            contexto.Entradas.Add(entrada);
        }

        await contexto.SaveChangesAsync();
    }
}
