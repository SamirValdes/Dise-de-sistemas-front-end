namespace TeatroLuminaria.Api.Servicios;

/// <summary>
/// 'activo'/'proximo' del seed del front se guardan como Publicado; esta distinción visible
/// se calcula aquí a partir de las fechas de venta, sin agregar estados a la tabla Evento.
/// </summary>
public static class CalculadoraEstadoVenta
{
    public static string Calcular(DateOnly fechaInicioVenta, DateOnly fechaFinVenta)
    {
        var hoy = DateOnly.FromDateTime(DateTime.UtcNow);

        if (hoy < fechaInicioVenta) return "Proximamente";
        if (hoy > fechaFinVenta) return "Cerrada";
        return "EnVenta";
    }
}
