import { useEffect, useState } from "react";
import { getCustomers } from "../api";
import CustomerDetail from "../components/CustomerDetail";
import { generatePDFReport } from "../components/ReportGenerator";

export default function Alerts() {
    const [alerts, setAlerts] = useState([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);

    useEffect(() => {
        getCustomers()
        .then((res) => {
            // Filter only flagged ones and sort by probability
            const flagged = res.data
                .filter(c => c.is_theft === 1)
                .sort((a, b) => b.probability - a.probability);
            setAlerts(flagged);
        })
        .catch(err => console.error(err));
    }, []);

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                <div>
                    <h1 style={{ margin: 0, color: "#2c3e50" }}>Security Alerts</h1>
                    <p style={{ color: "#7f8c8d", margin: "2rem 0 0 0" }}>Priority list of suspected theft cases requiring immediate field inspection.</p>
                </div>
                <button 
                    onClick={() => generatePDFReport(alerts)}
                    disabled={alerts.length === 0}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#2c3e50",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: alerts.length === 0 ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                    }}
                >
                    📄 Download PDF Report
                </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: selectedCustomerId ? "1fr 1fr" : "1fr", gap: "20px", marginTop: "20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    {alerts.length === 0 ? (
                        <div style={{ padding: "40px", textAlign: "center", backgroundColor: "white", borderRadius: "8px" }}>
                            <h3>No active alerts</h3>
                            <p>All load patterns appear normal within the current threshold.</p>
                        </div>
                    ) : (
                        alerts.map(alert => (
                            <div 
                                key={alert.customer_id}
                                onClick={() => setSelectedCustomerId(alert.customer_id)}
                                style={{
                                    backgroundColor: "white",
                                    padding: "20px",
                                    borderRadius: "8px",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                                    borderLeft: "6px solid #e74c3c",
                                    cursor: "pointer",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    border: selectedCustomerId === alert.customer_id ? "2px solid #e74c3c" : "none"
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: "bold", fontSize: "1.1rem", marginBottom: "5px" }}>
                                        Customer #{alert.customer_id}
                                    </div>
                                    <div style={{ fontSize: "0.85rem", color: "#7f8c8d" }}>
                                        Zone: {alert.zone} | Last Reading: {alert.last_timestamp || "N/A"}
                                    </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ 
                                        color: "#e74c3c", 
                                        fontWeight: "bold", 
                                        fontSize: "1.2rem" 
                                    }}>
                                        {(alert.probability * 100).toFixed(1)}% Risk
                                    </div>
                                    <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#c0392b" }}>
                                        High Severity
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {selectedCustomerId && (
                    <div style={{ 
                        backgroundColor: "white", 
                        padding: "20px", 
                        borderRadius: "8px", 
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                        height: "fit-content",
                        position: "sticky",
                        top: "20px"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                            <h3>Investigation Report</h3>
                            <button onClick={() => setSelectedCustomerId(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>✕</button>
                        </div>
                        <CustomerDetail customerId={selectedCustomerId} />
                    </div>
                )}
            </div>
        </div>
    );
}
