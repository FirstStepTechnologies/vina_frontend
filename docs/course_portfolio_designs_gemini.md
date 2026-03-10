# Vina - Multi-Course Portfolio Design Options

As Vina expands from a single course ("Foundations of LLM") to a portfolio of courses, we need to decide how users will discover, select, and switch between different learning content. 

Given that Vina is positioned as an **"adaptive upskilling portfolio"** rather than a traditional static video library, the UX should emphasize personalization, skill acquisition, and fluid learning paths.

Here are 3 design options for introducing a portfolio of courses to the user:

---

## Option 1: The Hybrid "Skill Tracks" (Recommended)
**Concept:** We avoid the term "Courses" completely. Instead, we offer "Skill Tracks" or "Specializations" (e.g., *LLM Foundations*, *AI Product Management*, *Advanced RAG*). Users build a "Skills Portfolio" by adding tracks to their active learning queue.

**The UX Difference (vs. Option 3):**
The core difference is **frictionless switching** and **unified context**. In Option 1, the user never "leaves" the dashboard to go to a catalog. They have a "deck" of active skills they are currently learning.

**How it works (The Screens):**
1. **The Skills Portfolio Page (`/portfolio`):** This is *not* a catalog of courses. It is a visual report of the User. It shows a radar chart of their acquired skills (e.g., Prompt Engineering: 80%, System Design: 20%). Below their stats, they can browse "Skill Tracks" to add to their active queue.
2. **The Dashboard (`/dashboard`):** 
   - **The View:** At the very top of the dashboard, there is a horizontally scrollable row of cards (or pill buttons) representing their **Active Tracks**. 
   - **Switching:** When a user clicks a different track in this top row, the course map directly below it *instantly swaps* to the new track's map, via a smooth animation. There is no page reload.
   - **The Flow:** They can do a lesson in "LLM Foundations", jump back to the dashboard, click "Product Strategy" in the top carousel, and immediately see that map.

**Why it fits Vina:** It reframes learning around building a personal portfolio of skills rather than checking off isolated courses. It encourages exploring multiple topics concurrently without heavy navigation.

---

## Option 2: The Unified Adaptive Path (No Course Portfolio Page)
**Concept:** Since Vina is an adaptive upskilling platform, users shouldn't have to manually browse and pick courses. Instead, the platform generates a continuously evolving, singular learning path based on their career goals.

**How it works:**
1. **No Traditional Portfolio Page:** There is no "Course Catalog" page.
2. **Choosing Content:** During onboarding (or via a "Career Goals" settings page), the user defines their target role (e.g., "AI Product Manager") and their current proficiencies.
3. **The Unified Dashboard:** Vina's backend dynamically queries all available lessons across *all* domains (LLMs, PM, Data Science) and constructs a single, personalized course map on the dashboard. The map interleaves lessons from different domains. Sometimes the next node is an LLM lesson, the next is a Product Strategy lesson. 
4. **Switching:** Users don't "switch courses"—they just update their career goals or tell the AI, "I want to focus more on coding right now," and the map dynamically regenerates to surface different lessons.

**Why it fits Vina:** This is the purest form of "adaptive upskilling." It abstracts away the rigid boundaries of "courses" and focuses entirely on what the user needs to learn next to reach their goal.
*Note: This requires the most backend re-architecture, as the course map generation must become entirely dynamic.*

---

## Option 3: The Traditional Course Catalog & Workspace
**Concept:** A straightforward, familiar approach similar to Coursera or Udemy. The mental model is "I am inside a specific box (course). To enter a different box, I must leave this one first."

**The UX Difference (vs. Option 1):**
This uses traditional, separated page routing. Courses are siloed environments. Switching requires navigating through a directory.

**How it works (The Screens):**
1. **The Course Catalog (`/courses`):** A standard directory page. It shows a grid of available courses. Each card shows the course title and a description. 
2. **The Dashboard (`/dashboard`):** 
   - **The View:** The dashboard is purely dedicated to **one** active course at a time. It shows the learning map for that specific course and nothing else.
   - **Switching:** There is no quick-switcher on the dashboard. If the user is currently looking at the "LLM Foundations" map and wants to learn "Product Strategy," they must:
     1. Click "Browse Courses" in the sidebar to leave the dashboard.
     2. Go to the `/courses` catalog page.
     3. Find and click "Product Strategy".
     4. Click "Resume" to set it as active.
     5. Be redirected back to `/dashboard`, which now loads the Product Strategy map.

**Why it fits Vina:** It is the lowest engineering lift. It highly reuses the existing `app/dashboard/page.tsx` by simply passing it a different `courseId` context. Users instantly understand how to use it because it perfectly mimics traditional LMS platforms. 

---

### Conclusion & Next Steps
- **Option 1** strikes the best balance between achievable engineering scope and Vina's innovative adaptive identity.
- **Option 2** is the boldest "adaptive" vision, but requires significant changes to how course maps are generated.
- **Option 3** is the safest, fastest to implement, but feels the least "next-gen".

Please review and let me know which direction you'd like to pursue. Once a decision is made, we can begin updating the backend data models and frontend API hooks.
