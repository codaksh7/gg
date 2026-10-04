from app.data.courses_db import COURSES_DATABASE, LIVING_COST_ESTIMATES
from app.models.schemas import StudentProfile
import re


def calculate_relevance_score(course: dict, profile: StudentProfile) -> dict:
    """Calculate how relevant a course is to the student's profile with weighted scoring."""
    score = 0
    max_score = 0
    reasons = []

    # Field match (weight: 30)
    max_score += 30
    if profile.field_of_study:
        field_lower = profile.field_of_study.lower()
        course_field = course["field"].lower()
        course_tags = [t.lower() for t in course.get("tags", [])]
        course_name = course["name"].lower()

        if field_lower in course_field or course_field in field_lower:
            score += 30
            reasons.append(f"Strong field match: {course['field']}")
        elif any(field_lower in tag or tag in field_lower for tag in course_tags):
            score += 22
            reasons.append(f"Related field: {course['field']}")
        elif field_lower in course_name:
            score += 18
            reasons.append(f"Related to your field of study")
        else:
            common_words = set(field_lower.split()) & set(course_field.split())
            if common_words:
                score += 12
                reasons.append(f"Partially related field")

    # Country match (weight: 20)
    max_score += 20
    if profile.preferred_countries:
        countries_lower = [c.lower() for c in profile.preferred_countries]
        if course["country"].lower() in countries_lower:
            score += 20
            reasons.append(f"Located in preferred country: {course['country']}")

    # Budget match (weight: 20)
    max_score += 20
    if profile.budget_max is not None and profile.budget_max > 0:
        tuition = course["tuition_per_year_usd"]
        if tuition <= profile.budget_max:
            score += 20
            reasons.append(f"Within budget at ${tuition:,.0f}/year")
        elif tuition <= profile.budget_max * 1.2:
            score += 10
            reasons.append(f"Slightly above budget at ${tuition:,.0f}/year, but scholarships may be available")
    else:
        score += 10

    # Degree type match (weight: 10)
    max_score += 10
    if profile.target_degree:
        degree_lower = profile.target_degree.lower()
        course_degree = course["degree_type"].lower()
        if degree_lower in course_degree or course_degree in degree_lower:
            score += 10
            reasons.append(f"Matches target degree: {course['degree_type']}")

    # GPA match (weight: 10)
    max_score += 10
    if profile.gpa is not None:
        gpa_req = course.get("gpa_requirement", 0)
        if profile.gpa >= gpa_req:
            score += 10
            reasons.append(f"GPA meets requirement ({gpa_req})")
        elif profile.gpa >= gpa_req - 0.2:
            score += 5
            reasons.append(f"GPA is close to requirement ({gpa_req}), may still be considered")

    # Intake match (weight: 5)
    max_score += 5
    if profile.preferred_intake:
        intake_lower = profile.preferred_intake.lower()
        course_intakes = [i.lower() for i in course.get("intake", [])]
        if any(intake_lower in ci or ci in intake_lower for ci in course_intakes):
            score += 5
            reasons.append(f"Available for {profile.preferred_intake} intake")

    # Career goals match (weight: 5)
    max_score += 5
    if profile.career_goals:
        career_lower = profile.career_goals.lower()
        career_outcomes = [o.lower() for o in course.get("career_outcomes", [])]
        course_tags = [t.lower() for t in course.get("tags", [])]
        career_words = set(re.findall(r'\w+', career_lower))

        outcome_match = any(
            any(word in outcome for word in career_words)
            for outcome in career_outcomes
        )
        tag_match = any(
            any(word in tag for word in career_words)
            for tag in course_tags
        )

        if outcome_match:
            score += 5
            matching_careers = [o for o in course["career_outcomes"]
                              if any(w in o.lower() for w in career_words)]
            reasons.append(f"Aligns with career goals: {', '.join(matching_careers[:2])}")
        elif tag_match:
            score += 3
            reasons.append(f"Related to your career interests")

    # Add scholarship bonus
    if course.get("scholarship_available"):
        reasons.append("Scholarships available")

    # University ranking bonus
    ranking = course.get("ranking", 999)
    if ranking <= 10:
        reasons.append(f"Top 10 globally ranked (#{ranking})")
    elif ranking <= 50:
        reasons.append(f"Highly ranked university (#{ranking})")

    percentage = round((score / max_score) * 100) if max_score > 0 else 0

    return {
        "score": score,
        "max_score": max_score,
        "percentage": percentage,
        "reasons": reasons,
    }


def get_recommendations(profile: StudentProfile, limit: int = 10) -> list[dict]:
    """Get course recommendations sorted by relevance."""
    results = []
    for course in COURSES_DATABASE:
        relevance = calculate_relevance_score(course, profile)
        results.append({
            **course,
            "relevance": relevance,
        })

    results.sort(key=lambda x: x["relevance"]["percentage"], reverse=True)
    return results[:limit]


def search_courses(query: str, filters: dict = None) -> list[dict]:
    """Search courses by keyword and optional filters."""
    query_lower = query.lower().strip()
    results = []

    for course in COURSES_DATABASE:
        if not query_lower:
            results.append(course)
            continue

        searchable = " ".join([
            course["name"],
            course["university"],
            course["country"],
            course["field"],
            course.get("description", ""),
            " ".join(course.get("tags", [])),
            " ".join(course.get("career_outcomes", [])),
        ]).lower()

        if query_lower in searchable:
            results.append(course)

    if filters:
        if filters.get("country"):
            results = [c for c in results if c["country"].lower() == filters["country"].lower()]
        if filters.get("degree_type"):
            results = [c for c in results if c["degree_type"].lower() == filters["degree_type"].lower()]
        if filters.get("field"):
            results = [c for c in results if filters["field"].lower() in c["field"].lower()]
        if filters.get("max_tuition"):
            results = [c for c in results if c["tuition_per_year_usd"] <= filters["max_tuition"]]

    return results


def get_course_by_id(course_id: str) -> dict | None:
    """Get a specific course by ID."""
    for course in COURSES_DATABASE:
        if course["id"] == course_id:
            return course
    return None


def compare_courses(course_ids: list[str]) -> list[dict]:
    """Get multiple courses for comparison."""
    courses = []
    for cid in course_ids:
        course = get_course_by_id(cid)
        if course:
            courses.append(course)
    return courses


def get_countries() -> list[str]:
    """Get list of unique countries in the database."""
    return sorted(set(c["country"] for c in COURSES_DATABASE))


def get_fields() -> list[str]:
    """Get list of unique fields in the database."""
    return sorted(set(c["field"] for c in COURSES_DATABASE))


def get_alternatives(course_id: str, limit: int = 5) -> list[dict]:
    """Get alternative courses similar to a given course."""
    course = get_course_by_id(course_id)
    if not course:
        return []

    alternatives = []
    for c in COURSES_DATABASE:
        if c["id"] == course_id:
            continue

        score = 0
        if c["field"].lower() == course["field"].lower():
            score += 3
        if c["country"] == course["country"]:
            score += 1
        if c["degree_type"] == course["degree_type"]:
            score += 1
        shared_tags = set(c.get("tags", [])) & set(course.get("tags", []))
        score += len(shared_tags)

        if score > 0:
            alternatives.append({**c, "_alt_score": score})

    alternatives.sort(key=lambda x: x["_alt_score"], reverse=True)
    for alt in alternatives:
        alt.pop("_alt_score", None)
    return alternatives[:limit]
