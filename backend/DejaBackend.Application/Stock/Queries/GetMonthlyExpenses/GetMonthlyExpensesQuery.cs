using MediatR;

namespace DejaBackend.Application.Stock.Queries.GetMonthlyExpenses;

public record GetMonthlyExpensesQuery : IRequest<decimal>;

