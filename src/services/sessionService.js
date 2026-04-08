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

/**
 * Record a player's score for a question.
 * Inserts a submission row and increments the player's running totals.
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
      score,
      time_seconds: timeSeconds,
    })

  if (subError) throw new Error(subError.message)

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
 * Fetch aggregate analytics for the admin dashboard.
 */
export async function fetchAdminStats() {
  const { data: sessions } = await supabase
    .from('game_sessions')
    .select('*')
    .order('created_at', { ascending: false })

  const { count: totalPlayers } = await supabase
    .from('players')
    .select('*', { count: 'exact', head: true })

  const allSessions = sessions || []
  const activeSessions = allSessions.filter(s => s.status === 'active').length

  return {
    totalSessions: allSessions.length,
    totalPlayers: totalPlayers || 0,
    avgCompletion: 0,
    activeSessions,
    sessions: allSessions.map(s => createSession({
      id: s.id,
      pin: s.pin,
      hostId: s.host_id,
      status: s.status,
      createdAt: s.created_at,
      startedAt: s.started_at,
      endedAt: s.ended_at,
    })),
  }
}
