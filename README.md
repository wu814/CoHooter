# CoHooter

A **Kahoot!-style competitive coding platform** built with Vue 3, Tailwind CSS, and Supabase.

Players join a session with a Game PIN, solve timed coding challenges, and compete on a live scoreboard.

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A [Supabase](https://supabase.com/) project (free tier works)

## Getting Started

```bash
npm install
cp .env.example .env      # fill in your Supabase credentials
npm run dev                # → http://localhost:5173
```

## Architecture

```
src/
├── models/index.js          ← Data schemas (Question, Player, Session, etc.)
├── services/                ← Backend integration layer (implement these)
│   ├── questionService.js   ←   Fetch / AI-generate questions
│   ├── codeRunner.js        ←   Execute & judge code submissions
│   └── sessionService.js    ←   Session CRUD, leaderboard, analytics
├── composables/             ← Reactive state shared across components
│   ├── useSession.js        ←   Join / create / leave sessions
│   ├── useGame.js           ←   Question, editor, timer, run/submit
│   └── useScoreboard.js     ←   Leaderboard with optional polling
├── components/
│   └── NavBar.vue
├── pages/
│   ├── HomePage.vue         ←   Entry screen — Game PIN + nickname
│   ├── GamePage.vue         ←   Coding challenge (question + editor + results)
│   ├── ScoreboardPage.vue   ←   Live leaderboard
│   └── AdminPage.vue        ←   Educator analytics dashboard
├── lib/supabase.js          ← Supabase client (reads from .env)
├── router/index.js
├── assets/main.css
├── App.vue
└── main.js
```

## How to implement

The template separates **UI** (pages/components) from **logic** (composables) from **backend** (services). To build a working platform:

### 1. Questions — `services/questionService.js`

| Function             | Purpose                                  |
| -------------------- | ---------------------------------------- |
| `fetchQuestion(id)`  | Load a question from Supabase or an API  |
| `generateQuestion()` | Call an LLM endpoint to create questions  |

Both return a `Question` object (see `models/index.js` for the schema).

### 2. Code execution — `services/codeRunner.js`

| Function       | Purpose                                          |
| -------------- | ------------------------------------------------ |
| `runCode()`    | Execute code, return stdout                      |
| `submitCode()` | Run code against test cases, return TestResult[]  |

Options: Judge0 API, Piston, Supabase Edge Functions, or your own sandbox.

### 3. Sessions & scoring — `services/sessionService.js`

| Function               | Purpose                              |
| ---------------------- | ------------------------------------ |
| `createGameSession()`  | Create a new session, generate a PIN |
| `joinSession()`        | Add a player to a session by PIN     |
| `fetchLeaderboard()`   | Ranked player list for a session     |
| `recordScore()`        | Save a player's score after submit   |
| `fetchAdminStats()`    | Aggregate data for admin dashboard   |

### 4. Data models — `models/index.js`

Factory functions that define the shape of every entity:

- `createQuestion()` — title, difficulty, examples, starter code, test cases
- `createPlayer()` — nickname, score, submissions
- `createSession()` — PIN, status, players, questions
- `createTestResult()` — passed, expected vs actual, errors
- `createLeaderboardEntry()` — rank, score, solve time

Extend these as your schema evolves.

## Routes

| Path          | Page             | Description                     |
| ------------- | ---------------- | ------------------------------- |
| `/`           | HomePage         | Game PIN + nickname entry       |
| `/game`       | GamePage         | Coding challenge interface      |
| `/scoreboard` | ScoreboardPage   | Live leaderboard                |
| `/admin`      | AdminPage        | Educator analytics dashboard    |

## Scripts

| Command           | Description               |
| ----------------- | ------------------------- |
| `npm run dev`     | Start dev server          |
| `npm run build`   | Build for production      |
| `npm run preview` | Preview production build  |

## Environment Variables

| Variable                  | Description                        |
| ------------------------- | ---------------------------------- |
| `VITE_SUPABASE_URL`      | Your Supabase project URL          |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key |
