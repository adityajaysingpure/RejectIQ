from fastapi import APIRouter, Query
from core.database import get_db
from bson import ObjectId

router = APIRouter()


@router.get("/")
async def get_history(limit: int = Query(20, le=100)):
    """Return past analysis summaries ordered newest first."""
    db = get_db()
    records = await db.analyses.find(
        {}, {"_id": 1, "company_name": 1, "role_title": 1,
             "ats_score": 1, "rejection_risk": 1,
             "match_percentage": 1, "top_3_fixes": 1, "created_at": 1}
    ).sort("created_at", -1).limit(limit).to_list(limit)

    for r in records:
        r["_id"] = str(r["_id"])
    return records


@router.get("/stats")
async def get_stats():
    """
    Aggregate stats across all analyses:
    average ATS score, risk distribution, most common missing skills.
    """
    db = get_db()
    total = await db.analyses.count_documents({})
    if total == 0:
        return {"total": 0, "avg_ats": 0, "risk_distribution": {}}

    pipeline = [
        {"$group": {
            "_id": "$rejection_risk",
            "count": {"$sum": 1},
            "avg_ats": {"$avg": "$ats_score"},
        }}
    ]
    risk_groups = await db.analyses.aggregate(pipeline).to_list(10)

    overall_avg = await db.analyses.aggregate([
        {"$group": {"_id": None, "avg": {"$avg": "$ats_score"}}}
    ]).to_list(1)

    return {
        "total_analyses": total,
        "avg_ats_score": round(overall_avg[0]["avg"], 1) if overall_avg else 0,
        "risk_distribution": {
            g["_id"]: {"count": g["count"], "avg_ats": round(g["avg_ats"], 1)}
            for g in risk_groups
        },
    }


@router.delete("/{analysis_id}")
async def delete_analysis(analysis_id: str):
    db = get_db()
    await db.analyses.delete_one({"_id": ObjectId(analysis_id)})
    return {"message": "Deleted."}
