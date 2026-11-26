
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using CashPilot.Data;
using CashPilot.Models;
using CashPilot.Services;
using CashPilot.Endpoints;
using CashPilot.Calculators;

var builder = WebApplication.CreateBuilder(args);
//The CORS policy registration
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
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

builder.Services.AddTransient<EmailService>();
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

// Password Recovery
app.MapPost("/auth/forgot-password", async (
    ForgotPasswordRequest request,
    UserManager<ApplicationUser> userManager,
    EmailService emailService,
    IConfiguration configuration,
    ILogger<EmailService> logger) =>
{
    const string message =
        "If an account exists with a recovery email configured, a password reset link will be sent.";

    if (string.IsNullOrWhiteSpace(request.Email))
    {
        return Results.Ok(new { message });
    }

    var user = await userManager.FindByEmailAsync(request.Email.Trim());

    if (user == null || string.IsNullOrWhiteSpace(user.RecoveryEmail))
    {
        return Results.Ok(new { message });
    }

    try
    {
        var token = await userManager.GeneratePasswordResetTokenAsync(user);

        var baseUrl = configuration["Frontend:BaseUrl"];

        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            throw new InvalidOperationException(
                "Frontend base URL is not configured."
            );
        }

        var resetUrl =
            $"{baseUrl.TrimEnd('/')}/reset-password" +
            $"?email={Uri.EscapeDataString(user.Email!)}" +
            $"&token={Uri.EscapeDataString(token)}";

        var safeResetUrl =
            System.Net.WebUtility.HtmlEncode(resetUrl);

        var htmlBody = $"""
            <h2>Reset Your CashPilot Password</h2>
            <p>We received a request to reset your password.</p>
            <p>Click the link below to create a new password:</p>
            <p><a href="{safeResetUrl}">Reset My Password</a></p>
            <p>If you did not request this, you can ignore this email.</p>
            """;

        await emailService.SendEmailAsync(
            user.RecoveryEmail,
            "Reset Your CashPilot Password",
            htmlBody
        );
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Password recovery email could not be sent.");
    }

    return Results.Ok(new { message });
});

app.MapPost("/auth/reset-password", async (
    ResetPasswordRequest request,
    UserManager<ApplicationUser> userManager) =>
{
    if (string.IsNullOrWhiteSpace(request.Email) ||
        string.IsNullOrWhiteSpace(request.Token) ||
        string.IsNullOrWhiteSpace(request.NewPassword))
    {
        return Results.BadRequest(new
        {
            message = "All fields are required."
        });
    }

    var user = await userManager.FindByEmailAsync(request.Email.Trim());

    if (user == null)
    {
        return Results.BadRequest(new
        {
            message = "Invalid password reset request."
        });
    }

    var result = await userManager.ResetPasswordAsync(
        user,
        request.Token,
        request.NewPassword
    );

    if (!result.Succeeded)
    {
        return Results.BadRequest(new
        {
            message = string.Join(
                " ",
                result.Errors.Select(error => error.Description)
            )
        });
    }

    return Results.Ok(new
    {
        message = "Your password has been reset successfully."
    });
});

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
        profilePhoto = user.ProfilePhoto,
        twoFactorEnabled = user.TwoFactorEnabled
    });
}).RequireAuthorization();


app.MapPut("/profile/me", async (
    ProfileUpdateRequest request,
    UserManager<ApplicationUser> userManager,
    HttpContext context) =>
{
    var user = await userManager.GetUserAsync(context.User);

    if (user == null)
    {
        return Results.Unauthorized();
    }

    if (string.IsNullOrWhiteSpace(request.FullName))
    {
        return Results.BadRequest(new
        {
            message = "Full name is required."
        });
    }

    if (!string.IsNullOrWhiteSpace(request.RecoveryEmail) &&
        !System.Text.RegularExpressions.Regex.IsMatch(
            request.RecoveryEmail,
            @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
    {
        return Results.BadRequest(new
        {
            message = "Please enter a valid recovery email."
        });
    }

    user.FullName = request.FullName.Trim();
    user.PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber)
        ? null
        : request.PhoneNumber.Trim();

    user.RecoveryEmail = string.IsNullOrWhiteSpace(request.RecoveryEmail)
        ? null
        : request.RecoveryEmail.Trim();

    var result = await userManager.UpdateAsync(user);

    if (!result.Succeeded)
    {
        return Results.BadRequest(new
        {
            message = string.Join(" ", result.Errors.Select(error => error.Description))
        });
    }

    return Results.Ok(new
    {
        message = "Profile updated successfully."
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

//CORS policy middleware activation
app.UseCors("FrontendPolicy");


// Api Stuff Below

// Transactions
TransactionCategory.MapRoutes(ref app);
Transaction.MapRoutes(ref app);

//Dashboard Api Endpoint Route registration
DashboardEndpoints.MapRoutes(app);
app.MapProductProfitCalculator();

// Api Stuff Above

if (app.Environment.IsDevelopment())
{
    await SeedData.InitDb(app.Services);
}

app.Run();
