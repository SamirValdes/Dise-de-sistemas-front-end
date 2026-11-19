using System.ComponentModel.DataAnnotations;

namespace TeatroLuminaria.Api.Dtos;

public class RegistroRequest
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "El correo es obligatorio.")]
    [EmailAddress(ErrorMessage = "El correo no tiene un formato válido.")]
    public string Correo { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es obligatoria.")]
    [MinLength(6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres.")]
    public string Contrasena { get; set; } = string.Empty;
}

public class LoginRequest
{
    [Required(ErrorMessage = "El correo es obligatorio.")]
    public string Correo { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es obligatoria.")]
    public string Contrasena { get; set; } = string.Empty;
}

public record UsuarioRespuesta(int Id, string Nombre, string Correo, string Rol, DateTime FechaRegistro);

public record LoginRespuesta(string Token, UsuarioRespuesta Usuario);
