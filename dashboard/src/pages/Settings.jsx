import { useEffect, useState } from "react";
import { getSettings, updateSettings } from "../api";

export default function Settings() {
    const [threshold, setThreshold] = useState(0.5);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        getSettings().then(res => setThreshold(res.data.detection_threshold));
    }, []);

    const handleSave = () => {
        setSaving(true);
        updateSettings({ detection_threshold: threshold })
            .then(() => {
                setMessage("Settings saved successfully!");
                setTimeout(() => setMessage(""), 3000);
            })
            .catch(err => console.error(err))
            .finally(() => setSaving(false));
    };

    return (
        <div style={{ maxWidth: "600px" }}>
            <h1 style={{ marginBottom: "2rem", color: "#2c3e50" }}>System Settings</h1>
            <p style={{ color: "#7f8c8d", marginBottom: "30px" }}>Configure global detection parameters and system behavior.</p>

            <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                <div style={{ marginBottom: "30px" }}>
                    <label style={{ display: "block", fontWeight: "bold", marginBottom: "10px" }}>
                        Detection Sensitivity Threshold: {(threshold * 100).toFixed(0)}%
                    </label>
                    <p style={{ fontSize: "0.85rem", color: "#7f8c8d", marginBottom: "15px" }}>
                        Lowering this will flag more suspicious cases (higher recall), while raising it will reduce false alarms (higher precision).
                    </p>
                    <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.05" 
                        value={threshold}
                        onChange={(e) => setThreshold(parseFloat(e.target.value))}
                        style={{ width: "100%", cursor: "pointer" }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#95a5a6", marginTop: "5px" }}>
                        <span>Sensitive (Low Threshold)</span>
                        <span>Strict (High Threshold)</span>
                    </div>
                </div>

                <div style={{ borderTop: "1px solid #eee", paddingTop: "20px", display: "flex", alignItems: "center", gap: "20px" }}>
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            padding: "10px 25px",
                            backgroundColor: "#2c3e50",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: saving ? "not-allowed" : "pointer",
                            opacity: saving ? 0.7 : 1
                        }}
                    >
                        {saving ? "Saving..." : "Apply Changes"}
                    </button>
                    {message && <span style={{ color: "#27ae60", fontWeight: "bold", fontSize: "0.9rem" }}>{message}</span>}
                </div>
            </div>

            <div style={{ marginTop: "30px", backgroundColor: "#ebf5fb", padding: "20px", borderRadius: "8px", color: "#2980b9" }}>
                <strong>Note:</strong> Changes to the threshold will immediately affect the Dashboard and Security Alerts pages.
            </div>
        </div>
    );
}
