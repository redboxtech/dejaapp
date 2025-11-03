using DejaBackend.Application.Stock.Commands.AddStockEntry;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DejaBackend.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/stock")]
public class StockController : ControllerBase
{
    private readonly IMediator _mediator;

    public StockController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("entry")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddStockEntry([FromBody] AddStockEntryCommand command)
    {
        try
        {
            var result = await _mediator.Send(command);
            if (!result)
            {
                return NotFound(new { message = "Medication not found." });
            }
            return Ok(new { message = "Stock entry added successfully." });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            // Log the exception
            return BadRequest(new { message = "An error occurred while adding stock entry." });
        }
    }
}
