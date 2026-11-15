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

  constructor(message: string, fieldErrors: ProfitErrors = {}) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

export async function calculateProductProfit(
  inputs: ProfitInputs,
  signal: AbortSignal,
): Promise<ProfitResult> {
  const response = await fetch(`${apiBaseUrl}/api/calculators/product-profit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(inputs),
    signal: AbortSignal.any([signal, AbortSignal.timeout(10_000)]),
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
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
