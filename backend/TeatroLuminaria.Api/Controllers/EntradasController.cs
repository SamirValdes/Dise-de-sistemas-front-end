using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeatroLuminaria.Api.Compras;
using TeatroLuminaria.Api.Datos;
using TeatroLuminaria.Api.Dtos;
using TeatroLuminaria.Api.Modelos;

namespace TeatroLuminaria.Api.Controllers;

[ApiController]
[Route("api/entradas")]
[Authorize(Policy = "Autenticado")]
[ManejadorReglasNegocio]
public class EntradasController(AppDbContext contexto) : ControllerBase
{
    [HttpGet("mias")]
    public async Task<IActionResult> Mias()
    {
        var usuarioId = ObtenerUsuarioId();
        var hoy = DateOnly.FromDateTime(DateTime.UtcNow);

        var entradas = await contexto.Entradas
            .Where(e => e.Compra.UsuarioId == usuarioId && e.Estado == EstadoEntrada.Valida)
            .Select(e => new EntradaRespuesta(
                e.Id,
                e.Compra.Evento.Nombre,
                e.Compra.Evento.Fecha,
                e.Compra.Evento.Hora,
                e.Asiento.Fila,
                e.Asiento.Numero,
                e.Asiento.Zona.ToString(),
                e.CodigoUnico,
                e.CodigoQr))
            .ToListAsync();

        var proximas = entradas.Where(e => e.EventoFecha >= hoy).OrderBy(e => e.EventoFecha).ToList();
        var pasadas = entradas.Where(e => e.EventoFecha < hoy).OrderByDescending(e => e.EventoFecha).ToList();

        return Ok(new MisEntradasRespuesta(proximas, pasadas));
    }

    private int ObtenerUsuarioId()
    {
        var valor = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");

        return int.TryParse(valor, out var id)
            ? id
            : throw ReglaNegocioException.NoAutorizado("Sesión inválida.");
    }
}
