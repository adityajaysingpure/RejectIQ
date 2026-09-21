from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class RiskLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class SkillGap(BaseModel):
    skill: str
    importance: str          # "required" | "preferred"
    present_in_resume: bool
    suggestion: str


class ResumeSection(BaseModel):
    section: str             # e.g. "Summary", "Experience", "Skills"
    original_text: str
    issue: str
    rewrite: str


class AnalysisResult(BaseModel):
    ats_score: int           # 0–100
    rejection_risk: RiskLevel
    match_percentage: int    # keyword overlap %
    skill_gaps: List[SkillGap]
    weak_sections: List[ResumeSection]
    missing_keywords: List[str]
    strong_keywords: List[str]
    title_mismatch: bool
    title_suggestion: Optional[str]
    experience_gap: bool
    experience_note: Optional[str]
    overall_verdict: str
    top_3_fixes: List[str]


class AnalysisRequest(BaseModel):
    resume_text: str
    job_description: str
    company_name: Optional[str] = None
    role_title: Optional[str] = None


class AnalysisRecord(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    company_name: Optional[str]
    role_title: Optional[str]
    ats_score: int
    rejection_risk: str
    match_percentage: int
    top_3_fixes: List[str]
    created_at: datetime = Field(default_factory=datetime.utcnow)
