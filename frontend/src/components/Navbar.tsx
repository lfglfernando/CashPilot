import { Link } from "react-router-dom";
import styles from "./Navbar.module.scss";

function Navbar() {
  return (
    <header className={styles.navbar}>
      <div className={styles.container}>

        {/* Brand */}
        <Link to="/" className={styles.logo}>
          CashPilot
        </Link>

        {/* Navigation links */}
        <nav className={styles.links}>
          <Link to="/">Home</Link>
          <a href="#features">Features</a>
          <a href="#about">About</a>
        </nav>

        {/* Authentication buttons */}
        <div className={styles.actions}>
          <Link to="/login" className={styles.loginButton}>
            Login
          </Link>

          <Link to="/register" className={styles.registerButton}>
            Get Started
          </Link>
        </div>

      </div>
    </header>
  );
}

export default Navbar;
