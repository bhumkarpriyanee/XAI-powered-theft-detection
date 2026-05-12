import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CustomerRegistry from "./pages/CustomerRegistry";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import Sidebar from "./components/Sidebar";
import "./App.css";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Check if already logged in (mock)
  useEffect(() => {
    const auth = localStorage.getItem("isLoggedIn");
    if (auth === "true") setIsLoggedIn(true);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{ display: "flex", backgroundColor: "#f4f7f6", minHeight: "100vh" }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      
      <main style={{ 
        flex: 1, 
        marginLeft: "250px", 
        padding: "40px",
        minWidth: 0 // Prevent flex items from overflowing
      }}>
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "customers" && <CustomerRegistry />}
        {activeTab === "alerts" && <Alerts />}
        {activeTab === "settings" && <Settings />}
      </main>
    </div>
  );
}
