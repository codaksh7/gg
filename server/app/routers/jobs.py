from fastapi import APIRouter, Depends, Query
from app.models.schemas import JobSearchFilters, SavedJob
from app.services.auth_service import get_current_user
from app.scrapers.job_scraper import get_all_jobs, filter_jobs

router = APIRouter(prefix="/api/jobs", tags=["Job Discovery"])

# In-memory saved jobs storage per user
saved_jobs: dict[str, list[dict]] = {}
application_tracker: dict[str, list[dict]] = {}


@router.get("/listings")
async def get_jobs(
    query: str = "",
    job_type: str = "",
    location: str = "",
    sort_by: str = "date",
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    all_jobs = await get_all_jobs()
    filtered = filter_jobs(all_jobs, query, job_type, location, sort_by=sort_by)

    total = len(filtered)
    start = (page - 1) * per_page
    end = start + per_page
    page_jobs = filtered[start:end]

    return {
        "jobs": page_jobs,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": (total + per_page - 1) // per_page,
    }


@router.get("/listings/{job_id}")
async def get_job_detail(
    job_id: str,
    current_user: dict = Depends(get_current_user),
):
    all_jobs = await get_all_jobs()
    for job in all_jobs:
        if job["id"] == job_id:
            return {"job": job}
    return {"error": "Job not found"}


@router.post("/save")
async def save_job(
    data: SavedJob,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]
    if user_id not in saved_jobs:
        saved_jobs[user_id] = []

    for sj in saved_jobs[user_id]:
        if sj["job_id"] == data.job_id:
            sj["notes"] = data.notes
            sj["status"] = data.status
            return {"message": "Job updated", "saved_job": sj}

    entry = {
        "job_id": data.job_id,
        "notes": data.notes,
        "status": data.status,
        "saved_at": __import__("datetime").datetime.now().isoformat(),
    }
    saved_jobs[user_id].append(entry)
    return {"message": "Job saved", "saved_job": entry}


@router.get("/saved")
async def get_saved_jobs(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    user_saved = saved_jobs.get(user_id, [])

    all_jobs = await get_all_jobs()
    job_map = {j["id"]: j for j in all_jobs}

    enriched = []
    for sj in user_saved:
        job_data = job_map.get(sj["job_id"])
        if job_data:
            enriched.append({**sj, "job": job_data})

    return {"saved_jobs": enriched}


@router.delete("/saved/{job_id}")
async def remove_saved_job(
    job_id: str,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]
    if user_id in saved_jobs:
        saved_jobs[user_id] = [
            sj for sj in saved_jobs[user_id] if sj["job_id"] != job_id
        ]
    return {"message": "Job removed from saved"}


@router.post("/track-application")
async def track_application(
    job_id: str,
    status: str = "applied",
    notes: str = "",
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]
    if user_id not in application_tracker:
        application_tracker[user_id] = []

    entry = {
        "job_id": job_id,
        "status": status,
        "notes": notes,
        "updated_at": __import__("datetime").datetime.now().isoformat(),
    }

    for i, app in enumerate(application_tracker[user_id]):
        if app["job_id"] == job_id:
            application_tracker[user_id][i] = entry
            return {"message": "Application updated", "application": entry}

    application_tracker[user_id].append(entry)
    return {"message": "Application tracked", "application": entry}


@router.get("/applications")
async def get_applications(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    return {"applications": application_tracker.get(user_id, [])}


@router.get("/stats")
async def get_job_stats(current_user: dict = Depends(get_current_user)):
    all_jobs = await get_all_jobs()
    stats = {
        "total_jobs": len(all_jobs),
        "by_type": {},
        "by_location": {},
        "sources": set(),
    }
    for job in all_jobs:
        jt = job.get("job_type", "unknown")
        stats["by_type"][jt] = stats["by_type"].get(jt, 0) + 1

        loc = job.get("location", "Unknown").split(",")[0].strip()
        stats["by_location"][loc] = stats["by_location"].get(loc, 0) + 1

        stats["sources"].add(job.get("source", "Unknown"))

    stats["sources"] = list(stats["sources"])
    return stats


@router.post("/refresh")
async def refresh_jobs(current_user: dict = Depends(get_current_user)):
    jobs = await get_all_jobs(force_refresh=True)
    return {"message": "Jobs refreshed", "total": len(jobs)}
