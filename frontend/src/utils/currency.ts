// Single place that decides which currency reports use.
// The team has not settled on GH₵ vs USD yet (main shows GH₵, PR #8 uses USD),
// so everything that shows or exports money reads from here.
// Switching later means changing REPORT_CURRENCY (or wiring it to a setting).
export type ReportCurrency = "USD" | "GHS";

export const REPORT_CURRENCY: ReportCurrency = "USD";

/** Formats an amount for display, e.g. 1234.5 -> "$1,234.50". */
export function formatMoney(
  amount: number,
  currency: ReportCurrency = REPORT_CURRENCY,
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}
