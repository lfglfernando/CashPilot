import { useEffect, useRef, useState, type FormEvent } from "react";
import DashboardPage from "../components/dashboard/DashboardPage";
import {
  deleteProduct, getProductToken, loadProducts, ProductsApiError, saveProduct,
  type ProductErrors, type SavedProduct,
} from "../api/products";
import { formatMoney } from "../utils/currency";
import styles from "./CompareProducts.module.scss";

const marginFormat = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function CompareProducts() {
  const [products, setProducts] = useState<SavedProduct[]>([]);
  const [name, setName] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(!getProductToken());
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ProductErrors>({});
  const [status, setStatus] = useState("");
  const [reload, setReload] = useState(0);
  const nameInput = useRef<HTMLInputElement>(null);
  const mutation = useRef<AbortController | null>(null);

  useEffect(() => () => mutation.current?.abort(), []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    loadProducts(controller.signal)
      .then((saved) => {
        if (controller.signal.aborted) return;
        setProducts(saved);
        setLoaded(true);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        if (err instanceof ProductsApiError && err.status === 401) setNeedsLogin(true);
        setError(err instanceof ProductsApiError ? err.message : "Unable to load your products. Please try again.");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [reload]);

  function clearForm() {
    setEditingId(null);
    setName("");
    setSellingPrice("");
    setCostPrice("");
    setFieldErrors({});
  }

  function showError(err: unknown) {
    if (err instanceof ProductsApiError) {
      setError(err.message);
      setFieldErrors(err.fieldErrors);
      if (err.status === 401) setNeedsLogin(true);
    } else {
      setError("Unable to reach the server. Reload your products before trying again.");
    }
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || loading || !loaded) return;
    setError("");
    setStatus("");
    setFieldErrors({});
    if (!name.trim()) {
      setFieldErrors({ name: "Enter a product name." });
      nameInput.current?.focus();
      return;
    }
    const controller = new AbortController();
    mutation.current = controller;
    setBusy(true);
    try {
      const saved = await saveProduct({ name: name.trim(), sellingPrice: Number(sellingPrice), costPrice: Number(costPrice) }, editingId, controller.signal);
      if (controller.signal.aborted) return;
      setProducts((current) => editingId
        ? current.map((product) => product.id === editingId ? saved : product)
        : [...current, saved]);
      setStatus(`${saved.name} ${editingId ? "updated" : "saved"}.`);
      clearForm();
      nameInput.current?.focus();
    } catch (err) {
      if (!controller.signal.aborted) showError(err);
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  function edit(product: SavedProduct) {
    setEditingId(product.id);
    setName(product.name);
    setSellingPrice(product.sellingPrice.toFixed(2));
    setCostPrice(product.costPrice.toFixed(2));
    setFieldErrors({});
    setError("");
    setStatus("");
    nameInput.current?.focus();
    nameInput.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  async function remove(product: SavedProduct) {
    if (busy || !window.confirm(`Delete "${product.name}"? This removes it from your saved products.`)) return;
    const controller = new AbortController();
    mutation.current = controller;
    setBusy(true);
    setError("");
    setStatus("");
    try {
      await deleteProduct(product.id, controller.signal);
      if (controller.signal.aborted) return;
      setProducts((current) => current.filter((item) => item.id !== product.id));
      if (editingId === product.id) clearForm();
      setStatus(`${product.name} deleted.`);
    } catch (err) {
      if (!controller.signal.aborted) showError(err);
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  const ranked = [...products].sort((a, b) => b.profitMarginPercent - a.profitMarginPercent
    || b.profitPerUnit - a.profitPerUnit || a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
  const highestMargin = ranked[0]?.profitMarginPercent;

  return (
    <DashboardPage
      title="Compare Products"
      description="Save your products and compare how much you earn on each unit."
      className={styles.page}
      error={needsLogin ? error || "Please log in to save and compare your products." : error}
      action={needsLogin ? { label: "Log in", to: "/login" } : undefined}
    >
        {!needsLogin && !loaded && (loading
          ? <p role="status">Loading your products...</p>
          : <button type="button" onClick={() => setReload((value) => value + 1)}>Reload products</button>)}
        {!needsLogin && loaded && (
          <>
            <p className={styles.status} role="status">{status}</p>

            <section className={styles.panel} aria-labelledby="product-form-title">
              <h2 id="product-form-title">{editingId ? "Edit product" : "Add a product"}</h2>
              <form onSubmit={handleSave} aria-busy={busy}>
                <fieldset disabled={busy || loading || !loaded} className={styles.fields}>
                  <legend className={styles.srOnly}>Product details</legend>
                  <div className={styles.field}>
                    <label htmlFor="product-name">Product name</label>
                    <input id="product-name" ref={nameInput} value={name} required maxLength={120}
                      placeholder="e.g. Coffee bag" onChange={(event) => { setName(event.target.value); setFieldErrors((previous) => ({ ...previous, name: undefined })); }}
                      aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? "product-name-error" : undefined} />
                    {fieldErrors.name && <p id="product-name-error" className={styles.fieldError}>{fieldErrors.name}</p>}
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="product-selling-price">Selling price (USD)</label>
                    <input id="product-selling-price" type="number" inputMode="decimal" value={sellingPrice} required
                      min="0.01" max="1000000000" step="0.01" placeholder="50.00"
                      onChange={(event) => { setSellingPrice(event.target.value); setFieldErrors((previous) => ({ ...previous, sellingPrice: undefined })); }}
                      aria-invalid={Boolean(fieldErrors.sellingPrice)} aria-describedby={fieldErrors.sellingPrice ? "product-selling-price-error" : undefined} />
                    {fieldErrors.sellingPrice && <p id="product-selling-price-error" className={styles.fieldError}>{fieldErrors.sellingPrice}</p>}
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="product-cost-price">Cost per unit (USD)</label>
                    <input id="product-cost-price" type="number" inputMode="decimal" value={costPrice} required
                      min="0" max="1000000000" step="0.01" placeholder="30.00"
                      onChange={(event) => { setCostPrice(event.target.value); setFieldErrors((previous) => ({ ...previous, costPrice: undefined })); }}
                      aria-invalid={Boolean(fieldErrors.costPrice)} aria-describedby={fieldErrors.costPrice ? "product-cost-price-error" : undefined} />
                    {fieldErrors.costPrice && <p id="product-cost-price-error" className={styles.fieldError}>{fieldErrors.costPrice}</p>}
                  </div>
                </fieldset>
                <p className={styles.hint}>Include all costs for one unit. Amounts use USD and up to two decimal places.</p>
                <div className={styles.actions}>
                  <button type="submit" className={styles.primary} disabled={busy || loading || !loaded}>
                    {busy ? "Saving changes…" : editingId ? "Update product" : "Save product"}
                  </button>
                  {editingId && <button type="button" disabled={busy} onClick={() => { clearForm(); setError(""); }}>Cancel edit</button>}
                </div>
              </form>
            </section>

            <section className={styles.panel} aria-labelledby="comparison-title" aria-busy={loading || busy}>
              <div className={styles.tableHeader}>
                <div>
                  <h2 id="comparison-title">Your products{loaded ? ` (${products.length})` : ""}</h2>
                  <p className={styles.hint}>Highest margin first. Profit per unit breaks ties.</p>
                </div>
                <button type="button" disabled={loading || busy} onClick={() => setReload((value) => value + 1)}>Reload products</button>
              </div>
              {loading ? <p role="status">Loading your products…</p>
                : !loaded ? <p>Your products could not be loaded. Select Reload products to try again.</p>
                  : ranked.length === 0 ? (
                    <div className={styles.empty}>
                      <h3>No saved products yet</h3>
                      <p>Add your first product above. Save at least two to compare their margins.</p>
                    </div>
                  ) : (
                    <>
                      {ranked.length === 1 && <p className={styles.hint}>Add another product to compare margins.</p>}
                      <div className={styles.tableScroll} role="region" aria-label="Product comparison table" tabIndex={0}>
                        <table>
                          <caption className={styles.srOnly}>Saved products ranked by profit margin, highest first. All amounts are in USD.</caption>
                          <thead><tr>
                            <th scope="col">Product</th><th scope="col">Selling price</th><th scope="col">Cost per unit</th>
                            <th scope="col">Profit per unit</th><th scope="col">Margin</th><th scope="col">Actions</th>
                          </tr></thead>
                          <tbody>{ranked.map((product) => (
                            <tr key={product.id}>
                              <th scope="row" className={styles.productName}>
                                {product.name}
                                <span className={styles.outcome}>{product.profitPerUnit > 0 ? "Profitable" : product.profitPerUnit < 0 ? "Selling at a loss" : "Break-even"}</span>
                              </th>
                              <td>{formatMoney(product.sellingPrice, "USD")}</td>
                              <td>{formatMoney(product.costPrice, "USD")}</td>
                              <td className={product.profitPerUnit < 0 ? styles.loss : product.profitPerUnit > 0 ? styles.profit : undefined}>{formatMoney(product.profitPerUnit, "USD")}</td>
                              <td className={styles.margin}>
                                {marginFormat.format(product.profitMarginPercent)}%
                                {ranked.length > 1 && highestMargin > 0 && product.profitMarginPercent === highestMargin
                                  && <span className={styles.badge}>Highest margin</span>}
                              </td>
                              <td><div className={styles.rowActions}>
                                <button type="button" disabled={busy || loading} onClick={() => edit(product)} aria-label={`Edit ${product.name}`}>Edit</button>
                                <button type="button" disabled={busy || loading} className={styles.delete} onClick={() => remove(product)} aria-label={`Delete ${product.name}`}>Delete</button>
                              </div></td>
                            </tr>
                          ))}</tbody>
                        </table>
                      </div>
                    </>
                  )}
              <p className={styles.hint}>Margin = (selling price − cost per unit) ÷ selling price × 100. Total profit also depends on how many units you sell.</p>
            </section>
          </>
        )}
    </DashboardPage>
  );
}

export default CompareProducts;
