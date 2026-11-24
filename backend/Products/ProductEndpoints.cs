using System.Security.Claims;
using System.Text.Json.Serialization;
using CashPilot.Calculators;
using CashPilot.Data;
using CashPilot.Models;
using Microsoft.EntityFrameworkCore;

namespace CashPilot.Products;

public static class ProductEndpoints
{
    public static void MapProductEndpoints(this WebApplication app)
    {
        var products = app.MapGroup("/api/products")
            .RequireAuthorization()
            .WithTags("Products");

        products.MapGet("/", async (CashPilotContext db, ClaimsPrincipal user) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId is null) return Results.Unauthorized();

            var saved = await db.Products.AsNoTracking()
                .Where(product => product.UserId == userId).ToListAsync();

            // Calculate and sort in memory: SQLite cannot order decimal expressions.
            return Results.Ok(saved.Select(ToResponse)
                .OrderByDescending(product => product.ProfitMarginPercent)
                .ThenByDescending(product => product.ProfitPerUnit)
                .ThenBy(product => product.Name, StringComparer.OrdinalIgnoreCase)
                .ThenBy(product => product.Id));
        });

        products.MapGet("/{id:guid}", async (Guid id, CashPilotContext db, ClaimsPrincipal user) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId is null) return Results.Unauthorized();

            var product = await db.Products.AsNoTracking()
                .SingleOrDefaultAsync(product => product.Id == id && product.UserId == userId);
            return product is null ? Results.NotFound() : Results.Ok(ToResponse(product));
        });

        products.MapPost("/", async (ProductRequest request, CashPilotContext db, ClaimsPrincipal user) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId is null) return Results.Unauthorized();

            var errors = Validate(request);
            if (errors.Count > 0) return Results.ValidationProblem(errors);

            var product = new Product
            {
                Name = request.Name!.Trim(),
                SellingPrice = request.SellingPrice!.Value,
                CostPrice = request.CostPrice!.Value,
                UserId = userId
            };
            db.Products.Add(product);
            await db.SaveChangesAsync();
            return Results.Created($"/api/products/{product.Id}", ToResponse(product));
        });

        products.MapPut("/{id:guid}", async (Guid id, ProductRequest request, CashPilotContext db, ClaimsPrincipal user) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId is null) return Results.Unauthorized();

            var product = await db.Products
                .SingleOrDefaultAsync(product => product.Id == id && product.UserId == userId);
            if (product is null) return Results.NotFound();

            var errors = Validate(request);
            if (errors.Count > 0) return Results.ValidationProblem(errors);

            product.Name = request.Name!.Trim();
            product.SellingPrice = request.SellingPrice!.Value;
            product.CostPrice = request.CostPrice!.Value;
            await db.SaveChangesAsync();
            return Results.Ok(ToResponse(product));
        });

        products.MapDelete("/{id:guid}", async (Guid id, CashPilotContext db, ClaimsPrincipal user) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId is null) return Results.Unauthorized();

            var product = await db.Products
                .SingleOrDefaultAsync(product => product.Id == id && product.UserId == userId);
            if (product is null) return Results.NotFound();

            db.Products.Remove(product);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }

    private static Dictionary<string, string[]> Validate(ProductRequest request)
    {
        var errors = ProductProfitCalculator.ValidatePrices(request.SellingPrice, request.CostPrice);
        if (string.IsNullOrWhiteSpace(request.Name))
            errors["name"] = ["Product name is required."];
        else if (request.Name.Trim().Length > 120)
            errors["name"] = ["Product name must be no longer than 120 characters."];
        return errors;
    }

    private static ProductResponse ToResponse(Product product)
    {
        var result = ProductProfitCalculator.GetResult(product.SellingPrice, product.CostPrice);
        return new ProductResponse(product.Id, product.Name, result.SellingPrice, result.CostPrice,
            result.ProfitPerUnit, result.ProfitMarginPercent);
    }
}

public sealed record ProductRequest(
    string? Name,
    [property: JsonNumberHandling(JsonNumberHandling.Strict)] decimal? SellingPrice,
    [property: JsonNumberHandling(JsonNumberHandling.Strict)] decimal? CostPrice);

public sealed record ProductResponse(
    Guid Id, string Name, decimal SellingPrice, decimal CostPrice,
    decimal ProfitPerUnit, decimal ProfitMarginPercent);
