import axios from "axios";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

const http = axios.create({ baseURL: BASE });

/**
 * Analyse a resume PDF against a job description.
 * Sends multipart/form-data.
 */
export const analyseResumePDF = (file, jd, company, role, onProgress) => {
  const form = new FormData();
  form.append("resume", file);
  form.append("job_description", jd);
  if (company) form.append("company_name", company);
  if (role)    form.append("role_title", role);

  return http.post("/analyse/", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
};

/**
 * Analyse plain-text resume (paste mode).
 */
export const analyseResumeText = (resumeText, jd, company, role) => {
  const form = new FormData();
  form.append("resume_text", resumeText);
  form.append("job_description", jd);
  if (company) form.append("company_name", company);
  if (role)    form.append("role_title", role);

  return http.post("/analyse/text", form);
};

export const getHistory    = (limit = 20) => http.get(`/history/?limit=${limit}`);
export const getStats      = ()            => http.get("/history/stats");
export const deleteHistory = (id)          => http.delete(`/history/${id}`);
