using DejaBackend.Application.Stock.Commands.AddStockEntry;
<<<<<<< HEAD:backend/DejaBackend.Api/Controllers/StockController.cs
using DejaBackend.Application.Stock.Queries.GetMonthlyExpenses;
=======
>>>>>>> master:DejaBackend/DejaBackend.Api/Controllers/StockController.cs
using DejaBackend.Application.Stock.Queries.GetStock;
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

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetStock()
    {
        var query = new GetStockQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
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
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception)
        {
            return BadRequest(new { message = "An error occurred while adding stock entry." });
        }
    }

    [HttpGet("monthly-expenses")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMonthlyExpenses()
    {
        try
        {
            var query = new GetMonthlyExpensesQuery();
            var result = await _mediator.Send(query);
            return Ok(new { total = result });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Erro ao buscar gastos mensais.", details = ex.Message });
        }
    }
}
