import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import styles from "./ForgotPassword.module.scss";
import API_BASE_URL from "../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to process your request.");
      }

      setMessage(data.message);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.forgotPage}>
      <section className={styles.welcomeSection}>
        <Link to="/" className={styles.logo}>
          CashPilot
        </Link>

        <div className={styles.welcomeContent}>
          <span className={styles.eyebrow}>
            YOUR BUSINESS. YOUR NUMBERS.
          </span>

          <h1>
            Secure access
            <br />
            to your finances.
          </h1>

          <p>
            Your business financial information deserves privacy and security.
            We are here to help you regain access to your account.
          </p>
        </div>

        <p className={styles.footerText}>
          CashPilot – Small Business Financial Dashboard
        </p>
      </section>

      <section className={styles.formSection}>
        <div className={styles.formCard}>
          <h2>Forgot Password?</h2>

          <p>
            Enter the email address associated with your CashPilot account.
            If a recovery email is configured, we will send you a reset link.
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Account Email</label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your account email"
              autoComplete="email"
              required
            />

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          {message && (
            <p className={styles.message} role="status">
              {message}
            </p>
          )}

          <div className={styles.backLink}>
            <Link to="/login">Back to Login</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ForgotPassword;
