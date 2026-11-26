
const API_BASE_URL = "http://localhost:5241";

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
  const response = await fetch(
    `${API_BASE_URL}/api/dashboard/summary?year=${year}&month=${month}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard summary");
  }

  return response.json();
}

export async function getMonthlyProfitLoss(
  year: number
): Promise<MonthlyProfitLoss[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/dashboard/monthly-profit-loss?year=${year}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch monthly profit and loss");
  }

  const data = await response.json();
  return data.months;
}
