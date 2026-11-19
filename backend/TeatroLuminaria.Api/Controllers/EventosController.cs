using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeatroLuminaria.Api.Datos;
using TeatroLuminaria.Api.Dtos;
using TeatroLuminaria.Api.Modelos;
using TeatroLuminaria.Api.Servicios;

namespace TeatroLuminaria.Api.Controllers;

[ApiController]
[Route("api/eventos")]
public class EventosController(AppDbContext contexto) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Listar(
        [FromQuery] string? categoria,
        [FromQuery] string? texto,
        [FromQuery] DateOnly? desde,
        [FromQuery] DateOnly? hasta)
    {
        var esAdmin = User.IsInRole("Administrador");

        var consulta = contexto.Eventos.AsQueryable();

        consulta = esAdmin
            ? consulta.Where(e => e.Estado == EstadoEvento.Publicado || e.Estado == EstadoEvento.Borrador)
            : consulta.Where(e => e.Estado == EstadoEvento.Publicado);

        if (!string.IsNullOrWhiteSpace(categoria))
        {
            consulta = consulta.Where(e => e.Categoria == categoria);
        }

        if (!string.IsNullOrWhiteSpace(texto))
        {
            consulta = consulta.Where(e => e.Nombre.Contains(texto) || e.Descripcion.Contains(texto));
        }

        if (desde is not null)
        {
            consulta = consulta.Where(e => e.Fecha >= desde);
        }

        if (hasta is not null)
        {
            consulta = consulta.Where(e => e.Fecha <= hasta);
        }

        var eventos = await consulta
            .OrderBy(e => e.Fecha)
            .Select(e => new
            {
                e.Id,
                e.Nombre,
                e.Descripcion,
                e.Fecha,
                e.Hora,
                e.ImagenUrl,
                e.Categoria,
                e.PrecioBase,
                e.FechaInicioVenta,
                e.FechaFinVenta,
                e.Estado,
                e.Duracion,
                e.Sala,
                AsientosDisponibles = e.Asientos.Count(a => a.Estado == EstadoAsiento.Disponible),
                AsientosTotales = e.Asientos.Count,
            })
            .ToListAsync();

        var respuesta = eventos.Select(e => new EventoListadoRespuesta(
            e.Id,
            e.Nombre,
            e.Descripcion,
            e.Fecha,
            e.Hora,
            e.ImagenUrl,
            e.Categoria,
            e.PrecioBase,
            e.FechaInicioVenta,
            e.FechaFinVenta,
            e.Estado.ToString(),
            CalculadoraEstadoVenta.Calcular(e.FechaInicioVenta, e.FechaFinVenta),
            e.Duracion,
            e.Sala,
            e.AsientosDisponibles,
            e.AsientosTotales));

        return Ok(respuesta);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Detalle(int id)
    {
        var evento = await contexto.Eventos
            .Include(e => e.Asientos)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (evento is null)
        {
            return NotFound(new { mensaje = "Evento no encontrado." });
        }

        var esAdmin = User.IsInRole("Administrador");
        if (evento.Estado == EstadoEvento.Borrador && !esAdmin)
        {
            return NotFound(new { mensaje = "Evento no encontrado." });
        }

        return Ok(MapearDetalle(evento));
    }

    [HttpPost]
    [Authorize(Policy = "SoloAdmin")]
    public async Task<IActionResult> Crear(EventoCrearRequest solicitud)
    {
        var evento = new Evento
        {
            Nombre = solicitud.Nombre.Trim(),
            Descripcion = solicitud.Descripcion.Trim(),
            InformacionAdicional = solicitud.InformacionAdicional,
            Fecha = solicitud.Fecha,
            Hora = solicitud.Hora,
            ImagenUrl = solicitud.ImagenUrl,
            Categoria = solicitud.Categoria.Trim(),
            PrecioBase = solicitud.PrecioBase,
            FechaInicioVenta = solicitud.FechaInicioVenta,
            FechaFinVenta = solicitud.FechaFinVenta,
            Estado = EstadoEvento.Borrador,
            FilasVip = solicitud.FilasVip,
            ColumnasVip = solicitud.ColumnasVip,
            FilasGenerales = solicitud.FilasGenerales,
            ColumnasGenerales = solicitud.ColumnasGenerales,
            Duracion = solicitud.Duracion,
            Sala = solicitud.Sala,
            FechaCreacion = DateTime.UtcNow,
            FechaActualizacion = DateTime.UtcNow,
        };

        evento.Asientos = GeneradorAsientos.Generar(evento);

        contexto.Eventos.Add(evento);
        await contexto.SaveChangesAsync();

        return CreatedAtAction(nameof(Detalle), new { id = evento.Id }, MapearDetalle(evento));
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = "SoloAdmin")]
    public async Task<IActionResult> Actualizar(int id, EventoActualizarRequest solicitud)
    {
        var evento = await contexto.Eventos.Include(e => e.Asientos).FirstOrDefaultAsync(e => e.Id == id);

        if (evento is null)
        {
            return NotFound(new { mensaje = "Evento no encontrado." });
        }

        evento.Nombre = solicitud.Nombre.Trim();
        evento.Descripcion = solicitud.Descripcion.Trim();
        evento.InformacionAdicional = solicitud.InformacionAdicional;
        evento.Fecha = solicitud.Fecha;
        evento.Hora = solicitud.Hora;
        evento.ImagenUrl = solicitud.ImagenUrl;
        evento.Categoria = solicitud.Categoria.Trim();
        evento.PrecioBase = solicitud.PrecioBase;
        evento.FechaInicioVenta = solicitud.FechaInicioVenta;
        evento.FechaFinVenta = solicitud.FechaFinVenta;
        evento.Duracion = solicitud.Duracion;
        evento.Sala = solicitud.Sala;
        evento.FechaActualizacion = DateTime.UtcNow;

        await contexto.SaveChangesAsync();

        return Ok(MapearDetalle(evento));
    }

    [HttpPatch("{id:int}/estado")]
    [Authorize(Policy = "SoloAdmin")]
    public async Task<IActionResult> CambiarEstado(int id, CambiarEstadoRequest solicitud)
    {
        var evento = await contexto.Eventos.Include(e => e.Asientos).FirstOrDefaultAsync(e => e.Id == id);

        if (evento is null)
        {
            return NotFound(new { mensaje = "Evento no encontrado." });
        }

        evento.Estado = solicitud.Estado;
        evento.FechaActualizacion = DateTime.UtcNow;

        await contexto.SaveChangesAsync();

        return Ok(MapearDetalle(evento));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = "SoloAdmin")]
    public async Task<IActionResult> Eliminar(int id)
    {
        var evento = await contexto.Eventos.FirstOrDefaultAsync(e => e.Id == id);

        if (evento is null)
        {
            return NotFound(new { mensaje = "Evento no encontrado." });
        }

        var tieneCompras = await contexto.Compras.AnyAsync(c => c.EventoId == id);
        if (tieneCompras)
        {
            return Conflict(new { mensaje = "No se puede eliminar un evento que ya tiene compras." });
        }

        contexto.Eventos.Remove(evento);
        await contexto.SaveChangesAsync();

        return NoContent();
    }

    private static EventoDetalleRespuesta MapearDetalle(Evento evento) => new(
        evento.Id,
        evento.Nombre,
        evento.Descripcion,
        evento.InformacionAdicional,
        evento.Fecha,
        evento.Hora,
        evento.ImagenUrl,
        evento.Categoria,
        evento.PrecioBase,
        evento.FechaInicioVenta,
        evento.FechaFinVenta,
        evento.Estado.ToString(),
        CalculadoraEstadoVenta.Calcular(evento.FechaInicioVenta, evento.FechaFinVenta),
        evento.FilasVip,
        evento.ColumnasVip,
        evento.FilasGenerales,
        evento.ColumnasGenerales,
        evento.Duracion,
        evento.Sala,
        evento.Asientos
            .OrderBy(a => a.Fila)
            .ThenBy(a => a.Numero)
            .Select(a => new AsientoRespuesta(
                a.Fila,
                a.Numero,
                a.Zona.ToString(),
                a.Estado.ToString(),
                ObtenerEstrategia(a.Zona).CalcularPrecio(evento.PrecioBase)))
            .ToList());

    private static readonly IEstrategiaPrecios EstrategiaGeneral = new PrecioGeneralStrategy();
    private static readonly IEstrategiaPrecios EstrategiaVip = new PrecioVIPStrategy();

    private static IEstrategiaPrecios ObtenerEstrategia(ZonaAsiento zona) =>
        zona == ZonaAsiento.VIP ? EstrategiaVip : EstrategiaGeneral;
}
