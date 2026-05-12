import { useState } from "react";
import CustomerList from "../components/CustomerList";
import CustomerDetail from "../components/CustomerDetail";

export default function CustomerRegistry() {
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  return (
    <div>
      <h1 style={{ marginBottom: "30px", color: "#2c3e50" }}>Customer List Registry</h1>
      
      <div style={{
        display: "grid",
        gridTemplateColumns: selectedCustomerId ? "1fr 1fr" : "1fr",
        gap: "20px",
        transition: "all 0.3s ease"
      }}>
        <div>
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
