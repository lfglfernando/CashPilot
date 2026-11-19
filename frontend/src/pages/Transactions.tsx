import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import TransactionForm from "../components/transactions/TransactionForm";
import styles from "./Transactions.module.scss";

function Transactions() {
    return (
        <div className={styles.layout}>
            <DashboardSidebar />

            <main>
                <TransactionForm />
            </main>
        </div>
    );
}

export default Transactions;
