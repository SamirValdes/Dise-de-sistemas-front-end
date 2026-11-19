using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;
using TeatroLuminaria.Api.Datos;
using TeatroLuminaria.Api.Servicios;

var builder = WebApplication.CreateBuilder(args);

const string PoliticaCors = "FrontendCors";

builder.Services.AddControllers();

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

app.UseAuthorization();

app.MapControllers();

app.Run();
