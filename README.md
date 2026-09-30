# Vidcura

> **Weave YouTube videos into distraction-free, structured courses.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-vidcura--zeta.vercel.app-00DC82?style=for-the-badge&logo=vercel&logoColor=white)](https://vidcura-zeta.vercel.app)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

🌐 **Live Application**: [https://vidcura-zeta.vercel.app](https://vit.vercel.app)

Vidcura is a modern, open learning platform that organizes scattered YouTube videos and playlists into focused, distraction-free courses. Learn at your own pace without algorithmic rabbit holes, intrusive sidebar recommendations, or comment distractions.

---

## 🌟 Key Features

### ⚡ Quick Watch (One-Time Distraction-Free Player)

- **Zero data stored**: Paste any YouTube link (video, playlist, or shorts) and watch immediately.
- **Pure privacy**: No login required, no tracking, and zero database entries stored.
- **Theatre mode & Cinema lighting**: Immersive distraction-free player with focus dimming.
- **Private browser scratchpad**: Take study notes saved locally in your browser session only.

### 🎬 Universal Coursera-Grade Player & Real Video Tracking

- **Ad-free & Distraction-Free**: Clean player via `youtube-nocookie.com` with zero algorithmic sidebar clutter.
- **100% Real Video Completion Tracking**: Automatically detects when a video ends via the YouTube Player API.
- **⏱️ 3-Second Auto-Play Next Video Countdown**: When a video completes in a course playlist, an animated 3-second countdown automatically queues and starts the next lesson (with immediate "Play Now" or "Cancel" options).
- **Big-Screen & Fullscreen Toggle**: Optimized for focused desktop and tablet viewing.

### 📚 Structured Curriculum & Infinite Scalability

- **10 Curated Categories**: Programming, Design, Business & Finance, Languages, Science & Maths, Exam Prep, Music & Arts, Health & Fitness, Movies, and Other.
- **Numbered Pagination**: Supports extensive catalogs with millions of videos and courses through fast, paginated chunk loading.
- **Syllabus Navigator**: 10-lesson paginated chapter drawer with video thumbnails, lesson status checkmarks, and page-jump controls.

### 🎓 My Learning Portal

- **Organized Tabs**: Quickly toggle between **All Courses**, **In Progress**, and **Completed ✓**.
- **Instant Resume**: Pick up right where you left off with one click.
- **Completion Badges**: Celebrate course milestones with clear progress tracking and 100% completion status.

### 🛡️ Creator-First & Private by Design

- **Original Creator Attribution**: Every view counts toward the original YouTube creator. We never re-host, download, or alter creator content.
- **Robust Security**: Comprehensive Firestore security rules ensuring user data privacy, authorization integrity, and rate limiting.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, React 19)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom claymorphism design system
- **Backend & Database**: [Google Firebase](https://firebase.google.com/) (Authentication & Cloud Firestore)
- **Testing**:
  - [Vitest](https://vitest.dev/) (Unit & integration tests)
  - [@firebase/rules-unit-testing](https://firebase.google.com/docs/rules/unit-testing) (Security rules verification)
  - [Playwright](https://playwright.dev/) (End-to-end journey tests)
- **Code Quality**: ESLint + Prettier

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- Firebase CLI: `npm install -g firebase-tools`
- (Optional) Java JRE for local Firebase Emulator Suite

### 1. Installation

```bash
git clone https://github.com/Channu0012/Vidcura.git
cd Vidcura
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Fill in your Firebase web app configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

```bash
# Run unit tests
npm test

# Type-check TypeScript code
npm run typecheck

# Run linter
npm run lint

# Format code with Prettier
npm run format

# Build production bundle
npm run build
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
