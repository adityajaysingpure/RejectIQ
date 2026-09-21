import { useState, useCallback } from "react";
import { analyseResumePDF, analyseResumeText } from "../services/api";

const INITIAL = {
  loading: false,
  progress: 0,
  result: null,
  error: null,
  stage: null,  // "uploading" | "analysing" | "done"
};

export function useAnalysis() {
  const [state, setState] = useState(INITIAL);

  const setPartial = (patch) =>
    setState((prev) => ({ ...prev, ...patch }));

  const runWithFile = useCallback(async ({ file, jd, company, role }) => {
    setPartial({ loading: true, error: null, result: null, stage: "uploading", progress: 0 });

    try {
      setPartial({ stage: "uploading" });
      const res = await analyseResumePDF(
        file, jd, company, role,
        (pct) => setPartial({ progress: pct, stage: pct === 100 ? "analysing" : "uploading" })
      );
      setPartial({ result: res.data, stage: "done", loading: false });
    } catch (err) {
      const msg = err.response?.data?.detail || "Analysis failed. Please try again.";
      setPartial({ error: msg, loading: false, stage: null });
    }
  }, []);

  const runWithText = useCallback(async ({ resumeText, jd, company, role }) => {
    setPartial({ loading: true, error: null, result: null, stage: "analysing", progress: 100 });

    try {
      const res = await analyseResumeText(resumeText, jd, company, role);
      setPartial({ result: res.data, stage: "done", loading: false });
    } catch (err) {
      const msg = err.response?.data?.detail || "Analysis failed. Please try again.";
      setPartial({ error: msg, loading: false, stage: null });
    }
  }, []);

  const reset = useCallback(() => setState(INITIAL), []);

  return { ...state, runWithFile, runWithText, reset };
}
