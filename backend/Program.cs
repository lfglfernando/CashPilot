using Microsoft.EntityFrameworkCore;
using CashPilot.Data;
using CashPilot.Models;
using CashPilot.Calculators;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddEndpointsApiExplorer();

if (builder.Environment.IsDevelopment())
{
    builder.Services.AddDbContext<CashPilotContext>(options =>
        options.UseSqlite(connectionString)
    );
}
else if (builder.Environment.IsProduction())
{
    builder.Services.AddDbContext<CashPilotContext>(options =>
        options.UseNpgsql(connectionString)
    );
}

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    options.AddPolicy("ProductProfit", policy =>
    {
        var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
        policy.WithOrigins(origins).WithMethods("POST").WithHeaders("Content-Type");
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors();

// Api Stuff Below

// Transactions
TransactionCategory.MapRoutes(ref app);
Transaction.MapRoutes(ref app);

app.MapProductProfitCalculator();

// Api Stuff Above

if (app.Environment.IsDevelopment())
{
    await SeedData.InitDb(app.Services);
}

app.Run();
