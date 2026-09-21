# 🔍 RejectIQ — AI Job Application Rejection Analyser

Stop applying blindly. Paste your resume and a job description — RejectIQ tells you exactly why you might get rejected, what keywords you're missing, which resume lines are weak, and gives you specific rewrites for that JD.

Built with **ReactJS**, **FastAPI**, **Python**, **OpenAI GPT-4**, **Pinecone**, and **MongoDB**.

---

## Why This Exists

Most job hunters apply to 40+ companies and hear nothing back. They don't know if it's their resume, their title, their skills, or the ATS filter. RejectIQ solves this by running your resume through a 3-stage AI pipeline and returning a detailed rejection risk report.

---

## Tech Stack

| Layer        | Technology                                           |
|--------------|------------------------------------------------------|
| Frontend     | ReactJS 18, React Router, react-dropzone             |
| Backend      | Python, FastAPI, Uvicorn, Pydantic v2                |
| AI           | OpenAI GPT-4 (deep analysis), GPT-3.5 (keyword extraction) |
| Vector Store | Pinecone (resume embeddings + similarity search)     |
| Database     | MongoDB (Motor async driver — analysis history)      |
| PDF Parsing  | PyPDF2                                               |

---

## Features

- 📄 Upload PDF resume or paste plain text
- 🤖 GPT-4 powered deep structural analysis
- 📊 ATS score (0–100) + rejection risk level
- 🧩 Skill gap report — required vs preferred skills
- ✏️ Line-by-line resume rewrites tailored to the JD
- 🔑 Missing keyword detection with suggestions
- ⚠️ Title mismatch and experience gap flags
- 📋 Analysis history with aggregated stats
- 🔎 Pinecone vector similarity — find similar past analyses

---

## Analysis Pipeline

```
Resume PDF / Text
       ↓
  PyPDF2 extraction + clean
       ↓
  GPT-3.5 → extract JD keywords (fast, cheap)
       ↓
  Keyword overlap scoring (Python)
       ↓
  GPT-4 → deep structural analysis (resume vs JD)
       ↓
  Merge into AnalysisResult
       ↓
  MongoDB → save summary
  Pinecone → store embedding (async, non-blocking)
       ↓
  Return to frontend
```

---

## Project Structure

```
rejectiq/
├── backend/
│   ├── main.py                      # FastAPI app + CORS
│   ├── core/
│   │   ├── config.py                # Pydantic settings
│   │   └── database.py              # Async MongoDB
│   ├── models/
│   │   └── analysis.py              # AnalysisResult, SkillGap, ResumeSection
│   ├── routers/
│   │   ├── analyse.py               # POST /api/analyse/
│   │   └── history.py               # GET /api/history/
│   ├── services/
│   │   ├── analysis_service.py      # 3-stage AI pipeline
│   │   └── vector_service.py        # Pinecone integration
│   └── utils/
│       └── pdf_parser.py            # PyPDF2 extraction
└── frontend/
    └── src/
        ├── services/api.js          # Axios API layer
        ├── hooks/
        │   ├── useAnalysis.js       # Analysis state machine
        │   └── useHistory.js        # History + stats
        ├── components/ui/
        │   ├── ResumeUploader.jsx   # PDF drop + paste toggle
        │   ├── ScoreGauge.jsx       # Circular ATS gauge
        │   └── AnalysisResult.jsx   # Tabbed results display
        └── pages/
            ├── Analyse.jsx          # Main analysis page
            └── History.jsx          # Past analyses
```

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB running locally
- OpenAI API key — platform.openai.com/api-keys
- Pinecone API key — app.pinecone.io (free tier works)

### Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate       # Windows
source .venv/bin/activate    # Mac/Linux
pip install -r requirements.txt
cp .env.example .env
# Fill in OPENAI_API_KEY and PINECONE_API_KEY
uvicorn main:app --reload
```
API: `http://localhost:8000`
Swagger docs: `http://localhost:8000/docs`

### Frontend
```bash
cd frontend
npm install
npm start
```
App: `http://localhost:3000`

---

## API Endpoints

| Method | Endpoint              | Description                              |
|--------|-----------------------|------------------------------------------|
| POST   | /api/analyse/         | Analyse PDF resume vs JD                 |
| POST   | /api/analyse/text     | Analyse pasted resume text vs JD         |
| GET    | /api/analyse/similar  | Find similar past resumes via Pinecone   |
| GET    | /api/history/         | List past analyses                       |
| GET    | /api/history/stats    | Aggregated stats (avg ATS, risk dist.)   |
| DELETE | /api/history/{id}     | Delete an analysis record                |

---

## Resume Bullet Points

> **RejectIQ — AI Job Application Analyser** | ReactJS, FastAPI, Python, OpenAI GPT-4, Pinecone, MongoDB

- Built a full-stack AI tool that analyses any resume against a job description using a 3-stage pipeline — GPT-3.5 keyword extraction, cosine similarity scoring, and GPT-4 structural analysis — returning ATS score, skill gaps, and line-by-line rewrites.
- Engineered Pinecone vector store integration to embed and index resumes by role type, enabling semantic similarity search across past analyses for benchmarking.
- Designed async FastAPI backend with non-blocking Pinecone upserts via `asyncio.create_task`, ensuring the primary analysis response is never delayed by vector storage operations.

---

## Environment Variables

```env
MONGO_URI=mongodb://localhost:27017
DB_NAME=rejectiq
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...
PINECONE_INDEX=rejectiq-resumes
PINECONE_ENV=gcp-starter
```
