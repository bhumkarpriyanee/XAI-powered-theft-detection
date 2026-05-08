import { useEffect, useState } from "react";
import { getCustomers } from "../api";

export default function CustomerList({ onSelect }) {
    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        getCustomers()
        .then((res) => {
            const flagged = res.data.filter((c) => c.is_theft === 1);
            setCustomers(flagged);
        })
        .catch((err) => {
            console.error("Failed to fetch customers:", err);
        });
    },[]);

    return(
        <div>
            <h2>Flagged Customers (Theft Detected) </h2>

            {customers.length === 0 ? (
                <p></p>
            ):(
                <ul>
                    {customers.map((c) => (
                        <li key={c.customer_id}>
                            Customer{" "}
                            <strong>{c.customer_id}</strong>{" "}
                            (Risk:{" "}
                            <strong>{(c.probability * 100).toFixed(1)}%</strong>)
                            <br/>
                            <small>
                                Status:{" "}
                                {c.is_theft ? "Suspected theft" : "Normal"}
                            </small>
                            <button onClick = {() => onSelect(c.customer_id)}>
                                Explain
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}