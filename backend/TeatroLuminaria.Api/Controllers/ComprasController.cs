using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeatroLuminaria.Api.Compras;
using TeatroLuminaria.Api.Datos;
using TeatroLuminaria.Api.Dtos;

namespace TeatroLuminaria.Api.Controllers;

[ApiController]
[Route("api/compras")]
[Authorize(Policy = "Autenticado")]
[ManejadorReglasNegocio]
public class ComprasController(ServicioCompras servicio, AppDbContext contexto) : ControllerBase
{
    [HttpPost("reservar")]
    public async Task<IActionResult> Reservar(ReservarRequest solicitud)
    {
        var respuesta = await servicio.ReservarAsync(ObtenerUsuarioId(), solicitud.EventoId, solicitud.AsientoIds);
        return Ok(respuesta);
    }

    [HttpPost]
    public async Task<IActionResult> Comprar(ComprarRequest solicitud)
    {
        var respuesta = await servicio.ComprarAsync(ObtenerUsuarioId(), solicitud);
        return Ok(respuesta);
    }

    [HttpGet("mias")]
    public async Task<IActionResult> Mias()
    {
        var usuarioId = ObtenerUsuarioId();

        var historial = await contexto.Compras
            .Where(c => c.UsuarioId == usuarioId)
            .OrderByDescending(c => c.Fecha)
            .Select(c => new CompraHistorialRespuesta(
                c.Id,
                c.EventoId,
                c.Evento.Nombre,
                c.Fecha,
                c.Subtotal,
                c.CargoServicio,
                c.Total,
                c.Estado.ToString(),
                c.Entradas.Count))
            .ToListAsync();

        return Ok(historial);
    }

    private int ObtenerUsuarioId()
    {
        var valor = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");

        return int.TryParse(valor, out var id)
            ? id
            : throw ReglaNegocioException.NoAutorizado("Sesión inválida.");
    }
}