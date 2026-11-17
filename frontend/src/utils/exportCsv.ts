import { REPORT_CURRENCY } from "./currency";
import { downloadBlob } from "./download";
import type { MonthlyReport } from "./monthlyReport";

// Excel treats text starting with these characters as a formula.
const FORMULA_START = /^[=+\-@\t\r]/;

// Only used on text the user typed (like descriptions), not on amounts,
// because a negative amount like -498.20 also starts with "-".
function safeText(value: string): string {
  return FORMULA_START.test(value) ? `'${value}` : value;
}

// Wraps a field in quotes if it has a comma, quote or new line.
function escapeField(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

const money = (amount: number) => amount.toFixed(2);

/** Builds the CSV text for a monthly report (pure, so it is easy to test). */
export function buildReportCsv(report: MonthlyReport): string {
  const rows: string[][] = [
    ["CashPilot Monthly Report"],
    ["Month", report.month],
    ["Currency", REPORT_CURRENCY],
    [],
    ["Summary"],
    ["Total Income", money(report.totalIncome)],
    ["Total Expenses", money(report.totalExpenses)],
    ["Net Profit", money(report.netProfit)],
    [],
    ["Expenses by Category"],
    ["Category", "Amount"],
    ...report.expensesByCategory.map((c) => [safeText(c.category), money(c.total)]),
    [],
    ["Transactions"],
    ["Date", "Type", "Category", "Description", "Amount"],
    ...report.transactions.map((t) => [
      t.time.slice(0, 10),
      t.type,
      safeText(t.category ?? ""),
      safeText(t.description),
      money(t.amount),
    ]),
  ];

  // BOM so Excel reads the file as UTF-8; CRLF line endings per the CSV spec.
  return (
    "﻿" +
    rows.map((row) => row.map(escapeField).join(",")).join("\r\n") +
    "\r\n"
  );
}

export function exportReportCsv(report: MonthlyReport): void {
  const blob = new Blob([buildReportCsv(report)], {
    type: "text/csv;charset=utf-8",
  });
  downloadBlob(blob, `cashpilot-report-${report.month}.csv`);
}
