
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-container">

        {/* Brand */}
        <Link to="/" className="navbar-logo">
          CashPilot
        </Link>

        {/* Navigation links */}
        <nav className="navbar-links">
          <Link to="/">Home</Link>
          <a href="#features">Features</a>
          <a href="#about">About</a>
        </nav>

        {/* Authentication buttons */}
        <div className="navbar-actions">
          <Link to="/login" className="login-button">
            Login
          </Link>

          <Link to="/register" className="register-button">
            Get Started
          </Link>
        </div>

      </div>
    </header>
  );
}

export default Navbar;
