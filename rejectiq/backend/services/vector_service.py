"""
vector_service.py
-----------------
Pinecone integration for RejectIQ.

Purpose:
  - Store resume embeddings indexed against role type
  - Find historically similar resumes and their outcomes
  - Power the "how does your resume compare to others for this role" feature

Index schema:
  id       : analysis_id (MongoDB ObjectId string)
  values   : OpenAI text-embedding-ada-002 vector (1536 dims)
  metadata : { role_title, company, ats_score, rejection_risk }
"""

from openai import AsyncOpenAI
from pinecone import Pinecone, ServerlessSpec
from core.config import get_settings
import asyncio

settings = get_settings()

_openai = AsyncOpenAI(api_key=settings.openai_api_key)

# Initialise Pinecone client lazily
_pc: Pinecone | None = None
_index = None


def _get_index():
    global _pc, _index
    if _index is not None:
        return _index

    if not settings.pinecone_api_key:
        return None  # Pinecone not configured — skip gracefully

    _pc = Pinecone(api_key=settings.pinecone_api_key)

    existing = [i.name for i in _pc.list_indexes()]
    if settings.pinecone_index not in existing:
        _pc.create_index(
            name=settings.pinecone_index,
            dimension=1536,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),
        )

    _index = _pc.Index(settings.pinecone_index)
    return _index


async def embed_text(text: str) -> list[float]:
    """Generate OpenAI embedding for a text chunk."""
    resp = await _openai.embeddings.create(
        model="text-embedding-ada-002",
        input=text[:8000],
    )
    return resp.data[0].embedding


async def store_analysis_vector(
    analysis_id: str,
    resume_text: str,
    role_title: str,
    company: str,
    ats_score: int,
    rejection_risk: str,
) -> bool:
    """
    Embed resume and upsert into Pinecone with analysis metadata.
    Returns True on success, False if Pinecone is not configured.
    """
    index = _get_index()
    if index is None:
        return False

    try:
        vector = await embed_text(resume_text[:4000])
        index.upsert(vectors=[{
            "id": analysis_id,
            "values": vector,
            "metadata": {
                "role_title": role_title or "unknown",
                "company": company or "unknown",
                "ats_score": ats_score,
                "rejection_risk": rejection_risk,
            },
        }])
        return True
    except Exception:
        return False


async def find_similar_analyses(
    resume_text: str,
    top_k: int = 5,
) -> list[dict]:
    """
    Find the most similar previously analysed resumes.
    Used to show benchmarking data: "Your resume scores better than X% for this role."
    """
    index = _get_index()
    if index is None:
        return []

    try:
        vector = await embed_text(resume_text[:4000])
        results = index.query(
            vector=vector,
            top_k=top_k,
            include_metadata=True,
        )
        return [
            {
                "id": m.id,
                "score": round(m.score, 3),
                "role_title": m.metadata.get("role_title"),
                "ats_score": m.metadata.get("ats_score"),
                "rejection_risk": m.metadata.get("rejection_risk"),
            }
            for m in results.matches
        ]
    except Exception:
        return []
