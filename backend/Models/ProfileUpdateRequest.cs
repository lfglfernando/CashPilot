
namespace CashPilot.Models
{
    public class ProfileUpdateRequest
    {
        public string FullName { get; set; } = string.Empty;

        public string? PhoneNumber { get; set; }

        public string? RecoveryEmail { get; set; }
    }
}
