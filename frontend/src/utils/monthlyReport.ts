import type { ReportTransaction } from "../data/sampleTransactions";

export type MonthlyReport = {
  month: string; // like "2026-11"
  transactions: ReportTransaction[];
  totalIncome: number;
  totalExpenses: number;
  netProfit: number; // income minus expenses, negative means a loss
};

// round to 2 decimals so adding prices doesn't give numbers like 0.30000000000000004
const round = (n: number) => Math.round(n * 100) / 100;

// gets "2026-11" from the date string
export function monthKey(time: string): string {
  return time.slice(0, 7);
}

// all the months that have transactions, newest first
export function getAvailableMonths(transactions: ReportTransaction[]): string[] {
  return [...new Set(transactions.map((t) => monthKey(t.time)))].sort().reverse();
}

export function buildMonthlyReport(
  transactions: ReportTransaction[],
  month: string,
): MonthlyReport {
  const inMonth = transactions
    .filter((t) => monthKey(t.time) === month)
    .sort((a, b) => a.time.localeCompare(b.time));

  let totalIncome = 0;
  let totalExpenses = 0;

  for (const t of inMonth) {
    if (t.type === "Income") {
      totalIncome += t.amount;
    } else {
      totalExpenses += t.amount;
    }
  }

  return {
    month,
    transactions: inMonth,
    totalIncome: round(totalIncome),
    totalExpenses: round(totalExpenses),
    netProfit: round(totalIncome - totalExpenses),
  };
}
