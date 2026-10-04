from app.data.lenders_db import (
    LENDER_RATES, CIBIL_REQUIREMENTS, COLLATERAL_DOCUMENTS,
    NON_COLLATERAL_DOCUMENTS, LENDER_FULL_NAMES
)
from app.models.schemas import LoanAssessmentRequest


def calculate_total_cost(request: LoanAssessmentRequest) -> dict:
    """Calculate total study cost breakdown."""
    study = request.study
    total_tuition = study.tuition_per_year * study.duration_years
    total_living = study.living_cost_per_year * study.duration_years
    total_other = study.other_costs
    total_cost = total_tuition + total_living + total_other

    return {
        "total_tuition": round(total_tuition, 2),
        "total_living_costs": round(total_living, 2),
        "other_costs": round(total_other, 2),
        "total_cost": round(total_cost, 2),
    }


def calculate_funding_available(request: LoanAssessmentRequest) -> dict:
    """Calculate total available funding."""
    funding = request.funding
    total = (
        funding.savings +
        funding.scholarship +
        funding.fees_paid +
        funding.family_contribution +
        funding.other_funding
    )
    return {
        "savings": funding.savings,
        "scholarship": funding.scholarship,
        "fees_paid": funding.fees_paid,
        "family_contribution": funding.family_contribution,
        "other_funding": funding.other_funding,
        "total_available": round(total, 2),
    }


def calculate_financial_summary(request: LoanAssessmentRequest) -> dict:
    """Summarize the financial profile."""
    fin = request.financial
    net_worth = fin.total_assets - fin.total_liabilities

    return {
        "annual_income": fin.annual_income,
        "cibil_score": fin.cibil_score,
        "total_assets": fin.total_assets,
        "total_liabilities": fin.total_liabilities,
        "net_worth": round(net_worth, 2),
        "employment_type": fin.employment_type,
        "debt_to_income_ratio": round(
            fin.total_liabilities / fin.annual_income * 100, 1
        ) if fin.annual_income > 0 else None,
    }


def calculate_loan_requirement(request: LoanAssessmentRequest) -> dict:
    """Calculate the funding gap / loan requirement."""
    cost = calculate_total_cost(request)
    funding = calculate_funding_available(request)

    funding_gap = cost["total_cost"] - funding["total_available"]
    loan_required = max(0, funding_gap)

    return {
        "total_cost": cost["total_cost"],
        "total_funding": funding["total_available"],
        "funding_gap": round(funding_gap, 2),
        "loan_required": round(loan_required, 2),
        "funding_coverage_percent": round(
            (funding["total_available"] / cost["total_cost"]) * 100, 1
        ) if cost["total_cost"] > 0 else 100,
    }


def assess_collateral(request: LoanAssessmentRequest) -> dict:
    """Assess collateral position."""
    coll = request.collateral

    if not coll.has_collateral:
        return {
            "has_collateral": False,
            "route": "non-collateral",
            "collateral_value": 0,
            "net_collateral_value": 0,
            "assessment": "Non-collateral route - loan approval depends on university ranking and co-applicant profile.",
        }

    net_value = coll.property_value - coll.existing_mortgage

    loan_req = calculate_loan_requirement(request)
    loan_amount = loan_req["loan_required"]

    ltv = (loan_amount / coll.property_value * 100) if coll.property_value > 0 else 0

    if ltv <= 75:
        assessment = "Strong collateral position. Loan-to-value ratio is within acceptable range."
    elif ltv <= 90:
        assessment = "Moderate collateral position. Some lenders may accept, but terms may be stricter."
    else:
        assessment = "Collateral value may be insufficient. Consider adding additional security or exploring mixed funding."

    return {
        "has_collateral": True,
        "route": "collateral",
        "property_type": coll.property_type,
        "property_location": coll.property_location,
        "property_value": coll.property_value,
        "existing_mortgage": coll.existing_mortgage,
        "net_collateral_value": round(net_value, 2),
        "loan_to_value_percent": round(ltv, 1),
        "assessment": assessment,
    }


def get_eligible_lenders(request: LoanAssessmentRequest) -> list[dict]:
    """Determine eligible lenders based on profile."""
    route = "collateral" if request.collateral.has_collateral else "non-collateral"
    cibil = request.financial.cibil_score
    university_rank = request.university_rank
    gender = request.gender.lower() if request.gender else ""

    eligible = []

    for rate_info in LENDER_RATES:
        if rate_info["loan_type"] != route:
            continue

        lender = rate_info["lender"]
        interest_rate = rate_info["interest_rate"]

        if interest_rate is None:
            continue

        eligibility_issues = []
        is_eligible = True

        # CIBIL check
        min_cibil = CIBIL_REQUIREMENTS.get(lender)
        if min_cibil and cibil is not None:
            if cibil < min_cibil:
                is_eligible = False
                eligibility_issues.append(
                    f"CIBIL score ({cibil}) below minimum requirement ({min_cibil})"
                )
        elif min_cibil and cibil is None:
            eligibility_issues.append(
                f"CIBIL score not provided (minimum required: {min_cibil})"
            )

        # University rank check for non-collateral
        if route == "non-collateral" and "Top 100" in rate_info.get("note", ""):
            if university_rank and university_rank > 100:
                is_eligible = False
                eligibility_issues.append(
                    f"University rank ({university_rank}) not in Top 100 - required for non-collateral loan"
                )
            elif university_rank is None:
                eligibility_issues.append(
                    "University rank not provided - this lender requires Top 100 for non-collateral"
                )

        # Determine actual rate based on gender
        actual_rate = interest_rate
        if gender == "female" and "rate_girls" in rate_info:
            actual_rate = rate_info["rate_girls"]

        loan_req = calculate_loan_requirement(request)

        eligible.append({
            "lender": lender,
            "lender_full_name": LENDER_FULL_NAMES.get(lender, lender),
            "loan_type": route,
            "interest_rate": actual_rate,
            "note": rate_info.get("note", ""),
            "is_eligible": is_eligible,
            "eligibility_issues": eligibility_issues,
            "min_cibil": CIBIL_REQUIREMENTS.get(lender),
            "estimated_monthly_emi": round(
                calculate_emi(loan_req["loan_required"], actual_rate, 10), 2
            ) if loan_req["loan_required"] > 0 else 0,
        })

    eligible.sort(key=lambda x: (not x["is_eligible"], x["interest_rate"] or 999))
    return eligible


def calculate_emi(principal: float, annual_rate: float, tenure_years: int) -> float:
    """Calculate EMI using the standard formula."""
    if principal <= 0 or annual_rate <= 0:
        return 0
    monthly_rate = annual_rate / 12 / 100
    n_months = tenure_years * 12
    emi = principal * monthly_rate * (1 + monthly_rate) ** n_months / (
        (1 + monthly_rate) ** n_months - 1
    )
    return emi


def get_document_checklist(request: LoanAssessmentRequest) -> dict:
    """Get required documents based on loan route and employment type."""
    route = "collateral" if request.collateral.has_collateral else "non-collateral"
    employment = request.financial.employment_type.lower()

    if route == "collateral":
        docs = dict(COLLATERAL_DOCUMENTS)
    else:
        docs = dict(NON_COLLATERAL_DOCUMENTS)

    # Filter co-applicant docs based on employment type
    if "salaried" in employment or "employed" in employment:
        docs.pop("coapplicant_self_employed", None)
    elif "self" in employment or "business" in employment:
        docs.pop("coapplicant_salaried", None)

    return {
        "route": route,
        "document_categories": docs,
        "note": "All documents should be self-attested.",
    }


def get_full_assessment(request: LoanAssessmentRequest) -> dict:
    """Generate a complete loan assessment."""
    cost = calculate_total_cost(request)
    funding = calculate_funding_available(request)
    loan_req = calculate_loan_requirement(request)
    financial = calculate_financial_summary(request)
    collateral = assess_collateral(request)
    lenders = get_eligible_lenders(request)
    documents = get_document_checklist(request)

    eligible_count = sum(1 for l in lenders if l["is_eligible"])

    if loan_req["loan_required"] == 0:
        overall_status = "fully_funded"
        summary = "Your study is fully funded. No loan is required."
    elif eligible_count > 0:
        best_rate = min(l["interest_rate"] for l in lenders if l["is_eligible"])
        overall_status = "eligible"
        summary = (
            f"Loan of INR {loan_req['loan_required']:,.0f} required. "
            f"{eligible_count} lender(s) may be suitable. "
            f"Best available rate: {best_rate}%."
        )
    else:
        overall_status = "needs_review"
        summary = (
            f"Loan of INR {loan_req['loan_required']:,.0f} required, "
            "but no lenders match your current profile. "
            "Consider improving CIBIL score, adding collateral, or exploring alternative funding."
        )

    return {
        "summary": summary,
        "status": overall_status,
        "cost_breakdown": cost,
        "funding_available": funding,
        "loan_requirement": loan_req,
        "financial_summary": financial,
        "collateral_assessment": collateral,
        "eligible_lenders": lenders,
        "document_checklist": documents,
    }
