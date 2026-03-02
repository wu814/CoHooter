/**
 * Reactive session state shared across components.
 *
 * Holds the current session, local player, and lobby status.
 * Pages call join() / create() and read from the returned refs.
 */

import { ref, computed } from 'vue'
import { joinSession, createGameSession } from '@/services/sessionService'

const session = ref(null)
const player = ref(null)
const loading = ref(false)
const error = ref(null)

export function useSession() {
  const isInSession = computed(() => !!session.value)
  const sessionPin = computed(() => session.value?.pin ?? '')
  const playerName = computed(() => player.value?.nickname ?? '')

  async function join(pin, nickname) {
    loading.value = true
    error.value = null
    try {
      const result = await joinSession({ pin, nickname })
      session.value = result.session
      player.value = result.player
    } catch (e) {
      error.value = e.message ?? 'Failed to join session'
    } finally {
      loading.value = false
    }
  }

  async function create(name, hostId = 'host') {
    loading.value = true
    error.value = null
    try {
      session.value = await createGameSession({ name, hostId })
    } catch (e) {
      error.value = e.message ?? 'Failed to create session'
    } finally {
      loading.value = false
    }
  }

  function leave() {
    session.value = null
    player.value = null
  }

  return {
    session,
    player,
    loading,
    error,
    isInSession,
    sessionPin,
    playerName,
    join,
    create,
    leave,
  }
}
