namespace TeatroLuminaria.Api.Servicios;

public class PrecioVIPStrategy : IEstrategiaPrecios
{
    /// <summary>RECARGO_VIP de precios.js: la zona VIP cuesta un 50% más.</summary>
    private const decimal RecargoVip = 1.5m;

    public decimal CalcularPrecio(decimal precioBase) => precioBase * RecargoVip;
}
