# Design & Architecture Write-up
**GradGuide: Revolutionizing the Study Abroad Experience**

Building GradGuide wasn't just about throwing together a few APIs; it was about solving a genuine pain point. When a student decides to study abroad, they are immediately bombarded with fragmented information. You have to visit one site for university shortlisting, a completely different portal for loans, and yet another platform to hunt for part-time jobs. 

My goal with GradGuide was to centralize this chaos. Here is a breakdown of my engineering approach, design philosophy, and the key decisions I made while building this platform.

---

## 🧠 The Recommendation Approach

When designing the **Course & University Recommendation Engine**, I wanted to avoid generic, unhelpful lists. My approach was to build a multi-layered filtering system that treats the student's academic and financial background as strict constraints.

1.  **Data Normalization:** First, the user inputs raw metrics—GPA, GRE, IELTS, and Budget. The backend normalizes these scores.
2.  **Tiered Matching:** Instead of a simple keyword match, the algorithm calculates a "compatibility score." It checks the user's metrics against the historical acceptance averages of the universities. 
3.  **Aspirational vs. Safe:** The system categorizes recommendations into "Ambitious" (slight reach), "Target" (perfect match), and "Safe" (highly likely).
4.  **Financial Reality Check:** The final and most crucial layer filters out universities that wildly exceed the user's budget, ensuring that every recommendation presented is actually financially viable for the student.

---

## 🎨 Interface & UX Philosophy

For the interface, I strictly adhered to a **Premium Dark Mode Aesthetic** driven by *Glassmorphism*. 

*   **Why Dark Mode?** Students spend hours staring at screens researching universities. A dark background (utilizing deep grays and navy hues like `#0F0F13`) significantly reduces eye strain.
*   **Visual Hierarchy:** I used vibrant, functional colors to direct attention. Emerald greens are exclusively used for salaries and positive loan approvals, while subtle purples and blues act as neutral accents for navigation.
*   **The Component Architecture:** Instead of building massive, bloated pages, I broke the UI down into highly reusable React components (like the custom Modal, the Stat Cards, and the Trackers). This ensures the app feels fast, responsive, and doesn't reload entirely when a user interacts with it. 

---

## ⚡ Three Key Feature Decisions

During development, I had to make several crucial decisions to ensure the product was both highly functional and user-friendly.

### 1. The Unified Dashboard Decision
**The Problem:** Education is usually siloed from finance and career hunting. 
**The Decision:** I chose to integrate all three pillars—Courses, Loans, and Jobs—into a single, unified tab-based dashboard. 
**The "Why":** A student checking their loan eligibility needs to know the tuition cost of their course. Similarly, knowing part-time job availability helps them understand how easily they can pay off that loan. By linking these within one platform, the user gets a holistic view of their entire study abroad timeline without ever leaving the site.

### 2. Real-Time Application Tracking Pipeline
**The Problem:** Students often forget where they applied and what the status of their job application is.
**The Decision:** Instead of a simple "Save" button, I engineered a dynamic Application Tracker that acts like a mini-Kanban board. 
**The "Why":** When a user saves a job in the discovery tab, the React state management instantly pushes that job into a central tracking pipeline. Users can update the status from "Saved" to "Interviewing" using dropdowns. This transforms the feature from a static list into an interactive, live productivity tool, giving students a sense of progression and control.

### 3. The Custom Modal for Dense Information
**The Problem:** Job descriptions and university details contain paragraphs of text. Rendering all of this on the main page makes the UI look cluttered and intimidating.
**The Decision:** I designed a custom, full-screen overlay modal with a blurred backdrop (backdrop-blur) for rendering deep data. 
**The "Why":** By keeping the main feed clean and only showing snippets (like title, company, and pay), the user can quickly scan hundreds of options. When they want to learn more, the modal takes over the screen, completely eliminating background distractions, and presents the dense information in neatly organized "pill" tags and typography-focused paragraphs.
