import { useState, useEffect } from "react";
import StatCards from "../components/StatCards";
import CustomerList from "../components/CustomerList";
import CustomerDetail from "../components/CustomerDetail";
import { getStats } from "../api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_customers: 0,
    flagged_today: 0,
    resolved_cases: 0,
    average_risk: 0
  });
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  useEffect(() => {
    getStats().then(res => setStats(res.data)).catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: "10px", color: "#2c3e50" }}>Overview</h1>
      <p style={{ color: "#7f8c8d", marginBottom: "30px" }}>Real-time electricity theft monitoring and XAI-driven risk analysis.</p>
      
      <StatCards stats={stats} />
      
      <div style={{
        display: "grid",
        gridTemplateColumns: selectedCustomerId ? "1fr 1fr" : "1fr",
        gap: "20px",
        transition: "all 0.3s ease"
      }}>
        <div>
          <h2 style={{ fontSize: "1.2rem", marginBottom: "15px", color: "#2c3e50" }}>Customer Risk Registry</h2>
          <CustomerList onSelect={(id) => setSelectedCustomerId(id)} />
        </div>
        
        {selectedCustomerId && (
          <div style={{ 
            backgroundColor: "white", 
            padding: "20px", 
            borderRadius: "8px", 
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            position: "sticky",
            top: "20px",
            height: "fit-content"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "1.2rem", margin: 0, color: "#2c3e50" }}>Analysis Results</h2>
              <button 
                onClick={() => setSelectedCustomerId(null)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>
            <CustomerDetail customerId={selectedCustomerId} />
          </div>
        )}
      </div>
    </div>
  );
}
