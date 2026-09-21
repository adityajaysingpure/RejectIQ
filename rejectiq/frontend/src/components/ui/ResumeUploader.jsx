import React, { useState, useRef } from "react";

export default function ResumeUploader({ onFileSelect, onTextInput, mode, setMode }) {
  const inputRef = useRef();
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [pasteText, setPasteText] = useState("");

  const handleFile = (file) => {
    if (!file?.name.endsWith(".pdf")) {
      alert("Only PDF files are supported.");
      return;
    }
    setFileName(file.name);
    onFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div>
      {/* Toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {["upload", "paste"].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: "6px 16px", borderRadius: 8, fontSize: 13,
              fontWeight: 600, border: "none", cursor: "pointer",
              background: mode === m ? "#4f46e5" : "#f3f4f6",
              color: mode === m ? "#fff" : "#6b7280",
            }}
          >
            {m === "upload" ? "📄 Upload PDF" : "✏️ Paste Text"}
          </button>
        ))}
      </div>

      {mode === "upload" ? (
        <div
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragOver ? "#4f46e5" : fileName ? "#22c55e" : "#d1d5db"}`,
            borderRadius: 12, padding: "28px 20px",
            textAlign: "center", cursor: "pointer",
            background: dragOver ? "#eef2ff" : fileName ? "#f0fdf4" : "#fafafa",
            transition: "all 0.2s",
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
          {fileName ? (
            <div>
              <p style={{ margin: 0, fontSize: 24 }}>✅</p>
              <p style={{ margin: "6px 0 0", fontWeight: 600, color: "#166534", fontSize: 14 }}>
                {fileName}
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9ca3af" }}>
                Click to change
              </p>
            </div>
          ) : (
            <div>
              <p style={{ margin: 0, fontSize: 32 }}>📄</p>
              <p style={{ margin: "8px 0 4px", fontWeight: 600, color: "#374151", fontSize: 14 }}>
                Drop your resume here or click to browse
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>PDF only</p>
            </div>
          )}
        </div>
      ) : (
        <textarea
          value={pasteText}
          onChange={(e) => { setPasteText(e.target.value); onTextInput(e.target.value); }}
          placeholder="Paste your resume text here..."
          rows={10}
          style={{
            width: "100%", padding: "12px 14px", borderRadius: 10,
            border: "1.5px solid #e5e7eb", fontSize: 13,
            resize: "vertical", outline: "none", fontFamily: "inherit",
            lineHeight: 1.6, boxSizing: "border-box",
          }}
        />
      )}
    </div>
  );
}
