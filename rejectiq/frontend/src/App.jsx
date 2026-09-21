import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Analyse from "./pages/Analyse";
import History from "./pages/History";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: "100vh", background: "#f4f6fb" }}>

        {/* Nav */}
        <nav style={{
          background: "#1f2937", height: 56,
          display: "flex", alignItems: "center",
          padding: "0 24px", gap: 28,
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        }}>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 17, letterSpacing: "-0.3px" }}>
            Reject<span style={{ color: "#818cf8" }}>IQ</span>
          </span>

          <div style={{ display: "flex", gap: 4 }}>
            {[
              { to: "/",        label: "Analyse"  },
              { to: "/history", label: "History"  },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end
                style={({ isActive }) => ({
                  padding: "6px 14px", borderRadius: 8,
                  fontSize: 13, fontWeight: 600,
                  textDecoration: "none",
                  background: isActive ? "#374151" : "transparent",
                  color: isActive ? "#fff" : "#9ca3af",
                })}
              >
                {label}
              </NavLink>
            ))}
          </div>

          <span style={{ marginLeft: "auto", color: "#6b7280", fontSize: 12 }}>
            ReactJS · FastAPI · GPT-4 · Pinecone
          </span>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/"        element={<Analyse />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
