# Antigravity AI — Design Sheet

## 1. Product Concept
Antigravity AI is an AI-powered study platform that matches students with compatible study partners and keeps them accountable through structured, focused study sessions. It is purpose-built for studying — not a general chat or social app.

**One-line pitch:** "Find the right person to study with, right now — and actually stick with it."

## 2. Design Principles
- **Focus over chatter** — every screen should nudge users toward studying, not socializing.
- **Low-friction matching** — students shouldn't have to search; the AI proposes, the student confirms.
- **Visible accountability** — progress, streaks, and session status should always be one glance away.
- **Calm, distraction-free UI** — study tools (timer, whiteboard, notes) should feel minimal and quiet, not gamified/noisy.
- **Trust and safety by design** — verification and moderation cues should be visible without being intrusive.

## 3. Primary User Flow
1. **Register** — student signs up.
2. **Verify** — college email/ID verification.
3. **Build Study Profile** — college, branch, semester, subjects, exams, goals, timings, learning style, language.
4. **AI Match** — AI proposes a best-fit study partner (or companion, if none available).
5. **Join Session** — enter a Video Study Room.
6. **Study** — with optional AI tutor support, whiteboard, shared notes, Pomodoro timer.
7. **Session Ends** — AI generates a progress summary.

## 4. Key Screens

### 4.1 Onboarding & Verification
- College email/ID upload
- Progress indicator (3–4 steps)
- Clear "why we verify" microcopy for trust

### 4.2 Study Profile Builder
- Structured form: College → Branch → Semester → Subject(s) → Exam(s) → Goals → Preferred timings → Learning style → Language
- Editable anytime from profile settings

### 4.3 Match Screen
- Card-based partner suggestion showing:
  - Name/avatar (verified badge)
  - Compatibility Score (e.g., "94% match")
  - Match reasons (same syllabus, same exam date, same schedule, etc.)
- Accept / Skip / Request AI Companion instead

### 4.4 Video Study Room
- Video + audio tiles
- Screen share toggle
- Shared whiteboard button
- Shared notes panel
- Pomodoro timer widget (default 25/5)
- "AI Tutor" quick-access button (visible but non-intrusive)

### 4.5 AI Tutor Panel (in-session)
- Chat-style doubt resolution
- Diagram generation inline
- "Explain simpler" quick action

### 4.6 Session Summary Screen
- Topics covered
- Time studied
- Key concepts (auto-extracted)
- Weak areas flagged
- Auto-generated revision notes
- CTA: "Generate quiz from this session"

### 4.7 Dashboard / Progress Tracking
- Hours studied (daily/weekly)
- Subjects completed
- Study streak counter
- Weekly goal progress bar
- Upcoming committed sessions (accountability slots)

### 4.8 Live Study Rooms (Public)
- Browsable list of open sessions by subject/topic
- Join button with live participant count

## 5. Interaction Design Notes
- **Accountability sessions** (e.g., 7–9 PM commitment) should show a persistent, low-key status indicator — "studying" presence, not chat activity — since the value is silent co-presence, not conversation.
- **Compatibility Score** should always be paired with 2–3 human-readable reasons, never shown as a bare number, to build trust in the matching logic.
- **Cold-start fallback** (AI Study Companion) should look and feel like a natural fallback tier, not a "downgrade" — same UI pattern as a human match card, just labeled differently.

## 6. Visual/Brand Direction (suggested)
- Calm, focused palette (muted blues/greens; avoid high-saturation "gamified app" colors)
- Typography: clean, readable sans-serif, generous line spacing for study content
- Minimal iconography for timer, whiteboard, notes — should read as "study tools," not "social app icons"

## 7. Accessibility Considerations
- Language preference should affect UI copy where feasible, not just matching
- Adjustable text size for notes/whiteboard content
- Captions/transcription option for video sessions (also aids AI session summaries)
