# Multi-Course Portfolio Design Options

## Goal

Vina currently behaves like a single adaptive course product. The goal is to evolve it into an adaptive upskilling portfolio where a learner can:

- discover multiple courses,
- understand why a course matters for their role,
- start one course confidently,
- move between courses without losing context,
- and still feel like Vina is curating one coherent journey rather than showing a generic catalog.

## Current Implementation Analysis

### What the codebase does today

The live learner experience is optimized around one course: `LLM Foundations`.

Frontend findings:

- `src/app/dashboard/page.tsx` renders a single linear course map and hard-codes the title `LLM Foundations`.
- `src/app/progress/page.tsx` hard-codes progress math against `17` total lessons.
- `src/contexts/ProgressContext.tsx` stores one global progress object with one `current_lesson_id`, one `starting_lesson`, and one `completed_lessons` array.
- `src/lib/api/service.ts` exposes `getCourseMap()` with no `courseId`, and `getLesson(lessonId)` also has no explicit course parameter.
- `src/app/practice/page.tsx` starts practice from `l01_what_llms_are`.
- onboarding in `src/app/profession/page.tsx` and `src/app/assessment/page.tsx` routes every learner back to one dashboard, not to a portfolio or selected course.

Backend findings:

- `src/vina_backend/api/routers/courses.py` loads `llm_foundations.json` directly and serves one static `/course/map`.
- `src/vina_backend/api/routers/lessons.py` hard-codes `LessonCache.course_id == "c_llm_foundations"`.
- `src/vina_backend/api/routers/assessment.py` uses fixed lesson IDs and places learners inside the LLM Foundations sequence.
- `src/vina_backend/integrations/db/models/user.py` stores one `UserProgress` record per user, not per course.
- lesson completion in `src/vina_backend/api/routers/progress.py` appends lesson IDs into one global `completed_lessons` list.

### What is reusable already

There is useful groundwork for multi-course support:

- `src/vina_backend/services/course_loader.py` already loads course configs by `course_id`.
- `src/vina_backend/domain/constants/llm_foundations.json` already has real course metadata: `course_id`, `course_name`, `tagline`, `series_name`, `prepares_for`.
- `src/vina_backend/domain/schemas/learner_state.py` already models `course_id`.

### Core product implication

The product should not just add a second course tile. It needs a first-class concept of:

- `active course`,
- `course portfolio`,
- `per-course progress`,
- and `course-aware routing/API contracts`.

Without that, the UX will feel inconsistent and the backend will mix progress across unrelated courses.

## UX Principles For A Portfolio Product

- Show a curated path, not a marketplace.
- Make the recommended next course obvious.
- Let users switch courses without fear of losing progress.
- Separate `overall growth` from `in-course progress`.
- Use the learner's role/goals to explain why each course exists.

## Option 1: Unified Skills Portfolio Home

### Summary

Replace the current dashboard with a `Skills Portfolio` home that shows all courses as part of one personalized learning portfolio. Each course appears as a rich card with status, value, and next action.

This keeps the product feeling adaptive and premium rather than catalog-heavy.

### Experience

The learner lands on a portfolio page with:

- a hero section: `Your AI Upskilling Portfolio`,
- one clearly highlighted `Recommended Next Course`,
- a `Continue Current Course` card,
- a `Build Adjacent Skills` section with 3 to 6 course cards,
- and an `All Skills Progress` summary above the fold.

Each course card shows:

- course title and role-specific benefit,
- current status: `Not started`, `In progress`, `Completed`,
- estimated effort,
- key skills taught,
- and one CTA: `Start`, `Resume`, or `Review`.

### How users choose a course

- Default choice is guided: one course is visually recommended.
- Other courses are available as secondary options in the same portfolio grid.
- Clicking a course opens either a lightweight preview drawer or a dedicated course detail page with syllabus, outcomes, prerequisites, and learner fit.

### How users move from the current course to another

- Add a `Switch course` action in the current course header.
- Add a persistent `Portfolio` entry in the bottom nav.
- After a lesson or course completion, show `What should I learn next?` with 2 or 3 suggested courses.
- When a learner switches, progress stays preserved per course and the app updates the `active course`.

### Do we need a separate course portfolio page?

Not necessarily. In this option, the portfolio page is the main home screen and already acts as the course portfolio.

### Why this option is strong

- Best balance of clarity and adaptability.
- Feels personalized, not like a generic LMS catalog.
- Easy mental model: one home, many learning tracks.
- Smoothest transition from the current single-course dashboard.

### Risks

- If the number of courses grows large, the page can become crowded.
- Requires good recommendation logic so the learner is not overwhelmed.

### Product/technical implications

- Introduce `activeCourseId` in frontend state.
- Replace `/dashboard` with a portfolio-oriented home.
- Add course-aware APIs like `GET /courses`, `GET /courses/{courseId}/map`, `GET /courses/{courseId}/lessons/{lessonId}`.
- Move progress from one global course track to per-course progress records.

## Option 2: Two-Level IA With Separate Portfolio And Course Detail Pages

### Summary

Create two clear layers:

- `Portfolio page`: overview across all courses.
- `Course page`: the immersive map for one selected course.

This is the cleanest information architecture if Vina will have a broader library.

### Experience

The learner first sees a portfolio overview with sections such as:

- `Recommended for your role`,
- `In progress`,
- `Completed`,
- `Coming next`.

Selecting a course takes the learner to a dedicated course page that keeps the current map-style immersion:

- course hero,
- lesson path/map,
- milestone progress,
- course-specific practice and outcomes.

### How users choose a course

- They browse from the portfolio page.
- They can filter by goal, skill domain, duration, or difficulty.
- Each course has a clear preview state before entry.

### How users move from the current course to another

- The course page has a top-left back affordance to `Portfolio`.
- The course page header includes `Change course`.
- The course completion screen returns the learner to the portfolio with recommended next courses.

### Do we need a separate course portfolio page?

Yes. This option explicitly requires one.

### Why this option is strong

- Best scalability for a growing course library.
- Keeps the current immersive course-map pattern intact.
- Clear separation between portfolio browsing and course learning.

### Risks

- Adds one extra navigation step before learning starts.
- Slightly more enterprise/LMS feeling if the portfolio page is not designed carefully.

### Product/technical implications

- New primary routes such as `/portfolio` and `/course/[courseId]`.
- Current dashboard map can be repurposed into the dedicated course page.
- Progress, assessment, practice, and lesson APIs all need `courseId`.
- Strong fit if Vina expects 8+ courses in the next phase.

## Option 3: Adaptive Career Roadmap

### Summary

Instead of leading with courses, lead with capabilities. The learner sees a roadmap of outcomes such as:

- `Use LLMs safely at work`
- `Design AI workflows`
- `Evaluate AI tools`
- `Automate research and reporting`

Courses become containers inside each capability lane.

This is the most differentiated option and best matches the language of an adaptive upskilling portfolio.

### Experience

The learner lands on a roadmap page with 3 to 5 capability lanes. Each lane contains one or more courses and badges for mastery level.

The primary card is not `Course 1`; it is `Next capability to unlock`.

Each capability opens to:

- why it matters for the learner's role,
- courses that contribute to it,
- mastery state,
- and a recommended next course.

### How users choose a course

- They choose a capability first, not a course first.
- Inside that capability, Vina recommends the best next course.
- Exploratory learners can still browse all courses from a secondary `All courses` view.

### How users move from the current course to another

- At any time, the learner can return to the roadmap.
- The roadmap visually shows adjacent capabilities and suggested jumps.
- If they are midway through one course, Vina can say `Pause this path and start RAG Essentials now` without making them feel lost.

### Do we need a separate course portfolio page?

Probably not as the main entry point. A lightweight `All courses` page or modal would still be useful for browsing, but the roadmap is the real home.

### Why this option is strong

- Most aligned with the idea of an adaptive upskilling portfolio.
- More distinctive than a normal course catalog.
- Better framing for cross-course recommendations and role-based pathways.

### Risks

- Highest UX and implementation complexity.
- Requires stronger metadata: capabilities, dependencies, skill tags, mastery states.
- Harder to ship quickly without first fixing course-aware backend/data structures.

### Product/technical implications

- Need skill taxonomy on top of course taxonomy.
- Need course-to-skill mapping in backend config.
- Need portfolio-level progress model plus per-course progress.
- Best as a phase-2 evolution, not the first multi-course release.

## Comparison

| Option | Best for | Separate portfolio page? | UX strength | Delivery complexity |
| --- | --- | --- | --- | --- |
| Option 1: Unified Skills Portfolio Home | 3 to 8 courses, curated premium feel | No, home page becomes portfolio | High | Medium |
| Option 2: Portfolio + Course Page | 8+ courses, cleaner IA | Yes | High | Medium |
| Option 3: Adaptive Career Roadmap | differentiated adaptive product vision | Not as primary page | Very high | High |

## Direct Comparison: Option 1 vs Hybrid Skill Tracks

### The common ground

These two ideas are close in spirit. Both:

- frame learning as a portfolio rather than a cold course catalog,
- depend on course metadata plus per-course progress,
- need an `active course/track` concept,
- support switching without losing progress,
- and fit Vina better than a traditional LMS browse-and-enroll model.

### The key differences

Option 1 in this document:

- uses the portfolio as the main entry point,
- emphasizes one recommended next course plus secondary choices,
- keeps switching available but slightly more deliberate,
- and treats course pages as the main immersive learning surface.

Hybrid Skill Tracks:

- separates `portfolio` from `dashboard`,
- treats the dashboard as a multi-track control center,
- encourages concurrent learning via an active-track queue,
- and prioritizes instant in-place switching between maps.

### What is better in Option 1

- Clearer focus. The learner is gently pushed toward one best next step.
- Lower cognitive load. Fewer simultaneous choices on the main learning screen.
- Stronger narrative. The product feels like a guided adaptive journey.
- Better fit for new learners who may not know what to study next.

### What is weaker in Option 1

- Switching is not as fluid as the hybrid model.
- It may feel too linear for users who want to learn across several domains at once.
- The portfolio can become a browse page instead of a live workspace if not designed carefully.

### What is better in the Hybrid Skill Tracks idea

- Best switching experience. The user can move between tracks almost instantly.
- Stronger sense of owning a personal skills portfolio.
- Better support for concurrent learning habits.
- More dynamic and differentiated product feel if executed well.

### What is weaker in the Hybrid Skill Tracks idea

- Higher cognitive load, especially for first-time learners.
- More temptation to fragment attention across too many tracks.
- Harder to keep one strong recommended path.
- More interaction and state complexity on the dashboard.

### UX tradeoff in one sentence

Option 1 optimizes for clarity and guidance. Hybrid Skill Tracks optimizes for fluidity and learner agency.

## Updated Recommendation

For the **best user experience overall**, I would recommend a **constrained version of the Hybrid Skill Tracks model**.

That means:

- keep the language of `Skills Portfolio` and `Skill Tracks`,
- keep a separate `Portfolio` page as the strategic view of the learner,
- keep a `Dashboard` as the operational learning workspace,
- allow instant switching between active tracks on the dashboard,
- but limit active tracks to a small set, ideally `1 primary + up to 2 secondary`.

This is important because the raw hybrid idea is more powerful, but it can become noisy fast. Constraining the number of active tracks preserves the best part of the hybrid concept without turning the dashboard into a multitasking trap.

### Why this beats pure Option 1

- It better matches the idea of an adaptive upskilling portfolio.
- It creates a more premium and differentiated product.
- It makes switching between topics feel natural, not navigational.
- It supports both focused learners and exploratory learners.

### Why this should still be constrained

- Most users do better with a visible primary recommendation.
- Too many active tracks would weaken completion rates.
- Vina should feel intelligently curated, not endlessly browsable.

### Recommended product model

- `Portfolio page`: identity, capability summary, skill coverage, suggested tracks, add/remove track.
- `Dashboard`: active-track switcher plus one map area that swaps between tracks.
- `Lesson flow`: always course-aware, but returns the user to the same dashboard workspace.
- `Recommendations`: Vina always marks one track as `Recommended next`.

### Suggested guardrails

- Default every learner into one primary track.
- Let them add at most 2 additional active tracks.
- If they add a new one, ask whether to replace an existing secondary track.
- Keep one persistent `Resume recommended track` CTA at the top of the dashboard.
- Use the portfolio page for discovery, not the dashboard.

## Recommendation

Recommend **Hybrid Skill Tracks with guardrails** for the product direction.

Recommend **Option 1-style structure** as the fallback if the team wants the simplest first release.

In practice, the strongest design is:

- a portfolio page for identity and discovery,
- a dashboard with an active-track switcher,
- one primary recommended track,
- and per-track maps that swap in place.

## Suggested Next-Step Architecture Before UI Build

Regardless of which option we choose, implementation should start by making courses first-class in the system:

1. Add a backend `CourseSummary` model and a real `GET /courses` endpoint.
2. Add `courseId` to frontend API methods and route structure.
3. Introduce per-course progress instead of one global `completed_lessons` list.
4. Make assessment and practice course-aware.
5. Store an `activeCourseId` for fast resume behavior.

Once those are in place, the frontend can support any of the three UX directions cleanly.
