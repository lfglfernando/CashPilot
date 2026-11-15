import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import styles from "./Dashboard.module.scss";

function Dashboard() {
  return (
    <div className={styles.layout}>
      <DashboardSidebar />

      <main className={styles.dashboard}>

        {/* Dashboard Header */}
        <header className="header">
          <div>
            <h1>Dashboard Overview</h1>
            <p>Welcome to CashPilot. Here's your financial summary.</p>
          </div>

          <div className={styles.period}>
            <span>Financial Overview</span>
          </div>
        </header>

        {/* Financial Summary Cards */}
        <section className={styles.summary}>

          <div className={`${styles.card} ${styles.revenue}`}>
            <div className="icon">↗</div>
            <div className="label">Total Revenue</div>
            <h2 className="amount">GH₵ 0.00</h2>
            <p>Money received</p>
          </div>

          <div className={`${styles.card} ${styles.expense}`}>
            <div className="icon">↙</div>
            <div className="label">Total Expenses</div>
            <h2 className="amount">GH₵ 0.00</h2>
            <p>Money spent</p>
          </div>

          <div className={`${styles.card} ${styles.profit}`}>
            <div className="icon">₵</div>
            <div className="label">Net Profit</div>
            <h2 className="amount">GH₵ 0.00</h2>
            <p>Revenue minus expenses</p>
          </div>

          <div className={`${styles.card} ${styles.margin}`}>
            <div className="icon">%</div>
            <div className="label">Profit Margin</div>
            <h2 className="amount">0.00%</h2>
            <p>Profit as a percentage of revenue</p>
          </div>

        </section>

        {/* Income and Expenses */}
        <section className={styles.section}>
          <div className="header">
            <div>
              <h2>Income & Expenses</h2>
              <p>Monitor your business financial performance.</p>
            </div>
          </div>

          <div className={styles.empty}>
            <div className="icon">▥</div>
            <h3>No financial data yet</h3>
            <p>
              Your income and expense charts will appear here
              once you start recording transactions.
            </p>
          </div>
        </section>

        {/* Monthly Profit and Loss */}
        <section className={styles.section}>
          <div className="header">
            <div>
              <h2>Monthly Profit & Loss</h2>
              <p>A breakdown of your business financial performance.</p>
            </div>
          </div>

          <div className={styles.table}>
            <div className="row heading">
              <span>Financial Summary</span>
              <span>Amount (GH₵)</span>
            </div>

            <div className="row">
              <span>Revenue</span>
              <strong>0.00</strong>
            </div>

            <div className="row">
              <span>Expenses</span>
              <strong>0.00</strong>
            </div>

            <div className="row total">
              <span>Net Profit</span>
              <strong>0.00</strong>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

export default Dashboard;
