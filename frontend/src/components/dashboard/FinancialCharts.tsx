
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import styles from "./FinancialCharts.module.scss";
import type { MonthlyProfitLoss } from "../../services/dashboardService";

interface FinancialChartsProps {
  data?: MonthlyProfitLoss[];
  loading?: boolean;
}

function FinancialCharts({
  data = [],
  loading = false,
}: FinancialChartsProps) {
  const financialData = data.map((item) => ({
    month: new Date(2000, item.month - 1).toLocaleString("en", {
      month: "short",
    }),
    income: item.revenue,
    expenses: item.expenses,
  }));

  /*Handling empty transactions */
  const hasFinancialData = financialData.some(
  (item) => item.income !== 0 || item.expenses !== 0
);
  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <div>
          <h3>Monthly Income vs Expenses</h3>
          <p>Compare your business income and spending.</p>
        </div>
      </div>

      <div className={styles.chart}>
        {loading ? (
          <div className={styles.chartEmpty}>
            <h3>Loading chart...</h3>
            <p>Please wait while your financial data is being retrieved.</p>
          </div>
        ) : hasFinancialData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={financialData}
              margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) =>
                  `$${Number(value).toLocaleString("en-US")}`
                }
              />

              <Tooltip
                formatter={(value) =>
                  `$${Number(value).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                }
              />

              <Legend />

              <Bar
                dataKey="income"
                name="Income"
                fill="#2563eb"
                radius={[5, 5, 0, 0]}
              />

              <Bar
                dataKey="expenses"
                name="Expenses"
                fill="#ea580c"
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className={styles.chartEmpty}>
            <div>📊</div>
            <h3>No financial data available</h3>
            <p>
              There are no income or expense records for this year.
              Your chart will appear here once you record transactions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FinancialCharts;
