using Microsoft.EntityFrameworkCore;
using TeatroLuminaria.Api.Modelos;

namespace TeatroLuminaria.Api.Datos;

public class AppDbContext(DbContextOptions<AppDbContext> opciones) : DbContext(opciones)
{
    public DbSet<Rol> Roles => Set<Rol>();
    public DbSet<Permiso> Permisos => Set<Permiso>();
    public DbSet<RolPermiso> RolPermisos => Set<RolPermiso>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Evento> Eventos => Set<Evento>();
    public DbSet<Asiento> Asientos => Set<Asiento>();
    public DbSet<Compra> Compras => Set<Compra>();
    public DbSet<Pago> Pagos => Set<Pago>();
    public DbSet<Entrada> Entradas => Set<Entrada>();
    public DbSet<Favorito> Favoritos => Set<Favorito>();
    public DbSet<Notificacion> Notificaciones => Set<Notificacion>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // --- Rol / Permiso / RolPermiso ---
        modelBuilder.Entity<Rol>(rol =>
        {
            rol.HasIndex(r => r.Nombre).IsUnique();
        });

        modelBuilder.Entity<Permiso>(permiso =>
        {
            permiso.HasIndex(p => p.Codigo).IsUnique();
        });

        modelBuilder.Entity<RolPermiso>(rolPermiso =>
        {
            rolPermiso.HasKey(rp => new { rp.RolId, rp.PermisoId });

            rolPermiso.HasOne(rp => rp.Rol)
                .WithMany(r => r.RolPermisos)
                .HasForeignKey(rp => rp.RolId);

            rolPermiso.HasOne(rp => rp.Permiso)
                .WithMany(p => p.RolPermisos)
                .HasForeignKey(rp => rp.PermisoId);
        });

        // --- Usuario ---
        modelBuilder.Entity<Usuario>(usuario =>
        {
            usuario.HasIndex(u => u.Correo).IsUnique();
            usuario.Property(u => u.Estado).HasConversion<string>();

            usuario.HasOne(u => u.Rol)
                .WithMany(r => r.Usuarios)
                .HasForeignKey(u => u.RolId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // --- Evento / Asiento ---
        modelBuilder.Entity<Evento>(evento =>
        {
            evento.Property(e => e.Estado).HasConversion<string>();
            evento.Property(e => e.PrecioBase).HasPrecision(10, 2);
        });

        modelBuilder.Entity<Asiento>(asiento =>
        {
            asiento.HasIndex(a => new { a.EventoId, a.Fila, a.Numero }).IsUnique();
            asiento.Property(a => a.Zona).HasConversion<string>();
            asiento.Property(a => a.Estado).HasConversion<string>();

            asiento.HasOne(a => a.Evento)
                .WithMany(e => e.Asientos)
                .HasForeignKey(a => a.EventoId)
                .OnDelete(DeleteBehavior.Cascade);

            asiento.HasOne(a => a.BloqueadoPorUsuario)
                .WithMany()
                .HasForeignKey(a => a.BloqueadoPorUsuarioId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // --- Compra / Pago / Entrada ---
        modelBuilder.Entity<Compra>(compra =>
        {
            compra.Property(c => c.Estado).HasConversion<string>();
            compra.Property(c => c.Subtotal).HasPrecision(10, 2);
            compra.Property(c => c.CargoServicio).HasPrecision(10, 2);
            compra.Property(c => c.Total).HasPrecision(10, 2);

            compra.HasOne(c => c.Usuario)
                .WithMany(u => u.Compras)
                .HasForeignKey(c => c.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);

            compra.HasOne(c => c.Evento)
                .WithMany(e => e.Compras)
                .HasForeignKey(c => c.EventoId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Pago>(pago =>
        {
            pago.Property(p => p.Estado).HasConversion<string>();
            pago.Property(p => p.Monto).HasPrecision(10, 2);

            pago.HasOne(p => p.Compra)
                .WithMany(c => c.Pagos)
                .HasForeignKey(p => p.CompraId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Entrada>(entrada =>
        {
            entrada.HasIndex(e => e.CodigoUnico).IsUnique();
            entrada.HasIndex(e => e.AsientoId).IsUnique();
            entrada.Property(e => e.Estado).HasConversion<string>();

            entrada.HasOne(e => e.Compra)
                .WithMany(c => c.Entradas)
                .HasForeignKey(e => e.CompraId)
                .OnDelete(DeleteBehavior.Cascade);

            // Restrict para no competir con la cascada Evento -> Asiento (SQL Server no permite
            // dos rutas de cascada hacia la misma tabla). En la práctica un Asiento con Entrada
            // pertenece a una Compra, y un Evento con Compras no se puede borrar (ver Compra).
            entrada.HasOne(e => e.Asiento)
                .WithOne(a => a.Entrada)
                .HasForeignKey<Entrada>(e => e.AsientoId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // --- Favorito / Notificacion ---
        modelBuilder.Entity<Favorito>(favorito =>
        {
            favorito.HasKey(f => new { f.UsuarioId, f.EventoId });

            favorito.HasOne(f => f.Usuario)
                .WithMany(u => u.Favoritos)
                .HasForeignKey(f => f.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);

            favorito.HasOne(f => f.Evento)
                .WithMany(e => e.Favoritos)
                .HasForeignKey(f => f.EventoId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Notificacion>(notificacion =>
        {
            notificacion.Property(n => n.Tipo).HasConversion<string>();

            notificacion.HasOne(n => n.Usuario)
                .WithMany(u => u.Notificaciones)
                .HasForeignKey(n => n.UsuarioId)
                .OnDelete(DeleteBehavior.Cascade);

            notificacion.HasOne(n => n.Evento)
                .WithMany(e => e.Notificaciones)
                .HasForeignKey(n => n.EventoId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
