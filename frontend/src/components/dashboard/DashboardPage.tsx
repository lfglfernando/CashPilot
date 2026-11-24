import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import styles from "./DashboardPage.module.scss";

type DashboardPageProps = {
  title: string;
  description: string;
  error?: string;
  className?: string;
  action?: { label: string; to: string };
  children: ReactNode;
};

export default function DashboardPage({ title, description, error, className = "", action, children }: DashboardPageProps) {
  return (
    <div className={styles.layout}>
      <DashboardSidebar />
      <main className={`${styles.page} ${className}`}>
        <header className={styles.header}>
          <div>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <Link to={action?.to ?? "/dashboard"} className={styles.backLink}>
            {action?.label ?? "Back to Dashboard"}
          </Link>
        </header>
        {error && <div className={styles.error} role="alert">{error}</div>}
        {children}
      </main>
    </div>
  );
}
