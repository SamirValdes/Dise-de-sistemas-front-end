using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using TeatroLuminaria.Api.Modelos;

namespace TeatroLuminaria.Api.Servicios;

public class ServicioJwt(IConfiguration configuracion)
{
    public const string ClaimPermiso = "permiso";

    /// <summary>Token con id, correo, rol y permisos del usuario. Expira en 2 horas.</summary>
    public string GenerarToken(Usuario usuario, IEnumerable<string> permisos)
    {
        var clave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuracion["Jwt:Clave"]!));
        var credenciales = new SigningCredentials(clave, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, usuario.Id.ToString()),
            new(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new(ClaimTypes.Email, usuario.Correo),
            new(ClaimTypes.Role, usuario.Rol.Nombre),
        };

        claims.AddRange(permisos.Select(codigo => new Claim(ClaimPermiso, codigo)));

        var token = new JwtSecurityToken(
            issuer: configuracion["Jwt:Emisor"],
            audience: configuracion["Jwt:Audiencia"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(2),
            signingCredentials: credenciales);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
