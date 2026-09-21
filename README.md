# 🔍 RejectIQ — AI-Powered Job Application Rejection Analyzer

> **Understand why your resume may be rejected — before you apply.**

RejectIQ is an AI-powered resume analysis platform that compares a **candidate's resume against a specific job description** and identifies potential reasons for rejection.

It analyzes **ATS compatibility, missing keywords, skill gaps, experience mismatches, resume weaknesses, and job-specific improvements**, then provides actionable rewrite suggestions tailored to the target role.

Built with **ReactJS, FastAPI, Python, OpenAI, Pinecone, and MongoDB**.

---

## 📌 Why RejectIQ?

Job seekers often apply to dozens of positions without knowing why they aren't getting responses.

The problem may be:

* Missing keywords
* Skill gaps
* Incorrect job title alignment
* Insufficient experience
* Weak resume sections
* Poor ATS compatibility
* Resume content that doesn't closely match the JD

RejectIQ turns a resume and job description into a structured **rejection-risk analysis**.

Instead of simply asking:

> **"Is my resume good?"**

RejectIQ helps answer:

> **"How well does my resume match this specific job, what could cause rejection, and exactly what should I improve?"**

---

## ✨ Key Features

### 📄 Resume Upload

Support for:

* PDF resume upload
* Plain-text resume input
* Drag-and-drop PDF upload
* Automatic text extraction

### 🤖 AI Resume Analysis

GPT-powered analysis evaluates the resume against the target job description and identifies structural and content-level issues.

### 📊 ATS Compatibility Score

Generate a **0–100 compatibility score** with a corresponding rejection-risk classification.

### 🧩 Skill Gap Analysis

Compare:

* Required skills
* Preferred skills
* Candidate skills
* Missing skills
* Partially matched skills

### 🔑 Missing Keyword Detection

Identify important JD keywords that are absent or underrepresented in the resume.

### ✏️ Resume Line Rewriting

Get **job-specific rewrite suggestions** for weak resume sections and individual bullet points.

### ⚠️ Experience & Title Mismatch

Identify potential mismatches between:

* Current/previous job titles
* Target position
* Required experience
* Candidate experience

### 📋 Analysis History

MongoDB stores previous analyses and provides aggregated statistics such as:

* Average ATS score
* Risk distribution
* Analysis history
* Frequently analyzed roles

### 🔎 Semantic Similarity Search

Pinecone embeddings allow users to find **semantically similar past resume analyses**, enabling historical benchmarking across different applications.

---

## 🧠 AI Analysis Pipeline

RejectIQ uses a multi-stage analysis pipeline designed to separate **fast deterministic processing** from deeper AI reasoning.

```text
              Resume PDF / Text
                     │
                     ▼
             PDF Text Extraction
                  (PyPDF2)
                     │
                     ▼
              Text Cleaning
                     │
                     ▼
        ┌─────────────────────────┐
        │     GPT Keyword         │
        │       Extraction        │
        └────────────┬────────────┘
                     │
                     ▼
          Keyword Overlap Analysis
                 (Python)
                     │
                     ▼
        ┌─────────────────────────┐
        │     GPT Deep Analysis   │
        │   Resume ↔ Job Match     │
        └────────────┬────────────┘
                     │
                     ▼
             AnalysisResult
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
      MongoDB                Pinecone
   Analysis History      Vector Embeddings
          │                     │
          └──────────┬──────────┘
                     ▼
              React Dashboard
```

### Pipeline Stages

**1. Resume Extraction**

PDF resumes are converted into clean text using PyPDF2.

**2. Keyword Extraction**

A lightweight AI model extracts important keywords and requirements from the job description.

**3. Deterministic Matching**

Python-based keyword overlap and similarity calculations provide measurable matching signals.

**4. Deep AI Analysis**

A more capable GPT model evaluates the relationship between the resume and job description, including structural and contextual mismatches.

**5. Result Aggregation**

The individual analysis signals are combined into a structured `AnalysisResult`.

**6. Persistence**

Analysis summaries are stored in MongoDB while resume embeddings are indexed in Pinecone for semantic search.

---

## 🛠️ Tech Stack

| Layer           | Technology                               |
| --------------- | ---------------------------------------- |
| Frontend        | ReactJS 18, React Router, React Dropzone |
| Backend         | Python, FastAPI, Uvicorn, Pydantic v2    |
| AI              | OpenAI GPT models                        |
| Vector Database | Pinecone                                 |
| Database        | MongoDB                                  |
| MongoDB Driver  | Motor                                    |
| PDF Processing  | PyPDF2                                   |
| API Client      | Axios                                    |

---

## 🏗️ Architecture

```text
┌────────────────────────────┐
│        ReactJS App         │
│                            │
│ Resume Upload              │
│ JD Input                   │
│ ATS Score                  │
│ Skill Gaps                 │
│ Rewrite Suggestions        │
│ Analysis History           │
└──────────────┬─────────────┘
               │
               │ REST API
               ▼
┌────────────────────────────┐
│         FastAPI            │
│                            │
│ Analysis Router            │
│ History Router             │
│ Pydantic Validation        │
└──────────────┬─────────────┘
               │
       ┌───────┼────────┐
       ▼       ▼        ▼
   OpenAI   MongoDB   Pinecone
      │         │        │
      ▼         ▼        ▼
   AI      History    Semantic
Analysis    Data       Search
       \      │        /
        \     │       /
         └────┼──────┘
              ▼
        Analysis Result
```

---

## 📁 Project Structure

```text
rejectiq/
│
├── backend/
│   ├── main.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   └── database.py
│   │
│   ├── models/
│   │   └── analysis.py
│   │
│   ├── routers/
│   │   ├── analyse.py
│   │   └── history.py
│   │
│   ├── services/
│   │   ├── analysis_service.py
│   │   └── vector_service.py
│   │
│   └── utils/
│       └── pdf_parser.py
│
└── frontend/
    └── src/
        ├── services/
        │   └── api.js
        │
        ├── hooks/
        │   ├── useAnalysis.js
        │   └── useHistory.js
        │
        ├── components/
        │   └── ui/
        │       ├── ResumeUploader.jsx
        │       ├── ScoreGauge.jsx
        │       └── AnalysisResult.jsx
        │
        └── pages/
            ├── Analyse.jsx
            └── History.jsx
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have:

* Python 3.11+
* Node.js 18+
* MongoDB
* OpenAI API key
* Pinecone API key

---

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd rejectiq
```

---

### 2. Backend Setup

```bash
cd backend

python -m venv .venv
```

#### Windows

```bash
.venv\Scripts\activate
```

#### macOS / Linux

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create the environment file:

```bash
cp .env.example .env
```

Configure the required variables:

```env
MONGO_URI=mongodb://localhost:27017
DB_NAME=rejectiq

OPENAI_API_KEY=your_openai_api_key

PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=rejectiq-resumes
```

Start the backend:

```bash
uvicorn main:app --reload
```

API:

```text
http://localhost:8000
```

Swagger documentation:

```text
http://localhost:8000/docs
```

---

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm start
```

Application:

```text
http://localhost:3000
```

---

## 🔌 API Endpoints

| Method   | Endpoint               | Description                     |
| -------- | ---------------------- | ------------------------------- |
| `POST`   | `/api/analyse/`        | Analyze PDF resume against a JD |
| `POST`   | `/api/analyse/text`    | Analyze pasted resume text      |
| `GET`    | `/api/analyse/similar` | Find similar past analyses      |
| `GET`    | `/api/history/`        | Retrieve previous analyses      |
| `GET`    | `/api/history/stats`   | Retrieve analysis statistics    |
| `DELETE` | `/api/history/{id}`    | Delete an analysis              |

---

## 📊 Example Analysis

### Input

```text
Target Role:
Full Stack Python Developer

Required Skills:
Python, FastAPI, React, MongoDB, REST APIs

Resume:
React Developer with 2 years of experience...
```

### Generated Analysis

```text
ATS Compatibility
78 / 100

Risk Level
Medium

Matched Skills
✓ React
✓ Python
✓ MongoDB

Missing / Weak Skills
⚠ FastAPI
⚠ REST API Development

Potential Issues
• Limited backend experience shown
• Target role requires stronger FastAPI exposure
• Resume emphasizes frontend responsibilities

Suggested Improvements
• Add relevant Python backend projects
• Highlight REST API development
• Quantify backend contributions
• Strengthen FastAPI-related experience
```

> **Note:** ATS scores and rejection-risk assessments are AI-generated estimates. Actual hiring decisions depend on the employer, recruitment process, candidate pool, and other factors.

---

## ⚡ Engineering Highlights

* Built a **multi-stage AI analysis pipeline** combining LLM reasoning with deterministic Python-based matching.
* Designed a **FastAPI backend** with modular routers, services, Pydantic models, and asynchronous database operations.
* Implemented **PDF-to-text processing** for automated resume ingestion.
* Integrated **Pinecone vector search** for semantic similarity across historical resume analyses.
* Used **MongoDB aggregation** to generate analysis statistics and historical insights.
* Implemented asynchronous Pinecone persistence so vector indexing does not block the primary analysis response.
* Created reusable React hooks for **analysis state management and history management**.
* Built reusable UI components for ATS scoring, resume uploads, and structured analysis results.
* Separated API communication into a dedicated **Axios service layer**.

---

## 🔮 Future Improvements

* [ ] LinkedIn profile analysis
* [ ] Multiple resume version comparison
* [ ] Resume-to-job compatibility comparison
* [ ] Job recommendation engine
* [ ] Cover letter generation
* [ ] Resume section scoring
* [ ] Industry-specific ATS analysis
* [ ] Skill learning recommendations
* [ ] Application tracking dashboard
* [ ] Interview preparation based on JD
* [ ] Resume version history
* [ ] PDF resume optimization/export
* [ ] Authentication and user profiles

---

## 🎯 Project Goal

RejectIQ is designed to make resume optimization **specific to the job being applied for** rather than relying on generic resume advice.

The goal is to help candidates understand the gap between:

```text
What the Job Requires
          ↓
What the Resume Shows
          ↓
Where the Gaps Are
          ↓
What Should Be Improved
```

This transforms resume preparation from a generic editing task into a **data-driven, job-specific optimization workflow**.

---

## 👨‍💻 Resume Description

**RejectIQ — AI-Powered Job Application Rejection Analyzer**
*ReactJS · FastAPI · Python · OpenAI · Pinecone · MongoDB*

* Built a full-stack AI resume analysis platform that compares resumes against job descriptions using a **multi-stage AI pipeline**, generating ATS compatibility scores, skill gaps, missing keywords, rejection-risk indicators, and JD-specific rewrite suggestions.
* Integrated **Pinecone vector search** to generate and index resume embeddings, enabling semantic similarity analysis across historical applications and role-specific benchmarking.
* Engineered an **asynchronous FastAPI backend** with MongoDB persistence and non-blocking vector indexing, keeping the primary analysis workflow responsive while storing semantic search data in the background.
