
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace CashPilot.Services;

public class EmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmailAsync(
        string recipient,
        string subject,
        string htmlBody)
    {
        var senderEmail = _configuration["EmailSettings:SenderEmail"];
        var appPassword = _configuration["EmailSettings:AppPassword"];

        if (string.IsNullOrWhiteSpace(senderEmail) ||
            string.IsNullOrWhiteSpace(appPassword))
        {
            throw new InvalidOperationException(
                "Email settings are not configured."
            );
        }

        var email = new MimeMessage();

        email.From.Add(
            new MailboxAddress("CashPilot", senderEmail)
        );

        email.To.Add(
            MailboxAddress.Parse(recipient)
        );

        email.Subject = subject;

        email.Body = new BodyBuilder
        {
            HtmlBody = htmlBody
        }.ToMessageBody();

        using var client = new SmtpClient();

        await client.ConnectAsync(
            "smtp.gmail.com",
            587,
            SecureSocketOptions.StartTls
        );

        await client.AuthenticateAsync(
            senderEmail,
            appPassword
        );

        await client.SendAsync(
    new SmtpSendRequest(email),
    CancellationToken.None
);

        await client.DisconnectAsync(true);
    }
}
