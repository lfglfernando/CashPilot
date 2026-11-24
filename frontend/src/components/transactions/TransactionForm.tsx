import { useState, type SubmitEvent } from "react";
import useSWRMutation from "swr/mutation";
import useTransactionCategories from "../../utils/useTransactionCategories";
import styles from "./TransactionForm.module.scss";

function TransactionForm() {
    const transTypeDefault: string = "Expense";
    const { categories, isLoading, isError } = useTransactionCategories();
    const [time, setTime] = useState("");
    const [transType, setTransType] = useState(transTypeDefault);
    const [transCat, setTransCat] = useState("");
    const [desc, setDesc] = useState("");
    const [amount, setAmount] = useState(0.0);

    function handleSubmit(e: SubmitEvent) {
        e.preventDefault();

        const url: string = `${import.meta.env.VITE_API_ROOT_URL}/transaction/new`;
        const data: any = {
            time: time,
            type: transType,
            category: transCat,
            description: desc,
            amount: amount
        };

        async function sender(url: string, data: any) {
            fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            }).then((res: Response) => res.json());
        }

        const { trigger } = useSWRMutation(url, sender);

        trigger(data);
    }

    return (
        <form onSubmit={handleSubmit}>
            <label>Date and Time
                <input name="time" type="datetime-local" onChange={(e) => setTime(e.target.value)}></input>
            </label>
            <label>Transaction Type
                <select name="type" defaultValue={transTypeDefault} onChange={(e) => setTransType(e.target.value)}>
                    <option>Income</option>
                    <option>Expense</option>
                </select>
            </label>
            <label>Category
                <select name="category" onChange={(e) => setTransCat(e.target.value)}>
                    {categories?.map((category: any) => <option key={category.id} value={category.id}>{category.category}</option>)}
                </select>
            </label>
            <label>Description
                <input name="description" type="text" onChange={(e) => setDesc(e.target.value)}></input>
            </label>
            <label>Amount
                <input name="amount" type="number" step="0.01" min="0" onChange={(e) => setAmount(parseFloat(e.target.value))}></input>
            </label>
        </form>
    );
}

export default TransactionForm;
