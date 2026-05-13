export default function StatCards({ stats }) {
  const cards = [
    { label: "Total Customers", value: stats.total_customers, icon: "👥", color: "#3498db" },
    { label: "Flagged Today", value: stats.flagged_today, icon: "⚠️", color: "#e74c3c" },
    { label: "Resolved Cases", value: stats.resolved_cases, icon: "✅", color: "#2ecc71" },
    { label: "Average Risk", value: `${stats.average_risk}%`, icon: "📈", color: "#f39c12" },
  ];

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "20px",
      marginBottom: "30px"
    }}>
      {cards.map((card, idx) => (
        <div key={idx} style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          display: "flex",
          alignItems: "center",
          borderTop: `4px solid ${card.color}`
        }}>
          <div style={{
            fontSize: "2rem",
            marginRight: "15px",
            opacity: 0.8
          }}>
            {card.icon}
          </div>
          <div>
            <div style={{ color: "#7f8c8d", fontSize: "0.9rem", fontWeight: "600" }}>{card.label}</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#2c3e50" }}>{card.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
