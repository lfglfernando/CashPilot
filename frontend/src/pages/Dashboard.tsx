
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-layout">
      <DashboardSidebar />

      <main className="dashboard">

        {/* Dashboard Header */}
        <header className="dashboard-header">
          <div>
            <h1>Dashboard Overview</h1>
            <p>Welcome to CashPilot. Here's your financial summary.</p>
          </div>

          <div className="dashboard-period">
            <span>Financial Overview</span>
          </div>
        </header>

        {/* Financial Summary Cards */}
        <section className="summary-cards">

          <div className="summary-card revenue-card">
            <div className="card-icon">↗</div>
            <div className="card-label">Total Revenue</div>
            <h2 className="summary-amount">GH₵ 0.00</h2>
            <p>Money received</p>
          </div>

          <div className="summary-card expense-card">
            <div className="card-icon">↙</div>
            <div className="card-label">Total Expenses</div>
            <h2 className="summary-amount">GH₵ 0.00</h2>
            <p>Money spent</p>
          </div>

          <div className="summary-card profit-card">
            <div className="card-icon">₵</div>
            <div className="card-label">Net Profit</div>
            <h2 className="summary-amount">GH₵ 0.00</h2>
            <p>Revenue minus expenses</p>
          </div>

          <div className="summary-card margin-card">
            <div className="card-icon">%</div>
            <div className="card-label">Profit Margin</div>
            <h2 className="summary-amount">0.00%</h2>
            <p>Profit as a percentage of revenue</p>
          </div>

        </section>

        {/* Income and Expenses */}
        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <h2>Income & Expenses</h2>
              <p>Monitor your business financial performance.</p>
            </div>
          </div>

          <div className="empty-chart">
            <div className="empty-chart-icon">▥</div>
            <h3>No financial data yet</h3>
            <p>
              Your income and expense charts will appear here
              once you start recording transactions.
            </p>
          </div>
        </section>

        {/* Monthly Profit and Loss */}
        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <h2>Monthly Profit & Loss</h2>
              <p>A breakdown of your business financial performance.</p>
            </div>
          </div>

          <div className="profit-loss-table">
            <div className="profit-loss-row table-heading">
              <span>Financial Summary</span>
              <span>Amount (GH₵)</span>
            </div>

            <div className="profit-loss-row">
              <span>Revenue</span>
              <strong>0.00</strong>
            </div>

            <div className="profit-loss-row">
              <span>Expenses</span>
              <strong>0.00</strong>
            </div>

            <div className="profit-loss-row total">
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
