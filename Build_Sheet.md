# Antigravity AI — Build Sheet

## 1. Suggested Architecture Overview

```
[Client Apps: Web / Mobile]
        |
[API Gateway]
        |
 ---------------------------------------------------
 |            |            |            |          |
[Auth &   [Matching   [Session/    [AI Services  [Notification
 Verify]   Engine]     Video Svc]   Layer]         Service]
 |            |            |            |
[User DB]  [Match DB]  [Session DB/ [LLM API +
            + Vector    Storage]     Vector DB for
            search]                  summarization/
                                      tutoring]
```

## 2. Core Modules & Build Order

### Phase 1 — Foundation (MVP core)
1. **Auth & Verification service**
   - Email/ID verification pipeline
   - Session/token management
2. **Study Profile service**
   - CRUD for profile fields (college, branch, semester, subject, exam, timings, learning style, language, goals)
3. **Matching Engine (v1 — rule-based)**
   - Implement priority-tier filtering (College → Branch → Semester → University → Subject → Companion fallback)
   - Basic scoring function combining tier + schedule overlap
4. **Basic Video Study Room**
   - Integrate WebRTC-based video/audio/screen-share (e.g., via a managed SDK such as Twilio, Agora, or LiveKit)
5. **Pomodoro Timer** (client-side widget, session-synced)

### Phase 2 — AI Layer
6. **Compatibility Scorer**
   - Upgrade matching to weighted scoring model, output % + reasons
7. **AI Tutor**
   - LLM-backed in-session Q&A, diagram generation, concept simplification
8. **Session Summarizer**
   - Capture session transcript/notes → generate structured summary (topics, time, key concepts, weak areas, revision notes)
9. **Quiz Generator**
   - Generate quiz from session summary/content on demand

### Phase 3 — Collaboration Tools
10. **Shared Whiteboard** (real-time canvas sync — e.g., via WebSocket + CRDT/OT library)
11. **Shared Notes** (collaborative text editor, e.g., via CRDT-based library like Yjs)

### Phase 4 — Accountability & Growth Features
12. **Accountability Sessions**
    - Scheduling + commitment tracking
    - Completion/progress tracking logic
13. **Progress Tracking Dashboard**
    - Hours studied, subjects completed, streaks, weekly goals
14. **Live/Public Study Rooms**
    - Discoverability by subject/topic, join flow

### Phase 5 — Trust & Safety
15. **Moderation tooling**
    - Reporting, session flagging, admin review queue
16. **Verification hardening**
    - Fraud detection on ID/email verification

## 3. Suggested Tech Stack (illustrative — adjust to team expertise)

| Layer | Options |
|---|---|
| Frontend (Web) | React / Next.js |
| Frontend (Mobile) | React Native or Flutter |
| Backend API | Node.js (NestJS/Express) or Python (FastAPI) |
| Auth | Firebase Auth / Auth0 / custom JWT |
| Database | PostgreSQL (core data), Redis (session/presence state) |
| Video/Audio/Screen-share | LiveKit, Agora, or Twilio Video |
| Real-time sync (whiteboard/notes) | WebSockets + Yjs (CRDT) |
| AI/LLM layer | Anthropic Claude API for tutoring, summarization, quiz generation |
| Vector search (matching similarity) | pgvector, Pinecone, or Weaviate |
| Notifications | Firebase Cloud Messaging / OneSignal |
| Infra | Docker + Kubernetes or serverless (e.g., AWS Lambda) depending on scale needs |

## 4. Data Model (high-level entities)
- **User**: id, verification_status, contact info
- **StudyProfile**: user_id, college, branch, semester, subjects[], exams[], goals, timings, learning_style, language
- **MatchRequest**: user_id, criteria snapshot, status
- **MatchResult**: user_id_a, user_id_b (or companion flag), compatibility_score, reasons[]
- **Session**: id, participants[], start_time, end_time, type (matched/public/accountability)
- **SessionSummary**: session_id, topics[], time_studied, key_concepts[], weak_areas[], revision_notes
- **Quiz**: session_id, questions[]
- **AccountabilityCommitment**: user_ids[], scheduled_start, scheduled_end, completion_status
- **ProgressStats**: user_id, hours_studied, streak_count, weekly_goal_progress

## 5. Build Risks & Mitigations
| Risk | Mitigation |
|---|---|
| Cold start — too few users for good matches | Launch single-college pilot; broaden matching tiers automatically as pool grows; AI Companion fallback from day one |
| Video infra cost at scale | Use managed SDK with usage-based pricing; monitor per-session cost early |
| AI Tutor answer quality/hallucination | Constrain scope to curriculum-relevant Q&A; add "flag as unhelpful" feedback loop |
| Verification fraud | Start with manual/semi-manual college ID review before automating |
| Moderation gaps in video sessions | Ship reporting + block features before public Live Study Rooms launch |

## 6. Suggested MVP Scope (v1 launch)
Include: Auth & verification, study profile, rule-based matching, video study rooms, Pomodoro timer, basic session summary (even if template-based initially).

Defer: Compatibility scoring with reasons, AI tutor, quiz generator, whiteboard, live public rooms, accountability tracking — these can follow in Phases 2–4 once core loop (profile → match → session) is validated with real users.

## 7. Future Features (post-v1, per product doc)
AI-generated study schedules, flashcards, exam countdowns, doubt discussion forums, personalized revision plans, calendar integration, smart reminders, study analytics dashboard.
