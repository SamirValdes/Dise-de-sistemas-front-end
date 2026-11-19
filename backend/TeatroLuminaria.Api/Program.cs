using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using TeatroLuminaria.Api.Datos;
using TeatroLuminaria.Api.Servicios;

var builder = WebApplication.CreateBuilder(args);

const string PoliticaCors = "FrontendCors";

builder.Services.AddControllers()
    .AddJsonOptions(opciones => opciones.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.Configure<ApiBehaviorOptions>(opciones =>
{
    // Convención de la guía: errores siempre en JSON {"mensaje": "..."}.
    opciones.InvalidModelStateResponseFactory = contexto =>
    {
        var mensaje = contexto.ModelState.Values
            .SelectMany(valor => valor.Errors)
            .Select(error => error.ErrorMessage)
            .FirstOrDefault() ?? "Datos inválidos.";

        return new BadRequestObjectResult(new { mensaje });
    };
});

builder.Services.AddDbContext<AppDbContext>(opciones =>
    opciones.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<ServicioJwt>();
builder.Services.AddScoped<TeatroLuminaria.Api.Compras.ServicioCompras>();
builder.Services.AddScoped<TeatroLuminaria.Api.Compras.Pasarela.IPasarelaPago, TeatroLuminaria.Api.Compras.Pasarela.AdaptadorPasarelaSimulada>();

// Observer: ProcesadorPagos notifica a todos los IPagoListener registrados cuando un pago
// se aprueba. El orden de registro es el orden en que se notifican.
builder.Services.AddScoped<TeatroLuminaria.Api.Compras.Observer.ProcesadorPagos>();
builder.Services.AddScoped<TeatroLuminaria.Api.Compras.Observer.IPagoListener, TeatroLuminaria.Api.Compras.Observer.ServicioNotificacionCorreo>();
builder.Services.AddScoped<TeatroLuminaria.Api.Compras.Observer.IPagoListener, TeatroLuminaria.Api.Compras.Observer.GeneradorBoletoDigital>();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opciones =>
    {
        opciones.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Emisor"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audiencia"],
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Clave"]!)),
            ValidateLifetime = true,
        };
    });

builder.Services.AddAuthorization(opciones =>
{
    opciones.AddPolicy("SoloAdmin", politica => politica.RequireRole("Administrador"));
    opciones.AddPolicy("Autenticado", politica => politica.RequireAuthenticatedUser());
});

builder.Services.AddCors(opciones =>
{
    opciones.AddPolicy(PoliticaCors, politica =>
    {
        politica
            .WithOrigins("http://localhost:3000", "http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddSwaggerGen(opciones =>
{
    opciones.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Teatro Luminaria API",
        Version = "v1",
    });

    opciones.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Token JWT. Pega solo el token, sin el prefijo 'Bearer '.",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
    });

    opciones.AddSecurityRequirement(documento => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", documento, null)] = new List<string>(),
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var contexto = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    SeedData.Aplicar(contexto);
}

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors(PoliticaCors);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
