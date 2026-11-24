using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace CashPilot.Models;

public class Product
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [MaxLength(120)]
    public required string Name { get; set; }

    [Precision(12, 2)]
    public decimal SellingPrice { get; set; }

    [Precision(12, 2)]
    public decimal CostPrice { get; set; }

    public required string UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;
}
