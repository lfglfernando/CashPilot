import API_BASE_URL from "../services/api";
import type { ProfitInputs, ProfitResult } from "./productProfit";

export type ProductInputs = ProfitInputs & { name: string };
export type SavedProduct = ProfitResult & { id: string; name: string };
export type ProductErrors = Partial<Record<keyof ProductInputs, string>>;

export class ProductsApiError extends Error {
  status: number;
  fieldErrors: ProductErrors;

  constructor(message: string, status: number, fieldErrors: ProductErrors = {}) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? API_BASE_URL).replace(/\/+$/, "");

export function getProductToken() {
  return localStorage.getItem("cashPilotToken") || sessionStorage.getItem("cashPilotToken");
}

async function request(path: string, method: string, signal: AbortSignal, input?: ProductInputs): Promise<unknown> {
  const token = getProductToken();
  if (!token) throw new ProductsApiError("Please log in to save and compare your products.", 401);

  const response = await fetch(`${apiBaseUrl}/api/products${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(input ? { "Content-Type": "application/json" } : {}),
    },
    body: input ? JSON.stringify(input) : undefined,
    signal: AbortSignal.any([signal, AbortSignal.timeout(10_000)]),
  });

  if (response.status === 204) return null;
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401) throw new ProductsApiError("Your session has expired. Please log in again.", 401);
    const fieldErrors: ProductErrors = {};
    if (data && typeof data === "object" && "errors" in data && data.errors && typeof data.errors === "object") {
      for (const field of ["name", "sellingPrice", "costPrice"] as const) {
        const messages = (data.errors as Record<string, unknown>)[field];
        if (Array.isArray(messages) && typeof messages[0] === "string") fieldErrors[field] = messages[0];
      }
    }
    throw new ProductsApiError(
      Object.keys(fieldErrors).length ? "Please check the product details."
        : response.status === 404 ? "This product no longer exists. Reload your products."
          : "Your products could not be updated or loaded. Please try again.",
      response.status,
      fieldErrors,
    );
  }
  return data;
}

function isProduct(value: unknown): value is SavedProduct {
  if (!value || typeof value !== "object") return false;
  const product = value as Record<string, unknown>;
  return typeof product.id === "string" && typeof product.name === "string"
    && ["sellingPrice", "costPrice", "profitPerUnit", "profitMarginPercent"].every(
      (field) => typeof product[field] === "number" && Number.isFinite(product[field]),
    );
}

export async function loadProducts(signal: AbortSignal): Promise<SavedProduct[]> {
  const data = await request("/", "GET", signal);
  if (!Array.isArray(data) || !data.every(isProduct)) throw new Error("Unexpected product response.");
  return data;
}

export async function saveProduct(input: ProductInputs, id: string | null, signal: AbortSignal): Promise<SavedProduct> {
  const data = await request(id ? `/${encodeURIComponent(id)}` : "/", id ? "PUT" : "POST", signal, input);
  if (!isProduct(data)) throw new Error("Unexpected product response.");
  return data;
}

export async function deleteProduct(id: string, signal: AbortSignal): Promise<void> {
  await request(`/${encodeURIComponent(id)}`, "DELETE", signal);
}
