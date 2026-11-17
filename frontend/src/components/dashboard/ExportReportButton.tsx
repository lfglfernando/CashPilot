import { useState } from "react";
import { sampleTransactions } from "../../data/sampleTransactions";
import { exportReportCsv } from "../../utils/exportCsv";
import { exportReportPdf } from "../../utils/exportPdf";
import {
  buildMonthlyReport,
  getAvailableMonths,
} from "../../utils/monthlyReport";
import styles from "./ExportReportButton.module.scss";

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

function ExportReportButton() {
  // using sample data until the dashboard is connected to the backend
  const transactions = sampleTransactions;
  const [month, setMonth] = useState(
    () => getAvailableMonths(transactions)[0] ?? "",
  );
  const [exporting, setExporting] = useState<"csv" | "pdf" | null>(null);
  const [error, setError] = useState("");

  const validMonth = MONTH_PATTERN.test(month);
  const report = validMonth ? buildMonthlyReport(transactions, month) : null;
  const hasData = report !== null && report.transactions.length > 0;

  async function handleExport(format: "csv" | "pdf") {
    if (!report || !hasData || exporting) return;

    setError("");
    setExporting(format);
    try {
      if (format === "csv") {
        exportReportCsv(report);
      } else {
        await exportReportPdf(report);
      }
    } catch {
      setError("The report could not be exported. Please try again.");
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className={styles.exporter}>
      <div className={styles.controls}>
        <label className={styles.monthField} htmlFor="report-month">
          <span>Report month</span>
          <input
            id="report-month"
            type="month"
            value={month}
            onChange={(event) => {
              setMonth(event.target.value);
              setError("");
            }}
          />
        </label>

        <div className={styles.buttons}>
          <button
            type="button"
            className={styles.primary}
            onClick={() => handleExport("csv")}
            disabled={!hasData || exporting !== null}
          >
            {exporting === "csv" ? "Exporting…" : "Export CSV"}
          </button>
          <button
            type="button"
            className={styles.secondary}
            onClick={() => handleExport("pdf")}
            disabled={!hasData || exporting !== null}
          >
            {exporting === "pdf" ? "Exporting…" : "Export PDF"}
          </button>
        </div>
      </div>

      <p className={styles.status} role="status" aria-live="polite">
        {!validMonth && "Choose a month to export."}
        {validMonth && !hasData && "No transactions for this month."}
      </p>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default ExportReportButton;
