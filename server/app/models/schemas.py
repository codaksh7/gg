from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from enum import Enum


class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class StudentProfile(BaseModel):
    name: str = ""
    education_level: str = ""
    field_of_study: str = ""
    gpa: Optional[float] = None
    target_degree: str = ""
    preferred_countries: list[str] = []
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    preferred_intake: str = ""
    career_goals: str = ""
    work_experience_years: Optional[int] = 0
    test_scores: dict = {}
    interests: list[str] = []


class CourseQuery(BaseModel):
    query: str = ""
    profile: Optional[StudentProfile] = None
    filters: dict = {}


class LoanStudyDetails(BaseModel):
    country: str = ""
    university: str = ""
    course: str = ""
    duration_years: float = 1
    tuition_per_year: float = 0
    living_cost_per_year: float = 0
    other_costs: float = 0


class LoanFunding(BaseModel):
    savings: float = 0
    scholarship: float = 0
    fees_paid: float = 0
    family_contribution: float = 0
    other_funding: float = 0


class LoanFinancialProfile(BaseModel):
    annual_income: float = 0
    cibil_score: Optional[int] = None
    total_assets: float = 0
    total_liabilities: float = 0
    employment_type: str = ""


class LoanCollateral(BaseModel):
    has_collateral: bool = False
    property_type: str = ""
    property_value: float = 0
    existing_mortgage: float = 0
    property_location: str = ""


class LoanAssessmentRequest(BaseModel):
    study: LoanStudyDetails
    funding: LoanFunding
    financial: LoanFinancialProfile
    collateral: LoanCollateral
    gender: str = ""
    university_rank: Optional[int] = None


class JobSearchFilters(BaseModel):
    query: str = ""
    job_type: str = ""
    location: str = ""
    min_pay: Optional[float] = None
    max_pay: Optional[float] = None
    sort_by: str = "date"
    page: int = 1
    per_page: int = 20


class SavedJob(BaseModel):
    job_id: str
    notes: str = ""
    status: str = "saved"


class SessionNote(BaseModel):
    content: str
    course_id: Optional[str] = None
