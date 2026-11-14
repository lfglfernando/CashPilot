using Microsoft.EntityFrameworkCore;
using CashPilot.Models;

namespace CashPilot.Data
{
    public class CashPilotContext : DbContext
    {
        public CashPilotContext(DbContextOptions options) : base(options) { }
        public DbSet<Transaction> Transactions { get; set; } = null!;
        public DbSet<TransactionCategory> TransactionCategories { get; set; } = null!;
    }
}
