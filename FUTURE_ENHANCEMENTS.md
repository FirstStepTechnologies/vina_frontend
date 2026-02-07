# Vina Frontend - Feature Gaps & Future Enhancements

This document outlines the features and improvements specified in the Product Requirements Document (PRD) that were **not included** in the initial MVP implementation. It serves as a backlog for the next development phase.

## 1. High Priority Enhancements (Post-MVP)

### 1.1 Authentication & User Cloud Sync
- **Current State**: User data is stored entirely in `LocalStorage`. If the user clears their cache or switches devices, their progress is lost.
- **Missing Feature**:
    -   Registration/Login screens (Email/Password or OAuth).
    -   Syncing of `UserContext` and `ProgressContext` with the backend database.
    -   Persistent user profiles across devices.

### 1.2 Real-time AI Adaptation
- **Current State**: The "Zap" button simulates adaptation with a timeout and mock logic.
- **Missing Feature**:
    -   Connect the "Adapt" button to a backend endpoint that truly triggers a generative AI workflow.
    -   Handle real-time video generation status streams (e.g., using WebSockets or polling) to show accurate "Generating..." progress.

### 1.3 Professional Profile Details
- **Current State**: Users only select a "Profession" (e.g., "Product Manager").
- **Missing Feature**:
    -   Collection of "Industry" (Healthcare, Finance, etc.) and "Experience Level" during onboarding.
    -   A dedicated **Profile/Settings** page to edit these details later.
    -   Using this data to further fine-tune the lesson content (e.g., "Clinical Researcher in Pharma" vs. "Clinical Researcher in Academia").

## 2. Medium Priority Enhancements

### 2.1 Advanced Gamification
- **Current State**: Basic points and streak counter.
- **Missing Feature**:
    -   **Leaderboard**: A view to compare XP with other users in the same profession.
    -   **Badges/Achievements**: A visual trophy case for milestones (e.g., "7-Day Streak", "Quiz Master").
    -   **XP Levels**: Visual distinction for leveling up (Bronze, Silver, Gold).

### 2.2 Deep "Practice" Mode
- **Current State**: The "Practice" tab is a placeholder with mock daily questions.
- **Missing Feature**:
    -   **Spaced Repetition Algorithm**: Implementation of logic (e.g., SuperMemo-2) to surface questions the user is likely to forget.
    -   **Weakness Targeting**: Automatically prioritizing questions from lessons where the user scored poorly.

### 2.3 Interactive Transcript & Notes
- **Current State**: Video player is standard.
- **Missing Feature**:
    -   **Interactive Transcript**: text that scrolls with the video and allows tapping to jump to that timestamp.
    -   **Note Taking**: Ability for users to jot down private notes attached to specific lessons.

## 3. UI/UX Polish (Low Priority)

### 3.1 Advanced Animations
- **Missing Feature**:
    -   Seamless page transitions (shared element transitions) between the Dashboard node and the Lesson player.
    -   More elaborate confetti/reward animations on the Dashboard when a node unlocks.

### 3.2 Accessibility (A11y) Deep Dive
- **Missing Feature**:
    -   Full audit of screen reader compatibility (VoiceOver/TalkBack).
    -   High contrast mode toggle.
    -   Keyboard navigation Optimization for all interactive elements.

## 4. Technical Infrastructure

### 4.1 Testing
- **Current State**: Manual testing.
- **Missing Feature**:
    -   Unit tests (Jest/Vitest) for utility functions and hooks.
    -   End-to-End tests (Playwright/Cypress) for critical flows (Onboarding -> Lesson -> Quiz).

### 4.2 PWA Capabilities
- **Current State**: Basic manifest exists.
- **Missing Feature**:
    -   **Offline Support**: Caching video content using Service Workers so lessons work without internet.
    -   **Install Prompt**: Custom UI to encourage users to "Add to Home Screen".
