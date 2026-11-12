
import { NavLink } from "react-router-dom";
import "./DashboardSidebar.css";

function DashboardSidebar() {
  return (
    <aside className="dashboard-sidebar">

      <div className="sidebar-brand">
        CashPilot
      </div>

      <div className="sidebar-section">
        {/*<p className="sidebar-heading">MAIN MENU</p> */}

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
          <span>↗</span>
          Income
        </div>

        <div className="sidebar-link disabled">
          <span>↙</span>
          Expenses
        </div>

        <div className="sidebar-link disabled">
          <span>⇄</span>
          Transactions
        </div>

        <div className="sidebar-link disabled">
          <span>▤</span>
          Reports
        </div>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-heading">OTHER</p>

        <div className="sidebar-link disabled">
          <span>▣</span>
          Calculators
        </div>

        <div className="sidebar-link disabled">
          <span>⚙</span>
          Settings
        </div>
      </div>

        
      <div className="sidebar-bottom">
        <div className="sidebar-profile">
          <div className="profile-avatar">U</div>

          <div className="profile-info">
            <strong>Business User</strong>
            <span>CashPilot Account</span>
          </div>
        </div>
      </div>

    </aside>
  );
}

export default DashboardSidebar;
