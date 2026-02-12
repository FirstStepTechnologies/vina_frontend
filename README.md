# 🍷 Vina - Adaptive LLM Learning Platform

Welcome to the Vina Frontend project! This is a mobile-first web application built with **Next.js 14**, designed to provide personalized, adaptive learning content about Large Language Models (LLMs).

This guide will walk you through setting up the project on your computer, especially if you are new to frontend development.


---

## 🛠 Prerequisites

Before you start, make sure you have these two essential tools installed:

1.  **Node.js (LTS Version)**: This is the engine that runs our project.
    -   Download it here: [nodejs.org](https://nodejs.org/) (Choose the "LTS" version).
2.  **Git**: A tool to manage and download the code.
    -   Download it here: [git-scm.com](https://git-scm.com/)

---

## 🚀 Getting Started

Follow these steps in order to get the app running on your machine:

### Step 1: Clone the Project
Open your terminal (Terminal on Mac, Command Prompt or PowerShell on Windows) and run the following command to download the code to your machine:

```bash
git clone https://github.com/FirstStepTechnologies/vina_frontend.git
```

Then, move into the project folder:

```bash
cd vina_frontend
```

### Step 2: Install Dependencies
A modern web project relies on many smaller "packages" (libraries). Run this command to download all the necessary tools specified in our project:

```bash
npm install
```

### Step 3: Run the Development Server
Now, let's start the app! Run:

```bash
npm run dev
```

You should see a message saying `Ready in ...ms`. Now, open your browser and go to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 📂 Project Structure (Where to find things)

As a new developer, here is a quick map of the project:

-   `src/app/`: This is where all the **Pages** of the app live.
    -   `page.tsx`: The Welcome screen.
    -   `dashboard/`: The winding course map.
    -   `lesson/[id]/`: The video player screen.
-   `src/components/ui/`: Reusable interface elements like **Buttons** and **Cards**.
-   `src/contexts/`: This is where we handle the "Brain" of the app (saving your name, tracking which lessons you finished).
-   `src/lib/api/`: Handles how we talk to the backend (or currently, how we use "mock" fake data for testing).
-   `public/assets/`: All the images and videos used in the app.

---

## ⌨️ Helpful Commands

-   `npm run dev`: Starts the app for development (auto-reloads when you save a file).
-   `npm run build`: Prepares the app for a real, live website (optimizes everything).
-   `git status`: Shows you which files you have changed.
-   `git add .` followed by `git commit -m "my changes"`: Saves your work locally.
-   `git push`: Sends your saved work to the GitHub website.

---

## 📚 Further Reading

We have created specialized documents for your transition:

1.  **[HANDOVER.md](./HANDOVER.md)**: Read this first! It explains the architecture and how the "magic" (like the winding S-curve) works.
2.  **[FUTURE_ENHANCEMENTS.md](./FUTURE_ENHANCEMENTS.md)**: A list of "To-Do" features that we haven't built yet.
3.  **[BACKEND_API_SPEC.md](./BACKEND_API_SPEC.md)**: Details on how the app will eventually talk to the real backend.

---

### 💡 Pro Tip for Mobile View
Since this is a mobile-first app, it's best to view it in "Mobile Mode" in your browser:
1. Right-click anywhere on the page and select **Inspect**.
2. Click the **Device Toggle** icon (looks like a small phone/tablet icon) at the top of the inspector panel.
3. Select a device like "iPhone 12/13" from the dropdown.
