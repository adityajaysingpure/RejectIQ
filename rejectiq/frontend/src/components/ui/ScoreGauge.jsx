import React from "react";

const riskMeta = {
  low:      { color: "#22c55e", label: "Low Risk",      bg: "#dcfce7" },
  medium:   { color: "#f59e0b", label: "Medium Risk",   bg: "#fef3c7" },
  high:     { color: "#ef4444", label: "High Risk",     bg: "#fee2e2" },
  critical: { color: "#7f1d1d", label: "Critical Risk", bg: "#fecaca" },
};

export default function ScoreGauge({ atsScore, rejectionRisk, matchPercentage }) {
  const meta = riskMeta[rejectionRisk] || riskMeta.high;

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (atsScore / 100) * circumference;

  return (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>

      {/* Circular ATS score */}
      <div style={{ textAlign: "center" }}>
        <svg width={130} height={130} viewBox="0 0 130 130">
          <circle cx={65} cy={65} r={54} fill="none" stroke="#f3f4f6" strokeWidth={10} />
          <circle
            cx={65} cy={65} r={54}
            fill="none"
            stroke={meta.color}
            strokeWidth={10}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 65 65)"
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
          <text x={65} y={60} textAnchor="middle" fontSize={26} fontWeight={700} fill="#1f2937">
            {atsScore}
          </text>
          <text x={65} y={78} textAnchor="middle" fontSize={11} fill="#9ca3af">
            ATS Score
          </text>
        </svg>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6b7280" }}>out of 100</p>
      </div>

      {/* Risk badge + match % */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{
          padding: "10px 20px", borderRadius: 10,
          background: meta.bg, border: `1.5px solid ${meta.color}`,
          textAlign: "center",
        }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: meta.color }}>
            {meta.label}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>Rejection risk</p>
        </div>

        <div style={{
          padding: "10px 20px", borderRadius: 10,
          background: "#eef2ff", border: "1.5px solid #c7d2fe",
          textAlign: "center",
        }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: "#4f46e5" }}>
            {matchPercentage}%
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>Keyword match</p>
        </div>
      </div>
    </div>
  );
}
