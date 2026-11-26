import { REPORT_CURRENCY } from "./currency";
import { downloadBlob } from "./download";
import type { MonthlyReport } from "./monthlyReport";

// Excel runs text that starts with these characters as a formula, so we
// put a ' in front of it. Only for typed text, not amounts (-498.20 starts with "-").
const FORMULA_START = /^[=+\-@\t\r]/;

function safeText(value: string): string {
  return FORMULA_START.test(value) ? `'${value}` : value;
}

// puts quotes around a field if it has a comma, quote or new line in it
function escapeField(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

const money = (amount: number) => amount.toFixed(2);

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

  // the first character is a BOM so Excel reads special characters right
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
