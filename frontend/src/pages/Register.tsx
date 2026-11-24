import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import styles from "./Register.module.scss";

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (
      !fullName.trim() ||
      !email.trim() ||
      !confirmEmail.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please complete all required fields.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (email.toLowerCase() !== confirmEmail.toLowerCase()) {
      setError("The email addresses do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Your password must contain at least 6 characters.");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError("Your password must contain at least one uppercase letter.");
      return;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      setError("Your password must contain at least one special character.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    if (!acceptedTerms) {
      setError("Please accept the Terms and Conditions to continue.");
      return;
    }

    setMessage(
      "Your registration form is working! Account creation will be connected to the backend soon."
    );
  }

  return (
    <main className={styles.registerPage}>
      <section className={styles.welcomeSection}>
        <Link to="/" className={styles.logo}>
          CashPilot
        </Link>

        <div className={styles.welcomeContent}>
          <span className={styles.eyebrow}>YOUR BUSINESS. YOUR NUMBERS.</span>

          <h1>
            Start making
            <br />
            smarter financial
            <br />
            decisions.
          </h1>

          <p>
            Create your CashPilot account and take the first step toward
            understanding and managing your business finances.
          </p>

          <div className={styles.benefits}>
            <div>✓ Organize your business finances</div>
            <div>✓ Track income and expenses</div>
            <div>✓ Understand your profitability</div>
            <div>✓ Make decisions with confidence</div>
          </div>
        </div>

        <p className={styles.footerText}>
          CashPilot – Small Business Financial Dashboard
        </p>
      </section>

      <section className={styles.formSection}>
        <div className={styles.registerCard}>
          <div className={styles.cardHeading}>
            <h2>Create Account</h2>
            <p>Enter your information to get started with CashPilot.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.formGroup}>
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                autoComplete="name"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmEmail">Confirm Email Address</label>
              <input
                id="confirmEmail"
                type="email"
                placeholder="Enter your email address again"
                value={confirmEmail}
                onChange={(event) => setConfirmEmail(event.target.value)}
                autoComplete="off"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <div className={styles.passwordInput}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={styles.showPassword}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <p className={styles.passwordHint}>
                At least 6 characters, one uppercase letter, and one special
                character.
              </p>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className={styles.passwordInput}>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Enter your password again"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={styles.showPassword}
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <label className={styles.terms}>
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
              />
              <span>
                I agree to the <a href="#terms">Terms and Conditions</a> and
                Privacy Policy.
              </span>
            </label>

            {error && (
              <div className={styles.errorMessage} role="alert">
                {error}
              </div>
            )}

            {message && (
              <div className={styles.successMessage} role="status">
                {message}
              </div>
            )}

            <button type="submit" className={styles.registerButton}>
              Create Account
            </button>
          </form>

          <div className={styles.loginLink}>
            Already have an account? <Link to="/login">Log In</Link>
          </div>

          <div className={styles.securityNote}>
            Your business financial information deserves privacy and security.
          </div>
        </div>
      </section>
    </main>
  );
}

export default Register;