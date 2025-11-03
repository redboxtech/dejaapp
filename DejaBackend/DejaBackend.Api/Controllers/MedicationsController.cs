using DejaBackend.Application.Medications.Commands.AddMedication;
using DejaBackend.Application.Medications.Commands.DeleteMedication;
using DejaBackend.Application.Medications.Commands.UpdateMedication;
using DejaBackend.Application.Medications.Queries.GetMedications;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DejaBackend.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/medications")]
public class MedicationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public MedicationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMedications()
    {
        var query = new GetMedicationsQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> AddMedication([FromBody] AddMedicationCommand command)
    {
        try
        {
            var medicationId = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetMedications), new { id = medicationId }, medicationId);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            // Log the exception
            return BadRequest(new { message = "An error occurred while adding the medication." });
        }
    }
    
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateMedication(Guid id, [FromBody] UpdateMedicationCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest(new { message = "ID mismatch." });
        }

        try
        {
            var result = await _mediator.Send(command);
            if (!result)
            {
                return NotFound(new { message = "Medication not found." });
            }
            return Ok(new { message = "Medication updated successfully." });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            // Log the exception
            return BadRequest(new { message = "An error occurred while updating the medication." });
        }
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteMedication(Guid id)
    {
        try
        {
            var command = new DeleteMedicationCommand(id);
            var result = await _mediator.Send(command);
            if (!result)
            {
                return NotFound(new { message = "Medication not found." });
            }
            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            // Log the exception
            return BadRequest(new { message = "An error occurred while deleting the medication." });
        }
    }
}
