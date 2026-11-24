
import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./Login.module.scss";
import API_BASE_URL from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();

  const registrationSuccess = (location.state as { registrationSuccess?: boolean } | null )?.registrationSuccess;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(
  registrationSuccess
    ? "Your account was created successfully! Please log in."
    : ""
);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  setError("");
  setMessage("");

  if (!email.trim() || !password) {
    setError("Please enter your email address and password.");
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    setError("Please enter a valid email address.");
    return;
  }

  setIsSubmitting(true);

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
        password: password,
        twoFactorCode: requiresTwoFactor ? twoFactorCode : undefined,
      }),
    });

    const data = await response.json();

   if (!response.ok) {
  const errorDetails = JSON.stringify(data).toLowerCase();

  if (
    response.status === 401 &&
    errorDetails.includes("requirestwofactor")
  ) {
    setRequiresTwoFactor(true);
    setMessage(
      "Two-factor authentication is enabled. Enter the code from your authenticator app."
    );
    return;
  }

  throw new Error(
    data.detail ||
    data.title ||
    data.message ||
    "Invalid email or password. Please try again."
  );
}

    if (!data.accessToken) {
      throw new Error("Authentication token was not returned by the server.");
    }

    const storage = rememberMe ? localStorage : sessionStorage;

   storage.setItem("cashPilotToken", data.accessToken);

    navigate("/dashboard");
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Unable to log in. Please try again."
    );
  } finally {
    setIsSubmitting(false);
  }
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
                <Link
                    to="/forgot-password"
                    className={styles.forgotPassword}
                  >
                    Forgot Password?
                  </Link>
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
                        {requiresTwoFactor && (
              <div className={styles.formGroup}>
                <label htmlFor="twoFactorCode">
                  Authenticator Code
                </label>

                <input
                  id="twoFactorCode"
                  type="text"
                  placeholder="Enter your 6-digit code"
                  value={twoFactorCode}
                  onChange={(event) =>
                    setTwoFactorCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
              </div>
            )}

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

            <button   type="submit"   			className={styles.loginButton} disabled={isSubmitting}>
	  {isSubmitting ? "Logging In..." : "Log In"}
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
