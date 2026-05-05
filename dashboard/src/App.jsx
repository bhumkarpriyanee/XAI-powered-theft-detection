import { useState } from 'react'
import './App.css'
import CustomerList from "./components/CustomerList";
import CustomerDetail from "./components/CustomerDetail";

export default function App() {
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  return (
    <div style={{
      fontfamily:"Arial, sans-serif",
      padding: "20px",
      maxWidth: "1200px",
      margin:"0 auto",
    }}>
      <h1>Electricity Theft XAI Dashboard</h1>
      <p>Real-time theft-detection and explanation for field engineers.</p>
      <div style={{
        display:"grid",
        gridTemplateColumns: "300px 1fr",
        gap:"20px",
        marginTop:"20px",
      }}>
        <div>
          <CustomerList onSelect={(id) => setSelectedCustomerId(id)} />
        </div>
        <div>
          {selectedCustomerId ? (
            <CustomerDetail
            customerId={selectedCustomerId} />
          ) : (
            <p>Select a customer to see details and explanation.</p>
          )}
        </div>
      </div>
    </div>
  )
}
