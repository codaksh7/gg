from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routers import auth, courses, loans, jobs

settings = get_settings()

app = FastAPI(
    title="GradGuide API",
    description="Backend API for GradGuide - Course Recommendation, Education Loan Assessment, and Job Discovery",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(courses.router)
app.include_router(loans.router)
app.include_router(jobs.router)


@app.get("/")
async def root():
    return {
        "name": "GradGuide API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "auth": "/api/auth",
            "courses": "/api/courses",
            "loans": "/api/loans",
            "jobs": "/api/jobs",
            "docs": "/docs",
        },
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
