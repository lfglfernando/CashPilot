import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import styles from "./ResetPassword.module.scss";
import API_BASE_URL from "../services/api";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!email || !token) {
      setMessage("Invalid or incomplete password reset link.");
      return;
    }

    if (password.length < 8) {
      setMessage("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            token,
            newPassword: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to reset your password."
        );
      }

      setIsSuccess(true);
      setMessage("Your password has been reset successfully.");
      setPassword("");
      setConfirmPassword("");
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
    <main className={styles.resetPage}>
      <section className={styles.welcomeSection}>
        <Link to="/" className={styles.logo}>
          CashPilot
        </Link>

        <div className={styles.welcomeContent}>
          <span className={styles.eyebrow}>
            YOUR BUSINESS. YOUR NUMBERS.
          </span>

          <h1>
            A fresh start
            <br />
            begins here.
          </h1>

          <p>
            Create a new password to securely access your business
            financial dashboard.
          </p>
        </div>

        <p className={styles.footerText}>
          CashPilot – Small Business Financial Dashboard
        </p>
      </section>

      <section className={styles.formSection}>
        <div className={styles.formCard}>
          <h2>Reset Password</h2>

          <p>Enter and confirm your new password below.</p>

          {!isSuccess && (
            <form onSubmit={handleSubmit}>
              <label htmlFor="password">New Password</label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your new password"
                autoComplete="new-password"
                minLength={8}
                required
              />

              <label htmlFor="confirmPassword">
                Confirm New Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Confirm your new password"
                autoComplete="new-password"
                required
              />

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          {message && (
            <p
              className={styles.message}
              role={isSuccess ? "status" : "alert"}
            >
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

export default ResetPassword;
