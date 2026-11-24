import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import API_BASE_URL from "../../services/api";
import "./DashboardSidebar.css";

interface UserProfile {
  fullName: string;
  email: string;
  profilePhoto: string | null;
}

function DashboardSidebar() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const token =
        localStorage.getItem("cashPilotToken") ||
        sessionStorage.getItem("cashPilotToken");

      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/profile/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        }
      } catch (error) {
        console.error("Unable to load sidebar profile:", error);
      }
    }

    loadProfile();
  }, []);

  function handleLogout() {
    const confirmed = window.confirm(
      "Are you sure you want to log out?"
    );

    if (!confirmed) return;

    localStorage.removeItem("cashPilotToken");
    sessionStorage.removeItem("cashPilotToken");

    navigate("/login");
  }

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">
        CashPilot
      </div>

      <div className="sidebar-section">
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          <span>▦</span>
          Dashboard
        </NavLink>

        <div className="sidebar-link disabled">
          <span>↗</span> Income
        </div>

        <div className="sidebar-link disabled">
          <span>↙</span> Expenses
        </div>

        <div className="sidebar-link disabled">
          <span>⇄</span> Transactions
        </div>

        <div className="sidebar-link disabled">
          <span>▤</span> Reports
        </div>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-heading">OTHER</p>

        <div className="sidebar-link disabled">
          <span>▣</span> Calculators
        </div>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          <span>👤</span>
          Profile
        </NavLink>

        <div className="sidebar-link disabled">
          <span>⚙</span> Settings
        </div>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-profile">
          {profile?.profilePhoto ? (
            <img
              src={profile.profilePhoto}
              alt="Profile"
              className="profile-avatar profile-avatar-image"
            />
          ) : (
            <div className="profile-avatar">
              {profile?.fullName?.charAt(0).toUpperCase() || "U"}
            </div>
          )}

          <div className="profile-info">
            <strong>{profile?.fullName || "Business User"}</strong>
            <span>{profile?.email || "CashPilot Account"}</span>
          </div>
        </div>

        <button
          type="button"
          className="sidebar-logout"
          onClick={handleLogout}
        >
          <span>↪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default DashboardSidebar;
