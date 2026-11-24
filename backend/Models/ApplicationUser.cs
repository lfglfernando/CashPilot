
using Microsoft.AspNetCore.Identity;

namespace CashPilot.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string? FullName { get; set; }

        public string? RecoveryEmail { get; set; }

        public string? ProfilePhoto { get; set; }
    }
}

