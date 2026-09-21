import React, { useState } from "react";
import ResumeUploader from "../components/ui/ResumeUploader";
import AnalysisResult from "../components/ui/AnalysisResult";
import { useAnalysis } from "../hooks/useAnalysis";

export default function Analyse() {
  const { loading, progress, stage, result, error, runWithFile, runWithText, reset } = useAnalysis();

  const [mode, setMode]       = useState("upload");
  const [file, setFile]       = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [jd, setJd]           = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole]       = useState("");

  const canSubmit = (mode === "upload" ? !!file : resumeText.length > 100) && jd.trim().length > 50;

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (mode === "upload") {
      runWithFile({ file, jd, company, role });
    } else {
      runWithText({ resumeText, jd, company, role });
    }
  };

  if (result) {
    return (
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "24px 16px" }}>
        <AnalysisResult result={result} onReset={reset} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "24px 16px" }}>

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: "#1f2937" }}>
          Analyse Your Resume
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>
          Paste a job description, upload your resume, and find out exactly why you might get rejected.
        </p>
      </div>

      {/* Resume input */}
      <div style={cardStyle}>
        <p style={labelStyle}>Your Resume</p>
        <ResumeUploader
          mode={mode}
          setMode={setMode}
          onFileSelect={setFile}
          onTextInput={setResumeText}
        />
      </div>

      {/* JD input */}
      <div style={cardStyle}>
        <p style={labelStyle}>Job Description <span style={{ color: "#ef4444" }}>*</span></p>
        <textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder="Paste the full job description here..."
          rows={8}
          style={textareaStyle}
        />
      </div>

      {/* Optional metadata */}
      <div style={{ ...cardStyle, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <p style={labelStyle}>Company Name <span style={{ color: "#9ca3af" }}>(optional)</span></p>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Razorpay"
            style={inputStyle}
          />
        </div>
        <div>
          <p style={labelStyle}>Role Title <span style={{ color: "#9ca3af" }}>(optional)</span></p>
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Full Stack Engineer"
            style={inputStyle}
          />
        </div>
      </div>

      {error && (
        <div style={{ padding: "12px 16px", borderRadius: 10, background: "#fee2e2", border: "1px solid #fca5a5", marginBottom: 16, fontSize: 14, color: "#991b1b" }}>
          ❌ {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{ ...cardStyle, textAlign: "center" }}>
          <p style={{ margin: "0 0 12px", fontWeight: 600, color: "#4f46e5", fontSize: 15 }}>
            {stage === "uploading" ? "📤 Uploading resume..." : "🤖 Analysing with GPT-4..."}
          </p>
          <div style={{ background: "#f3f4f6", borderRadius: 999, height: 8, overflow: "hidden" }}>
            <div style={{
              width: stage === "analysing" ? "75%" : `${progress}%`,
              height: "100%", background: "#4f46e5",
              transition: "width 0.4s ease",
              animation: stage === "analysing" ? "pulse 1.5s infinite" : "none",
            }} />
          </div>
          <p style={{ margin: "10px 0 0", fontSize: 13, color: "#9ca3af" }}>
            {stage === "analysing" ? "This takes 15–30 seconds..." : `${progress}%`}
          </p>
        </div>
      )}

      {!loading && (
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{
            width: "100%", padding: "14px", borderRadius: 10,
            background: canSubmit ? "#4f46e5" : "#e5e7eb",
            color: canSubmit ? "#fff" : "#9ca3af",
            border: "none", fontWeight: 700, fontSize: 15,
            cursor: canSubmit ? "pointer" : "not-allowed",
            transition: "background 0.2s",
          }}
        >
          🔍 Analyse My Resume
        </button>
      )}
    </div>
  );
}

const cardStyle = {
  background: "#fff", borderRadius: 12,
  padding: 20, boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
  marginBottom: 16,
};
const labelStyle = {
  margin: "0 0 8px", fontWeight: 600,
  fontSize: 13, color: "#374151",
};
const textareaStyle = {
  width: "100%", padding: "10px 14px",
  borderRadius: 10, border: "1.5px solid #e5e7eb",
  fontSize: 13, resize: "vertical", outline: "none",
  fontFamily: "inherit", lineHeight: 1.6,
  boxSizing: "border-box",
};
const inputStyle = {
  width: "100%", padding: "10px 14px",
  borderRadius: 10, border: "1.5px solid #e5e7eb",
  fontSize: 13, outline: "none", boxSizing: "border-box",
};
