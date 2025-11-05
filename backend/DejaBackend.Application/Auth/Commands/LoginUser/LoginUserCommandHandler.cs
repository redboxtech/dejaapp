using DejaBackend.Application.Interfaces;
using MediatR;

namespace DejaBackend.Application.Auth.Commands.LoginUser;

public class LoginUserCommandHandler : IRequestHandler<LoginUserCommand, LoginUserResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtService _jwtService;

    public LoginUserCommandHandler(IUserRepository userRepository, IJwtService jwtService)
    {
        _userRepository = userRepository;
        _jwtService = jwtService;
    }

    public async Task<LoginUserResponse> Handle(LoginUserCommand request, CancellationToken cancellationToken)
    {
        // 1. Find user by email
        var user = await _userRepository.GetByEmailAsync(request.Email);

        if (user == null)
        {
            return new LoginUserResponse(false, null, "Invalid credentials.");
        }

        // 2. Check password
        var passwordValid = await _userRepository.CheckPasswordAsync(user, request.Password);

        if (!passwordValid)
        {
            return new LoginUserResponse(false, null, "Invalid credentials.");
        }

        // 3. Generate JWT token
        var token = _jwtService.GenerateToken(user);

        return new LoginUserResponse(true, token, null);
    }
}
