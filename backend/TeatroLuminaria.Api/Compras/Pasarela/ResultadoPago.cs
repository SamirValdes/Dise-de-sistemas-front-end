namespace TeatroLuminaria.Api.Compras.Pasarela;

public record ResultadoPago(bool Aprobado, string Referencia, string? Motivo);