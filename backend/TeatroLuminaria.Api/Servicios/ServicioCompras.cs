using Microsoft.EntityFrameworkCore;
using TeatroLuminaria.Api.Compras.Estados;
using TeatroLuminaria.Api.Compras.Observer;
using TeatroLuminaria.Api.Compras.Pasarela;
using TeatroLuminaria.Api.Datos;
using TeatroLuminaria.Api.Dtos;
using TeatroLuminaria.Api.Modelos;
using TeatroLuminaria.Api.Servicios;

namespace TeatroLuminaria.Api.Compras;

public class ServicioCompras(AppDbContext contexto, IPasarelaPago pasarela, ProcesadorPagos procesadorPagos)
{
    public const int MaxAsientos = 8;
    public const decimal PorcentajeServicio = 0.05m;

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

        public async Task<CompraRespuesta> ComprarAsync(int usuarioId, ComprarRequest solicitud)
    {
        var ids = solicitud.AsientoIds?.Distinct().ToList() ?? [];

        if (ids.Count == 0)
        {
            throw ReglaNegocioException.Invalida("Debes seleccionar al menos un asiento.");
        }

        if (ids.Count > MaxAsientos)
        {
            throw ReglaNegocioException.Invalida($"Máximo {MaxAsientos} asientos por compra.");
        }

        var evento = await contexto.Eventos.FirstOrDefaultAsync(e => e.Id == solicitud.EventoId)
                     ?? throw ReglaNegocioException.NoEncontrada("Evento no encontrado.");

        ValidarEventoEnVenta(evento);

        var asientos = await contexto.Asientos
            .Where(a => a.EventoId == evento.Id && ids.Contains(a.Id))
            .ToListAsync();

        if (asientos.Count != ids.Count)
        {
            throw ReglaNegocioException.Invalida("Algún asiento no existe o no pertenece al evento.");
        }

        // Cada asiento debe estar reservado (bloqueado y vigente) por este mismo usuario.
        foreach (var asiento in asientos)
        {
            if (asiento.Estado == EstadoAsiento.BloqueadoTemporal
                && asiento.BloqueadoHasta > DateTime.UtcNow
                && asiento.BloqueadoPorUsuarioId != usuarioId)
            {
                throw ReglaNegocioException.Conflicto(
                    $"El asiento {asiento.Fila}{asiento.Numero} está bloqueado por otra persona.");
            }

            if (asiento.BloqueadoPorUsuarioId != usuarioId || asiento.Estado != EstadoAsiento.BloqueadoTemporal)
            {
                // Vendido, o no reservado, o reserva vencida: el estado  lanza el 409.
                EstadoAsientoFactory.Obtener(asiento).Pagar(asiento);
            }
        }

        // calculo de totales (estrategia de precio según la zona del asiento).
        var subtotal = asientos.Sum(a =>
            (a.Zona == ZonaAsiento.VIP ? (IEstrategiaPrecios)new PrecioVIPStrategy() : new PrecioGeneralStrategy())
            .CalcularPrecio(evento.PrecioBase));
        var cargo = Math.Round(subtotal * PorcentajeServicio, 2);
        var total = subtotal + cargo;

        var compra = new Compra
        {
            UsuarioId = usuarioId,
            EventoId = evento.Id,
            Subtotal = subtotal,
            CargoServicio = cargo,
            Total = total,
            Estado = EstadoCompra.Pendiente,
            Fecha = DateTime.UtcNow,
        };
        var pago = new Pago
        {
            Compra = compra,
            Pasarela = pasarela.Nombre,
            ReferenciaExterna = string.Empty,
            Monto = total,
            Estado = EstadoPago.Pendiente,
            Fecha = DateTime.UtcNow,
        };
        contexto.Compras.Add(compra);
        contexto.Pagos.Add(pago);
        await contexto.SaveChangesAsync();

        // Cobro por la pasarela (Adapter).
        var resultado = await pasarela.CobrarAsync(new SolicitudPago(compra.Id, total, solicitud.SimularRechazo));
        pago.ReferenciaExterna = resultado.Referencia;

        if (!resultado.Aprobado)
        {
            foreach (var asiento in asientos)
            {
                EstadoAsientoFactory.Obtener(asiento).Liberar(asiento);
            }

            pago.Estado = EstadoPago.Rechazado;
            pago.MotivoRechazo = resultado.Motivo;
            compra.Estado = EstadoCompra.Rechazada;
            await contexto.SaveChangesAsync();

            throw ReglaNegocioException.PagoRechazado(resultado.Motivo ?? "Pago rechazado.");
        }

        foreach (var asiento in asientos)
        {
            EstadoAsientoFactory.Obtener(asiento).Pagar(asiento);
        }

        pago.Estado = EstadoPago.Aprobado;
        compra.Estado = EstadoCompra.Pagada;

        try
        {
            await contexto.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            throw ReglaNegocioException.Conflicto("Un asiento cambió de estado durante el pago.");
        }

        // Observer: notifica (correo simulado, generación del boleto digital) ya con la
        // compra pagada y confirmada. Si un listener fallara, la compra ya quedó registrada.
        await procesadorPagos.NotificarPagoAprobadoAsync(compra, asientos);

        return new CompraRespuesta(compra.Id, evento.Id, subtotal, cargo, total, compra.Estado.ToString(), ids);
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