# CashPilot – Small Business Financial Dashboard

CashPilot is a simple web application that helps small business owners understand their finances without needing advanced accounting knowledge.

Many small business owners struggle to know how much they are actually earning, where their money is going, and which of their products are truly profitable. Many rely on spreadsheets or manual calculations, which makes it difficult to track expenses, calculate profit margins, and make informed business decisions. CashPilot solves this by bringing income, expenses, and profitability together in one clear dashboard, so owners can see their financial performance and make better decisions.

## Features

- **Income and Expense Tracking** — Record business income and expenses, organize expenses into categories such as rent, supplies, utilities, and payroll, and view total income, expenses, and net profit for a selected month.
- **Financial Dashboard** — Display total revenue, total expenses, and net profit, visualize income and expenses with simple charts, and view a monthly profit and loss summary.
- **Product Cost and Profit Calculator** — Enter a product's selling price and cost to calculate profit per unit and profit margin, and understand which products are profitable.
- **ROI Calculator** — Enter the cost of an investment and the financial return to automatically calculate ROI as a percentage and evaluate whether an investment was profitable.

## Technology

- Frontend: React with TypeScript
- Backend: ASP.NET Core Web API (C#)
- Database: PostgreSQL
- Charts: Recharts
- Version Control: Git and GitHub

## Local development

Requirements: Node.js 20.19+ or 22.12+ with npm, and the .NET 10 SDK. Run the frontend and backend in separate terminals.

In terminal 1, starting from the repository root:

```sh
cd frontend
npm ci
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Open http://127.0.0.1:5173 or http://127.0.0.1:5173/dashboard. The dashboard's **Calculators** link opens the product profit calculator at http://127.0.0.1:5173/calculators/product-profit. The dashboard still displays placeholder values. Login and registration pages exist, but authentication is not connected yet.

In terminal 2, from the repository root:

```sh
bash scripts/dotnet.sh run --project backend --launch-profile http
```

Check the backend at http://localhost:5241/openapi/v1.json. A 404 response at http://localhost:5241/ is expected because there is no root route. Development uses SQLite at `backend/Data/TestData.db`, with migrations and sample transaction data initialized at startup; production uses PostgreSQL. You do not need to install PostgreSQL to run locally. Press `Ctrl+C` in each terminal to stop its server.

The `scripts/dotnet.sh` wrapper prefers the project-local SDK in `.tools/dotnet` and otherwise uses the system SDK. If .NET 10 is missing, install it locally from the repository root:

```sh
curl -fsSL https://dot.net/v1/dotnet-install.sh -o /tmp/cashpilot-dotnet-install.sh
bash /tmp/cashpilot-dotnet-install.sh --channel 10.0 --install-dir .tools/dotnet --no-path
```

The `.tools` directory is ignored by Git.

## Product profit calculator

Enter a selling price and cost per unit, then select **Calculate profit**. The page calls `POST /api/calculators/product-profit` and displays profit per unit, profit margin, and whether the product makes a profit, a loss, or breaks even. Editing either amount clears the previous result. Calculations are not saved.

Example request:

```json
{ "sellingPrice": 50, "costPrice": 30 }
```

Example response:

```json
{ "sellingPrice": 50, "costPrice": 30, "profitPerUnit": 20, "profitMarginPercent": 40 }
```

Profit is selling price minus cost. Margin is `(profit / selling price) * 100`, rounded to two decimal places with midpoint rounding away from zero. The API uses decimal arithmetic. Selling price must be at least `0.01`, cost may be zero, and both amounts must be no greater than `1,000,000,000` with up to two decimal places. Invalid inputs return HTTP 400. The dashboard and calculator display amounts in US dollars (USD); no exchange-rate conversion is performed.

Additional request examples are in `backend/CashPilot.http`.

### Separate frontend and API hosting

Locally, [Vite's development proxy](https://vite.dev/config/server-options#server-proxy) forwards `/api` to `http://localhost:5241`. For separate hosting, set `VITE_API_BASE_URL` to the API's HTTPS origin (without a trailing `/api`) **before building the frontend**; see `frontend/.env.example` and [Vite environment variables](https://vite.dev/guide/env-and-mode). Configure `Cors__AllowedOrigins__0` on the backend with the frontend origin, for example `https://cashpilot-ua1w.onrender.com`, without a trailing slash. Additional origins use `Cors__AllowedOrigins__1`, etc. This [CORS policy](https://learn.microsoft.com/en-us/aspnet/core/security/cors?view=aspnetcore-10.0) applies only to the calculator endpoint. The default is same-origin access.

## Deployment Links
- Frontend: [Render: https://cashpilot-ua1w.onrender.com](https://cashpilot-ua1w.onrender.com)
- Backend: [MonsterASP: https://cashpilotapi.runasp.net/](https://cashpilotapi.runasp.net/)

## Team

- Joshua Matthew Wagstaff
- Raphael Dotse
- Luis Fernando Galvez
- Jacob Cannon Nielsen
- Soraya de Moura Vilela da Skavinski

Synchronous meeting time: Wednesdays at 7:00 p.m. MT

## Quote

> "The best way to predict the future is to create it." — Peter Drucker
>
> "What you do today can improve all your tomorrows." — Ralph Marston
