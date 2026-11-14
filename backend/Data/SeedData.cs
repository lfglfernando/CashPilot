using Microsoft.EntityFrameworkCore;
using CashPilot.Models;

namespace CashPilot.Data
{
    public static class SeedData
    {
        public static async Task InitDb(IServiceProvider services)
        {
            using var scope = services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<CashPilotContext>();
            await db.Database.MigrateAsync();

            // Transaction Categories - Such as "Food" or "Maintenance"
            TransactionCategory[] transactionCategories = [
                new TransactionCategory { Id = 1, Category = "Payment" },
                new TransactionCategory { Id = 2, Category = "Rent" },
                new TransactionCategory { Id = 3, Category = "Utilities" },
                new TransactionCategory { Id = 4, Category = "Maintenance" }
            ];

            if (transactionCategories.Any() && !await db.TransactionCategories.AnyAsync())
            {
                foreach (var category in transactionCategories)
                {
                    await db.TransactionCategories.AddAsync(category);
                }
                await db.SaveChangesAsync();
            }

            // Transactions
            Transaction[] transactions = [
                new Transaction {
                    Id = 1,
                    Time = DateTime.Parse("2026-11-06T13:05:33"),
                    Type = "Income",
                    CategoryId = 1,
                    Description = "Payment -- Order from Mr. Smith",
                    Amount = 2341.56
                },
                new Transaction {
                    Id = 2,
                    Time = DateTime.Parse("2026-11-09T09:27:56"),
                    Type = "Expense",
                    CategoryId = 4,
                    Description = "Office roof repair",
                    Amount = 827
                }
            ];

            if (transactions.Any() && !await db.Transactions.AnyAsync())
            {
                foreach (var transaction in transactions)
                {
                    await db.Transactions.AddAsync(transaction);
                }
                await db.SaveChangesAsync();
            }
        }
    }
}
