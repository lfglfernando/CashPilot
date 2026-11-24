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
        public string? Type { get; set; }
        public int? CategoryId { get; set; }
        public TransactionCategory? Category { get; set; }
        public string? UserId { get; set; }
        public ApplicationUser? User { get; set; }
        public string? Description { get; set; }
        public double? Amount { get; set; }

        public static void MapRoutes(ref WebApplication app)
        {
            // GET: Get one transaction belonging to the authenticated user
            app.MapGet("/transaction/{id}", async (
                CashPilotContext db,
                long id,
                System.Security.Claims.ClaimsPrincipal user) =>
            {
                var userId = user.FindFirst(
                    System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

                var transaction = await db.Transactions
                    .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

                return transaction is null
                    ? Results.NotFound()
                    : Results.Ok(transaction);
            }).RequireAuthorization();

            // GET: Get all transactions belonging to the authenticated user
            app.MapGet("/transaction/all", async (
                CashPilotContext db,
                System.Security.Claims.ClaimsPrincipal user) =>
            {
                var userId = user.FindFirst(
                    System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

                var transactions = await db.Transactions
                    .Where(t => t.UserId == userId)
                    .Select(t => new
                    {
                        id = t.Id,
                        time = t.Time,
                        type = t.Type,
                        categoryId = t.CategoryId,
                        category = t.Category != null ? t.Category.Category : null,
                        description = t.Description,
                        amount = t.Amount
                    })
                    .ToListAsync();

                return Results.Ok(transactions);
            }).RequireAuthorization();

            // POST: Create a transaction for the authenticated user
            app.MapPost("/transaction/new", async (
                CashPilotContext db,
                Transaction transaction,
                System.Security.Claims.ClaimsPrincipal user) =>
            {
                var userId = user.FindFirst(
                    System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

                bool required =
                    transaction.Time is not null &&
                    (transaction.Type == "Income" || transaction.Type == "Expense") &&
                    transaction.Amount is not null &&
                    userId is not null;

                if (!required)
                    return Results.BadRequest();

                transaction.Id = null;
                transaction.UserId = userId;
                transaction.User = null;
                transaction.Category = null;

                await db.Transactions.AddAsync(transaction);
                await db.SaveChangesAsync();

                return Results.Created($"/transaction/{transaction.Id}", transaction);
            }).RequireAuthorization();

            // PUT: Update only a transaction belonging to the authenticated user
            app.MapPut("/transaction/{id}", async (
                CashPilotContext db,
                Transaction update,
                long id,
                System.Security.Claims.ClaimsPrincipal user) =>
            {
                var userId = user.FindFirst(
                    System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

                var transaction = await db.Transactions
                    .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

                if (transaction is null)
                    return Results.NotFound();

                if (update.Type is not null &&
                    update.Type != "Income" &&
                    update.Type != "Expense")
                    return Results.BadRequest();

                transaction.Time = update.Time ?? transaction.Time;
                transaction.Type = update.Type ?? transaction.Type;
                transaction.CategoryId = update.CategoryId ?? transaction.CategoryId;
                transaction.Description = update.Description ?? transaction.Description;
                transaction.Amount = update.Amount ?? transaction.Amount;

                await db.SaveChangesAsync();

                return Results.NoContent();
            }).RequireAuthorization();

            // DELETE: Delete only a transaction belonging to the authenticated user
            app.MapDelete("/transaction/{id}", async (
                CashPilotContext db,
                long id,
                System.Security.Claims.ClaimsPrincipal user) =>
            {
                var userId = user.FindFirst(
                    System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

                var transaction = await db.Transactions
                    .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

                if (transaction is null)
                    return Results.NotFound();

                db.Transactions.Remove(transaction);
                await db.SaveChangesAsync();

                return Results.NoContent();
            }).RequireAuthorization();
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
