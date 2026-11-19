namespace TeatroLuminaria.Api.Compras;

public class ReglaNegocioException(string mensaje, int codigoHttp) : Exception(mensaje)
{
    public int CodigoHttp { get; } = codigoHttp;

    public static ReglaNegocioException Invalida(string mensaje) => new(mensaje, 400);
    public static ReglaNegocioException NoAutorizado(string mensaje) => new(mensaje, 401);
    public static ReglaNegocioException NoEncontrada(string mensaje) => new(mensaje, 404);
    public static ReglaNegocioException Conflicto(string mensaje) => new(mensaje, 409);
}