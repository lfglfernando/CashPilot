import { useEffect, useRef, useState, type FormEvent } from "react";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import {
  calculateProductProfit,
  ProfitCalculationError,
  type ProfitErrors,
  type ProfitResult,
} from "../api/productProfit";
import styles from "./ProductProfit.module.scss";

const numberFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const currencyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
const money = (value: number) => currencyFormat.format(value);

function validateAmount(value: string, isSellingPrice: boolean): string | undefined {
  if (!value.trim()) return "Enter an amount.";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Enter a valid amount.";
  if (isSellingPrice && amount <= 0) return "Selling price must be greater than zero.";
  if (!isSellingPrice && amount < 0) return "Cost cannot be negative.";
  if (amount > 1_000_000_000) return "Enter an amount no greater than 1,000,000,000.";
  if (!/^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(value)) {
    return "Use up to two decimal places, for example 19.99.";
  }
}

function ProductProfit() {
  const [sellingPrice, setSellingPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [errors, setErrors] = useState<ProfitErrors>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<ProfitResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const sellingPriceInput = useRef<HTMLInputElement>(null);
  const costPriceInput = useRef<HTMLInputElement>(null);
  const request = useRef<AbortController | null>(null);

  useEffect(() => () => request.current?.abort(), []);

  function updateAmount(field: "sellingPrice" | "costPrice", value: string) {
    if (field === "sellingPrice") setSellingPrice(value);
    else setCostPrice(value);
    setErrors((previous) => ({ ...previous, [field]: undefined }));
    setErrorMessage("");
    setResult(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isCalculating) return;

    const nextErrors = {
      sellingPrice: validateAmount(sellingPrice, true),
      costPrice: validateAmount(costPrice, false),
    };
    setErrors(nextErrors);
    setErrorMessage("");
    setResult(null);
    if (nextErrors.sellingPrice || nextErrors.costPrice) {
      (nextErrors.sellingPrice ? sellingPriceInput : costPriceInput).current?.focus();
      return;
    }

    const controller = new AbortController();
    request.current = controller;
    setIsCalculating(true);
    try {
      const calculation = await calculateProductProfit(
        { sellingPrice: Number(sellingPrice), costPrice: Number(costPrice) },
        controller.signal,
      );
      if (!controller.signal.aborted) setResult(calculation);
    } catch (error) {
      if (controller.signal.aborted) return;
      if (error instanceof ProfitCalculationError) {
        setErrors(error.fieldErrors);
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to reach the calculator. Please try again.");
      }
    } finally {
      if (!controller.signal.aborted) setIsCalculating(false);
    }
  }

  function reset() {
    setSellingPrice("");
    setCostPrice("");
    setErrors({});
    setErrorMessage("");
    setResult(null);
    sellingPriceInput.current?.focus();
  }

  const outcome = result
    ? result.profitPerUnit > 0 ? "profit" : result.profitPerUnit < 0 ? "loss" : "breakEven"
    : null;

  return (
    <div className={styles.layout}>
      <DashboardSidebar />
      <main className={styles.page}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>CALCULATORS</p>
          <h1>Product Profit Calculator</h1>
          <p>See what you earn on every product you sell.</p>
        </header>

        <div className={styles.columns}>
          <section className={styles.panel} aria-labelledby="product-details-title">
            <h2 id="product-details-title">Product details</h2>
            <p className={styles.description}>Enter the selling price and total cost for one unit.</p>
            <form onSubmit={handleSubmit} noValidate aria-busy={isCalculating}>
              <div className={styles.field}>
                <label htmlFor="selling-price">Selling price (USD)</label>
                <input
                  ref={sellingPriceInput}
                  id="selling-price"
                  name="sellingPrice"
                  type="number"
                  inputMode="decimal"
                  min="0.01"
                  max="1000000000"
                  step="0.01"
                  placeholder="e.g. 50.00"
                  required
                  value={sellingPrice}
                  onChange={(event) => updateAmount("sellingPrice", event.target.value)}
                  disabled={isCalculating}
                  aria-invalid={Boolean(errors.sellingPrice)}
                  aria-describedby={errors.sellingPrice ? "selling-price-error" : undefined}
                />
                {errors.sellingPrice && <p id="selling-price-error" className={styles.fieldError}>{errors.sellingPrice}</p>}
              </div>
              <div className={styles.field}>
                <label htmlFor="cost-price">Cost per unit (USD)</label>
                <input
                  ref={costPriceInput}
                  id="cost-price"
                  name="costPrice"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="1000000000"
                  step="0.01"
                  placeholder="e.g. 30.00"
                  required
                  value={costPrice}
                  onChange={(event) => updateAmount("costPrice", event.target.value)}
                  disabled={isCalculating}
                  aria-invalid={Boolean(errors.costPrice)}
                  aria-describedby={errors.costPrice ? "cost-price-hint cost-price-error" : "cost-price-hint"}
                />
                <p id="cost-price-hint" className={styles.hint}>Include materials, labor, and other costs per unit.</p>
                {errors.costPrice && <p id="cost-price-error" className={styles.fieldError}>{errors.costPrice}</p>}
              </div>
              {errorMessage && <p className={styles.requestError} role="alert">{errorMessage}</p>}
              <div className={styles.actions}>
                <button className={styles.calculate} type="submit" disabled={isCalculating}>
                  {isCalculating ? "Calculating…" : "Calculate profit"}
                </button>
                <button className={styles.reset} type="button" onClick={reset} disabled={isCalculating}>Reset</button>
              </div>
            </form>
          </section>

          <section className={styles.panel} aria-labelledby="profit-results-title">
            <h2 id="profit-results-title">Your results</h2>
            <div aria-live="polite" aria-atomic="true" aria-busy={isCalculating}>
              {result && outcome ? (
                <div className={`${styles.results} ${styles[outcome]}`}>
                  <p className={styles.outcome}>
                    {outcome === "profit" ? "Profitable" : outcome === "loss" ? "Selling at a loss" : "Break-even"}
                  </p>
                  <dl className={styles.metrics}>
                    <div><dt>Profit per unit</dt><dd>{money(result.profitPerUnit)}</dd></div>
                    <div><dt>Profit margin</dt><dd>{numberFormat.format(result.profitMarginPercent)}%</dd></div>
                  </dl>
                  <p className={styles.explanation}>
                    {outcome === "profit"
                      ? `You earn ${money(result.profitPerUnit)} on each unit sold.`
                      : outcome === "loss"
                        ? `Your cost exceeds your selling price by ${money(Math.abs(result.profitPerUnit))} per unit.`
                        : "Your selling price covers the cost. There is no profit or loss per unit."}
                  </p>
                  <p className={styles.basedOn}>
                    Selling price: {money(result.sellingPrice)} · Cost: {money(result.costPrice)}
                  </p>
                </div>
              ) : (
                <div className={styles.empty}>
                  <span aria-hidden="true">%</span>
                  <h3>{isCalculating ? "Calculating your profit…" : "How profitable is your product?"}</h3>
                  <p>Enter your amounts and select Calculate profit to see your profit per unit and margin.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <section className={styles.formulas} aria-labelledby="profit-formulas-title">
          <h2 id="profit-formulas-title">How it works</h2>
          <p><strong>Profit per unit</strong> = selling price − cost per unit</p>
          <p><strong>Profit margin</strong> = (profit per unit ÷ selling price) × 100</p>
          <p className={styles.hint}>Margin is the percentage of the selling price you keep after the costs entered above.</p>
        </section>
      </main>
    </div>
  );
}

export default ProductProfit;
