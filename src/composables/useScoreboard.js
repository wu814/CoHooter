/**
 * Reactive scoreboard / leaderboard state.
 *
 * Fetches and exposes a ranked list of players for a session.
 * Supports polling for live updates during an active game.
 */

import { ref, onUnmounted } from 'vue'
import { fetchLeaderboard } from '@/services/sessionService'

export function useScoreboard() {
  const entries = ref([])
  const loading = ref(false)
  const error = ref(null)
  let pollInterval = null

  async function load(sessionId) {
    loading.value = true
    error.value = null
    try {
      entries.value = await fetchLeaderboard(sessionId)
    } catch (e) {
      error.value = e.message ?? 'Failed to load leaderboard'
    } finally {
      loading.value = false
    }
  }

  /**
   * Start polling the leaderboard on an interval.
   * Useful during an active game to show live rank changes.
   */
  function startPolling(sessionId, intervalMs = 5000) {
    stopPolling()
    load(sessionId)
    pollInterval = setInterval(() => load(sessionId), intervalMs)
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval)
      pollInterval = null
    }
  }

  onUnmounted(stopPolling)

  return { entries, loading, error, load, startPolling, stopPolling }
}
