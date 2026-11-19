using Microsoft.AspNetCore.Mvc;

namespace TeatroLuminaria.Api.Controllers;

[ApiController]
[Route("api/salud")]
public class SaludController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok(new { estado = "ok", fecha = DateTime.UtcNow });
}
