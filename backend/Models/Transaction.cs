using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using CashPilot.Data;

namespace CashPilot.Models
{
    public class Transaction
    {
        [Key]
        public long? Id { get; set; }
        public DateTime? Time { get; set; }
        public string? Type { get; set; } // "Income" or "Expense"
        public int? CategoryId { get; set; }
        public TransactionCategory? Category { get; set; }
        public string? Description { get; set; }
        public double? Amount { get; set; }
        public static void MapRoutes(ref WebApplication app)
        {
            app.MapGet("/transaction/{id}", async (CashPilotContext db, long id) => await db.Transactions.FindAsync(id));
            app.MapGet("/transaction/all", async (CashPilotContext db) =>
            {
                var transactions = await db.Transactions.ToListAsync();
                var categories = await db.TransactionCategories.ToListAsync();
                var query = transactions
                    .GroupJoin(
                        categories,
                        transaction => transaction.CategoryId,
                        category => category.Id,
                        (transaction, categoryList) => new { transaction, subgroup = categoryList })
                    .SelectMany(
                        joinedSet => joinedSet.subgroup.DefaultIfEmpty(),
                        (t, c) => new
                        {
                            id = t.transaction.Id,
                            time = t.transaction.Time,
                            type = t.transaction.Type,
                            categoryId = c?.Id,
                            category = c?.Category,
                            description = t.transaction.Description,
                            amount = t.transaction.Amount
                        });
                return query;
            });
            app.MapPost("/transaction/new", async (CashPilotContext db, Transaction transaction) =>
            {
                bool required =
                    transaction.Time is not null &&
                    (transaction.Type == "Income" || transaction.Type == "Expense") &&
                    transaction.Amount is not null;
                
                if (required)
                {
                    await db.Transactions.AddAsync(transaction);
                    await db.SaveChangesAsync();
                    return Results.Created();
                }
                else
                    return Results.BadRequest();
            });
            app.MapPut("/transaction/{id}", async (CashPilotContext db, Transaction update, long id) =>
            {
                var transaction = await db.Transactions.FindAsync(id);
                if (transaction is null)
                    return Results.NotFound();
                transaction.Time = update.Time ?? transaction.Time;
                transaction.Type = update.Type ?? transaction.Type;
                transaction.CategoryId = update.CategoryId ?? transaction.CategoryId;
                transaction.Category = update.Category ?? transaction.Category;
                transaction.Description = update.Description ?? transaction.Description;
                transaction.Amount = update.Amount ?? transaction.Amount;
                await db.SaveChangesAsync();
                return Results.NoContent();
            });
            app.MapDelete("/transaction/{id}", async (CashPilotContext db, long id) =>
            {
                var transaction = await db.Transactions.FindAsync(id);
                if (transaction is null)
                    return Results.NotFound();
                db.Transactions.Remove(transaction);
                await db.SaveChangesAsync();
                return Results.NoContent();
            });
        }
    }

    public class TransactionCategory
    {
        [Key]
        public int? Id { get; set; }
        public string? Category { get; set; }
        public static void MapRoutes(ref WebApplication app)
        {
            app.MapGet("/transcat/{id}", async (CashPilotContext db, int id) => await db.TransactionCategories.FindAsync(id));
            app.MapGet("/transcat/all", async (CashPilotContext db) => await db.TransactionCategories.ToListAsync());
            app.MapPost("/transcat/new", async (CashPilotContext db, TransactionCategory category) =>
            {
                if (category.Category is not null)
                {
                    await db.TransactionCategories.AddAsync(category);
                    await db.SaveChangesAsync();
                    return Results.Created();
                }
                else
                    return Results.BadRequest();
            });
            app.MapPut("/transcat/{id}", async (CashPilotContext db, TransactionCategory update, int id) =>
            {
                var category = await db.TransactionCategories.FindAsync(id);
                if (category is null)
                    return Results.NotFound();
                category.Category = update.Category ?? category.Category;
                await db.SaveChangesAsync();
                return Results.NoContent();
            });
            app.MapDelete("/transcat/{id}", async (CashPilotContext db, int id) =>
            {
                var category = await db.TransactionCategories.FindAsync(id);
                if (category is null)
                    return Results.NotFound();
                db.TransactionCategories.Remove(category);
                await db.SaveChangesAsync();
                return Results.NoContent();
            });
        }
    }
}
