using DejaBackend.Application.Interfaces;
using DejaBackend.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DejaBackend.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/representatives")]
public class RepresentativesController : ControllerBase
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public RepresentativesController(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public record RepresentativeDto(Guid Id, string Name, string Email, string AddedAt, string Status);
    public record CreateRepresentativeRequest(string Email);

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        if (!_currentUser.UserId.HasValue) return Unauthorized();
        var ownerId = _currentUser.UserId.Value;
        var list = await _db.Representatives.AsNoTracking()
            .Where(r => r.OwnerId == ownerId)
            .ToListAsync();
        var dtos = list.Select(r => new RepresentativeDto(r.Id, r.Name, r.Email, r.AddedAt.ToString("yyyy-MM-dd"), r.Status.ToString().ToLower())).ToList();
        return Ok(dtos);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateRepresentativeRequest req)
    {
        if (!_currentUser.UserId.HasValue) return Unauthorized();
        var ownerId = _currentUser.UserId.Value;
        // try find user by email for name
        var existingUser = await _db.Users.FirstOrDefaultAsync(u => u.Email == req.Email);
        var name = existingUser?.Name ?? "Representante Convidado";
        var entity = new Representative(ownerId, name, req.Email);
        _db.Representatives.Add(entity);
        await _db.SaveChangesAsync(HttpContext.RequestAborted);
        return CreatedAtAction(nameof(Get), new { id = entity.Id }, entity.Id);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (!_currentUser.UserId.HasValue) return Unauthorized();
        var ownerId = _currentUser.UserId.Value;
        var entity = await _db.Representatives.FirstOrDefaultAsync(r => r.Id == id && r.OwnerId == ownerId);
        if (entity == null) return NotFound();
        _db.Representatives.Remove(entity);
        await _db.SaveChangesAsync(HttpContext.RequestAborted);
        return NoContent();
    }
}


