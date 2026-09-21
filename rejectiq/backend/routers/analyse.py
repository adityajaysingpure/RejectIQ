from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from core.database import get_db
from models.analysis import AnalysisResult
from services.analysis_service import run_full_analysis
from services.vector_service import store_analysis_vector, find_similar_analyses
from utils.pdf_parser import extract_text_from_pdf, clean_text
from datetime import datetime
from typing import Optional
import asyncio

router = APIRouter()


@router.post("/", response_model=AnalysisResult)
async def analyse_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    company_name: Optional[str] = Form(None),
    role_title: Optional[str] = Form(None),
):
    """
    Primary endpoint.
    Accepts multipart form: resume PDF + JD text + optional metadata.
    Returns full AnalysisResult with ATS score, gaps, rewrites, verdict.
    """
    # Extract and clean resume text
    raw_text = await extract_text_from_pdf(resume)
    resume_text = clean_text(raw_text)

    if len(job_description.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Job description is too short. Please paste the full JD."
        )

    # Run the full AI pipeline
    try:
        result = await run_full_analysis(
            resume_text=resume_text,
            jd_text=job_description,
            company_name=company_name or "",
            role_title=role_title or "",
        )
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )

    # Persist summary to MongoDB
    db = get_db()
    record = {
        "company_name": company_name,
        "role_title": role_title,
        "ats_score": result.ats_score,
        "rejection_risk": result.rejection_risk,
        "match_percentage": result.match_percentage,
        "top_3_fixes": result.top_3_fixes,
        "created_at": datetime.utcnow(),
    }
    insert_result = await db.analyses.insert_one(record)
    analysis_id = str(insert_result.inserted_id)

    # Store vector in Pinecone (non-blocking — don't fail if Pinecone is down)
    asyncio.create_task(
        store_analysis_vector(
            analysis_id=analysis_id,
            resume_text=resume_text,
            role_title=role_title or "",
            company=company_name or "",
            ats_score=result.ats_score,
            rejection_risk=result.rejection_risk,
        )
    )

    return result


@router.post("/text", response_model=AnalysisResult)
async def analyse_resume_text(
    resume_text: str = Form(...),
    job_description: str = Form(...),
    company_name: Optional[str] = Form(None),
    role_title: Optional[str] = Form(None),
):
    """
    Alternative endpoint for plain-text resume input
    (when user pastes resume instead of uploading PDF).
    """
    if len(resume_text.strip()) < 100:
        raise HTTPException(status_code=400, detail="Resume text is too short.")
    if len(job_description.strip()) < 50:
        raise HTTPException(status_code=400, detail="Job description is too short.")

    try:
        result = await run_full_analysis(
            resume_text=clean_text(resume_text),
            jd_text=job_description,
            company_name=company_name or "",
            role_title=role_title or "",
        )
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))

    db = get_db()
    await db.analyses.insert_one({
        "company_name": company_name,
        "role_title": role_title,
        "ats_score": result.ats_score,
        "rejection_risk": result.rejection_risk,
        "match_percentage": result.match_percentage,
        "top_3_fixes": result.top_3_fixes,
        "created_at": datetime.utcnow(),
    })

    return result


@router.get("/similar")
async def get_similar_resumes(resume_text: str):
    """
    Find previously analysed resumes similar to the input.
    Powers the benchmarking feature.
    """
    matches = await find_similar_analyses(resume_text)
    return {"matches": matches}
