using DejaBackend.Application.Representatives.Commands.AddRepresentative;
using DejaBackend.Application.Representatives.Commands.DeleteRepresentative;
using DejaBackend.Application.Representatives.Queries.GetRepresentatives;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DejaBackend.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/representatives")]
public class RepresentativesController : ControllerBase
{
    private readonly IMediator _mediator;

    public RepresentativesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    public record CreateRepresentativeRequest(string Email);

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Get()
    {
        var query = new GetRepresentativesQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Create([FromBody] CreateRepresentativeRequest req)
    {
        try
        {
            var command = new AddRepresentativeCommand(req.Email);
            var representativeId = await _mediator.Send(command);
            return CreatedAtAction(nameof(Get), new { id = representativeId }, representativeId);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception)
        {
            return BadRequest(new { message = "An error occurred while adding the representative." });
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
            var command = new DeleteRepresentativeCommand(id);
            var result = await _mediator.Send(command);
            if (!result)
            {
                return NotFound(new { message = "Representative not found." });
            }
            return NoContent();
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception)
        {
            return BadRequest(new { message = "An error occurred while deleting the representative." });
        }
    }
}


