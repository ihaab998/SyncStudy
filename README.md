# 📚 SyncStudy

**Find the right person to study with, right now — and actually stick with it.**

SyncStudy is an intelligent, real-time study platform that pairs students based on their goals, subjects, and learning styles. Once matched, students drop into an interactive, real-time video room equipped with shared whiteboards, a Pomodoro timer, and a built-in AI tutor to help them conquer difficult topics together.

---

## ✨ Features

- 🧠 **AI-Powered Matching:** Uses Google's Gemini AI to analyze student profiles, subjects, and goals to find the perfect study partner.
- 📹 **Real-Time Study Rooms:** High-quality, low-latency video and audio powered by **LiveKit**.
- 🎨 **Shared Interactive Whiteboards:** Collaborate on complex problems in real-time.
- 🤖 **On-Demand AI Tutor:** A built-in AI sidebar (Gemini-powered) that can explain concepts, debug code, and provide hints without giving away the direct answers.
- ⏱️ **Pomodoro Timer:** Built-in focus tracking to keep study sessions productive and structured.
- 💬 **Live Chat & Presence Tracking:** See who is online and chat with matches before joining a room.
- 🛡️ **Admin Portal & Moderation:** A dedicated `/admin` portal for verifying student IDs and handling moderation reports.
- 📱 **Mobile Responsive:** A sleek, dark-mode glassmorphism UI that looks stunning on desktops and perfectly wraps for mobile devices.

---

## 🛠️ Tech Stack

- **Frontend framework:** [Next.js](https://nextjs.org/) (App Router, React)
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL, Magic Link Auth)
- **Real-Time Video/Audio:** [LiveKit](https://livekit.io/)
- **Artificial Intelligence:** [Google Gemini API](https://aistudio.google.com/)
- **Styling:** Custom Vanilla CSS (Glassmorphism, Modern UI)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/ihaab998/SyncStudy.git
cd SyncStudy
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Environment Variables
Create a `.env.local` file in the root directory and add the following keys:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
LIVEKIT_API_KEY=your_livekit_key
LIVEKIT_API_SECRET=your_livekit_secret
NEXT_PUBLIC_LIVEKIT_URL=your_livekit_wss_url
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Database Setup
To set up the Supabase database, run the provided SQL scripts in your Supabase SQL Editor in this order:
1. `database.sql` (Core tables & Auth triggers)
2. `update-social.sql` (Friends & Chat tables)
3. `database-phase4.sql` & `update-phase4-rooms.sql` (Rooms & Reports)
4. `mock-users.sql` (Optional: Inject 25 dummy users for testing the AI matching)

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🔒 Security & Roles
- **Users** authenticate seamlessly via Supabase Magic Links.
- **Admin** access is restricted to `admin@syncstudy.com`, which routes directly to a secure moderation portal.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
