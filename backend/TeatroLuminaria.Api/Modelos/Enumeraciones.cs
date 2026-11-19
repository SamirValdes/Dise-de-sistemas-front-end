namespace TeatroLuminaria.Api.Modelos;

public enum EstadoUsuario
{
    Activo,
    Inactivo,
}

public enum EstadoEvento
{
    Borrador,
    Publicado,
    Cancelado,
    Finalizado,
}

public enum ZonaAsiento
{
    General,
    VIP,
}

public enum EstadoAsiento
{
    Disponible,
    BloqueadoTemporal,
    Vendido,
}

public enum EstadoCompra
{
    Pendiente,
    Pagada,
    Rechazada,
    Cancelada,
}

public enum EstadoPago
{
    Pendiente,
    Aprobado,
    Rechazado,
}

public enum EstadoEntrada
{
    Valida,
    Anulada,
}

public enum TipoNotificacion
{
    CambioEvento,
    Compra,
    Otro,
}
