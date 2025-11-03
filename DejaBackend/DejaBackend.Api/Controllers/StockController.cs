using DejaBackend.Application.Interfaces;
using DejaBackend.Application.Stock.Commands.AddStockEntry;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/stock")]
public class StockController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public StockController(IMediator mediator, IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _mediator = mediator;
        _db = db;
        _currentUser = currentUser;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetStock()
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId == null)
        {
            return Unauthorized();
        }

        var userId = _currentUser.UserId.Value;

        var items = await _db.Medications
            .AsNoTracking()
            .Include(m => m.Patient)
            .Include(m => m.Movements)
            .Where(m => m.OwnerId == userId)
            .Select(m => new
            {
                id = m.Id,
                medication = m.Name + " " + m.Dosage + m.Unit,
                medicationId = m.Id,
                patient = m.Patient != null ? m.Patient.Name : string.Empty,
                current = m.CurrentStock,
                dailyConsumption = m.DailyConsumption,
                daysLeft = m.DaysLeft,
                estimatedEndDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(m.DaysLeft)).ToString("yyyy-MM-dd"),
                boxQuantity = m.BoxQuantity,
                unit = m.Unit,
                status = m.Status.ToString().ToLower(),
                movements = m.Movements
                    .OrderByDescending(x => x.Date)
                    .Take(50)
                    .Select(x => new { type = x.Type == DejaBackend.Domain.Enums.StockMovementType.In ? "in" : "out", quantity = x.Quantity, date = x.Date.ToString("yyyy-MM-dd"), source = x.Source })
                    .ToList(),
                ownerId = userId
            })
            .ToListAsync();

        return Ok(items);
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
