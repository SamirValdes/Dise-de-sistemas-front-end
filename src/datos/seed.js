/*
 * Datos quemados de la aplicación (no hay backend).
 * Es el puerto de `Teatro Figma/src/data.ts` a JavaScript, con las claves en español
 * para que coincidan con el resto del proyecto.
 *
 * Los identificadores (u1..u7, e1..e6, p1..p5) se conservan tal cual: las compras y los
 * favoritos guardados en localStorage los referencian.
 */

export const usuariosSeed = [
  {
    id: 'u1',
    nombre: 'Admin Teatro',
    correo: 'admin@teatro.com',
    contrasena: 'admin123',
    rol: 'admin',
    registradoEn: '2024-01-15T10:00:00Z',
  },
  {
    id: 'u2',
    nombre: 'María García',
    correo: 'maria@email.com',
    contrasena: 'user123',
    rol: 'usuario',
    registradoEn: '2024-02-20T14:30:00Z',
  },
  {
    id: 'u3',
    nombre: 'Carlos López',
    correo: 'carlos@email.com',
    contrasena: 'user123',
    rol: 'usuario',
    registradoEn: '2024-03-05T09:15:00Z',
  },
  {
    id: 'u4',
    nombre: 'Ana Martínez',
    correo: 'ana@email.com',
    contrasena: 'user123',
    rol: 'usuario',
    registradoEn: '2024-03-18T16:45:00Z',
  },
  {
    id: 'u5',
    nombre: 'Roberto Empleado',
    correo: 'roberto@teatro.com',
    contrasena: 'emp123',
    rol: 'empleado',
    registradoEn: '2024-01-20T11:00:00Z',
  },
  {
    id: 'u6',
    nombre: 'Lucía Fernández',
    correo: 'lucia@email.com',
    contrasena: 'user123',
    rol: 'usuario',
    registradoEn: '2024-04-02T08:20:00Z',
  },
  {
    id: 'u7',
    nombre: 'Diego Ramírez',
    correo: 'diego@email.com',
    contrasena: 'user123',
    rol: 'usuario',
    registradoEn: '2024-04-10T13:50:00Z',
  },
];

export const eventosSeed = [
  {
    id: 'e1',
    nombre: 'La Traviata',
    descripcion: 'La ópera maestra de Verdi',
    descripcionLarga:
      'Una de las óperas más interpretadas del mundo, La Traviata narra la trágica historia de amor entre Violetta Valéry, una cortesana parisina, y Alfredo Germont. Con una música extraordinaria y personajes profundamente humanos, esta obra de Giuseppe Verdi continúa conmoviendo al público desde su estreno en 1853. Esta producción de Teatro Luminaria reúne a los más destacados cantantes líricos de la escena internacional.',
    fecha: '2026-10-15',
    hora: '20:00',
    precio: 45,
    inicioVenta: '2026-09-01',
    finVenta: '2026-10-14',
    estado: 'activo',
    categoria: 'Ópera',
    duracion: '2h 45min',
    sala: 'Sala Principal',
    asientosOcupados: [
      'A1', 'A2', 'A3', 'B4', 'B5', 'C2', 'C6', 'D1', 'D2', 'D3', 'D4',
      'E5', 'E6', 'F7', 'F8', 'G1', 'G2', 'H3', 'H4', 'I1', 'I2', 'J5', 'J6',
    ],
  },
  {
    id: 'e2',
    nombre: 'El Lago de los Cisnes',
    descripcion: 'Ballet clásico de Chaikovski',
    descripcionLarga:
      'El Lago de los Cisnes es considerada la cumbre del ballet romántico. La historia del amor imposible entre el príncipe Siegfried y Odette, una princesa transformada en cisne por el hechizo del malvado mago Rothbart, ha cautivado al mundo entero desde su estreno en 1877. Esta versión de Teatro Luminaria cuenta con la coreografía original del Ballet Imperial Ruso junto a diseños escenográficos de vanguardia.',
    fecha: '2026-10-28',
    hora: '19:30',
    precio: 55,
    inicioVenta: '2026-09-05',
    finVenta: '2026-10-27',
    estado: 'activo',
    categoria: 'Ballet',
    duracion: '2h 30min',
    sala: 'Sala Principal',
    asientosOcupados: [
      'A1', 'A2', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3', 'D1', 'D5', 'E2', 'E3', 'F1', 'F2',
    ],
  },
  {
    id: 'e3',
    nombre: 'Sinfonía No. 9 — Beethoven',
    descripcion: 'La obra cumbre del compositor alemán',
    descripcionLarga:
      'La Novena Sinfonía de Ludwig van Beethoven es una de las composiciones más aclamadas de la historia de la música occidental. Compuesta cuando Beethoven era completamente sordo, esta obra monumental culmina con el célebre Himno a la Alegría, un llamado universal a la fraternidad humana. La Orquesta Sinfónica Nacional y el Coro Filarmónico se unen para rendir tributo a este legado inmortal.',
    fecha: '2026-11-10',
    hora: '20:30',
    precio: 40,
    inicioVenta: '2026-09-10',
    finVenta: '2026-11-09',
    estado: 'activo',
    categoria: 'Concierto',
    duracion: '1h 15min',
    sala: 'Sala de Cámara',
    asientosOcupados: ['B2', 'B3', 'C4', 'D1', 'D2', 'D3', 'E6', 'F5', 'G3', 'G4', 'H1'],
  },
  {
    id: 'e4',
    nombre: 'El Fantasma de la Ópera',
    descripcion: 'El musical más taquillero de la historia',
    descripcionLarga:
      'Basado en la novela de Gaston Leroux y con música del maestro Andrew Lloyd Webber, El Fantasma de la Ópera es el espectáculo musical más visto en la historia del teatro. Una historia oscura y apasionada de amor, obsesión y tragedia ambientada en la Ópera de París. Esta producción exclusiva de Teatro Luminaria presenta los efectos especiales más impresionantes jamás vistos en nuestro escenario.',
    fecha: '2026-11-22',
    hora: '19:00',
    precio: 65,
    inicioVenta: '2026-09-15',
    finVenta: '2026-11-21',
    estado: 'activo',
    categoria: 'Musical',
    duracion: '2h 30min',
    sala: 'Sala Principal',
    asientosOcupados: [
      'A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3', 'C4',
      'D1', 'D2', 'D3', 'D4', 'D5', 'E1', 'E2', 'E3', 'F6', 'F7', 'G5',
    ],
  },
  {
    id: 'e5',
    nombre: 'Flamenco Nuevo',
    descripcion: 'Arte flamenco contemporáneo',
    descripcionLarga:
      'Una fusión única de flamenco tradicional con influencias del jazz contemporáneo y la música electrónica. Esta compañía joven y visionaria reinventa el duende del flamenco para las nuevas generaciones, respetando sus raíces mientras explora nuevos territorios artísticos. Cinco bailaoras, tres guitarristas y un equipo de percusión se unen para crear una experiencia sensorial sin precedentes.',
    fecha: '2026-12-05',
    hora: '21:00',
    precio: 35,
    inicioVenta: '2026-10-01',
    finVenta: '2026-12-04',
    estado: 'proximo',
    categoria: 'Danza',
    duracion: '1h 30min',
    sala: 'Sala Íntima',
    asientosOcupados: [],
  },
  {
    id: 'e6',
    nombre: 'Medea — Eurípides',
    descripcion: 'La tragedia griega clásica',
    descripcionLarga:
      'Una nueva puesta en escena de la obra más poderosa del teatro clásico griego. Medea, la hechicera apasionada y vengativa, es un estudio sin precedentes de la fuerza destructiva del amor traicionado. Esta versión contemporánea busca los ecos que estas emociones eternas tienen en el mundo moderno, con una escenografía minimalista y una interpretación de enorme intensidad dramática.',
    fecha: '2026-12-18',
    hora: '20:00',
    precio: 38,
    inicioVenta: '2026-10-15',
    finVenta: '2026-12-17',
    estado: 'proximo',
    categoria: 'Teatro',
    duracion: '2h',
    sala: 'Sala Principal',
    asientosOcupados: [],
  },
];

export const comprasSeed = [
  {
    id: 'p1',
    eventoId: 'e1',
    usuarioId: 'u2',
    asientos: ['D5', 'D6'],
    total: 90,
    compradaEn: '2026-09-01T15:30:00Z',
    codigoEntrada: 'TL-A4B2C3D1',
  },
  {
    id: 'p2',
    eventoId: 'e2',
    usuarioId: 'u2',
    asientos: ['A3', 'A4'],
    total: 165,
    compradaEn: '2026-09-03T11:20:00Z',
    codigoEntrada: 'TL-E5F6G7H8',
  },
  {
    id: 'p3',
    eventoId: 'e1',
    usuarioId: 'u3',
    asientos: ['H1', 'H2', 'H3'],
    total: 135,
    compradaEn: '2026-09-02T09:45:00Z',
    codigoEntrada: 'TL-I9J0K1L2',
  },
  {
    id: 'p4',
    eventoId: 'e4',
    usuarioId: 'u4',
    asientos: ['B1', 'B2'],
    total: 195,
    compradaEn: '2026-09-04T14:00:00Z',
    codigoEntrada: 'TL-M3N4O5P6',
  },
  {
    id: 'p5',
    eventoId: 'e3',
    usuarioId: 'u6',
    asientos: ['E1', 'E2', 'E3'],
    total: 120,
    compradaEn: '2026-09-05T10:00:00Z',
    codigoEntrada: 'TL-Q7R8S9T0',
  },
];

export const CATEGORIAS = [
  'Todos',
  'Ópera',
  'Ballet',
  'Musical',
  'Concierto',
  'Teatro',
  'Danza',
];
