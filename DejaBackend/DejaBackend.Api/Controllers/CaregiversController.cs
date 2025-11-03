using DejaBackend.Application.Interfaces;
using DejaBackend.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/caregivers")]
public class CaregiversController : ControllerBase
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CaregiversController(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public record CaregiverDto(Guid Id, string Name, string Email, string Phone, List<Guid> Patients, string AddedAt, string Status);
    public record CreateCaregiverRequest(string Name, string Email, string Phone, List<Guid> Patients);

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        if (!_currentUser.UserId.HasValue) return Unauthorized();
        var ownerId = _currentUser.UserId.Value;
        var list = await _db.Caregivers.AsNoTracking()
            .Where(c => c.OwnerId == ownerId)
            .ToListAsync();
        var dtos = list.Select(c => new CaregiverDto(c.Id, c.Name, c.Email, c.Phone, c.Patients, c.AddedAt.ToString("yyyy-MM-dd"), c.Status.ToString().ToLower())).ToList();
        return Ok(dtos);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCaregiverRequest req)
    {
        if (!_currentUser.UserId.HasValue) return Unauthorized();
        var ownerId = _currentUser.UserId.Value;

        var entity = new Caregiver(req.Name, req.Email, req.Phone, req.Patients ?? new List<Guid>(), ownerId);
        _db.Caregivers.Add(entity);
        await _db.SaveChangesAsync(HttpContext.RequestAborted);
        return CreatedAtAction(nameof(Get), new { id = entity.Id }, entity.Id);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (!_currentUser.UserId.HasValue) return Unauthorized();
        var ownerId = _currentUser.UserId.Value;
        var entity = await _db.Caregivers.FirstOrDefaultAsync(c => c.Id == id && c.OwnerId == ownerId);
        if (entity == null) return NotFound();
        _db.Caregivers.Remove(entity);
        await _db.SaveChangesAsync(HttpContext.RequestAborted);
        return NoContent();
    }
}


