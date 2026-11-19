using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeatroLuminaria.Api.Datos;
using TeatroLuminaria.Api.Dtos;
using TeatroLuminaria.Api.Modelos;
using TeatroLuminaria.Api.Servicios;

namespace TeatroLuminaria.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AppDbContext contexto, ServicioJwt servicioJwt) : ControllerBase
{
    [HttpPost("registro")]
    public async Task<IActionResult> Registro(RegistroRequest solicitud)
    {
        var correo = solicitud.Correo.Trim().ToLowerInvariant();

        if (await contexto.Usuarios.AnyAsync(u => u.Correo == correo))
        {
            return Conflict(new { mensaje = "Este correo electrónico ya está registrado." });
        }

        var rolCliente = await contexto.Roles.FirstAsync(r => r.Nombre == "Cliente");

        var usuario = new Usuario
        {
            Nombre = solicitud.Nombre.Trim(),
            Correo = correo,
            ContrasenaHash = BCrypt.Net.BCrypt.HashPassword(solicitud.Contrasena),
            RolId = rolCliente.Id,
            Estado = EstadoUsuario.Activo,
            FechaRegistro = DateTime.UtcNow,
        };

        contexto.Usuarios.Add(usuario);
        await contexto.SaveChangesAsync();

        return Created(string.Empty, MapearUsuario(usuario, rolCliente));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest solicitud)
    {
        var correo = solicitud.Correo.Trim().ToLowerInvariant();
        var usuario = await contexto.Usuarios
            .Include(u => u.Rol)
            .FirstOrDefaultAsync(u => u.Correo == correo);

        if (usuario is null || !BCrypt.Net.BCrypt.Verify(solicitud.Contrasena, usuario.ContrasenaHash))
        {
            return Unauthorized(new { mensaje = "Correo o contraseña incorrectos." });
        }

        if (usuario.Estado == EstadoUsuario.Inactivo)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { mensaje = "La cuenta está inactiva." });
        }

        var token = servicioJwt.GenerarToken(usuario);

        return Ok(new LoginRespuesta(token, MapearUsuario(usuario, usuario.Rol)));
    }

    private static UsuarioRespuesta MapearUsuario(Usuario usuario, Rol rol) =>
        new(usuario.Id, usuario.Nombre, usuario.Correo, rol.Nombre, usuario.FechaRegistro);
}
