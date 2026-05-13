export default function Sidebar({ activeTab, setActiveTab, onLogout }) {
  const menuItems = [
    { id: "dashboard", label: "Overview", icon: "📊" },
    { id: "customers", label: "Customer List", icon: "👥" },
    { id: "alerts", label: "Recent Alerts", icon: "⚠️" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div style={{
      width: "250px",
      backgroundColor: "#2c3e50",
      color: "white",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      padding: "20px 0",
      position: "fixed",
      left: 0,
      top: 0
    }}>
      <div style={{ padding: "0 20px 30px 20px", borderBottom: "1px solid #3e4f5f" }}>
        <h2 style={{ fontSize: "1.2rem", margin: 0 }}>Theft Detection</h2>
        <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>XAI Powered v1.0</span>
      </div>
      
      <nav style={{ flex: 1, marginTop: "20px" }}>
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              padding: "15px 20px",
              cursor: "pointer",
              backgroundColor: activeTab === item.id ? "#34495e" : "transparent",
              borderLeft: activeTab === item.id ? "4px solid #3498db" : "4px solid transparent",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center"
            }}
          >
            <span style={{ marginRight: "10px" }}>{item.icon}</span>
            {item.label}
          </div>
        ))}
      </nav>
      
      <div style={{ padding: "20px", borderTop: "1px solid #3e4f5f" }}>
        <button
          onClick={onLogout}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#e74c3c",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
