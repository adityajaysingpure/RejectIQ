import React, { useState } from "react";
import ScoreGauge from "./ScoreGauge";

const card = {
  background: "#fff", borderRadius: 12,
  padding: 20, boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
  marginBottom: 16,
};
const sectionTitle = {
  margin: "0 0 14px", fontWeight: 700,
  fontSize: 15, color: "#1f2937",
};

export default function AnalysisResult({ result, onReset }) {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview",  label: "Overview"   },
    { id: "gaps",      label: "Skill Gaps" },
    { id: "rewrites",  label: "Rewrites"   },
    { id: "keywords",  label: "Keywords"   },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: "8px 18px", borderRadius: 8, fontSize: 13,
            fontWeight: 600, border: "none", cursor: "pointer",
            background: activeTab === t.id ? "#4f46e5" : "#f3f4f6",
            color: activeTab === t.id ? "#fff" : "#6b7280",
          }}>
            {t.label}
          </button>
        ))}
        <button onClick={onReset} style={{
          marginLeft: "auto", padding: "8px 16px", borderRadius: 8,
          fontSize: 13, fontWeight: 600, border: "1px solid #e5e7eb",
          cursor: "pointer", background: "#fff", color: "#6b7280",
        }}>
          ↩ New Analysis
        </button>
      </div>

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <div>
          <div style={card}>
            <ScoreGauge
              atsScore={result.ats_score}
              rejectionRisk={result.rejection_risk}
              matchPercentage={result.match_percentage}
            />
          </div>

          {/* Verdict */}
          <div style={{ ...card, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <p style={sectionTitle}>🧠 Honest Verdict</p>
            <p style={{ margin: 0, fontSize: 14, color: "#374151", lineHeight: 1.7 }}>
              {result.overall_verdict}
            </p>
          </div>

          {/* Top 3 fixes */}
          <div style={card}>
            <p style={sectionTitle}>🔧 Top 3 Fixes — Do These First</p>
            {result.top_3_fixes.map((fix, i) => (
              <div key={i} style={{
                display: "flex", gap: 12, alignItems: "flex-start",
                padding: "10px 0", borderBottom: i < 2 ? "1px solid #f3f4f6" : "none",
              }}>
                <span style={{
                  minWidth: 26, height: 26, borderRadius: "50%",
                  background: "#4f46e5", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700,
                }}>{i + 1}</span>
                <p style={{ margin: 0, fontSize: 14, color: "#374151", lineHeight: 1.6 }}>{fix}</p>
              </div>
            ))}
          </div>

          {/* Flags */}
          {(result.title_mismatch || result.experience_gap) && (
            <div style={card}>
              <p style={sectionTitle}>⚠️ Flags</p>
              {result.title_mismatch && (
                <div style={{ padding: "10px 14px", borderRadius: 8, background: "#fee2e2", marginBottom: 8 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#991b1b" }}>
                    Title Mismatch
                  </p>
                  {result.title_suggestion && (
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "#7f1d1d" }}>
                      Suggestion: <strong>{result.title_suggestion}</strong>
                    </p>
                  )}
                </div>
              )}
              {result.experience_gap && result.experience_note && (
                <div style={{ padding: "10px 14px", borderRadius: 8, background: "#fef3c7" }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#92400e" }}>
                    Experience Gap
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#78350f" }}>
                    {result.experience_note}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SKILL GAPS */}
      {activeTab === "gaps" && (
        <div style={card}>
          <p style={sectionTitle}>🧩 Skill Gap Analysis</p>
          {result.skill_gaps.length === 0 ? (
            <p style={{ color: "#6b7280", fontSize: 14 }}>No major skill gaps detected.</p>
          ) : (
            result.skill_gaps.map((gap, i) => (
              <div key={i} style={{
                padding: "12px 14px", borderRadius: 10, marginBottom: 10,
                background: gap.present_in_resume ? "#f0fdf4" : "#fff7ed",
                border: `1px solid ${gap.present_in_resume ? "#bbf7d0" : "#fed7aa"}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#1f2937" }}>
                    {gap.present_in_resume ? "✅" : "❌"} {gap.skill}
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
                    background: gap.importance === "required" ? "#fee2e2" : "#e0f2fe",
                    color: gap.importance === "required" ? "#991b1b" : "#0369a1",
                  }}>
                    {gap.importance}
                  </span>
                </div>
                {!gap.present_in_resume && (
                  <p style={{ margin: 0, fontSize: 13, color: "#78350f" }}>
                    💡 {gap.suggestion}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* REWRITES */}
      {activeTab === "rewrites" && (
        <div>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 14 }}>
            These are weak lines from your resume with suggested rewrites for this specific JD.
          </p>
          {result.weak_sections.length === 0 ? (
            <div style={card}>
              <p style={{ color: "#6b7280", fontSize: 14 }}>No weak sections identified.</p>
            </div>
          ) : (
            result.weak_sections.map((sec, i) => (
              <div key={i} style={card}>
                <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 600, color: "#4f46e5", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {sec.section}
                </p>
                <div style={{ padding: "10px 14px", borderRadius: 8, background: "#fee2e2", marginBottom: 10 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 11, color: "#991b1b", fontWeight: 600 }}>ORIGINAL</p>
                  <p style={{ margin: 0, fontSize: 13, color: "#7f1d1d", fontStyle: "italic" }}>
                    "{sec.original_text}"
                  </p>
                </div>
                <p style={{ margin: "0 0 8px", fontSize: 13, color: "#ef4444" }}>⚠️ {sec.issue}</p>
                <div style={{ padding: "10px 14px", borderRadius: 8, background: "#dcfce7" }}>
                  <p style={{ margin: "0 0 4px", fontSize: 11, color: "#166534", fontWeight: 600 }}>REWRITE</p>
                  <p style={{ margin: 0, fontSize: 13, color: "#14532d" }}>{sec.rewrite}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* KEYWORDS */}
      {activeTab === "keywords" && (
        <div>
          <div style={{ ...card, marginBottom: 14 }}>
            <p style={sectionTitle}>✅ Keywords Found in Your Resume</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {result.strong_keywords.map((kw, i) => (
                <span key={i} style={{
                  padding: "4px 12px", borderRadius: 999,
                  background: "#dcfce7", color: "#166534",
                  fontSize: 13, fontWeight: 500,
                }}>{kw}</span>
              ))}
              {result.strong_keywords.length === 0 && (
                <p style={{ color: "#9ca3af", fontSize: 14 }}>None found.</p>
              )}
            </div>
          </div>

          <div style={card}>
            <p style={sectionTitle}>❌ Missing Keywords — Add These to Your Resume</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {result.missing_keywords.map((kw, i) => (
                <span key={i} style={{
                  padding: "4px 12px", borderRadius: 999,
                  background: "#fee2e2", color: "#991b1b",
                  fontSize: 13, fontWeight: 500,
                }}>{kw}</span>
              ))}
              {result.missing_keywords.length === 0 && (
                <p style={{ color: "#6b7280", fontSize: 14 }}>No missing keywords — great match!</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
