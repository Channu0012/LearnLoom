# LearnLoom

> Build and share free courses from YouTube videos.

LearnLoom is a community learning platform where anyone can create a structured course by pasting YouTube links, and anyone can learn — no account required to watch.

## Features

- 🎓 **Create courses** — paste YouTube links, auto-fetch titles via oEmbed, reorder lessons, publish instantly
- 🔍 **Explore & search** — category tabs, full-text keyword search, paginated grid
- 📺 **Distraction-free player** — youtube-nocookie.com embeds, lesson list, progress tracking, resume
- 🔐 **Google sign-in** — required only to create, save progress, or report
- 🛡️ **Security** — comprehensive Firestore rules with type/length validation and 15+ attack case tests
- 📊 **Admin panel** — review reports, unpublish or delete courses
- ⚖️ **Legal pages** — Terms, Privacy, Takedown request

## Tech stack

- **Next.js 15** (App Router) + TypeScript (strict)
- **Tailwind CSS** — Claymorphism design system
- **Firebase** — Auth (Google), Firestore, App Hosting
- **Vitest** — unit tests + Firestore rules tests
- **Playwright** — end-to-end tests

---

## Quick start

### Prerequisites

- Node.js ≥ 18
- Firebase CLI: `npm install -g firebase-tools`
- Java (for Firebase emulators): https://java.com

### 1. Clone and install

```bash
git clone https://github.com/your-org/learnloom.git
cd learnloom
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
# Fill in your Firebase project values
```

**HUMAN REQUIRED** — See Firebase setup instructions below.

### 3. Start the Firebase emulators

```bash
firebase emulators:start --import=./emulator-data --export-on-exit=./emulator-data
```

The emulator UI will be at http://localhost:4000

### 4. Start the dev server

In a separate terminal:

```bash
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true npm run dev
```

Open http://localhost:3000

---

## Running tests

```bash
# Unit tests (keyword generation, URL parsing)
npm run test

# Rules tests (requires emulator running)
firebase emulators:start --only firestore &
npm run test:rules

# End-to-end tests (requires dev server running)
npm run dev &
npm run test:e2e
```

---

## Firebase setup (HUMAN REQUIRED)

Follow these steps once:

### Step 1 — Create Firebase projects

1. Go to https://console.firebase.google.com
2. Click **Add project** → name it `learnloom-dev`
3. Repeat for `learnloom-prod`

### Step 2 — Enable services (do this for both projects)

1. **Authentication** → Sign-in method → Enable **Google**
2. **Firestore** → Create database → Start in production mode → choose a region
3. **App Hosting** → Get started (optional, for deployment)

### Step 3 — Get your config values

1. Project settings → Your apps → Add web app
2. Copy the config values into `.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### Step 4 — Service account (for Admin SDK)

1. Project settings → Service accounts → Generate new private key
2. Add to `.env.local`:

```bash
FIREBASE_ADMIN_PROJECT_ID=...
FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

### Step 5 — Set first admin user (HUMAN REQUIRED)

1. Sign in to the app with Google
2. Go to Firebase Console → Firestore → `users` collection
3. Find your user document and set `isAdmin: true`

---

## Project structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/oembed/         # oEmbed proxy route
│   ├── course/[courseId]/  # Course page (SSR)
│   ├── create/             # Create course
│   ├── edit/[courseId]/    # Edit course
│   ├── explore/            # Browse courses
│   ├── my-courses/         # Creator dashboard
│   ├── my-learning/        # Learner dashboard
│   ├── admin/              # Admin panel
│   ├── terms/              # Terms of Service
│   ├── privacy/            # Privacy Policy
│   └── takedown/           # Takedown request
├── components/
│   ├── courses/            # CourseCard, CourseEditor, CoursePageClient
│   └── layout/             # Header, Footer
├── context/
│   └── AuthContext.tsx     # Firebase Auth React context
├── lib/
│   ├── constants.ts        # Categories, limits, YouTube utilities
│   ├── types.ts            # Firestore TypeScript types
│   ├── firebase.ts         # Client SDK init
│   ├── firebase-admin.ts   # Admin SDK init
│   ├── firestore.ts        # Typed Firestore helpers
│   └── keywords.ts         # Keyword generation & search ranking
└── tests/
    ├── keywords.test.ts    # Unit tests
    ├── constants.test.ts   # Unit tests
    ├── rules/
    │   └── firestore.rules.test.ts  # Security rules tests
    └── e2e/
        └── smoke.test.ts   # Playwright E2E tests
```

---

## Scripts

| Command              | Description                  |
| -------------------- | ---------------------------- |
| `npm run dev`        | Start dev server             |
| `npm run build`      | Production build             |
| `npm run typecheck`  | TypeScript check             |
| `npm run lint`       | ESLint                       |
| `npm run format`     | Prettier format              |
| `npm run test`       | Unit tests                   |
| `npm run test:rules` | Rules tests (needs emulator) |
| `npm run test:e2e`   | E2E tests (needs dev server) |
| `npm run emulator`   | Start Firebase emulators     |
