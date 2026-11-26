using Microsoft.AspNetCore.Http.HttpResults;
using System.Text.Json.Serialization;

namespace CashPilot.Calculators;

public static class ProductProfitCalculator
{
    private const decimal MaximumPrice = 1_000_000_000m;

    public static void MapProductProfitCalculator(this WebApplication app)
    {
        app.MapPost("/api/calculators/product-profit", Calculate)
            .RequireAuthorization()
            .RequireCors("ProductProfit")
            .WithName("CalculateProductProfit")
            .WithTags("Calculators")
            .WithSummary("Calculate profit per unit and profit margin from a selling price and cost.");
    }

    private static Results<Ok<ProductProfitResponse>, ValidationProblem> Calculate(ProductProfitRequest request)
    {
        var errors = ValidatePrices(request.SellingPrice, request.CostPrice);

        if (errors.Count > 0)
        {
            return TypedResults.ValidationProblem(errors);
        }

        return TypedResults.Ok(GetResult(request.SellingPrice!.Value, request.CostPrice!.Value));
    }

    internal static Dictionary<string, string[]> ValidatePrices(decimal? sellingPrice, decimal? costPrice)
    {
        var errors = new Dictionary<string, string[]>();
        ValidatePrice(sellingPrice, "sellingPrice", "Selling price", 0.01m, errors);
        ValidatePrice(costPrice, "costPrice", "Cost price", 0m, errors);
        return errors;
    }

    internal static ProductProfitResponse GetResult(decimal sellingPrice, decimal costPrice)
    {
        var profitPerUnit = sellingPrice - costPrice;
        var profitMarginPercent = decimal.Round(profitPerUnit / sellingPrice * 100m, 2, MidpointRounding.AwayFromZero);

        return new ProductProfitResponse(sellingPrice, costPrice, profitPerUnit, profitMarginPercent);
    }

    private static void ValidatePrice(
        decimal? value,
        string field,
        string label,
        decimal minimum,
        Dictionary<string, string[]> errors)
    {
        if (value is null)
        {
            errors[field] = [$"{label} is required."];
        }
        else if (value < minimum || value > MaximumPrice)
        {
            errors[field] = [minimum == 0m
                ? $"{label} must be between 0 and 1,000,000,000."
                : $"{label} must be between 0.01 and 1,000,000,000."];
        }
        else if (decimal.Round(value.Value, 2) != value.Value)
        {
            errors[field] = [$"{label} must have no more than two decimal places."];
        }
    }
}

public sealed record ProductProfitRequest(
    [property: JsonNumberHandling(JsonNumberHandling.Strict)] decimal? SellingPrice,
    [property: JsonNumberHandling(JsonNumberHandling.Strict)] decimal? CostPrice);

public sealed record ProductProfitResponse(
    decimal SellingPrice,
    decimal CostPrice,
    decimal ProfitPerUnit,
    decimal ProfitMarginPercent);
