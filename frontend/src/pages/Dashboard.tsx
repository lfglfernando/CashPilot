
import { useEffect, useState } from "react";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import ExportReportButton from "../components/dashboard/ExportReportButton";
import styles from "./Dashboard.module.scss";
import FinancialCharts from "../components/dashboard/FinancialCharts";
import { formatMoney } from "../utils/currency";

import {
  getDashboardSummary,
  getMonthlyProfitLoss,
  type DashboardSummary,
  type MonthlyProfitLoss,
} from "../services/dashboardService";

function Dashboard() {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyProfitLoss[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);
        setSummary(null);
        setMonthlyData([]);

        const [summaryData, profitLossData] = await Promise.all([
          getDashboardSummary(selectedYear, selectedMonth),
          getMonthlyProfitLoss(selectedYear),
        ]);

        setSummary(summaryData);
        setMonthlyData(profitLossData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [selectedYear, selectedMonth, retryCount]);

  const formatCurrency = formatMoney;

  const selectedMonthData = monthlyData.find(
    (item) => item.month === selectedMonth
  );

  const monthlyRevenue = selectedMonthData?.revenue ?? 0;
  const monthlyExpenses = selectedMonthData?.expenses ?? 0;
  const monthlyProfit = selectedMonthData?.netProfit ?? 0;

  const monthlyProfitMargin =
    monthlyRevenue > 0
      ? (monthlyProfit / monthlyRevenue) * 100
      : 0;

 /*Months without transactions */
  const hasSelectedMonthTransactions =
  monthlyRevenue !== 0 || monthlyExpenses !== 0;

  const monthOptions = Array.from({ length: 12 }, (_, index) => ({
    value: index + 1,
    label: new Date(2000, index).toLocaleString("en-GH", {
      month: "long",
    }),
  }));

  const yearOptions = Array.from(
    { length: 6 },
    (_, index) => today.getFullYear() - index
  );

  return (
    <div className={styles.layout}>
      <DashboardSidebar />

      <main className={styles.dashboard}>
        {/* Dashboard Header */}
        <header className={styles.header}>
          <div>
            <h1>Dashboard Overview</h1>
            <p>Welcome to CashPilot. Here's your financial summary.</p>
          </div>

          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <label htmlFor="monthFilter">Month</label>
              <select
                id="monthFilter"
                className={styles.filterSelect}
                value={selectedMonth}
                onChange={(event) =>
                  setSelectedMonth(Number(event.target.value))
                }
              >
                {monthOptions.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="yearFilter">Year</label>
              <select
                id="yearFilter"
                className={styles.filterSelect}
                value={selectedYear}
                onChange={(event) =>
                  setSelectedYear(Number(event.target.value))
                }
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/*Error handler with retry button */}
        {error && (
          <div className={styles.errorMessage} role="alert">
            <p>{error}</p>

            <button
              type="button"
              className={styles.retryButton}
              onClick={() => setRetryCount((count) => count + 1)}
              disabled={loading}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Financial Summary Cards */}
        <section className={styles.summary}>
          <div className={`${styles.card} ${styles.revenue}`}>
            <div className={styles.icon}>↗</div>
            <div className={styles.label}>Total Revenue</div>
            <h2 className={styles.amount}>
              {loading ? "Loading..." : formatCurrency(summary?.totalRevenue ?? 0)}
            </h2>
            <p>Money received</p>
          </div>

          <div className={`${styles.card} ${styles.expense}`}>
            <div className={styles.icon}>↙</div>
            <div className={styles.label}>Total Expenses</div>
            <h2 className={styles.amount}>
              {loading ? "Loading..." : formatCurrency(summary?.totalExpenses ?? 0)}
            </h2>
            <p>Money spent</p>
          </div>

        {/*Net profit card */}
          <div
            className={`${styles.card} ${
              (summary?.netProfit ?? 0) > 0
                ? styles.profit
                : (summary?.netProfit ?? 0) < 0
                  ? styles.loss
                  : styles.neutral
            }`}
          >
            <div className={styles.icon}>
              {(summary?.netProfit ?? 0) < 0 ? "−" : "$"}
            </div>

            <div className={styles.label}>
              {(summary?.netProfit ?? 0) < 0 ? "Net Loss" : "Net Profit"}
            </div>

            <h2 className={styles.amount}>
              {loading
                ? "Loading..."
                : formatCurrency(summary?.netProfit ?? 0)}
            </h2>

            <p>
              {(summary?.netProfit ?? 0) < 0
                ? "Expenses exceed revenue"
                : "Revenue minus expenses"}
            </p>
          </div>

          <div className={`${styles.card} ${styles.margin}`}>
            <div className={styles.icon}>%</div>
            <div className={styles.label}>Profit Margin</div>
            <h2 className={styles.amount}>
              {loading ? "Loading..." : `${(summary?.profitMargin ?? 0).toFixed(2)}%`}
            </h2>
            <p>Profit as a percentage of revenue</p>
          </div>
        </section>

        {/* Monthly Income and Expenses Chart */}
        <section className={styles.section}>
          <FinancialCharts
            data={monthlyData}
            loading={loading}
          />
        </section>

        {/* Monthly Profit and Loss */}
        <section className={styles.section}>
          <div className={styles.header}>
            <div>
              <h2>Monthly Profit & Loss</h2>
              <p>A breakdown of your business financial performance.</p>
            </div>

            <span className={styles.period}>
              {new Date(2000, selectedMonth - 1).toLocaleString("en-GH", {
                month: "long",
              })}{" "}
              {selectedYear}
            </span>
          </div>

          {/*The Profit & Loss Table */}
          {loading ? (
            <p>Loading financial summary...</p>
          ) : hasSelectedMonthTransactions ? (
            <div className={styles.table}>
              <div className={`${styles.row} ${styles.heading}`}>
                <span>Financial Summary</span>
                <span>Amount (USD)</span>
              </div>

              <div className={styles.row}>
                <span>Revenue</span>
                <strong>
                  {loading ? "Loading..." : formatCurrency(monthlyRevenue)}
                </strong>
              </div>

              <div className={styles.row}>
                <span>Expenses</span>
                <strong>
                  {loading ? "Loading..." : formatCurrency(monthlyExpenses)}
                </strong>
              </div>

              <div
                className={`${styles.row} ${
                  monthlyProfit < 0 ? styles.totalLoss : styles.total
                }`}
              >
                <span>{monthlyProfit < 0 ? "Net Loss" : "Net Profit"}</span>
                <strong>
                  {loading ? "Loading..." : formatCurrency(monthlyProfit)}
                </strong>
              </div>

              <div className={styles.row}>
                <span>Profit Margin</span>
                <strong>
                  {loading ? "Loading..." : `${monthlyProfitMargin.toFixed(2)}%`}
                </strong>
              </div>
            </div>
          ) : (
            <div className={styles.empty}>
              <div className={styles.icon}>📊</div>
              <h3>No transactions recorded</h3>
              <p>
                There are no income or expense records for this month.
                Once you record transactions, your financial summary
                will appear here.
              </p>
            </div>
          )}

          <ExportReportButton />
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
