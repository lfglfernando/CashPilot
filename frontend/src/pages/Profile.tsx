
import { useEffect, useState, type ChangeEvent } from "react";
import API_BASE_URL from "../services/api";
import DashboardPage from "../components/dashboard/DashboardPage";
import styles from "./Profile.module.scss";

interface UserProfile {
  fullName: string;
  email: string;
  phoneNumber: string | null;
  recoveryEmail: string | null;
  profilePhoto: string | null;
}

function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingPhoto, setSavingPhoto] = useState(false);

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
    <DashboardPage
      title="My Profile"
      description="Manage your personal information and account photo."
      error={error}
    >

        {loading && <p>Loading your profile...</p>}

        {profile && !loading && (
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
                <label>Full Name</label>
                <p>{profile.fullName || "Not provided"}</p>
              </div>

              <div className={styles.field}>
                <label>Email Address</label>
                <p>{profile.email}</p>
              </div>

              <div className={styles.field}>
                <label>Phone Number</label>
                <p>{profile.phoneNumber || "Not provided"}</p>
              </div>

              <div className={styles.field}>
                <label>Recovery Email</label>
                <p>{profile.recoveryEmail || "Not provided"}</p>
              </div>
            </div>
          </section>
        )}
    </DashboardPage>
  );
}

export default Profile;
