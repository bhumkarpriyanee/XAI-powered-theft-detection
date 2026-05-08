import { useEffect, useState } from "react";
import { getExplanation } from "../api";

// Chart.js MUST be registered before use — this is what was missing
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function CustomerDetail({ customerId }) {
  const [exp, setExp] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!customerId) return;
    setExp(null);
    setError(null);

    getExplanation(customerId)
      .then((res) => setExp(res.data))
      .catch((err) => {
        console.error("Failed to get explanation:", err);
        setError("Could not load explanation. Please try again.");
      });
  }, [customerId]);

  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!exp) return <div>Loading details for customer {customerId}…</div>;
  if (exp.error) return <div style={{ color: "red" }}>{exp.error}</div>;

  const { features = [], shap_values = [], probability = 0, is_theft = 0 } = exp;

  // Colour bars: positive SHAP = red (increases theft risk), negative = green
  const barColors = shap_values.map((v) =>
    v >= 0 ? "rgba(239,68,68,0.7)" : "rgba(34,197,94,0.7)"
  );

  const recommendations =
    is_theft === 1
      ? [
          "Check meter seal and housing for physical tampering.",
          "Verify neutral connection and earthing integrity.",
          "Inspect nearby transformers for load imbalance.",
          "Review recent load-pattern changes for this customer.",
        ]
      : ["No strong evidence of theft detected for this customer."];

  return (
    <div>
      <h3>Customer {exp.customer_id} – Detailed Analysis</h3>

      <p>
        <strong>Theft probability:</strong> {(probability * 100).toFixed(1)}%
      </p>
      <p>
        <em>
          {is_theft === 1
            ? "⚠️ Suspected theft pattern."
            : "✅ Load pattern consistent with normal usage."}
        </em>
      </p>

      {/* SHAP bar chart — fixed: features & shap_values are now flat lists */}
      <h4>Why this customer was flagged (SHAP feature influence)</h4>
      <Bar
        data={{
          labels: features,
          datasets: [
            {
              label: "SHAP value (impact on theft score)",
              data: shap_values,
              backgroundColor: barColors,
              borderColor: barColors.map((c) => c.replace("0.7", "1")),
              borderWidth: 1,
            },
          ],
        }}
        options={{
          indexAxis: "y",         // horizontal bars
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) =>
                  ` ${ctx.parsed.x >= 0 ? "+" : ""}${ctx.parsed.x.toFixed(4)}`,
              },
            },
          },
          scales: {
            x: { beginAtZero: true, title: { display: true, text: "SHAP value" } },
          },
        }}
      />

      <h4>Field-engineer recommendations:</h4>
      <ul>
        {recommendations.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>
    </div>
  );
}
