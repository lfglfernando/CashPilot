
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
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

// ASP.NET Core Identity
builder.Services
    .AddIdentityApiEndpoints<ApplicationUser>(options =>
    {
        options.User.RequireUniqueEmail = true;

        options.Password.RequiredLength = 8;
        options.Password.RequireDigit = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireNonAlphanumeric = false;
    })
    .AddEntityFrameworkStores<CashPilotContext>();

builder.Services.AddAuthorization();
// Allow the React frontend to communicate with the backend
builder.Services.AddCors(options =>
{
    options.AddPolicy("CashPilotFrontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// OpenAPI
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

// Configure HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors();

app.UseCors("CashPilotFrontend");
app.UseAuthentication();
app.UseAuthorization();

// Authentication endpoints
app.MapGroup("/auth").MapIdentityApi<ApplicationUser>();
// Custom registration endpoint
app.MapPost("/auth/register-custom", async (
    RegisterRequest request,
    UserManager<ApplicationUser> userManager) =>
{
    if (string.IsNullOrWhiteSpace(request.FullName) ||
        string.IsNullOrWhiteSpace(request.Email) ||
        string.IsNullOrWhiteSpace(request.Password))
    {
        return Results.BadRequest(new
        {
            message = "All fields are required."
        });
    }

    var user = new ApplicationUser
    {
        UserName = request.Email.Trim(),
        Email = request.Email.Trim(),
        FullName = request.FullName.Trim()
    };

    var result = await userManager.CreateAsync(user, request.Password);

    if (!result.Succeeded)
    {
        return Results.BadRequest(new
        {
            message = string.Join(" ", result.Errors.Select(error => error.Description))
        });
    }

    return Results.Ok(new
    {
        message = "Account created successfully."
    });
});

// User Profile
app.MapGet("/profile/me", async (
    UserManager<ApplicationUser> userManager,
    HttpContext context) =>
{
    var user = await userManager.GetUserAsync(context.User);

    if (user == null)
    {
        return Results.Unauthorized();
    }

    return Results.Ok(new
    {
        fullName = user.FullName,
        email = user.Email,
        phoneNumber = user.PhoneNumber,
        recoveryEmail = user.RecoveryEmail,
        profilePhoto = user.ProfilePhoto
    });
}).RequireAuthorization();


app.MapPut("/profile/me/photo", async (
    ProfilePhotoRequest request,
    UserManager<ApplicationUser> userManager,
    HttpContext context) =>
{
    var user = await userManager.GetUserAsync(context.User);

    if (user == null)
    {
        return Results.Unauthorized();
    }

    if (string.IsNullOrWhiteSpace(request.ProfilePhoto))
    {
        return Results.BadRequest(new
        {
            message = "A profile photo is required."
        });
    }

    if (!request.ProfilePhoto.StartsWith("data:image/") ||
        request.ProfilePhoto.Length > 3_000_000)
    {
        return Results.BadRequest(new
        {
            message = "Invalid image or image too large. Maximum size is 2 MB."
        });
    }

    user.ProfilePhoto = request.ProfilePhoto;

    var result = await userManager.UpdateAsync(user);

    if (!result.Succeeded)
    {
        return Results.BadRequest(new
        {
            message = "Unable to save profile photo."
        });
    }

    return Results.Ok(new
    {
        message = "Profile photo updated successfully."
    });
}).RequireAuthorization();

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
