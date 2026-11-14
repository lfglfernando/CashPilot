
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import styles from "./Login.module.scss";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!email.trim() || !password) {
      setError("Please enter your email address and password.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Backend authentication will be connected in a later step.
    setError(
  "Invalid email or password. Please check your credentials and try again."
    );
  }

  return (
    <main className={styles.loginPage}>
      <section className={styles.welcomeSection}>
        <Link to="/" className={styles.logo}>
          CashPilot
        </Link>

        <div className={styles.welcomeContent}>
          <span className={styles.eyebrow}>YOUR BUSINESS. YOUR NUMBERS.</span>

          <h1>
            Take control of
            <br />
            your business finances.
          </h1>

          <p>
            Understand your income, track your expenses, and
            make smarter financial decisions with CashPilot.
          </p>

          <div className={styles.benefits}>
            <div>✓ Track income and expenses</div>
            <div>✓ Monitor business profitability</div>
            <div>✓ Make informed financial decisions</div>
          </div>
        </div>

        <p className={styles.footerText}>
          CashPilot – Small Business Financial Dashboard
        </p>
      </section>

      <section className={styles.formSection}>
        <div className={styles.loginCard}>
          <div className={styles.cardHeading}>
            <h2>Welcome Back</h2>
            <p>Log in to your account to access your dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
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
              <div className={styles.passwordLabel}>
                <label htmlFor="password">Password</label>
                <button
                  type="button"
                  className={styles.forgotPassword}
                  onClick={() =>
                    setMessage("Password recovery will be available soon.")
                  }
                >
                  Forgot Password?
                </button>
              </div>

              <div className={styles.passwordInput}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
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
            </div>

            <label className={styles.rememberMe}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              <span>Remember Me</span>
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

            <button type="submit" className={styles.loginButton}>
              Log In
            </button>
          </form>

          <div className={styles.registerLink}>
            Don't have an account?{" "}
            <Link to="/register">Create an Account</Link>
          </div>

          <div className={styles.securityNote}>
            Your business financial information deserves privacy and security.
          </div>
        </div>
      </section>
    </main>
  );
}

export default Login;
