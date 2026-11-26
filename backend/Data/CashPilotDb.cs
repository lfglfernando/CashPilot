
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using CashPilot.Models;

namespace CashPilot.Data
{
    public class CashPilotContext : IdentityDbContext<ApplicationUser>
    {
        public CashPilotContext(DbContextOptions<CashPilotContext> options)
            : base(options)
        {
        }

        public DbSet<Transaction> Transactions { get; set; } = null!;

        public DbSet<TransactionCategory> TransactionCategories { get; set; } = null!;

        public DbSet<Product> Products { get; set; } = null!;
    }
}
