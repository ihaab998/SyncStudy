# Antigravity AI — Specification Sheet

## 1. Product Summary
| Field | Detail |
|---|---|
| Product Name | Antigravity AI |
| Category | AI-powered study-partner matching & accountability platform |
| Target Users | College students (initial), expanding to universities, competitive-exam aspirants, school students |
| Core Value Prop | AI-matched study partners + structured accountability + in-session AI tutoring |

## 2. Functional Requirements

### 2.1 Registration & Verification
- FR1: Users register with email/phone.
- FR2: College email or ID verification required before matching is enabled.
- FR3: Verification status visible on profile (badge).

### 2.2 Study Profile
- FR4: Capture: college, branch, semester, subject(s), exam(s), study goals, preferred timings, learning style, language preference.
- FR5: Profile editable post-creation.

### 2.3 AI Matching Engine
- FR6: Match priority order:
  1. Same College
  2. Same Branch
  3. Same Semester
  4. Same University
  5. Same Subject
  6. Fallback: AI Study Companion
- FR7: Secondary factors within a priority tier: same exam, study schedule overlap, learning style, language, study goals.
- FR8: Output a **Compatibility Score** (0–100%) with 2–5 human-readable match reasons.
- FR9: If no suitable human match exists, offer AI Study Companion automatically.

### 2.4 Study Sessions (Video Study Rooms)
- FR10: Support video chat, audio chat, and screen share.
- FR11: Support shared whiteboard (draw, solve, annotate).
- FR12: Support shared/collaborative notes, persisted post-session.
- FR13: Built-in Pomodoro timer, default 25 min study / 5 min break, user-configurable.
- FR14: In-session AI Tutor available on demand: explain concepts, solve doubts, give examples, generate diagrams, simplify topics.

### 2.5 AI Session Summary
- FR15: Auto-generate after each session: topics covered, time studied, key concepts, weak areas, revision notes.
- FR16: Summary stored to user history/dashboard.

### 2.6 AI Quiz Generator
- FR17: Generate a quiz from the current session's content on demand.

### 2.7 Accountability Sessions
- FR18: Users can commit to a scheduled joint session (e.g., 7–9 PM).
- FR19: System tracks session completion, time spent, and progress against the commitment.
- FR20: No forced interaction required during session — passive co-presence is a valid mode.

### 2.8 Progress Tracking
- FR21: Track and display: hours studied, subjects completed, weekly goals, study streaks.

### 2.9 Live Study Rooms (Public)
- FR22: Users can host public sessions discoverable by subject/topic.
- FR23: Other users can browse and join open public sessions.

## 3. Non-Functional Requirements
- NFR1: **Verification integrity** — prevent fake/unverified accounts from accessing matching.
- NFR2: **Moderation** — reporting and moderation tooling for video sessions to prevent misuse.
- NFR3: **Latency** — matching results should return in near-real-time (target: <5s for a match suggestion).
- NFR4: **Scalability** — matching pool logic must gracefully degrade (broaden criteria) as user base grows from small to large.
- NFR5: **Privacy** — study profile and session content (notes, whiteboard) should be access-restricted to session participants unless explicitly shared.
- NFR6: **Data retention** — session summaries/notes retained for user's historical progress tracking; user should be able to delete data.

## 4. AI Components (system-level)
| Component | Function |
|---|---|
| Matching Engine | Ranks/filters candidate partners using the priority + compatibility scoring model |
| Compatibility Scorer | Produces % score + reasons from profile/schedule overlap |
| In-session Tutor | Real-time doubt resolution, explanations, diagram generation |
| Session Summarizer | NLP/summarization over session transcript/notes → structured summary |
| Quiz Generator | Generates quiz items from session content |

## 5. Out of Scope (v1)
- General-purpose chat/social networking features
- Non-study video calling
- AI-generated study schedules, flashcards, forums (listed as Future Features, not v1)

## 6. Known Constraints
- **Cold Start Problem**: insufficient users initially for tight matches → mitigated via broadened matching tiers + AI Companion fallback.
- **Verification dependency**: platform trust model depends on reliable college email/ID verification, which may vary in reliability across institutions.
