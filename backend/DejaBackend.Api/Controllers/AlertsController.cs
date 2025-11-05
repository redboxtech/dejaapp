using DejaBackend.Application.Alerts.Commands.UpdateAlertSettings;
using DejaBackend.Application.Alerts.Queries.GetAlertSettings;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DejaBackend.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/alerts")]
public class AlertsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AlertsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("settings")]
    public async Task<IActionResult> GetAlertSettings()
    {
        try
        {
            var query = new GetAlertSettingsQuery();
            var settings = await _mediator.Send(query);
            return Ok(settings);
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Erro ao buscar configurações de alertas." });
        }
    }

    [HttpPut("settings")]
    public async Task<IActionResult> UpdateAlertSettings([FromBody] UpdateAlertSettingsCommand command)
    {
        try
        {
            var result = await _mediator.Send(command);
            if (!result)
            {
                return BadRequest(new { message = "Erro ao atualizar configurações de alertas." });
            }
            return Ok(new { message = "Configurações de alertas atualizadas com sucesso." });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Erro ao atualizar configurações de alertas." });
        }
    }
}

