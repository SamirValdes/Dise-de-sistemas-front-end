namespace TeatroLuminaria.Api.Compras.Pasarela;

public record SolicitudPago(int CompraId, decimal Monto, bool SimularRechazo);