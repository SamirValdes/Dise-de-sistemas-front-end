namespace TeatroLuminaria.Api.Compras.Pasarela;

// Adapter adapta una pasarela externa a nuestra interfaz IPasarelaPago.
// Para usar otra pasarela real, se crea otra clase adaptadora y se cambia el registro en "Program.cs"
public class AdaptadorPasarelaSimulada : IPasarelaPago
{
    public string Nombre => "PasarelaSimulada";

    public Task<ResultadoPago> CobrarAsync(SolicitudPago solicitud)
    {
        var referencia = $"SIM-{Guid.NewGuid().ToString("N")[..10].ToUpper()}";

        var resultado = solicitud.SimularRechazo
            ? new ResultadoPago(false, referencia, "Tarjeta rechazada por la pasarela simulada.")
            : new ResultadoPago(true, referencia, null);

        return Task.FromResult(resultado);
    }
}