/**
 * Data models / schemas for CoHooter.
 *
 * These factory functions define the shape of every core entity.
 * Replace default values or extend fields as your backend evolves.
 */

/** A single coding question presented to players. */
export function createQuestion(overrides = {}) {
  return {
    id: '',
    title: '',
    difficulty: 'Easy',        // 'Easy' | 'Medium' | 'Hard'
    category: '',              // e.g. 'Arrays & Hashing'
    description: '',
    examples: [],              // [{ input: string, output: string }]
    constraints: [],           // string[]
    starterCode: {             // keyed by language id
      python: '',
      javascript: '',
      java: '',
      cpp: '',
    },
    testCases: [],             // [{ input: string, expected: string, hidden: boolean }]
    timeLimitSeconds: 300,
    ...overrides,
  }
}

/** A player participating in a session. */
export function createPlayer(overrides = {}) {
  return {
    id: '',
    nickname: '',
    score: 0,
    questionsCompleted: 0,
    questionsTotal: 0,
    submissions: [],           // [{ questionId, code, language, passed, timestamp }]
    joinedAt: null,
    ...overrides,
  }
}

/** A game session that groups players and questions. */
export function createSession(overrides = {}) {
  return {
    id: '',
    pin: '',
    name: '',
    status: 'lobby',          // 'lobby' | 'active' | 'completed' | 'scheduled'
    hostId: '',
    questions: [],             // Question[]
    players: [],               // Player[]
    currentQuestionIndex: 0,
    createdAt: null,
    startedAt: null,
    endedAt: null,
    ...overrides,
  }
}

/** Result of running / submitting code against test cases. */
export function createTestResult(overrides = {}) {
  return {
    passed: false,
    input: '',
    expected: '',
    actual: '',
    error: null,               // string | null — runtime error message
    runtimeMs: 0,
    ...overrides,
  }
}

/** An entry on the scoreboard / leaderboard. */
export function createLeaderboardEntry(overrides = {}) {
  return {
    rank: 0,
    playerId: '',
    nickname: '',
    score: 0,
    questionsCompleted: 0,
    avgTimeSeconds: 0,
    ...overrides,
  }
}

/** Supported programming languages for the code editor. */
export const LANGUAGES = [
  { id: 'python', label: 'Python' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'java', label: 'Java' },
  { id: 'cpp', label: 'C++' },
]
