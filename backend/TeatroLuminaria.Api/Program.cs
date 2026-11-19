using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

const string PoliticaCors = "FrontendCors";

builder.Services.AddControllers();

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

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors(PoliticaCors);

app.UseAuthorization();

app.MapControllers();

app.Run();
