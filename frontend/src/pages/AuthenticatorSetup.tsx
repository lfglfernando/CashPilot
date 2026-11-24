
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import API_BASE_URL from "../services/api";
import styles from "./AuthenticatorSetup.module.scss";

interface AuthenticatorSetupProps {
  email: string;
  enabled: boolean;
  onStatusChange: (enabled: boolean) => void;
}

function AuthenticatorSetup({
  email,
  enabled,
  onStatusChange,
}: AuthenticatorSetupProps) {
  const [sharedKey, setSharedKey] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showSetup, setShowSetup] = useState(false);

  function getToken() {
    return (
      localStorage.getItem("cashPilotToken") ||
      sessionStorage.getItem("cashPilotToken")
    );
  }

  async function startSetup() {
    const token = getToken();

    if (!token) {
      setError("Please log in again.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/manage/2fa`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok || !data.sharedKey) {
        throw new Error(data.detail || "Unable to start authenticator setup.");
      }

      setSharedKey(data.sharedKey);
      setShowSetup(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to start setup."
      );
    } finally {
      setLoading(false);
    }
  }

  async function enableAuthenticator() {
    const token = getToken();

    if (!token) {
      setError("Please log in again.");
      return;
    }

    if (!/^\d{6}$/.test(verificationCode)) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/manage/2fa`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enable: true,
          twoFactorCode: verificationCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Invalid verification code.");
      }

      setRecoveryCodes(data.recoveryCodes || []);
      setShowSetup(false);
      setSharedKey("");
      setVerificationCode("");
      onStatusChange(true);
      setMessage("Authenticator app enabled successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to enable 2FA."
      );
    } finally {
      setLoading(false);
    }
  }

  async function disableAuthenticator() {
    const token = getToken();

    if (!token) {
      setError("Please log in again.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to disable two-factor authentication?"
    );

    if (!confirmed) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/manage/2fa`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enable: false }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to disable 2FA.");
      }

      setRecoveryCodes([]);
      onStatusChange(false);
      setMessage("Two-factor authentication has been disabled.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to disable 2FA."
      );
    } finally {
      setLoading(false);
    }
  }

  const authenticatorUri =
    sharedKey && email
      ? `otpauth://totp/${encodeURIComponent(
          `CashPilot:${email}`
        )}?secret=${encodeURIComponent(
          sharedKey
        )}&issuer=CashPilot&digits=6&period=30`
      : "";

  return (
   <section className={styles.authenticator}>
      <h2>Two-Factor Authentication</h2>

      <p>
        Add an extra layer of security to your CashPilot account
        using an authenticator app.
      </p>

      <p>
        Status: <strong>{enabled ? "Enabled" : "Disabled"}</strong>
      </p>

      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}

      {!enabled && !showSetup && (
        <button type="button" onClick={startSetup} disabled={loading}>
          {loading ? "Preparing..." : "Enable Authenticator App"}
        </button>
      )}

      {showSetup && (
        <div>
          <h3>Set up your authenticator app</h3>

          <p>
            Open Google Authenticator or Microsoft Authenticator
            and scan this QR code.
          </p>

          <QRCodeSVG value={authenticatorUri} size={200} />

          <p>If you cannot scan the QR code, enter this key manually:</p>
          <p><strong>{sharedKey}</strong></p>

          <label htmlFor="authenticatorCode">
            6-Digit Verification Code
          </label>

          <input
            id="authenticatorCode"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={verificationCode}
            onChange={(event) =>
              setVerificationCode(
                event.target.value.replace(/\D/g, "").slice(0, 6)
              )
            }
            placeholder="000000"
          />

          <button
            type="button"
            onClick={enableAuthenticator}
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify and Enable"}
          </button>

          <button
            type="button"
            onClick={() => {
              setShowSetup(false);
              setSharedKey("");
              setVerificationCode("");
            }}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      )}

      {enabled && (
        <button
          type="button"
          onClick={disableAuthenticator}
          disabled={loading}
        >
          {loading ? "Processing..." : "Disable Authenticator App"}
        </button>
      )}

      {recoveryCodes.length > 0 && (
        <div>
          <h3>Save Your Recovery Codes</h3>

          <p>
            Store these codes in a safe place. Each code can only
            be used once if you cannot access your authenticator app.
          </p>

          <ul>
            {recoveryCodes.map((code) => (
              <li key={code}>{code}</li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() =>
              navigator.clipboard.writeText(recoveryCodes.join("\n"))
            }
          >
            Copy Recovery Codes
          </button>

          <button
            type="button"
            onClick={() => setRecoveryCodes([])}
          >
            I Have Saved My Codes
          </button>
        </div>
      )}
    </section>
  );
}

export default AuthenticatorSetup;
