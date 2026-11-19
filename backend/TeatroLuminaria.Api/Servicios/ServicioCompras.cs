using Microsoft.EntityFrameworkCore;
using TeatroLuminaria.Api.Compras.Estados;
using TeatroLuminaria.Api.Datos;
using TeatroLuminaria.Api.Dtos;
using TeatroLuminaria.Api.Modelos;
using TeatroLuminaria.Api.Servicios;

namespace TeatroLuminaria.Api.Compras;

public class ServicioCompras(AppDbContext contexto)
{
    public const int MaxAsientos = 8;

    public async Task<ReservaRespuesta> ReservarAsync(int usuarioId, int eventoId, List<int>? asientoIds)
    {
        var ids = asientoIds?.Distinct().ToList() ?? [];

        if (ids.Count == 0)
        {
            throw ReglaNegocioException.Invalida("Debes seleccionar al menos un asiento.");
        }

        if (ids.Count > MaxAsientos)
        {
            throw ReglaNegocioException.Invalida($"Máximo {MaxAsientos} asientos por compra.");
        }

        var evento = await contexto.Eventos.FirstOrDefaultAsync(e => e.Id == eventoId)
                     ?? throw ReglaNegocioException.NoEncontrada("Evento no encontrado.");

        ValidarEventoEnVenta(evento);

        var asientos = await contexto.Asientos
            .Where(a => a.EventoId == eventoId && ids.Contains(a.Id))
            .ToListAsync();

        if (asientos.Count != ids.Count)
        {
            throw ReglaNegocioException.Invalida("Algún asiento no existe o no pertenece al evento.");
        }

        // Si cualquier asiento falla, se lanza la excepción y no se guarda nada (todo o nada).
        foreach (var asiento in asientos)
        {
            EstadoAsientoFactory.Obtener(asiento).Seleccionar(asiento, usuarioId);
        }

        try
        {
            await contexto.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            throw ReglaNegocioException.Conflicto("Alguno de los asientos acaba de ser reservado por otra persona.");
        }

        return new ReservaRespuesta(eventoId, ids, asientos.Min(a => a.BloqueadoHasta!.Value));
    }

    private static void ValidarEventoEnVenta(Evento evento)
    {
        if (evento.Estado != EstadoEvento.Publicado)
        {
            throw ReglaNegocioException.Invalida("El evento no está publicado.");
        }

        var estadoVenta = CalculadoraEstadoVenta.Calcular(evento.FechaInicioVenta, evento.FechaFinVenta);
        if (estadoVenta != "EnVenta")
        {
            throw ReglaNegocioException.Invalida("El evento está fuera del período de venta.");
        }
    }
}