using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeatroLuminaria.Api.Datos;
using TeatroLuminaria.Api.Dtos;

namespace TeatroLuminaria.Api.Controllers;

[ApiController]
[Route("api/usuarios")]
[Authorize(Policy = "SoloAdmin")]
public class UsuariosController(AppDbContext contexto) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var usuarios = await contexto.Usuarios
            .OrderBy(u => u.Nombre)
            .Select(u => new UsuarioListadoRespuesta(u.Nombre, u.Correo, u.FechaRegistro, u.Estado.ToString()))
            .ToListAsync();

        return Ok(usuarios);
    }
}
