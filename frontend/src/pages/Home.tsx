
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <main className="home">

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">

          <h1>
            Take Control of Your Business Finances.
          </h1>

          <p>
            Understand your money. Track your growth.
            Make smarter business decisions.
            CashPilot makes managing your business finances
            simple and straightforward.
          </p>

          <div className="hero-buttons">
            <Link to="/register" className="primary-button">
              Create Free Account
            </Link>

            <a href="#features" className="secondary-button">
              Explore Features
            </a>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">

        <h2 className="section-heading">
          Everything You Need to Manage Your Finances
        </h2>

        <p className="section-description">
          Simple tools to help you understand and grow your business.
        </p>

        <div className="features-grid">

          <div className="feature-card">
            <h3>Income Tracking</h3>
            <p>
              Record and monitor your business income
              with ease.
            </p>
          </div>

          <div className="feature-card">
            <h3>Expense Tracking</h3>
            <p>
              Keep track of business expenses and
              understand where your money goes.
            </p>
          </div>

          <div className="feature-card">
            <h3>Profit Analysis</h3>
            <p>
              Understand your revenue, expenses
              and net profit.
            </p>
          </div>

          <div className="feature-card">
            <h3>Business Calculators</h3>
            <p>
              Calculate product costs, profit margins
              and return on investment.
            </p>
          </div>

        </div>
      </section>

      {/* About Section */}
      <section className="about" id="about">

        <div className="about-content">

          <h2 className="section-heading">
            About CashPilot
          </h2>

          <p>
            CashPilot is designed to help small business
            owners understand their finances without
            needing advanced accounting knowledge.
            Our goal is to make financial management
            easier, clearer and more accessible.
          </p>

        </div>
      </section>

      {/* Call To Action */}
      <section className="cta">

        <h2>Ready to Take Control?</h2>

        <p>
          Start managing your business finances
          with greater confidence.
        </p>

        <Link to="/register" className="primary-button">
          Get Started Today
        </Link>

      </section>

    </main>
  );
}

export default Home;
