from fastapi import APIRouter, Depends, UploadFile, File
from app.models.schemas import LoanAssessmentRequest
from app.services.auth_service import get_current_user
from app.services.loan_service import (
    calculate_total_cost, calculate_funding_available,
    calculate_loan_requirement, calculate_financial_summary,
    assess_collateral, get_eligible_lenders, get_document_checklist,
    get_full_assessment, calculate_emi,
)
from app.data.lenders_db import LENDER_RATES, CIBIL_REQUIREMENTS, LENDER_FULL_NAMES
import os

router = APIRouter(prefix="/api/loans", tags=["Education Loan Assessment"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Store uploaded document references per user
user_documents: dict[str, list[dict]] = {}


@router.post("/assess")
async def assess_loan(
    request: LoanAssessmentRequest,
    current_user: dict = Depends(get_current_user),
):
    assessment = get_full_assessment(request)
    return assessment


@router.post("/calculate-cost")
async def calc_cost(
    request: LoanAssessmentRequest,
    current_user: dict = Depends(get_current_user),
):
    return calculate_total_cost(request)


@router.post("/calculate-funding")
async def calc_funding(
    request: LoanAssessmentRequest,
    current_user: dict = Depends(get_current_user),
):
    return calculate_funding_available(request)


@router.post("/calculate-emi")
async def calc_emi(
    principal: float,
    rate: float,
    tenure: int = 10,
    current_user: dict = Depends(get_current_user),
):
    emi = calculate_emi(principal, rate, tenure)
    total_payment = emi * tenure * 12
    total_interest = total_payment - principal
    return {
        "monthly_emi": round(emi, 2),
        "total_payment": round(total_payment, 2),
        "total_interest": round(total_interest, 2),
        "tenure_years": tenure,
    }


@router.get("/lenders")
async def get_lenders(current_user: dict = Depends(get_current_user)):
    return {
        "lenders": LENDER_RATES,
        "cibil_requirements": CIBIL_REQUIREMENTS,
        "lender_names": LENDER_FULL_NAMES,
    }


@router.post("/upload-document")
async def upload_document(
    file: UploadFile = File(...),
    doc_type: str = "general",
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]

    allowed_types = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]

    if file.content_type not in allowed_types:
        return {"error": "File type not allowed. Please upload PDF, JPG, PNG, or XLSX files."}

    max_size = 10 * 1024 * 1024
    contents = await file.read()
    if len(contents) > max_size:
        return {"error": "File too large. Maximum size is 10MB."}

    user_dir = os.path.join(UPLOAD_DIR, user_id)
    os.makedirs(user_dir, exist_ok=True)

    file_path = os.path.join(user_dir, file.filename)
    with open(file_path, "wb") as f:
        f.write(contents)

    doc_info = {
        "filename": file.filename,
        "doc_type": doc_type,
        "size": len(contents),
        "content_type": file.content_type,
    }

    if user_id not in user_documents:
        user_documents[user_id] = []
    user_documents[user_id].append(doc_info)

    return {"message": "Document uploaded successfully", "document": doc_info}


@router.get("/documents")
async def get_documents(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    return {"documents": user_documents.get(user_id, [])}
