import React from "react";
import { useHistory } from "../hooks/useHistory";

const riskColor = {
  low:      "#22c55e",
  medium:   "#f59e0b",
  high:     "#ef4444",
  critical: "#7f1d1d",
};

export default function History() {
  const { records, stats, loading, remove } = useHistory();

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "24px 16px" }}>
      <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: "#1f2937" }}>
        Analysis History
      </h2>
      <p style={{ margin: "0 0 20px", fontSize: 14, color: "#6b7280" }}>
        Track how your resume performs across different companies and roles.
      </p>

      {/* Stats row */}
      {stats && stats.total_analyses > 0 && (
        <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { label: "Total Analyses", value: stats.total_analyses, color: "#4f46e5" },
            { label: "Avg ATS Score",  value: `${stats.avg_ats_score}/100`, color: "#06b6d4" },
          ].map((s) => (
            <div key={s.label} style={{
              flex: 1, minWidth: 140, background: "#fff",
              borderRadius: 12, padding: "16px 20px",
              boxShadow: "0 1px 8px rgba(0,0,0,0.07)", textAlign: "center",
            }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 22, color: s.color }}>{s.value}</p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9ca3af" }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <p style={{ color: "#9ca3af", textAlign: "center" }}>Loading...</p>
      ) : records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}>
          <p style={{ fontSize: 40 }}>📋</p>
          <p style={{ fontSize: 15, fontWeight: 500 }}>No analyses yet.</p>
          <p style={{ fontSize: 13 }}>Run your first analysis to see results here.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {records.map((r) => (
            <div key={r._id} style={{
              background: "#fff", borderRadius: 12, padding: "16px 18px",
              boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#1f2937" }}>
                    {r.company_name || "Unknown Company"}
                  </span>
                  {r.role_title && (
                    <span style={{ fontSize: 12, color: "#6b7280" }}>· {r.role_title}</span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#4f46e5" }}>
                    ATS: {r.ats_score}/100
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#06b6d4" }}>
                    Match: {r.match_percentage}%
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
                    color: riskColor[r.rejection_risk] || "#6b7280",
                    background: "#f9fafb", border: `1px solid ${riskColor[r.rejection_risk] || "#e5e7eb"}`,
                    textTransform: "capitalize",
                  }}>
                    {r.rejection_risk} risk
                  </span>
                </div>
                <p style={{ margin: "6px 0 0", fontSize: 12, color: "#9ca3af" }}>
                  {new Date(r.created_at).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric"
                  })}
                </p>
              </div>
              <button
                onClick={() => remove(r._id)}
                style={{ background: "none", border: "none", color: "#d1d5db", cursor: "pointer", fontSize: 20 }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
