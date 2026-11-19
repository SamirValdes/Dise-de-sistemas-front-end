using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace TeatroLuminaria.Api.Compras;

public class ManejadorReglasNegocioAttribute : ExceptionFilterAttribute
{
    public override void OnException(ExceptionContext contexto)
    {
        if (contexto.Exception is ReglaNegocioException ex)
        {
            contexto.Result = new ObjectResult(new { mensaje = ex.Message }) { StatusCode = ex.CodigoHttp };
            contexto.ExceptionHandled = true;
        }
    }
}