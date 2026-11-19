using QRCoder;
using TeatroLuminaria.Api.Modelos;

namespace TeatroLuminaria.Api.Compras.Builder;

/// <summary>
/// Patrón Builder: arma una Entrada paso a paso (compra, asiento, código único) en vez de
/// un constructor con muchos parámetros, y resuelve por su cuenta la parte que requiere
/// más trabajo — generar el QR — al construir. Un builder nuevo por entrada.
/// </summary>
public class BoletoDigitalBuilder
{
    private const string AlfabetoCodigo = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    private Compra? _compra;
    private Asiento? _asiento;

    public BoletoDigitalBuilder ParaCompra(Compra compra)
    {
        _compra = compra;
        return this;
    }

    public BoletoDigitalBuilder ParaAsiento(Asiento asiento)
    {
        _asiento = asiento;
        return this;
    }

    public Entrada Construir()
    {
        if (_compra is null || _asiento is null)
        {
            throw new InvalidOperationException(
                "BoletoDigitalBuilder necesita ParaCompra() y ParaAsiento() antes de Construir().");
        }

        var codigoUnico = GenerarCodigoUnico();

        return new Entrada
        {
            CompraId = _compra.Id,
            AsientoId = _asiento.Id,
            CodigoUnico = codigoUnico,
            CodigoQr = GenerarQrBase64(codigoUnico),
            Estado = EstadoEntrada.Valida,
            FechaEmision = DateTime.UtcNow,
        };
    }

    /// <summary>Código con la forma TL-XXXXXXXX, igual al que ya genera el frontend.</summary>
    private static string GenerarCodigoUnico()
    {
        Span<char> sufijo = stackalloc char[8];
        for (var i = 0; i < sufijo.Length; i++)
        {
            sufijo[i] = AlfabetoCodigo[Random.Shared.Next(AlfabetoCodigo.Length)];
        }

        return $"TL-{new string(sufijo)}";
    }

    /// <summary>PNG en base64 del código, listo para pegar en un &lt;img src="data:image/png;base64,...">.</summary>
    private static string GenerarQrBase64(string contenido)
    {
        using var generador = new QRCodeGenerator();
        var datosQr = generador.CreateQrCode(contenido, QRCodeGenerator.ECCLevel.Q);
        using var qrPng = new PngByteQRCode(datosQr);
        var bytes = qrPng.GetGraphic(10);

        return Convert.ToBase64String(bytes);
    }
}
