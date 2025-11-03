using DejaBackend.Application.Patients.Commands.AddPatient;
using DejaBackend.Application.Patients.Commands.DeletePatient;
using DejaBackend.Application.Patients.Commands.SharePatient;
using DejaBackend.Application.Patients.Commands.UpdatePatient;
using DejaBackend.Application.Patients.Queries.GetPatients;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DejaBackend.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/patients")]
public class PatientsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PatientsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetPatients()
    {
        var query = new GetPatientsQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> AddPatient([FromBody] AddPatientCommand command)
    {
        try
        {
            var patientId = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetPatients), new { id = patientId }, patientId);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            // Log the exception
            return BadRequest(new { message = "An error occurred while adding the patient." });
        }
    }
    
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdatePatient(Guid id, [FromBody] UpdatePatientCommand command)
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
                return NotFound(new { message = "Patient not found." });
            }
            return Ok(new { message = "Patient updated successfully." });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            // Log the exception
            return BadRequest(new { message = "An error occurred while updating the patient." });
        }
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeletePatient(Guid id)
    {
        try
        {
            var command = new DeletePatientCommand(id);
            var result = await _mediator.Send(command);
            if (!result)
            {
                return NotFound(new { message = "Patient not found." });
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
            return BadRequest(new { message = "An error occurred while deleting the patient." });
        }
    }

    [HttpPost("{id}/share")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SharePatient(Guid id, [FromBody] SharePatientCommand command)
    {
        if (id != command.PatientId)
        {
            return BadRequest(new { message = "ID mismatch." });
        }

        try
        {
            var result = await _mediator.Send(command);
            if (!result)
            {
                return NotFound(new { message = "Patient not found." });
            }
            return Ok(new { message = "Patient shared successfully." });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            // Frontend expects specific messages for "Representative not found" and "You cannot share with yourself"
            if (ex.Message.Contains("Representative not found") || ex.Message.Contains("You cannot share with yourself"))
            {
                return BadRequest(new { message = ex.Message });
            }
            
            // Log the exception
            return BadRequest(new { message = "An error occurred while sharing the patient." });
        }
    }
}
