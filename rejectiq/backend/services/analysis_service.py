"""
analysis_service.py
-------------------
Core intelligence layer for RejectIQ.

Flow:
  1. Extract keywords from JD using GPT (fast, cheap call)
  2. Score keyword overlap between resume and JD
  3. Send resume + JD to GPT for deep structural analysis
  4. Parse structured JSON response into AnalysisResult
  5. Store summary in MongoDB for history tracking
"""

import json
import re
from openai import AsyncOpenAI
from core.config import get_settings
from models.analysis import AnalysisResult, RiskLevel, SkillGap, ResumeSection

settings = get_settings()
client = AsyncOpenAI(api_key=settings.openai_api_key)


# ── Keyword extraction (fast GPT-3.5 call) ──────────────────────────────────

async def extract_jd_keywords(jd_text: str) -> dict:
    """
    Extract required skills, preferred skills, and role keywords
    from a job description using a lightweight GPT call.
    """
    prompt = f"""Extract keywords from this job description. 
Respond ONLY with valid JSON — no markdown, no extra text.

Job Description:
{jd_text[:3000]}

JSON format:
{{
  "required_skills": ["skill1", "skill2"],
  "preferred_skills": ["skill3", "skill4"],
  "role_keywords": ["keyword1", "keyword2"],
  "experience_years": "X-Y years or null"
}}"""

    resp = await client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You extract structured data from job descriptions. Always respond with valid JSON only."},
            {"role": "user", "content": prompt},
        ],
        max_tokens=400,
        temperature=0,
    )

    raw = resp.choices[0].message.content.strip()
    raw = raw.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"required_skills": [], "preferred_skills": [], "role_keywords": [], "experience_years": None}


# ── Keyword overlap scoring ──────────────────────────────────────────────────

def score_keyword_overlap(resume_text: str, jd_keywords: dict) -> tuple[int, list[str], list[str]]:
    """
    Compare resume text against JD keywords.
    Returns: (match_percentage, found_keywords, missing_keywords)
    """
    resume_lower = resume_text.lower()

    all_keywords = (
        jd_keywords.get("required_skills", []) +
        jd_keywords.get("preferred_skills", []) +
        jd_keywords.get("role_keywords", [])
    )

    found = []
    missing = []

    for kw in all_keywords:
        if kw.lower() in resume_lower:
            found.append(kw)
        else:
            missing.append(kw)

    total = len(all_keywords)
    match_pct = round((len(found) / total) * 100) if total > 0 else 0

    return match_pct, found, missing


# ── Deep GPT analysis ────────────────────────────────────────────────────────

async def deep_analyse(resume_text: str, jd_text: str, company: str = "") -> dict:
    """
    Send resume + JD to GPT-4 for a thorough structural analysis.
    Returns parsed JSON dict matching AnalysisResult schema.
    """
    company_ctx = f"Company: {company}" if company else ""

    system_prompt = """You are a senior technical recruiter with 10 years experience at product companies.
You give brutally honest, specific feedback on resumes.
You ALWAYS respond with valid JSON only — no markdown fences, no preamble."""

    user_prompt = f"""Analyse this resume against the job description and return a detailed rejection risk report.

{company_ctx}

=== RESUME ===
{resume_text[:4000]}

=== JOB DESCRIPTION ===
{jd_text[:3000]}

Return ONLY this JSON structure:
{{
  "ats_score": <integer 0-100>,
  "rejection_risk": <"low"|"medium"|"high"|"critical">,
  "title_mismatch": <true|false>,
  "title_suggestion": "<suggested resume title or null>",
  "experience_gap": <true|false>,
  "experience_note": "<note about experience gap or null>",
  "skill_gaps": [
    {{
      "skill": "<skill name>",
      "importance": "<required|preferred>",
      "present_in_resume": <true|false>,
      "suggestion": "<how to address this>"
    }}
  ],
  "weak_sections": [
    {{
      "section": "<section name>",
      "original_text": "<quoted weak line from resume>",
      "issue": "<why this is weak>",
      "rewrite": "<specific rewrite suggestion>"
    }}
  ],
  "overall_verdict": "<2-3 sentence honest verdict>",
  "top_3_fixes": ["<fix 1>", "<fix 2>", "<fix 3>"]
}}"""

    resp = await client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        max_tokens=1500,
        temperature=0.3,
    )

    raw = resp.choices[0].message.content.strip()
    raw = raw.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Fallback — try to extract JSON block
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise ValueError("GPT returned malformed JSON. Try again.")


# ── Main orchestrator ────────────────────────────────────────────────────────

async def run_full_analysis(
    resume_text: str,
    jd_text: str,
    company_name: str = "",
    role_title: str = "",
) -> AnalysisResult:
    """
    Orchestrate the full analysis pipeline:
      1. Extract JD keywords
      2. Score keyword overlap
      3. Deep GPT analysis
      4. Merge into AnalysisResult
    """
    # Step 1 & 2 — fast keyword pass
    jd_keywords = await extract_jd_keywords(jd_text)
    match_pct, found_kws, missing_kws = score_keyword_overlap(resume_text, jd_keywords)

    # Step 3 — deep analysis
    gpt_result = await deep_analyse(resume_text, jd_text, company_name)

    # Step 4 — build typed result
    skill_gaps = [
        SkillGap(**gap) for gap in gpt_result.get("skill_gaps", [])
    ]
    weak_sections = [
        ResumeSection(**sec) for sec in gpt_result.get("weak_sections", [])
    ]

    return AnalysisResult(
        ats_score=gpt_result.get("ats_score", 0),
        rejection_risk=RiskLevel(gpt_result.get("rejection_risk", "high")),
        match_percentage=match_pct,
        skill_gaps=skill_gaps,
        weak_sections=weak_sections,
        missing_keywords=missing_kws[:15],
        strong_keywords=found_kws[:15],
        title_mismatch=gpt_result.get("title_mismatch", False),
        title_suggestion=gpt_result.get("title_suggestion"),
        experience_gap=gpt_result.get("experience_gap", False),
        experience_note=gpt_result.get("experience_note"),
        overall_verdict=gpt_result.get("overall_verdict", ""),
        top_3_fixes=gpt_result.get("top_3_fixes", []),
    )
