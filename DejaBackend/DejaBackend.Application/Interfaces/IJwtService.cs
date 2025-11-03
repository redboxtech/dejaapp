using DejaBackend.Domain.Entities;

namespace DejaBackend.Application.Interfaces;

public interface IJwtService
{
    string GenerateToken(User user);
}
