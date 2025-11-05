using DejaBackend.Domain.Entities;

namespace DejaBackend.Application.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdAsync(Guid id);
    Task<bool> IsEmailUniqueAsync(string email);
    Task<bool> CheckPasswordAsync(User user, string password);
    Task<bool> CreateUserAsync(User user, string password);
    Task<bool> UpdateUserAsync(User user);
    Task<User?> GetUserByEmailAsync(string email);
}
