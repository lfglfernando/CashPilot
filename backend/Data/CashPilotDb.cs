using Microsoft.EntityFrameworkCore;
using CashPilot.Models;

namespace CashPilot.Data
{
    public class CashPilotContext : DbContext
    {
        public CashPilotContext(DbContextOptions options) : base(options) { }
        public DbSet<Expense> Expenses { get; set; } = null!;
    }
}
