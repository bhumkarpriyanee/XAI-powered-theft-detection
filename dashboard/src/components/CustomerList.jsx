import { useEffect, useState, useMemo } from "react";
import { getCustomers } from "../api";

export default function CustomerList({ onSelect }) {
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [zoneFilter, setZoneFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortOrder, setSortOrder] = useState("desc"); // 'desc' or 'asc'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getCustomers()
            .then((res) => {
                setCustomers(Array.isArray(res.data) ? res.data : []);
            })
            .catch((err) => {
                console.error("Failed to fetch customers:", err);
                setCustomers([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const filteredAndSortedCustomers = useMemo(() => {
        if (!customers) return [];
        
        const term = searchTerm.toLowerCase().trim();
        
        return customers
            .filter(c => {
                const idMatch = c.customer_id?.toString().toLowerCase().includes(term);
                const zoneMatch = zoneFilter === "All" || c.zone === zoneFilter;
                
                let statusMatch = true;
                if (statusFilter === "Suspected") statusMatch = c.is_theft === 1;
                if (statusFilter === "Normal") statusMatch = c.is_theft === 0;
                
                return idMatch && zoneMatch && statusMatch;
            })
            .sort((a, b) => {
                const probA = a.probability || 0;
                const probB = b.probability || 0;
                return sortOrder === "desc" ? probB - probA : probA - probB;
            });
    }, [customers, searchTerm, zoneFilter, statusFilter, sortOrder]);

    const zones = useMemo(() => {
        return ["All", ...new Set(customers.map(c => c.zone).filter(Boolean))];
    }, [customers]);

    const getRiskBadge = (prob) => {
        let bg, color, label;
        if (prob >= 0.7) {
            bg = "#ffd7d7"; color = "#c0392b"; label = "High Risk";
        } else if (prob >= 0.4) {
            bg = "#fff3cd"; color = "#856404"; label = "Medium Risk";
        } else {
            bg = "#d4edda"; color = "#155724"; label = "Low Risk";
        }
        return (
            <span style={{ 
                padding: "4px 10px", 
                borderRadius: "12px", 
                fontSize: "0.75rem",
                backgroundColor: bg,
                color: color,
                fontWeight: "bold",
                textTransform: "uppercase"
            }}>
                {label}
            </span>
        );
    };

    if (loading) return <div style={{ textAlign: "center", padding: "20px" }}>Loading customers...</div>;

    return (
        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <input 
                        type="text" 
                        placeholder="Search ID..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd", width: "120px" }}
                    />
                    <select 
                        value={zoneFilter}
                        onChange={(e) => setZoneFilter(e.target.value)}
                        style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                    >
                        <option value="All">All Zones</option>
                        {zones.filter(z => z !== "All").map(z => <option key={z} value={z}>{z}</option>)}
                    </select>
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                    >
                        <option value="All">All Status</option>
                        <option value="Suspected">Suspected Only</option>
                        <option value="Normal">Normal Only</option>
                    </select>
                </div>
                <div>
                    <button 
                        onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
                        style={{ padding: "8px 15px", backgroundColor: "#f8f9fa", border: "1px solid #ddd", borderRadius: "4px", cursor: "pointer" }}
                    >
                        Sort Risk: {sortOrder === "desc" ? "▼ High" : "▲ Low"}
                    </button>
                </div>
            </div>

            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ textAlign: "left", borderBottom: "2px solid #eee" }}>
                            <th style={{ padding: "12px" }}>ID</th>
                            <th style={{ padding: "12px" }}>Zone</th>
                            <th style={{ padding: "12px" }}>Status</th>
                            <th style={{ padding: "12px" }}>Risk %</th>
                            <th style={{ padding: "12px" }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedCustomers.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: "center", padding: "20px", color: "#7f8c8d" }}>No matching customers found</td></tr>
                        ) : (
                            filteredAndSortedCustomers.map((c) => (
                                <tr key={c.customer_id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                                    <td style={{ padding: "12px" }}>{c.customer_id}</td>
                                    <td style={{ padding: "12px" }}>{c.zone}</td>
                                    <td style={{ padding: "12px" }}>
                                        {getRiskBadge(c.probability)}
                                    </td>
                                    <td style={{ padding: "12px", fontWeight: "bold" }}>
                                        {(c.probability * 100).toFixed(1)}%
                                    </td>
                                    <td style={{ padding: "12px" }}>
                                        <button 
                                            onClick={() => onSelect(c.customer_id)}
                                            style={{ 
                                                padding: "5px 10px", 
                                                backgroundColor: "#3498db", 
                                                color: "white", 
                                                border: "none", 
                                                borderRadius: "4px", 
                                                cursor: "pointer",
                                                fontSize: "0.85rem"
                                            }}
                                        >
                                            Analyze
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
