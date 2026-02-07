# Vina Frontend - Developer Handover Documentation

## 1. Project Overview
This repository contains the frontend application for **Vina**, an AI-native learning platform designed to teach LLM concepts through personalized, bite-sized lessons. The application is built as a Progressive Web App (PWA) focusing on a mobile-first, gamified user experience.

## 2. Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (with Custom Theme Extension)
- **Icons**: Lucide React
- **Effects**: Canvas Confetti (for celebrations)
- **Deployment Target**: Vercel / Netlify (Static Export compatible if needed)

## 3. Current Status & Accomplishments
We have successfully implemented the MVP (Minimum Viable Product) UI and core user flows, including a major UI modernization pass.

### User Flows Implemented:
1.  **Welcome & Onboarding**:
    -   Responsive landing screen with "Get Started".
    -   Profession selection (Software Engineer, Product Manager, etc.).
    -   Pre-assessment quiz to gauge initial knowledge.
2.  **Dashboard (Course Map)**:
    -   **Custom S-Curve Layout**: A gamified, winding path for lessons (Sin-wave based).
    -   Dynamic SVG connectors that follow the path.
    -   Lesson locking/unlocking logic based on progress.
    -   Visual indicators for Active (Pulsing), Locked (Glass), and Completed lessons.
3.  **Lesson Experience**:
    -   Video player with custom controls (Play/Pause, Speed 1x-2x, Seek).
    -   **Adaptation Menu**: "Zap" button to change lesson difficulty (Simplify, Concise, Deep Dive).
    -   Mock logic for switching video assets based on adaptation.
4.  **Assessment & Practice**:
    -   End-of-lesson quizzes with instant feedback.
    -   Confetti celebration on passing.
    -   "Practice" tab for daily spaced repetition cards.

## 4. Key Implementation Details

### State Management (`src/contexts`)
-   **UserContext**: Manages user profile (name, profession, preferences). Persists to LocalStorage.
-   **ProgressContext**: Tracks completed lessons, quiz scores, and daily streak.

### Mock API (`src/lib/api/service.ts`)
-   The app currently runs on a `mock-data.ts` file.
-   `ApiService` contains methods like `getLesson()`, `completeQuize()`, etc.
-   **Next Step for Dev**: Replace the internals of `ApiService` with real `fetch()` calls to your backend.

### The Dashboard "S-Curve" Logic (`src/app/dashboard/page.tsx`)
The winding path is generated mathematically to ensure responsiveness.
-   **Node Positioning**: Calculated using `x = sin(index * 0.8) * AMPLITUDE`.
-   **Connectors**: An SVG `<path>` is generated dynamically using Bezier curves (`C` command) to connect the centers of each node smoothly.
-   **Configuration**: Constants like `ROW_HEIGHT` and `AMPLITUDE` control the shape of the river.

### Design System (`tailwind.config.ts`)
-   **Colors**: A custom "Teal" palette (`teal-50` to `teal-950`) is the primary brand color.
-   **Gradients**: `bg-vina-gradient` (Teal to Blue) is used for primary actions.
-   **Glassmorphism**: `.glass-panel` utility class provides the frosted glass effect used in headers and cards.

## 5. Directory Structure
```
src/
├── app/                 # Next.js App Router pages
│   ├── dashboard/       # Course Map
│   ├── lesson/[id]/     # Video Player & Adaptation
│   ├── quiz/[id]/       # Assessment Flows
│   └── globals.css      # Global styles & Tailwind
├── components/
│   ├── ui/              # Reusable atoms (Button, Card)
│   └── layout/          # TopBar, BottomNav
├── contexts/            # React Context providers
└── lib/
    └── api/             # Mock services & Type definitions
```

## 6. How to Run
1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Start Development Server**:
    ```bash
    npm run dev
    ```
3.  **Build for Production**:
    ```bash
    npm run build
    ```

## 7. Next Steps for Development
-   [ ] **Backend Integration**: Connect `ApiService` to the real Python/Node backend.
-   [ ] **Authentication**: Implement real login/signup (Supabase/Auth0/NextAuth).
-   [ ] **Content**: Replace mock videos in `public/assets` with real lesson content.
-   [ ] **AI Integration**: Connect the "Adaptation" button to a real LLM endpoint to generate text/video variations on the fly.
