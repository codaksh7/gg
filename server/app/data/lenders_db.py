LENDER_RATES = [
    {
        "lender": "BOI",
        "loan_type": "non-collateral",
        "interest_rate": None,
        "note": "Non-collateral loans not available"
    },
    {
        "lender": "BOI",
        "loan_type": "collateral",
        "interest_rate": 9.00,
        "note": "Girls: 8.60%",
        "rate_girls": 8.60
    },
    {
        "lender": "BOB",
        "loan_type": "non-collateral",
        "interest_rate": 8.45,
        "note": "Top 100 universities only"
    },
    {
        "lender": "BOB",
        "loan_type": "collateral",
        "interest_rate": 8.95,
        "note": "Rate for boys",
        "rate_girls": 8.75
    },
    {
        "lender": "SBI",
        "loan_type": "non-collateral",
        "interest_rate": 9.40,
        "note": "Top 100 universities only"
    },
    {
        "lender": "SBI",
        "loan_type": "collateral",
        "interest_rate": 8.40,
        "note": ""
    },
    {
        "lender": "Credila",
        "loan_type": "non-collateral",
        "interest_rate": 10.75,
        "note": ""
    },
    {
        "lender": "Credila",
        "loan_type": "collateral",
        "interest_rate": 9.50,
        "note": "Range: 9.25% - 9.75%",
        "rate_min": 9.25,
        "rate_max": 9.75
    },
    {
        "lender": "Auxilo",
        "loan_type": "non-collateral",
        "interest_rate": 10.25,
        "note": ""
    },
    {
        "lender": "Auxilo",
        "loan_type": "collateral",
        "interest_rate": 10.00,
        "note": ""
    },
]

CIBIL_REQUIREMENTS = {
    "SBI": 750,
    "BOB": 700,
    "BOI": 670,
}

COLLATERAL_DOCUMENTS = {
    "basic_student": [
        "PAN Card",
        "Proof of residence (Voter ID / Passport / Electricity Bill / Telephone Bill / Ration Card / Bank statement / Aadhaar)",
        "Bank account statement for last 6 months (personal / salary)",
        "Personal Asset & Liability Statement",
    ],
    "academic": [
        "10th, 12th and Degree marksheets/certificates",
        "Proof of admission showing total course duration",
        "Fee structure (I-20 for US, if available)",
        "IELTS / GMAT / GRE score card",
        "University ranking print-out",
    ],
    "coapplicant_salaried": [
        "Latest salary slips - last 3 months",
        "Form 16 - last 2 years",
        "Employer ID card",
        "ITR - last 2 years",
    ],
    "coapplicant_self_employed": [
        "ITR - last 3 years",
        "Balance sheet and Profit & Loss account - last 3 years",
        "Proof of business address",
    ],
    "property": [
        "Property title deed and registered sale agreement",
        "Original registration receipt",
        "Allotment letter by Municipal Corporation / authorised government authority",
        "Previous chain of sale deeds / Encumbrance Certificate (EC) of last 30 years",
        "Latest property tax bill or electricity bill with same address",
        "Municipality-approved building plan or plot layout",
        "Occupancy Certificate (OC), if apartment",
    ],
}

NON_COLLATERAL_DOCUMENTS = {
    "basic_student": [
        "PAN Card",
        "Proof of residence (Voter ID / Passport / Electricity Bill / Telephone Bill / Ration Card / Bank statement / Aadhaar)",
        "Bank account statement for last 6 months (personal / salary)",
        "Personal Asset & Liability Statement",
    ],
    "academic": [
        "10th, 12th and Degree marksheets/certificates",
        "Proof of admission showing total course duration",
        "Fee structure (I-20 for US, if available)",
        "IELTS / GMAT / GRE score card",
        "University ranking print-out",
    ],
    "coapplicant_salaried": [
        "Latest salary slips - last 3 months",
        "Form 16 - last 2 years",
        "Employer ID card",
        "ITR - last 2 years",
    ],
    "coapplicant_self_employed": [
        "ITR - last 3 years",
        "Balance sheet and Profit & Loss account - last 3 years",
        "Proof of business address",
    ],
}

LENDER_FULL_NAMES = {
    "BOI": "Bank of India",
    "BOB": "Bank of Baroda",
    "SBI": "State Bank of India",
    "Credila": "HDFC Credila",
    "Auxilo": "Auxilo Finserve",
}
