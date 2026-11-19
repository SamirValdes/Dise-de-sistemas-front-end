using TeatroLuminaria.Api.Modelos;

namespace TeatroLuminaria.Api.Servicios;

/// <summary>
/// Genera los asientos de un evento a partir de sus propias filas/columnas VIP y generales
/// (ver MapaAsientos.jsx: las filas VIP van primero y pueden tener menos columnas que las
/// generales, así que no es una grilla rectangular uniforme).
/// </summary>
public static class GeneradorAsientos
{
    public static List<Asiento> Generar(Evento evento)
    {
        var asientos = new List<Asiento>();
        var fila = 'A';

        for (var i = 0; i < evento.FilasVip; i++, fila++)
        {
            for (var numero = 1; numero <= evento.ColumnasVip; numero++)
            {
                asientos.Add(new Asiento
                {
                    Fila = fila.ToString(),
                    Numero = numero,
                    Zona = ZonaAsiento.VIP,
                    Estado = EstadoAsiento.Disponible,
                });
            }
        }

        for (var i = 0; i < evento.FilasGenerales; i++, fila++)
        {
            for (var numero = 1; numero <= evento.ColumnasGenerales; numero++)
            {
                asientos.Add(new Asiento
                {
                    Fila = fila.ToString(),
                    Numero = numero,
                    Zona = ZonaAsiento.General,
                    Estado = EstadoAsiento.Disponible,
                });
            }
        }

        return asientos;
    }
}
