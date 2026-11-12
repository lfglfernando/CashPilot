import { Link } from "react-router-dom";
import styles from "./Home.module.scss";

function Home() {
  return (
    <main className={styles.home}>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="content">

          <h1>
            Take Control of Your Business Finances.
          </h1>

          <p>
            Understand your money. Track your growth.
            Make smarter business decisions.
            CashPilot makes managing your business finances
            simple and straightforward.
          </p>

          <div className="buttons">
            <Link to="/register" className={styles.primary}>
              Create Free Account
            </Link>

            <a href="#features" className={styles.secondary}>
              Explore Features
            </a>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features} id="features">

        <h2 className={styles.heading}>
          Everything You Need to Manage Your Finances
        </h2>

        <p className={styles.description}>
          Simple tools to help you understand and grow your business.
        </p>

        <div className={styles.grid}>

          <div className={styles.card}>
            <h3>Income Tracking</h3>
            <p>
              Record and monitor your business income
              with ease.
            </p>
          </div>

          <div className={styles.card}>
            <h3>Expense Tracking</h3>
            <p>
              Keep track of business expenses and
              understand where your money goes.
            </p>
          </div>

          <div className={styles.card}>
            <h3>Profit Analysis</h3>
            <p>
              Understand your revenue, expenses
              and net profit.
            </p>
          </div>

          <div className={styles.card}>
            <h3>Business Calculators</h3>
            <p>
              Calculate product costs, profit margins
              and return on investment.
            </p>
          </div>

        </div>
      </section>

      {/* About Section */}
      <section className={styles.about} id="about">

        <div className="content">

          <h2 className={styles.heading}>
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
      <section className={styles.cta}>

        <h2>Ready to Take Control?</h2>

        <p>
          Start managing your business finances
          with greater confidence.
        </p>

        <Link to="/register" className={styles.primary}>
          Get Started Today
        </Link>

      </section>

    </main>
  );
}

export default Home;
