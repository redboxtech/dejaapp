using DejaBackend.Application.Auth.Commands.LoginUser;
using DejaBackend.Application.Auth.Commands.RegisterUser;
using DejaBackend.Application.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DejaBackend.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public AuthController(IMediator mediator, IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _mediator = mediator;
        _db = db;
        _currentUser = currentUser;
    }

    [HttpPost("register")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterUserCommand command)
    {
        var result = await _mediator.Send(command);

        if (!result.Success)
        {
            return BadRequest(new { message = result.ErrorMessage });
        }

        return Ok(new { token = result.Token });
    }

    [HttpPost("login")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Login([FromBody] LoginUserCommand command)
    {
        var result = await _mediator.Send(command);

        if (!result.Success)
        {
            return BadRequest(new { message = result.ErrorMessage });
        }

        return Ok(new { token = result.Token });
    }

    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Me()
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId == null)
        {
            return Unauthorized();
        }

        var user = await _db.Users.FindAsync(_currentUser.UserId.Value);
        if (user != null)
        {
            return Ok(new { id = user.Id, name = user.Name, email = user.Email });
        }

        // fallback para claims do token
        var claims = HttpContext.User;
        var id = claims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var email = claims.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value ?? string.Empty;
        var name = claims.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value ?? string.Empty;
        if (Guid.TryParse(id, out var guid))
        {
            return Ok(new { id = guid, name, email });
        }
        return Unauthorized();
    }
}
