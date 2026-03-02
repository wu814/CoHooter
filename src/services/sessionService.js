/**
 * Session service — manages game sessions, players, and scoring.
 *
 * IMPLEMENT: Wire these to Supabase (or your preferred backend).
 *   Each function documents what it should do and return.
 */

import { createSession, createPlayer, createLeaderboardEntry } from '@/models'

/**
 * Create a new game session.
 * @param {{ name: string, hostId: string }} params
 * @returns {Promise<Session>}
 */
export async function createGameSession({ name, hostId }) {
  // IMPLEMENT: Insert into Supabase and return the created row.
  const pin = String(Math.floor(100000 + Math.random() * 900000))
  return createSession({ id: crypto.randomUUID(), pin, name, hostId, createdAt: new Date() })
}

/**
 * Join an existing session by PIN.
 * @param {{ pin: string, nickname: string }} params
 * @returns {Promise<{ session: Session, player: Player }>}
 */
export async function joinSession({ pin, nickname }) {
  // IMPLEMENT: Look up session by PIN, add player row, return both.
  const player = createPlayer({
    id: crypto.randomUUID(),
    nickname,
    joinedAt: new Date(),
  })
  const session = createSession({ pin, status: 'lobby' })
  return { session, player }
}

/**
 * Fetch the current leaderboard for a session.
 * @param {string} sessionId
 * @returns {Promise<LeaderboardEntry[]>}
 */
export async function fetchLeaderboard(sessionId) {
  // IMPLEMENT: Query players for this session, sorted by score desc.
  //   e.g. const { data } = await supabase
  //     .from('players')
  //     .select('*')
  //     .eq('session_id', sessionId)
  //     .order('score', { ascending: false })
  //   return data.map((p, i) => createLeaderboardEntry({ rank: i + 1, ...p }))

  return []
}

/**
 * Record a player's score for a question.
 * @param {{ sessionId: string, playerId: string, questionId: string, score: number, timeSeconds: number }} params
 * @returns {Promise<void>}
 */
export async function recordScore({ sessionId, playerId, questionId, score, timeSeconds }) {
  // IMPLEMENT: Upsert into a scores / submissions table.
}

/**
 * Fetch aggregate analytics for the admin dashboard.
 * @returns {Promise<{ totalSessions: number, totalPlayers: number, avgCompletion: number, activeSessions: number, sessions: Session[] }>}
 */
export async function fetchAdminStats() {
  // IMPLEMENT: Aggregate queries against your sessions / players tables.
  return {
    totalSessions: 0,
    totalPlayers: 0,
    avgCompletion: 0,
    activeSessions: 0,
    sessions: [],
  }
}
