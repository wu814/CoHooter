# CoHooter

A **Kahoot!-style competitive coding platform** built with Vue 3, Tailwind CSS, and Supabase.

Players join a session with a Game PIN, solve timed coding challenges, and compete on a live scoreboard.

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Python](https://python.org/) 3.10+
- A [Supabase](https://supabase.com/) project 
- A [Judge0 RapidAPI](https://rapidapi.com/judge0-official/api/judge0-ce) key 

## Quick Start

### Step 1: Get API Keys (Before You Begin)

You'll need these API keys:

| Service | Purpose | Where to Get |
|---------|---------|--------------|
| **Judge0 RapidAPI** | Code execution | [rapidapi.com/judge0-official/api/judge0-ce](https://rapidapi.com/judge0-official/api/judge0-ce) |
| **Supabase** | Database & auth | [supabase.com](https://supabase.com/) |
| **Gemini API** | AI question generation | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |

### Step 2: Backend Setup

Open **Terminal 1** and run:

```bash
# 1. Create and activate Python virtual environment
python3 -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate

# 2. Install Python dependencies
pip install -r backend/requirements.txt

# 3. Create backend environment file
cp backend/.env.example backend/.env
```

Now edit `backend/.env` and add your Judge0 API key:

```env
JUDGE0_PROVIDER=rapid
JUDGE0_RAPID_API_KEY=your-rapidapi-key-here   # ← Replace with your key
```

Start the backend server:

```bash
# 4. Run the backend (keep this terminal open)
python -m backend.app
```

You should see: `Running on http://127.0.0.1:5000`

### Step 3: Frontend Setup

Open **Terminal 2** (keep backend running in Terminal 1):

```bash
# 1. Install Node.js dependencies
npm install

# 2. Create frontend environment file
cp .env.example .env
```

Now edit `.env` and add your API keys:

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_SUPABASE_URL=https://your-project.supabase.co    # ← Replace
VITE_SUPABASE_ANON_KEY=your-anon-key-here             # ← Replace
VITE_GEMINI_API_KEY=your-gemini-key-here              # ← Replace
```

Start the frontend:

```bash
# 3. Run the frontend dev server
npm run dev
```

You should see: `Local: http://localhost:5173/`

### Step 4: Verify Everything Works

Open your browser and go to **http://localhost:5173**

To test the backend directly, run in a new terminal:

```bash
# Test code execution
curl -X POST http://localhost:5000/api/submit \
  -H "Content-Type: application/json" \
  -d '{"user_code": "def solution(a, b): return a + b", "test_cases": [{"input": "solution(1, 2)", "expected": "3"}]}'
```

Expected response:
```json
{
  "all_passed": true,
  "passed": 1,
  "score_percent": 100.0,
  ...
}
```

### Troubleshooting

| Issue | Solution |
|-------|----------|
| `venv/bin/activate: No such file` | Run `python3 -m venv venv` first |
| `Module not found` errors | Make sure venv is activated: `source venv/bin/activate` |
| Backend connection refused | Ensure backend is running in Terminal 1 |
| Judge0 API errors | Check your RapidAPI key is correct in `backend/.env` |
| Supabase errors | Verify your Supabase URL and anon key in `.env` |

## Architecture

```
CoHooter/
├── src/
│   ├── models/index.js          ← Data schemas (Question, Player, Session, etc.)
│   ├── services/                ← Backend integration layer
│   │   ├── questionService.js   ←   Fetch / AI-generate questions
│   │   ├── codeRunner.js        ←   Execute & judge code submissions
│   │   └── sessionService.js    ←   Session CRUD, leaderboard, analytics
│   ├── composables/             ← Reactive state shared across components
│   │   ├── useSession.js        ←   Join / create / leave sessions
│   │   ├── useGame.js           ←   Question, editor, timer, run/submit
│   │   └── useScoreboard.js     ←   Leaderboard with optional polling
│   ├── components/
│   │   └── NavBar.vue
│   ├── pages/
│   │   ├── HomePage.vue         ←   Entry screen — Game PIN + nickname
│   │   ├── GamePage.vue         ←   Coding challenge (question + editor + results)
│   │   ├── ScoreboardPage.vue   ←   Live leaderboard
│   │   └── AdminPage.vue        ←   Educator analytics dashboard
│   ├── lib/supabase.js          ← Supabase client (reads from .env)
│   ├── router/index.js
│   ├── assets/main.css
│   ├── App.vue
│   └── main.js
├── backend/                     ← Python Flask code execution backend
│   ├── app.py                   ←   Flask + SocketIO entry point
│   ├── config.py                ←   Environment configuration
│   ├── requirements.txt         ←   Python dependencies
│   ├── .env.example             ←   Template for backend environment
│   ├── judge/                   ←   Code execution module
│   │   ├── models.py            ←   TestCase, GradingResult dataclasses
│   │   ├── client.py            ←   Judge0 SDK wrapper
│   │   └── runner.py            ←   Grading orchestration
│   ├── routes/
│   │   └── submission.py        ←   /api/submit, /api/run endpoints
│   └── tests/                   ←   Unit & integration tests
├── package.json
├── vite.config.js
├── .env.example                 ← Template for frontend environment
└── README.md
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

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `npm run dev`     | Start frontend dev server      |
| `npm run build`   | Build frontend for production  |
| `npm run preview` | Preview production build       |

## Environment Variables

### Frontend (.env)

| Variable                  | Description                        |
| ------------------------- | ---------------------------------- |
| `VITE_BACKEND_URL`       | Backend URL (default: http://localhost:5000) |
| `VITE_SUPABASE_URL`      | Your Supabase project URL          |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key |
| `VITE_GEMINI_API_KEY`    | Gemini API key for AI questions    |

### Backend (backend/.env)

| Variable              | Description                              |
| --------------------- | ---------------------------------------- |
| `JUDGE0_PROVIDER`     | API provider: `rapid` or `self-hosted`   |
| `JUDGE0_RAPID_API_KEY`| RapidAPI key (for `rapid` provider)      |
| `JUDGE0_BASE_URL`     | Self-hosted URL (for `self-hosted`)      |
| `JUDGE0_CPU_LIMIT`    | CPU time limit in seconds (default: 5)   |
| `JUDGE0_MEMORY_LIMIT` | Memory limit in KB (default: 128000)     |
| `FLASK_SECRET_KEY`    | Flask session secret key                 |

---

## Judge0 API Key

Get your RapidAPI key at: https://rapidapi.com/judge0-official/api/judge0-ce

Self-hosted Judge0 is also supported for advanced users.
