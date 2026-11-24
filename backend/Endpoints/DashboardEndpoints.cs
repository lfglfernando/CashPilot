
using Microsoft.EntityFrameworkCore;
using CashPilot.Data;

namespace CashPilot.Endpoints
{
    public static class DashboardEndpoints
    {
        public static void MapRoutes(this WebApplication app)
        {
            // Monthly dashboard summary
            app.MapGet("/api/dashboard/summary",
                async (CashPilotContext db, int year, int month) =>
            {
                if (month < 1 || month > 12)
                    return Results.BadRequest("Month must be between 1 and 12.");

                var startDate = new DateTime(year, month, 1);
                var endDate = startDate.AddMonths(1);

                var transactions = await db.Transactions
                    .Where(t => t.Time >= startDate && t.Time < endDate)
                    .ToListAsync();

                decimal revenue = transactions
                    .Where(t => t.Type == "Income")
                    .Sum(t => t.Amount ?? 0m);

                decimal expenses = transactions
                    .Where(t => t.Type == "Expense")
                    .Sum(t => t.Amount ?? 0m);

                decimal netProfit = revenue - expenses;

                decimal profitMargin = revenue > 0
                    ? Math.Round((netProfit / revenue) * 100, 2)
                    : 0m;

                return Results.Ok(new
                {
                    year,
                    month,
                    totalRevenue = revenue,
                    totalExpenses = expenses,
                    netProfit,
                    profitMargin
                });
            });

            // Monthly Profit and Loss report
            app.MapGet("/api/dashboard/monthly-profit-loss",
                async (CashPilotContext db, int year) =>
            {
                var startDate = new DateTime(year, 1, 1);
                var endDate = startDate.AddYears(1);

                var transactions = await db.Transactions
                    .Where(t => t.Time >= startDate && t.Time < endDate)
                    .ToListAsync();

                var monthlyReport = Enumerable.Range(1, 12)
                    .Select(month =>
                    {
                        var monthlyTransactions = transactions
                            .Where(t => t.Time!.Value.Month == month);

                        decimal revenue = monthlyTransactions
                            .Where(t => t.Type == "Income")
                            .Sum(t => t.Amount ?? 0m);

                        decimal expenses = monthlyTransactions
                            .Where(t => t.Type == "Expense")
                            .Sum(t => t.Amount ?? 0m);

                        return new
                        {
                            month,
                            revenue,
                            expenses,
                            netProfit = revenue - expenses
                        };
                    });

                return Results.Ok(new
                {
                    year,
                    months = monthlyReport
                });
            });
        }
    }
}
