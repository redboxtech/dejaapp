using DejaBackend.Application.CaregiverSchedules.Commands.AddCaregiverSchedule;
using DejaBackend.Application.CaregiverSchedules.Commands.DeleteCaregiverSchedule;
using DejaBackend.Application.CaregiverSchedules.Commands.UpdateCaregiverSchedule;
using DejaBackend.Application.CaregiverSchedules.Queries.GetCaregiverSchedules;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DejaBackend.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/caregiver-schedules")]
public class CaregiverSchedulesController : ControllerBase
{
    private readonly IMediator _mediator;

    public CaregiverSchedulesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    public record CreateCaregiverScheduleRequest(
        Guid CaregiverId,
        Guid PatientId,
        List<string> DaysOfWeek,
        string StartTime,
        string EndTime
    );

    public record UpdateCaregiverScheduleRequest(
        Guid CaregiverId,
        Guid PatientId,
        List<string> DaysOfWeek,
        string StartTime,
        string EndTime
    );

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Get()
    {
        try
        {
            var query = new GetCaregiverSchedulesQuery();
            var result = await _mediator.Send(query);
            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Erro ao buscar escalas de cuidadores." });
        }
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Create([FromBody] CreateCaregiverScheduleRequest req)
    {
        try
        {
            var command = new AddCaregiverScheduleCommand(
                req.CaregiverId,
                req.PatientId,
                req.DaysOfWeek,
                req.StartTime,
                req.EndTime
            );
            var scheduleId = await _mediator.Send(command);
            return CreatedAtAction(nameof(Get), new { id = scheduleId }, scheduleId);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception)
        {
            return BadRequest(new { message = "Erro ao criar escala de cuidador." });
        }
    }

    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCaregiverScheduleRequest req)
    {
        try
        {
            var command = new UpdateCaregiverScheduleCommand(
                id,
                req.CaregiverId,
                req.PatientId,
                req.DaysOfWeek,
                req.StartTime,
                req.EndTime
            );
            var result = await _mediator.Send(command);
            if (!result)
            {
                return NotFound(new { message = "Escala não encontrada." });
            }
            return NoContent();
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception)
        {
            return BadRequest(new { message = "Erro ao atualizar escala de cuidador." });
        }
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var command = new DeleteCaregiverScheduleCommand(id);
            var result = await _mediator.Send(command);
            if (!result)
            {
                return NotFound(new { message = "Escala não encontrada." });
            }
            return NoContent();
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception)
        {
            return BadRequest(new { message = "Erro ao excluir escala de cuidador." });
        }
    }
}

