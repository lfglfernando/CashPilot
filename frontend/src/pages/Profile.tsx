
import { useEffect, useState, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../services/api";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import styles from "./Profile.module.scss";
import AuthenticatorSetup from "./AuthenticatorSetup";

interface UserProfile {
  fullName: string;
  email: string;
  phoneNumber: string | null;
  recoveryEmail: string | null;
  profilePhoto: string | null;
  twoFactorEnabled: boolean;
}

function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const token =
        localStorage.getItem("cashPilotToken") ||
        sessionStorage.getItem("cashPilotToken");

      if (!token) {
        setError("Please log in to view your profile.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/profile/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Unable to load your profile.");
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function updateProfileField(
    field: "fullName" | "phoneNumber" | "recoveryEmail",
    value: string
  ) {
    setProfile((current) =>
      current ? { ...current, [field]: value } : current
    );
    setSuccess("");
    setError("");
  }

  async function handleSaveProfile() {
    if (!profile) return;

    const token =
      localStorage.getItem("cashPilotToken") ||
      sessionStorage.getItem("cashPilotToken");

    if (!token) {
      setError("Please log in again.");
      return;
    }

    setSavingProfile(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE_URL}/profile/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: profile.fullName,
          phoneNumber: profile.phoneNumber,
          recoveryEmail: profile.recoveryEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update your profile.");
      }

      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update your profile."
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Please choose an image smaller than 2 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = async () => {
      const photo = reader.result as string;

      const token =
        localStorage.getItem("cashPilotToken") ||
        sessionStorage.getItem("cashPilotToken");

      if (!token) {
        setError("Please log in again.");
        return;
      }

      setSavingPhoto(true);
      setError("");
      setSuccess("");

      try {
        const response = await fetch(`${API_BASE_URL}/profile/me/photo`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ profilePhoto: photo }),
        });

        if (!response.ok) {
          throw new Error("Unable to save your profile photo.");
        }

        setProfile((current) =>
          current ? { ...current, profilePhoto: photo } : current
        );

        setSuccess("Profile photo updated successfully!");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to save your photo."
        );
      } finally {
        setSavingPhoto(false);
      }
    };

    reader.readAsDataURL(file);
  }

  return (
    <div className={styles.layout}>
      <DashboardSidebar />

      <main className={styles.profilePage}>
        <header className={styles.header}>
          <div>
            <h1>My Profile</h1>
            <p>Manage your personal information and account photo.</p>
          </div>

          <Link to="/dashboard" className={styles.backLink}>
            Back to Dashboard
          </Link>
        </header>

        {loading && <p>Loading your profile...</p>}

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        {profile && !loading && (
          <>
          <section className={styles.profileCard}>
            <div className={styles.photoSection}>
              {profile.profilePhoto ? (
                <img
                  src={profile.profilePhoto}
                  alt="Profile"
                  className={styles.avatar}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {profile.fullName?.charAt(0).toUpperCase() || "U"}
                </div>
              )}

              <label className={styles.uploadButton}>
                {savingPhoto ? "Saving..." : "Change Photo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  disabled={savingPhoto}
                  hidden
                />
              </label>

              <span className={styles.photoHint}>
                JPG, PNG or other image format. Maximum 2 MB.
              </span>
            </div>

            <div className={styles.details}>
              <h2>Personal Information</h2>

              <div className={styles.field}>
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  className={styles.input}
                  value={profile.fullName || ""}
                  onChange={(event) =>
                    updateProfileField("fullName", event.target.value)
                  }
                  required
                />
              </div>

              <div className={styles.field}>
                <label>Email Address</label>
                <p>{profile.email}</p>
              </div>

              <div className={styles.field}>
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  id="phoneNumber"
                  type="tel"
                  className={styles.input}
                  value={profile.phoneNumber || ""}
                  onChange={(event) =>
                    updateProfileField("phoneNumber", event.target.value)
                  }
                  placeholder="Enter your phone number"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="recoveryEmail">Recovery Email</label>
                <input
                  id="recoveryEmail"
                  type="email"
                  className={styles.input}
                  value={profile.recoveryEmail || ""}
                  onChange={(event) =>
                    updateProfileField("recoveryEmail", event.target.value)
                  }
                  placeholder="Enter your recovery email"
                />
              </div>

              <button
                type="button"
                className={styles.saveButton}
                onClick={handleSaveProfile}
                disabled={savingProfile}
              >
                {savingProfile ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </section>

          <AuthenticatorSetup
            email={profile.email}
            enabled={profile.twoFactorEnabled}
            onStatusChange={(enabled) =>
              setProfile((current) =>
                current
                  ? { ...current, twoFactorEnabled: enabled }
                  : current
              )
            }
            />
          </>
        )}  
      </main>
    </div>
  );
}

export default Profile;
