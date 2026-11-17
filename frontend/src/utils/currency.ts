// The team hasn't decided between GH₵ and USD yet, so the currency is set
// in one place. Change REPORT_CURRENCY here to switch it.
export type ReportCurrency = "USD" | "GHS";

export const REPORT_CURRENCY: ReportCurrency = "USD";

// turns 1234.5 into "$1,234.50"
export function formatMoney(
  amount: number,
  currency: ReportCurrency = REPORT_CURRENCY,
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}
