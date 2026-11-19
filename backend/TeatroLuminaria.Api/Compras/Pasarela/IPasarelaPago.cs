namespace TeatroLuminaria.Api.Compras.Pasarela;

public interface IPasarelaPago
{
    string Nombre { get; }
    Task<ResultadoPago> CobrarAsync(SolicitudPago solicitud);
}