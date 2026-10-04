<div align="center">

# 🎓 GradGuide
**The Ultimate Study Abroad & Career Toolkit**

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=vercel)](https://gradguide-daksh.vercel.app/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)]()
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)]()

A comprehensive, all-in-one platform built to simplify the journey of international students. From finding the perfect university to securing education loans and landing that crucial first job, GradGuide streamlines the entire process into one elegant dashboard.

---

## 🎥 Video Demonstration
Check out the full walkthrough of GradGuide's features:

**[▶️ Watch or Download the Video Demo](https://github.com/codaksh7/gg/raw/main/Video-Demo.mp4)**

<video src="https://github.com/codaksh7/gg/raw/main/Video-Demo.mp4" controls="controls" style="max-width: 100%;">
  Your browser does not support the video tag.
</video>

</div>

---

## ✨ Key Features

### 🏛️ Smart Course Recommendation
*   **Profile Matching:** Input your academic scores (GPA, GRE, IELTS) and budget to get realistic, data-backed university recommendations.
*   **Side-by-Side Comparison:** Compare universities instantly based on tuition, living costs, acceptance rates, and post-graduation salaries.

### 💰 Education Loan Assessment
*   **Eligibility Prediction:** Find out if you qualify for collateral or non-collateral loans based on your co-applicant's income and your target university.
*   **Lender Matching:** Get matched with top banks and NBFCs offering the best interest rates tailored to your profile.
*   **EMI Calculator:** Transparent breakdown of your future monthly payments and total interest burden.

### 💼 Job Discovery & Tracking
*   **Unified Job Search:** Filter through part-time gigs for students and full-time tech/business roles for graduates.
*   **Application Pipeline:** A built-in tracker to manage your job hunting progress—from "Saved" to "Applied" to "Interviewing"—all updating dynamically in real-time.

---

## 🛠️ Tech Stack

**Frontend (Client)**
*   **React + Vite:** For lightning-fast rendering and an optimized build process.
*   **Tailwind CSS:** For building a modern, responsive, and glassmorphism-inspired dark UI.
*   **Lucide React:** For clean, scalable, and premium vector icons.

**Backend (Server)**
*   **Python + FastAPI:** For a high-performance, asynchronous REST API.
*   **Pydantic:** For strict data validation and type checking.
*   **BeautifulSoup & Requests:** For scraping and aggregating real-time job data.

---

## 🚀 Getting Started

If you'd like to run this project locally on your machine, follow these steps:

### Prerequisites
Make sure you have **Node.js** and **Python 3.10+** installed on your system.

### 1. Clone the repository
```bash
git clone https://github.com/codaksh7/gg.git
cd gg
```

### 2. Start the Backend
```bash
cd server
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 3. Start the Frontend
Open a new terminal window:
```bash
cd client
npm install
npm run dev
```

The app will now be running on `http://localhost:5173`.

---

## 💡 Architecture & Design Philosophy
This project was built with a core focus on **User Experience (UX)**. Moving abroad is stressful enough, so the interface was explicitly designed to be calming, intuitive, and premium. By using a dark mode aesthetic with subtle glowing accents (glassmorphism), the platform reduces eye strain and organizes heavy data (like university stats and loan numbers) into easily digestible, highly visual cards.

<div align="center">
  <br>
  <b>Built by Daksh</b>
</div>
