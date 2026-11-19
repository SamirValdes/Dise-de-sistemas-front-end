using System.ComponentModel.DataAnnotations;
using TeatroLuminaria.Api.Modelos;

namespace TeatroLuminaria.Api.Dtos;

public class EventoCrearRequest
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "La descripción es obligatoria.")]
    public string Descripcion { get; set; } = string.Empty;

    public string? InformacionAdicional { get; set; }

    [Required(ErrorMessage = "La fecha es obligatoria.")]
    public DateOnly Fecha { get; set; }

    [Required(ErrorMessage = "La hora es obligatoria.")]
    public TimeOnly Hora { get; set; }

    public string? ImagenUrl { get; set; }

    [Required(ErrorMessage = "La categoría es obligatoria.")]
    public string Categoria { get; set; } = string.Empty;

    [Range(0.01, double.MaxValue, ErrorMessage = "El precio base debe ser mayor que 0.")]
    public decimal PrecioBase { get; set; }

    [Required(ErrorMessage = "La fecha de inicio de venta es obligatoria.")]
    public DateOnly FechaInicioVenta { get; set; }

    [Required(ErrorMessage = "La fecha de fin de venta es obligatoria.")]
    public DateOnly FechaFinVenta { get; set; }

    [Range(1, 26, ErrorMessage = "FilasVip debe ser entre 1 y 26.")]
    public int FilasVip { get; set; }

    [Range(1, 100, ErrorMessage = "ColumnasVip debe ser mayor que 0.")]
    public int ColumnasVip { get; set; }

    [Range(1, 26, ErrorMessage = "FilasGenerales debe ser entre 1 y 26.")]
    public int FilasGenerales { get; set; }

    [Range(1, 100, ErrorMessage = "ColumnasGenerales debe ser mayor que 0.")]
    public int ColumnasGenerales { get; set; }

    public string? Duracion { get; set; }
    public string? Sala { get; set; }
}

public class EventoActualizarRequest
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "La descripción es obligatoria.")]
    public string Descripcion { get; set; } = string.Empty;

    public string? InformacionAdicional { get; set; }

    [Required(ErrorMessage = "La fecha es obligatoria.")]
    public DateOnly Fecha { get; set; }

    [Required(ErrorMessage = "La hora es obligatoria.")]
    public TimeOnly Hora { get; set; }

    public string? ImagenUrl { get; set; }

    [Required(ErrorMessage = "La categoría es obligatoria.")]
    public string Categoria { get; set; } = string.Empty;

    [Range(0.01, double.MaxValue, ErrorMessage = "El precio base debe ser mayor que 0.")]
    public decimal PrecioBase { get; set; }

    [Required(ErrorMessage = "La fecha de inicio de venta es obligatoria.")]
    public DateOnly FechaInicioVenta { get; set; }

    [Required(ErrorMessage = "La fecha de fin de venta es obligatoria.")]
    public DateOnly FechaFinVenta { get; set; }

    public string? Duracion { get; set; }
    public string? Sala { get; set; }
}

public class CambiarEstadoRequest
{
    [Required(ErrorMessage = "El estado es obligatorio.")]
    public EstadoEvento Estado { get; set; }
}

public record AsientoRespuesta(string Fila, int Numero, string Zona, string Estado, decimal Precio);

public record EventoListadoRespuesta(
    int Id,
    string Nombre,
    string Descripcion,
    DateOnly Fecha,
    TimeOnly Hora,
    string? ImagenUrl,
    string Categoria,
    decimal PrecioBase,
    DateOnly FechaInicioVenta,
    DateOnly FechaFinVenta,
    string Estado,
    string EstadoVenta,
    string? Duracion,
    string? Sala,
    int AsientosDisponibles,
    int AsientosTotales);

public record EventoDetalleRespuesta(
    int Id,
    string Nombre,
    string Descripcion,
    string? InformacionAdicional,
    DateOnly Fecha,
    TimeOnly Hora,
    string? ImagenUrl,
    string Categoria,
    decimal PrecioBase,
    DateOnly FechaInicioVenta,
    DateOnly FechaFinVenta,
    string Estado,
    string EstadoVenta,
    int FilasVip,
    int ColumnasVip,
    int FilasGenerales,
    int ColumnasGenerales,
    string? Duracion,
    string? Sala,
    List<AsientoRespuesta> Asientos);
