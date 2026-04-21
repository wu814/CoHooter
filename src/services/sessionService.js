/**
 * Session service — manages game sessions, players, and scoring
 * via Supabase.
 */

import { supabase } from '@/lib/supabase'
import { createSession, createPlayer, createLeaderboardEntry } from '@/models'

/**
 * Create a new game session.
 * @param {{ hostId: string }} params
 * @returns {Promise<Session>}
 */
export async function createGameSession({ hostId }) {
  const pin = String(Math.floor(100000 + Math.random() * 900000))

  const { data, error } = await supabase
    .from('game_sessions')
    .insert({ pin, host_id: hostId })
    .select()
    .single()

  if (error) throw new Error(error.message)

  return createSession({
    id: data.id,
    pin: data.pin,
    hostId: data.host_id,
    status: data.status,
    createdAt: data.created_at,
  })
}

/**
 * Join an existing session by PIN.
 * @param {{ pin: string, nickname: string }} params
 * @returns {Promise<{ session: Session, player: Player }>}
 */
export async function joinSession({ pin, nickname }) {
  const { data: sessionData, error: sessionError } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('pin', pin)
    .single()

  if (sessionError) throw new Error('Session not found. Check the PIN and try again.')

  const { data: playerData, error: playerError } = await supabase
    .from('players')
    .insert({ session_id: sessionData.id, nickname })
    .select()
    .single()

  if (playerError) throw new Error(playerError.message)

  const session = createSession({
    id: sessionData.id,
    pin: sessionData.pin,
    hostId: sessionData.host_id,
    status: sessionData.status,
    createdAt: sessionData.created_at,
  })

  const player = createPlayer({
    id: playerData.id,
    nickname: playerData.nickname,
    score: playerData.score,
    questionsCompleted: playerData.questions_completed,
    joinedAt: playerData.joined_at,
  })

  return { session, player }
}

/**
 * Fetch the current leaderboard for a session (looked up by PIN).
 * @param {string} pin — the 6-digit game PIN
 * @returns {Promise<LeaderboardEntry[]>}
 */
export async function fetchLeaderboard(pin) {
  const { data: sessionData, error: sessionError } = await supabase
    .from('game_sessions')
    .select('id')
    .eq('pin', pin)
    .single()

  if (sessionError) return []

  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('session_id', sessionData.id)
    .order('score', { ascending: false })

  if (error) throw new Error(error.message)

  return data.map((p, i) => createLeaderboardEntry({
    rank: i + 1,
    playerId: p.id,
    nickname: p.nickname,
    score: p.score,
    questionsCompleted: p.questions_completed,
  }))
}

/** Max points per question when answered instantly (Kahoot-style time decay applies). */
export const MAX_POINTS_PER_QUESTION = 1000

/**
 * Points for a fully correct answer: linear in time remaining (slower = fewer points).
 * Remaining fraction is clamped to at least 10% so a last-second correct answer still earns something.
 */
export function computeTimeBasedPoints(secondsRemaining, timeLimitSeconds, maxPoints = MAX_POINTS_PER_QUESTION) {
  const limit = Math.max(1, timeLimitSeconds)
  const ratio = Math.min(1, Math.max(0.1, secondsRemaining / limit))
  return Math.round(maxPoints * ratio)
}

/**
 * Record a submission. Wrong answers are logged only (no leaderboard change).
 * Correct answers add `score` to the player and increment questions_completed.
 */
export async function recordScore({ sessionId, playerId, questionTitle, score, timeSeconds, code, passed }) {
  const { error: subError } = await supabase
    .from('submissions')
    .insert({
      session_id: sessionId,
      player_id: playerId,
      question_title: questionTitle,
      code,
      passed,
      score: passed ? score : 0,
      time_seconds: timeSeconds,
    })

  if (subError) throw new Error(subError.message)

  if (!passed) return

  const { data: current, error: fetchError } = await supabase
    .from('players')
    .select('score, questions_completed')
    .eq('id', playerId)
    .single()

  if (fetchError) throw new Error(fetchError.message)

  const { error: updateError } = await supabase
    .from('players')
    .update({
      score: current.score + score,
      questions_completed: current.questions_completed + 1,
    })
    .eq('id', playerId)

  if (updateError) throw new Error(updateError.message)
}

/**
 * Push a question to all players in a session (host action).
 * Writes the question JSON into game_sessions.current_question.
 */
export async function pushQuestion(pin, question) {
  const { error } = await supabase
    .from('game_sessions')
    .update({
      current_question: question,
      status: 'active',
      started_at: new Date().toISOString(),
    })
    .eq('pin', pin)

  if (error) throw new Error(error.message)
}

/**
 * Mark a session as finished (host / admin). Students see final scoreboard via Realtime.
 */
export async function endSession(pin) {
  const { error } = await supabase
    .from('game_sessions')
    .update({
      status: 'completed',
      ended_at: new Date().toISOString(),
    })
    .eq('pin', pin)

  if (error) throw new Error(error.message)
}

/**
 * Load session row by PIN (status, etc.).
 */
export async function fetchSessionByPin(pin) {
  const { data, error } = await supabase
    .from('game_sessions')
    .select('status, ended_at, current_question')
    .eq('pin', pin)
    .single()

  if (error) return null
  return data
}

/**
 * Fetch the list of players who have joined a session.
 */
export async function fetchSessionPlayers(pin) {
  const { data: sessionData, error: sessionError } = await supabase
    .from('game_sessions')
    .select('id')
    .eq('pin', pin)
    .single()

  if (sessionError) return []

  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('session_id', sessionData.id)
    .order('joined_at', { ascending: true })

  if (error) return []
  return data
}

/**
 * Subscribe to Realtime changes on a game session (by PIN).
 * Calls onChange(payload) whenever the row is updated.
 * Returns an unsubscribe function.
 */
export function subscribeToSession(pin, onChange) {
  const channel = supabase
    .channel(`session-${pin}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'game_sessions',
        filter: `pin=eq.${pin}`,
      },
      (payload) => onChange(payload.new)
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}

/**
 * Mean completion % across sessions owned by the current user.
 * Scoped to the provided session IDs so stats never bleed across accounts.
 */
async function computeAverageCompletionPercent(sessionIds) {
  if (!sessionIds.length) return 0

  const { data: playersRows, error: playersError } = await supabase
    .from('players')
    .select('session_id, questions_completed')
    .in('session_id', sessionIds)

  if (playersError || !playersRows?.length) return 0

  const { data: passedSubs, error: subError } = await supabase
    .from('submissions')
    .select('session_id, question_title')
    .eq('passed', true)
    .in('session_id', sessionIds)

  if (subError) return 0

  const distinctTitlesBySession = new Map()
  for (const row of passedSubs || []) {
    if (!row.session_id || !row.question_title) continue
    if (!distinctTitlesBySession.has(row.session_id))
      distinctTitlesBySession.set(row.session_id, new Set())
    distinctTitlesBySession.get(row.session_id).add(row.question_title)
  }

  const maxCompletedBySession = new Map()
  for (const p of playersRows) {
    const sid = p.session_id
    const qc = p.questions_completed ?? 0
    maxCompletedBySession.set(sid, Math.max(maxCompletedBySession.get(sid) || 0, qc))
  }

  let sumRates = 0
  for (const p of playersRows) {
    const sid = p.session_id
    const distinctCount = distinctTitlesBySession.get(sid)?.size ?? 0
    const maxInSession = maxCompletedBySession.get(sid) || 0
    const denom = Math.max(1, distinctCount, maxInSession)
    const qc = p.questions_completed ?? 0
    const rate = Math.min(100, Math.round((100 * qc) / denom))
    sumRates += rate
  }

  return Math.round(sumRates / playersRows.length)
}

/**
 * Fetch aggregate analytics for the admin dashboard, scoped to the signed-in user.
 */
export async function fetchAdminStats() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const sessionsRes = await supabase
    .from('game_sessions')
    .select('*, players(count)')
    .eq('host_id', user.id)
    .order('created_at', { ascending: false })

  const allSessions = sessionsRes.data || []
  const sessionIds = allSessions.map(s => s.id)

  const [playersCountRes, avgCompletion, submissionsRes] = await Promise.all([
    sessionIds.length
      ? supabase.from('players').select('*', { count: 'exact', head: true }).in('session_id', sessionIds)
      : Promise.resolve({ count: 0 }),
    computeAverageCompletionPercent(sessionIds),
    sessionIds.length
      ? supabase.from('submissions').select('session_id, passed, score').in('session_id', sessionIds)
      : Promise.resolve({ data: [] }),
  ])

  const totalPlayers = playersCountRes.count ?? 0
  const activeSessions = allSessions.filter(s => s.status === 'active' || s.status === 'lobby').length

  const subsBySession = {}
  for (const sub of submissionsRes.data || []) {
    if (!subsBySession[sub.session_id]) subsBySession[sub.session_id] = { passed: 0, total: 0, totalScore: 0 }
    subsBySession[sub.session_id].total++
    subsBySession[sub.session_id].totalScore += sub.score ?? 0
    if (sub.passed) subsBySession[sub.session_id].passed++
  }

  return {
    totalSessions: allSessions.length,
    totalPlayers,
    avgCompletion,
    activeSessions,
    sessions: allSessions.map(s => ({
      ...createSession({
        id: s.id,
        pin: s.pin,
        hostId: s.host_id,
        status: s.status,
        createdAt: s.created_at,
        startedAt: s.started_at,
        endedAt: s.ended_at,
      }),
      playerCount: s.players?.[0]?.count ?? 0,
      accuracy: subsBySession[s.id]?.total
        ? Math.round((subsBySession[s.id].passed / subsBySession[s.id].total) * 100)
        : null,
      avgScore: subsBySession[s.id]?.total
        ? Math.round(subsBySession[s.id].totalScore / subsBySession[s.id].total)
        : null,
    })),
  }
}
