# Vina Frontend - API Integration Log

**Date:** February 8, 2026
**Status:** Integrated & Verified

## 📋 Overview
The Vina frontend has been fully integrated with the local backend API (`http://localhost:8000/api/v1`). This integration replaces mock data with real persistence, JWT-based authentication, and personalized content delivery.

## 🛠️ Changes Implemented

### 1. API Service Layer (`src/lib/api/service.ts`)
- **JWT Management**: Added `getAuthHeader` to automatically include the `Authorization: Bearer <token>` header in all requests.
- **Silent Auth**: Implemented `ensureUser(fullName)` which handles registration/login transparently during the onboarding flow.
- **Endpoints Integrated**:
  - `auth/register` & `auth/login`: User management.
  - `user/profile`: GET/PATCH for user personalization details.
  - `course/map`: Dynamic lesson roadmap based on user progress.
  - `lessons/{id}`: Fetches personalized video URLs and content.
  - `quizzes/{id}` & `quizzes/submit`: Lesson-specific assessments.
  - `assessment/pre-quiz`: Placement test for new users.
  - `user/progress/sync`: Real-time learning time synchronization.

### 2. Context Providers
- **`UserContext.tsx`**:
  - Now polls `/user/profile` on load if a token exists.
  - `login` and `logout` now handle both state and `localStorage` persistence of JWT tokens.
- **`ProgressContext.tsx`**:
  - State fields updated to `snake_case` to match backend models (e.g., `minutes_today`, `completed_lessons`).
  - `completeLesson` and `addMinutes` now trigger backend sync calls to ensure progress is never lost.

### 3. Personalization & Onboarding
- **`app/profession/page.tsx`**: Updated to send the full `onboarding_responses` object to the backend, enabling the AI to tailor future content to the specific role and industry.
- **`app/assessment/page.tsx`**: Connected to the placement quiz engine to determine the user's starting point in the course.

### 4. Lesson Experience
- **`app/lesson/[id]/page.tsx`**: 
  - Now uses the dynamic `videoUrl` returned by the backend.
  - Passes the current difficulty level to the API to receive the correct adaptive video variant.
  - Integrated `adaptLesson` stub for future AI-driven real-time re-scripting.

## 🧬 Data Model Alignment
Synced `src/lib/api/types.ts` with backend Pydantic models:
- **`VinaProgress`**: Uses `completed_lessons`, `minutes_today`, `total_learning_time_seconds`.
- **`VinaProfile`**: Uses `experience_level`, `leadership_level`, `daily_goal_minutes`.

---

## 🚦 Testing Instructions (Local Environment)

Follow these steps to verify the integration before moving to production:

### 1. Start the Backend
```bash
cd vina-backend
source .venv/bin/activate
# Ensure database is initialized
python scripts/init_db.py --force
# Run the server
python -m uvicorn vina_backend.main:app --reload --port 8000
```

### 2. Start the Frontend
```bash
cd vina-frontend
# Ensure .env.local exists with:
# NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
npm run dev
```

### 3. Verification Flow
1. **Onboarding**:
   - Open browser to `http://localhost:3000`.
   - Go through the personalization flow (Profession selection).
   - Check the Browser Console/Network tab: You should see a `POST /auth/register` followed by a `PATCH /user/profile`.
2. **Placement Quiz**:
   - Complete the pre-assessment.
   - Verify that your starting lesson on the Dashboard matches your performance (e.g., getting all correct should jump you to Lesson 6).
3. **Lesson Completion**:
   - Open Lesson 1.
   - Wait for the video to finish or trigger `handleVideoEnd`.
   - Verify `POST /user/progress/lesson/l01_what_llms_are/complete` in Network tab.
4. **Persistence**:
   - Refresh the page.
   - Verify that your progress (Diamonds, Streak, Completed Lessons) is restored from the server, not just `localStorage`.

### 4. Debugging Tips
- If you see `401 Unauthorized`, clear your `localStorage` (`localStorage.clear()`) and re-register.
- If you see `404 Not Found` for videos, ensure the `video_manifest.json` in the backend aliases the lesson IDs correctly.
