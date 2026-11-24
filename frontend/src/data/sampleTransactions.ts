// Fake data for now until the dashboard is connected to the backend.
// It's shaped like what GET /transaction/all returns so it's easy to swap later.

export type TransactionType = "Income" | "Expense";

export type ReportTransaction = {
  id: number;
  time: string; // like "2026-11-06T13:05:33"
  type: TransactionType;
  category: string | null; // null if there is no category
  description: string;
  amount: number;
};

export const sampleTransactions: ReportTransaction[] = [
  // November 2026: profitable month. Ids 1-2 match the backend seed data.
  {
    id: 1,
    time: "2026-11-06T13:05:33",
    type: "Income",
    category: "Payment",
    description: "Payment -- Order from Mr. Smith",
    amount: 2341.56,
  },
  {
    id: 2,
    time: "2026-11-09T09:27:56",
    type: "Expense",
    category: "Maintenance",
    description: "Office roof repair",
    amount: 827,
  },
  {
    id: 3,
    time: "2026-11-12T15:40:10",
    type: "Income",
    category: "Payment",
    description: 'Order from Ms. Lee, "rush" delivery',
    amount: 1280,
  },
  {
    id: 4,
    time: "2026-11-01T08:00:00",
    type: "Expense",
    category: "Rent",
    description: "Shop rent, November",
    amount: 1200,
  },
  {
    id: 5,
    time: "2026-11-14T11:15:42",
    type: "Expense",
    category: "Utilities",
    description: "Electricity and water",
    amount: 214.37,
  },
  {
    id: 6,
    time: "2026-11-15T17:05:00",
    type: "Expense",
    category: null,
    description: "Uncategorized cash purchase",
    amount: 35.5,
  },

  // October 2026: a loss month (expenses higher than income).
  {
    id: 7,
    time: "2026-10-03T10:20:00",
    type: "Income",
    category: "Payment",
    description: "Payment -- Order from Mr. Adams",
    amount: 900,
  },
  {
    id: 8,
    time: "2026-10-01T08:00:00",
    type: "Expense",
    category: "Rent",
    description: "Shop rent, October",
    amount: 1200,
  },
  {
    id: 9,
    time: "2026-10-18T14:30:00",
    type: "Expense",
    category: "Utilities",
    description: "Electricity and water",
    amount: 198.2,
  },

  // September 2026 intentionally has no transactions, to test the empty case.
];
