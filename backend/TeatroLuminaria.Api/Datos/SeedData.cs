using TeatroLuminaria.Api.Modelos;
using TeatroLuminaria.Api.Servicios;

namespace TeatroLuminaria.Api.Datos;

/// <summary>
/// Carga los datos iniciales (sección 5 de GUIA_BACKEND_FASES.md) si la base está vacía.
/// Los eventos vienen de src/datos/seed.js del frontend. Los usuarios y comprasSeed del
/// frontend NO se cargan: solo los dos usuarios de prueba que define la guía.
/// </summary>
public static class SeedData
{
    private const int FilasVip = 3;
    private const int ColumnasVip = 8;
    private const int FilasGenerales = 7;
    private const int ColumnasGenerales = 12;

    public static void Aplicar(AppDbContext contexto)
    {
        if (contexto.Roles.Any()) return;

        var permisos = new[]
        {
            new Permiso { Codigo = "eventos.gestionar", Descripcion = "Crear, editar y eliminar eventos" },
            new Permiso { Codigo = "usuarios.ver", Descripcion = "Ver el listado de usuarios" },
            new Permiso { Codigo = "empleados.gestionar", Descripcion = "Administrar empleados" },
            new Permiso { Codigo = "roles.gestionar", Descripcion = "Administrar roles y permisos" },
            new Permiso { Codigo = "metricas.ver", Descripcion = "Ver métricas del teatro" },
        };
        contexto.Permisos.AddRange(permisos);

        var rolCliente = new Rol { Nombre = "Cliente", Descripcion = "Compra entradas para los eventos" };
        var rolAdministrador = new Rol
        {
            Nombre = "Administrador",
            Descripcion = "Gestiona el teatro: eventos, usuarios, empleados y roles",
            RolPermisos = permisos.Select(permiso => new RolPermiso { Permiso = permiso }).ToList(),
        };
        contexto.Roles.AddRange(rolCliente, rolAdministrador);

        var administrador = new Usuario
        {
            Nombre = "Administrador Teatro Luminaria",
            Correo = "admin@luminaria.com",
            ContrasenaHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            Rol = rolAdministrador,
            Estado = EstadoUsuario.Activo,
            FechaRegistro = DateTime.UtcNow,
        };

        var cliente = new Usuario
        {
            Nombre = "Cliente de prueba",
            Correo = "cliente@luminaria.com",
            ContrasenaHash = BCrypt.Net.BCrypt.HashPassword("Cliente123!"),
            Rol = rolCliente,
            Estado = EstadoUsuario.Activo,
            FechaRegistro = DateTime.UtcNow,
        };
        contexto.Usuarios.AddRange(administrador, cliente);

        contexto.Eventos.AddRange(ConstruirEventos());

        contexto.SaveChanges();
    }

    private static IEnumerable<Evento> ConstruirEventos() => EventosSeed.Select(datos =>
    {
        var evento = new Evento
        {
            Nombre = datos.Nombre,
            Descripcion = datos.Descripcion,
            InformacionAdicional = datos.DescripcionLarga,
            Fecha = datos.Fecha,
            Hora = datos.Hora,
            Categoria = datos.Categoria,
            PrecioBase = datos.Precio,
            FechaInicioVenta = datos.InicioVenta,
            FechaFinVenta = datos.FinVenta,
            // El seed del frontend solo trae 'activo' y 'proximo'; ambos son eventos públicos
            // y se guardan como Publicado. La distinción se calcula en la API (estadoVenta).
            Estado = EstadoEvento.Publicado,
            FilasVip = FilasVip,
            ColumnasVip = ColumnasVip,
            FilasGenerales = FilasGenerales,
            ColumnasGenerales = ColumnasGenerales,
            Duracion = datos.Duracion,
            Sala = datos.Sala,
            FechaCreacion = DateTime.UtcNow,
            FechaActualizacion = DateTime.UtcNow,
        };

        var asientos = GeneradorAsientos.Generar(evento);

        foreach (var codigo in datos.AsientosOcupados)
        {
            var fila = codigo[..1];
            var numero = int.Parse(codigo[1..]);
            var asiento = asientos.First(a => a.Fila == fila && a.Numero == numero);
            asiento.Estado = EstadoAsiento.Vendido;
        }

        evento.Asientos = asientos;
        return evento;
    });

    private sealed record EventoSeedDto(
        string Nombre,
        string Descripcion,
        string DescripcionLarga,
        DateOnly Fecha,
        TimeOnly Hora,
        decimal Precio,
        DateOnly InicioVenta,
        DateOnly FinVenta,
        string Categoria,
        string Duracion,
        string Sala,
        string[] AsientosOcupados);

    private static readonly EventoSeedDto[] EventosSeed =
    [
        new(
            Nombre: "La Traviata",
            Descripcion: "La ópera maestra de Verdi",
            DescripcionLarga:
                "Una de las óperas más interpretadas del mundo, La Traviata narra la trágica historia de amor entre Violetta Valéry, una cortesana parisina, y Alfredo Germont. Con una música extraordinaria y personajes profundamente humanos, esta obra de Giuseppe Verdi continúa conmoviendo al público desde su estreno en 1853. Esta producción de Teatro Luminaria reúne a los más destacados cantantes líricos de la escena internacional.",
            Fecha: new DateOnly(2026, 10, 15),
            Hora: new TimeOnly(20, 0),
            Precio: 45m,
            InicioVenta: new DateOnly(2026, 9, 1),
            FinVenta: new DateOnly(2026, 10, 14),
            Categoria: "Ópera",
            Duracion: "2h 45min",
            Sala: "Sala Principal",
            AsientosOcupados:
            [
                "A1", "A2", "A3", "B4", "B5", "C2", "C6", "D1", "D2", "D3", "D4",
                "E5", "E6", "F7", "F8", "G1", "G2", "H3", "H4", "I1", "I2", "J5", "J6",
            ]),
        new(
            Nombre: "El Lago de los Cisnes",
            Descripcion: "Ballet clásico de Chaikovski",
            DescripcionLarga:
                "El Lago de los Cisnes es considerada la cumbre del ballet romántico. La historia del amor imposible entre el príncipe Siegfried y Odette, una princesa transformada en cisne por el hechizo del malvado mago Rothbart, ha cautivado al mundo entero desde su estreno en 1877. Esta versión de Teatro Luminaria cuenta con la coreografía original del Ballet Imperial Ruso junto a diseños escenográficos de vanguardia.",
            Fecha: new DateOnly(2026, 10, 28),
            Hora: new TimeOnly(19, 30),
            Precio: 55m,
            InicioVenta: new DateOnly(2026, 9, 5),
            FinVenta: new DateOnly(2026, 10, 27),
            Categoria: "Ballet",
            Duracion: "2h 30min",
            Sala: "Sala Principal",
            AsientosOcupados:
                ["A1", "A2", "B1", "B2", "B3", "C1", "C2", "C3", "D1", "D5", "E2", "E3", "F1", "F2"]),
        new(
            Nombre: "Sinfonía No. 9 — Beethoven",
            Descripcion: "La obra cumbre del compositor alemán",
            DescripcionLarga:
                "La Novena Sinfonía de Ludwig van Beethoven es una de las composiciones más aclamadas de la historia de la música occidental. Compuesta cuando Beethoven era completamente sordo, esta obra monumental culmina con el célebre Himno a la Alegría, un llamado universal a la fraternidad humana. La Orquesta Sinfónica Nacional y el Coro Filarmónico se unen para rendir tributo a este legado inmortal.",
            Fecha: new DateOnly(2026, 11, 10),
            Hora: new TimeOnly(20, 30),
            Precio: 40m,
            InicioVenta: new DateOnly(2026, 9, 10),
            FinVenta: new DateOnly(2026, 11, 9),
            Categoria: "Concierto",
            Duracion: "1h 15min",
            Sala: "Sala de Cámara",
            AsientosOcupados: ["B2", "B3", "C4", "D1", "D2", "D3", "E6", "F5", "G3", "G4", "H1"]),
        new(
            Nombre: "El Fantasma de la Ópera",
            Descripcion: "El musical más taquillero de la historia",
            DescripcionLarga:
                "Basado en la novela de Gaston Leroux y con música del maestro Andrew Lloyd Webber, El Fantasma de la Ópera es el espectáculo musical más visto en la historia del teatro. Una historia oscura y apasionada de amor, obsesión y tragedia ambientada en la Ópera de París. Esta producción exclusiva de Teatro Luminaria presenta los efectos especiales más impresionantes jamás vistos en nuestro escenario.",
            Fecha: new DateOnly(2026, 11, 22),
            Hora: new TimeOnly(19, 0),
            Precio: 65m,
            InicioVenta: new DateOnly(2026, 9, 15),
            FinVenta: new DateOnly(2026, 11, 21),
            Categoria: "Musical",
            Duracion: "2h 30min",
            Sala: "Sala Principal",
            AsientosOcupados:
            [
                "A1", "A2", "A3", "A4", "B1", "B2", "B3", "C1", "C2", "C3", "C4",
                "D1", "D2", "D3", "D4", "D5", "E1", "E2", "E3", "F6", "F7", "G5",
            ]),
        new(
            Nombre: "Flamenco Nuevo",
            Descripcion: "Arte flamenco contemporáneo",
            DescripcionLarga:
                "Una fusión única de flamenco tradicional con influencias del jazz contemporáneo y la música electrónica. Esta compañía joven y visionaria reinventa el duende del flamenco para las nuevas generaciones, respetando sus raíces mientras explora nuevos territorios artísticos. Cinco bailaoras, tres guitarristas y un equipo de percusión se unen para crear una experiencia sensorial sin precedentes.",
            Fecha: new DateOnly(2026, 12, 5),
            Hora: new TimeOnly(21, 0),
            Precio: 35m,
            InicioVenta: new DateOnly(2026, 10, 1),
            FinVenta: new DateOnly(2026, 12, 4),
            Categoria: "Danza",
            Duracion: "1h 30min",
            Sala: "Sala Íntima",
            AsientosOcupados: []),
        new(
            Nombre: "Medea — Eurípides",
            Descripcion: "La tragedia griega clásica",
            DescripcionLarga:
                "Una nueva puesta en escena de la obra más poderosa del teatro clásico griego. Medea, la hechicera apasionada y vengativa, es un estudio sin precedentes de la fuerza destructiva del amor traicionado. Esta versión contemporánea busca los ecos que estas emociones eternas tienen en el mundo moderno, con una escenografía minimalista y una interpretación de enorme intensidad dramática.",
            Fecha: new DateOnly(2026, 12, 18),
            Hora: new TimeOnly(20, 0),
            Precio: 38m,
            InicioVenta: new DateOnly(2026, 10, 15),
            FinVenta: new DateOnly(2026, 12, 17),
            Categoria: "Teatro",
            Duracion: "2h",
            Sala: "Sala Principal",
            AsientosOcupados: []),
    ];
}
