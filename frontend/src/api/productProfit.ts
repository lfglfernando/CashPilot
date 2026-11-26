import API_BASE_URL from "../services/api";

export type ProfitInputs = {
  sellingPrice: number;
  costPrice: number;
};

export type ProfitResult = ProfitInputs & {
  profitPerUnit: number;
  profitMarginPercent: number;
};

export type ProfitErrors = Partial<Record<keyof ProfitInputs, string>>;

export class ProfitCalculationError extends Error {
  fieldErrors: ProfitErrors;
  status: number;

  constructor(message: string, fieldErrors: ProfitErrors = {}, status = 0) {
    super(message);
    this.fieldErrors = fieldErrors;
    this.status = status;
  }
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
const sessionApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || API_BASE_URL).replace(/\/+$/, "");

function getToken(): string {
  const token = localStorage.getItem("cashPilotToken") || sessionStorage.getItem("cashPilotToken");
  if (!token) throw new ProfitCalculationError("Please log in to use the calculator.", {}, 401);
  return token;
}

export async function checkCalculatorSession(signal: AbortSignal): Promise<void> {
  const response = await fetch(`${sessionApiBaseUrl}/profile/me`, {
    headers: { Authorization: `Bearer ${getToken()}` },
    signal: AbortSignal.any([signal, AbortSignal.timeout(10_000)]),
  });
  if (response.status === 401) {
    throw new ProfitCalculationError("Your session has expired. Please log in again.", {}, 401);
  }
  if (!response.ok) throw new ProfitCalculationError("Unable to verify your session. Please reload the page.");
}

export async function calculateProductProfit(
  inputs: ProfitInputs,
  signal: AbortSignal,
): Promise<ProfitResult> {
  const response = await fetch(`${apiBaseUrl}/api/calculators/product-profit`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(inputs),
    signal: AbortSignal.any([signal, AbortSignal.timeout(10_000)]),
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      throw new ProfitCalculationError("Your session has expired. Please log in again.", {}, 401);
    }
    const fieldErrors: ProfitErrors = {};
    if (response.status === 400 && data && typeof data === "object" && "errors" in data) {
      const errors = data.errors;
      if (errors && typeof errors === "object") {
        for (const field of ["sellingPrice", "costPrice"] as const) {
          const messages = (errors as Record<string, unknown>)[field];
          if (Array.isArray(messages) && typeof messages[0] === "string") {
            fieldErrors[field] = messages[0];
          }
        }
      }
    }
    throw new ProfitCalculationError(
      Object.keys(fieldErrors).length
        ? "Please check the amounts below."
        : "The calculation could not be completed. Please try again.",
      fieldErrors,
    );
  }

  const fields = ["sellingPrice", "costPrice", "profitPerUnit", "profitMarginPercent"] as const;
  if (!data || typeof data !== "object" || !fields.every((field) => {
    const value = (data as Record<string, unknown>)[field];
    return typeof value === "number" && Number.isFinite(value);
  })) {
    throw new ProfitCalculationError("The calculator returned an unexpected response. Please try again.");
  }

  return data as ProfitResult;
}
