using DejaBackend.Application.Replenishment.Commands.ApproveReplenishmentRequest;
using DejaBackend.Application.Replenishment.Commands.CreateReplenishmentRequest;
using DejaBackend.Application.Replenishment.Commands.RejectReplenishmentRequest;
using DejaBackend.Application.Replenishment.Queries.GetReplenishmentRequests;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DejaBackend.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/replenishment")]
public class ReplenishmentController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReplenishmentController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetRequests()
    {
        var query = new GetReplenishmentRequestsQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateRequest([FromBody] CreateReplenishmentRequestCommand command)
    {
        try
        {
            var requestId = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetRequests), new { id = requestId }, requestId);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception)
        {
            return BadRequest(new { message = "An error occurred while creating the request." });
        }
    }

    [HttpPost("{id}/approve")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ApproveRequest(Guid id, [FromBody] ApproveReplenishmentRequestCommand command)
    {
        if (id != command.RequestId)
        {
            return BadRequest(new { message = "ID mismatch." });
        }

        try
        {
            var result = await _mediator.Send(command);
            if (!result)
            {
                return NotFound(new { message = "Request not found." });
            }
            return Ok(new { message = "Request approved and stock updated." });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception)
        {
            return BadRequest(new { message = "An error occurred while approving the request." });
        }
    }

    [HttpPost("{id}/reject")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RejectRequest(Guid id)
    {
        try
        {
            var command = new RejectReplenishmentRequestCommand(id);
            var result = await _mediator.Send(command);
            if (!result)
            {
                return NotFound(new { message = "Request not found." });
            }
            return Ok(new { message = "Request rejected." });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception)
        {
            return BadRequest(new { message = "An error occurred while rejecting the request." });
        }
    }
}
