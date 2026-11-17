import type { ReportTransaction } from "../data/sampleTransactions";

export const UNCATEGORIZED = "Uncategorized";

export type CategoryTotal = {
  category: string;
  total: number;
};

export type MonthlyReport = {
  /** Month key as "YYYY-MM", e.g. "2026-11". */
  month: string;
  /** Transactions in the month, oldest first. */
  transactions: ReportTransaction[];
  totalIncome: number;
  totalExpenses: number;
  /** totalIncome - totalExpenses. Negative means a loss. */
  netProfit: number;
  /** Expense totals per category, largest first. */
  expensesByCategory: CategoryTotal[];
};

// Money is summed in whole cents so results never drift (0.1 + 0.2 !== 0.3).
const toCents = (amount: number) => Math.round(amount * 100);
const fromCents = (cents: number) => cents / 100;

/** "YYYY-MM" for a transaction. Reads the string so time zones can't shift the month. */
export function monthKey(time: string): string {
  return time.slice(0, 7);
}

/** Months that have at least one transaction, newest first. */
export function getAvailableMonths(transactions: ReportTransaction[]): string[] {
  return [...new Set(transactions.map((t) => monthKey(t.time)))].sort().reverse();
}

/** Builds the profit and loss summary for one month ("YYYY-MM"). */
export function buildMonthlyReport(
  transactions: ReportTransaction[],
  month: string,
): MonthlyReport {
  const inMonth = transactions
    .filter((t) => monthKey(t.time) === month)
    .sort((a, b) => a.time.localeCompare(b.time));

  let incomeCents = 0;
  let expenseCents = 0;
  const categoryCents = new Map<string, number>();

  for (const t of inMonth) {
    const cents = toCents(t.amount);
    if (t.type === "Income") {
      incomeCents += cents;
    } else {
      expenseCents += cents;
      const name = t.category ?? UNCATEGORIZED;
      categoryCents.set(name, (categoryCents.get(name) ?? 0) + cents);
    }
  }

  const expensesByCategory = [...categoryCents.entries()]
    .map(([category, cents]) => ({ category, total: fromCents(cents) }))
    .sort((a, b) => b.total - a.total || a.category.localeCompare(b.category));

  return {
    month,
    transactions: inMonth,
    totalIncome: fromCents(incomeCents),
    totalExpenses: fromCents(expenseCents),
    netProfit: fromCents(incomeCents - expenseCents),
    expensesByCategory,
  };
}
