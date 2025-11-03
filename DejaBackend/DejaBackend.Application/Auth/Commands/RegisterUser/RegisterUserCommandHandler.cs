using DejaBackend.Application.Interfaces;
using DejaBackend.Domain.Entities;
using MediatR;

namespace DejaBackend.Application.Auth.Commands.RegisterUser;

public class RegisterUserCommandHandler : IRequestHandler<RegisterUserCommand, RegisterUserResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtService _jwtService;

    public RegisterUserCommandHandler(IUserRepository userRepository, IJwtService jwtService)
    {
        _userRepository = userRepository;
        _jwtService = jwtService;
    }

    public async Task<RegisterUserResponse> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        // 1. Check if email is unique
        if (!await _userRepository.IsEmailUniqueAsync(request.Email))
        {
            return new RegisterUserResponse(false, null, "Email already registered.");
        }

        // 2. Create User entity
        var user = new User(request.Name, request.Email, request.IsSelfElderly);

        // 3. Create user in Identity system (handles password hashing)
        var success = await _userRepository.CreateUserAsync(user, request.Password);

        if (!success)
        {
            return new RegisterUserResponse(false, null, "Failed to create user.");
        }

        // 4. Generate JWT token
        var token = _jwtService.GenerateToken(user);

        // 5. If user is self-elderly, automatically create a patient profile
        if (user.IsSelfElderly)
        {
            // This logic should ideally be handled by a domain event or a separate command,
            // but for simplicity and to match the frontend's immediate behavior, we'll
            // call a patient creation service/command here.
            // For now, we'll skip the automatic patient creation to keep the Auth module clean.
            // This will be added later in the Patient module implementation.
        }

        return new RegisterUserResponse(true, token, null);
    }
}
