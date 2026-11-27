import API_BASE_URL from "./api";

export interface DashboardSummary {
  year: number;
  month: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
}

export interface MonthlyProfitLoss {
  month: number;
  revenue: number;
  expenses: number;
  netProfit: number;
}

export async function getDashboardSummary(
  year: number,
  month: number
): Promise<DashboardSummary> {
  const params = new URLSearchParams({
    year: String(year),
    month: String(month),
  });

  const response = await fetch(
    `${API_BASE_URL}/api/dashboard/summary?${params}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard summary");
  }

  return response.json() as Promise<DashboardSummary>;
}

export async function getMonthlyProfitLoss(
  year: number
): Promise<MonthlyProfitLoss[]> {
  const params = new URLSearchParams({
    year: String(year),
  });

  const response = await fetch(
    `${API_BASE_URL}/api/dashboard/monthly-profit-loss?${params}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch monthly profit and loss");
  }

  const data = await response.json();

  if (!Array.isArray(data.months)) {
    throw new Error("Invalid monthly profit and loss response");
  }

  return data.months as MonthlyProfitLoss[];
}