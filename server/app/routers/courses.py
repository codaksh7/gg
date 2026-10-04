from fastapi import APIRouter, Depends, Query
from app.models.schemas import StudentProfile, CourseQuery, SessionNote
from app.services.auth_service import get_current_user
from app.services.course_service import (
    get_recommendations, search_courses, get_course_by_id,
    compare_courses, get_countries, get_fields, get_alternatives,
)
from app.data.courses_db import LIVING_COST_ESTIMATES

router = APIRouter(prefix="/api/courses", tags=["Course Recommendation"])

# In-memory session notes storage
session_notes: dict[str, list[dict]] = {}


@router.post("/recommend")
async def recommend_courses(
    profile: StudentProfile,
    limit: int = Query(10, ge=1, le=50),
    current_user: dict = Depends(get_current_user),
):
    results = get_recommendations(profile, limit)
    return {"recommendations": results, "total": len(results)}


@router.post("/search")
async def search(
    query: CourseQuery,
    current_user: dict = Depends(get_current_user),
):
    results = search_courses(query.query, query.filters)
    return {"results": results, "total": len(results)}


@router.get("/all")
async def get_all_courses(current_user: dict = Depends(get_current_user)):
    results = search_courses("")
    return {"courses": results, "total": len(results)}


@router.get("/countries")
async def list_countries(current_user: dict = Depends(get_current_user)):
    return {"countries": get_countries()}


@router.get("/fields")
async def list_fields(current_user: dict = Depends(get_current_user)):
    return {"fields": get_fields()}


@router.get("/living-costs")
async def get_living_costs(current_user: dict = Depends(get_current_user)):
    return {"estimates": LIVING_COST_ESTIMATES}


@router.get("/{course_id}")
async def get_course(
    course_id: str,
    current_user: dict = Depends(get_current_user),
):
    course = get_course_by_id(course_id)
    if not course:
        return {"error": "Course not found"}, 404
    return {"course": course}


@router.get("/{course_id}/alternatives")
async def get_course_alternatives(
    course_id: str,
    limit: int = Query(5, ge=1, le=20),
    current_user: dict = Depends(get_current_user),
):
    alternatives = get_alternatives(course_id, limit)
    return {"alternatives": alternatives}


@router.post("/compare")
async def compare(
    course_ids: list[str],
    current_user: dict = Depends(get_current_user),
):
    courses = compare_courses(course_ids)
    return {"courses": courses}


@router.post("/session-notes")
async def add_session_note(
    note: SessionNote,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]
    if user_id not in session_notes:
        session_notes[user_id] = []
    note_entry = {
        "content": note.content,
        "course_id": note.course_id,
        "timestamp": __import__("datetime").datetime.now().isoformat(),
    }
    session_notes[user_id].append(note_entry)
    return {"note": note_entry, "total_notes": len(session_notes[user_id])}


@router.get("/session-notes/all")
async def get_session_notes(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    return {"notes": session_notes.get(user_id, [])}
