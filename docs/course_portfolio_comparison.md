# UX Comparison & Final Recommendation: Adaptive Skills Portfolio

This document analyzes the UX directions proposed for Vina's multi-course expansion, comparing the approaches from our initial brainstorm (`course_portfolio_designs_gemini.md`) and the subsequent analysis (`multi-course-portfolio-design-options.md`), to provide a final recommendation.

## The Design Landscape

Between the two explorations, three distinct mental models emerged for how users interact with multiple courses:

1.  **The Traditional Course Catalog (Siloed):** The user browses a catalog, selects a course, and that course becomes their isolated workspace. To switch, they must leave the workspace and return to the catalog.
2.  **The Unified Adaptive Path (Course-less):** The user defines their career goal, and the system weaves together a single, linear learning path mixing lessons from all available domains.
3.  **The Hybrid Skill Tracks (Track-Switching):** The user maintains a small portfolio of "Active Tracks". The main dashboard allows them to instantly switch their map view between these active tracks without leaving the learning flow.

## The Core Conflict: Clarity vs. Fluidity

The deepest UX debate is between **Focus/Clarity** (a guided portfolio home page leading to a single-course dashboard) vs. **Fluidity/Agency** (a unified dashboard with instant track-switching).

### Focus (The "Portfolio Home" Model)
*   **How it works:** You land on a `/portfolio` page showing your courses. You click one to enter the dashboard.
*   **Pros:** Lower cognitive load. It's incredibly clear what the user should do next, especially for new learners. It's simple to build.
*   **Cons:** High friction when switching contexts. It feels like a standard LMS, slightly diluting the "adaptive upskilling" proposition.

### Fluidity (The "Hybrid Skill Tracks" Model)
*   **How it works:** The `/dashboard` *is* the home. A carousel at the top holds 3-4 "Active Skills". Clicking one instantly swaps the course map below. 
*   **Pros:** Unbeatable for concurrent learning. It keeps the user in the coveted "flow state". It feels highly distinct, premium, and adaptive.
*   **Cons:** If unrestricted, the dashboard becomes noisy. The user might fragment their attention across 10 different tracks and never finish one.

---

## Final UX Recommendation: "Constrained Hybrid Tracks"

Both design explorations independently converged on the exact same optimal solution: **A constrained version of the Hybrid Skill Tracks model.** This approach fuses the fluidity of the instant-switcher with the focus of a guided portfolio.

### How it Works (The Target UX)

If we want Vina to stand out as a next-generation adaptive product rather than a generic LMS, we must prioritize the *frictionless switching* while mitigating the *cognitive overload*.

1.  **The Core Surface (`/dashboard`):** This remains the user's operational workspace. At the top of the screen is an **Active Tracks Switcher** (e.g., pill buttons for *LLM Foundations*, *AI Product Mgmt*). Clicking these instantly swaps the map in place.
2.  **The Guardrails (Crucial):**
    *   **Strict Limits:** The user is limited to a small number of active tracks (e.g., 1 Primary Recommendation + a maximum of 2 Secondary Tracks).
    *   **Visual Hierarchy:** The system always visually elevates the *Primary Recommended Track* to guide focus.
3.  **The Discovery Surface (`/portfolio`):** A separate page used purely for strategic identity and discovery. It shows their overall skill radar, tracks they've completed, and allows them to browse and swap out their 2 secondary active tracks.

### Why this is the winning choice:

*   **It feels "Adaptive":** By allowing instant swaps between tracks without reloading pages or navigating directories, the UI matches the speed of the user's thought process. It feels like a continuously molding portfolio, not a static library.
*   **It prevents fragmentation:** The strict 3-track limit prevents the user from drowning in concurrent choices, ensuring completion rates remain high.
*   **It solves the single-course constraint:** It provides a scalable way to introduce 3, 5, or 10 courses, while only showing the user the 1-3 they actually care about right now.

### Next Steps for Implementation

Before building this UI, the backend must transition from a "global progress" model to a "course-aware" model:
1.  Add `courseId` to all API endpoints and frontend routing state.
2.  Migrate `UserProgress` to store lesson completion *per course*.
3.  Implement the logical state limit for the "Active Tracks" queue (1 Primary, max 2 Secondary).
