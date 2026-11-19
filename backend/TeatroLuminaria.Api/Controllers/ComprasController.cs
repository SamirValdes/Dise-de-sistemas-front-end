using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeatroLuminaria.Api.Compras;
using TeatroLuminaria.Api.Dtos;

namespace TeatroLuminaria.Api.Controllers;

[ApiController]
[Route("api/compras")]
[Authorize(Policy = "Autenticado")]
[ManejadorReglasNegocio]
public class ComprasController(ServicioCompras servicio) : ControllerBase
{
    [HttpPost("reservar")]
    public async Task<IActionResult> Reservar(ReservarRequest solicitud)
    {
        var respuesta = await servicio.ReservarAsync(ObtenerUsuarioId(), solicitud.EventoId, solicitud.AsientoIds);
        return Ok(respuesta);
    }

    private int ObtenerUsuarioId()
    {
        var valor = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");

        return int.TryParse(valor, out var id)
            ? id
            : throw ReglaNegocioException.NoAutorizado("Sesión inválida.");
    }
}