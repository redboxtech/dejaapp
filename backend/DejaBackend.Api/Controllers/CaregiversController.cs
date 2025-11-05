using DejaBackend.Application.Caregivers.Commands.AddCaregiver;
using DejaBackend.Application.Caregivers.Commands.DeleteCaregiver;
using DejaBackend.Application.Caregivers.Commands.UpdateCaregiver;
using DejaBackend.Application.Caregivers.Queries.GetCaregivers;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DejaBackend.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/caregivers")]
public class CaregiversController : ControllerBase
{
    private readonly IMediator _mediator;

    public CaregiversController(IMediator mediator)
    {
        _mediator = mediator;
    }

    public record CreateCaregiverRequest(string Name, string? Email, string Phone, List<Guid>? Patients);

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Get()
    {
        var query = new GetCaregiversQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Create([FromBody] CreateCaregiverRequest req)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(req.Phone))
            {
                return BadRequest(new { message = "Phone is required." });
            }

            var command = new AddCaregiverCommand(
                req.Name,
                req.Email,
                req.Phone,
                req.Patients ?? new List<Guid>()
            );
            var caregiverId = await _mediator.Send(command);
            return CreatedAtAction(nameof(Get), new { id = caregiverId }, caregiverId);
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
            return BadRequest(new { message = "An error occurred while adding the caregiver." });
        }
    }

    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCaregiverRequest req)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(req.Phone))
            {
                return BadRequest(new { message = "Phone is required." });
            }

            var command = new UpdateCaregiverCommand(
                id,
                req.Name,
                req.Email,
                req.Phone,
                req.Patients ?? new List<Guid>()
            );
            var result = await _mediator.Send(command);
            if (!result)
            {
                return NotFound(new { message = "Caregiver not found." });
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
            return BadRequest(new { message = "An error occurred while updating the caregiver." });
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
            var command = new DeleteCaregiverCommand(id);
            var result = await _mediator.Send(command);
            if (!result)
            {
                return NotFound(new { message = "Caregiver not found." });
            }
            return NoContent();
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception)
        {
            return BadRequest(new { message = "An error occurred while deleting the caregiver." });
        }
    }
    
    public record UpdateCaregiverRequest(string Name, string? Email, string Phone, List<Guid>? Patients);
}


