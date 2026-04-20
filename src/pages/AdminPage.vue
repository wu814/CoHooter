<template>
  <div class="min-h-[calc(100vh-4rem)] p-6">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p class="text-white/50 mt-1">Educator analytics &amp; session management</p>
        </div>
        <button @click="handleNewSession" class="btn-kahoot bg-kahoot-green text-sm">
          + New Session
        </button>
      </div>

      <!-- Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div v-for="stat in statCards" :key="stat.label" class="card-kahoot p-5">
          <p class="text-xs font-semibold text-white/40 uppercase tracking-wide">{{ stat.label }}</p>
          <p class="text-3xl font-black mt-1" :class="stat.color">{{ stat.value }}</p>
        </div>
      </div>

      <!-- Empty state when no data -->
      <div v-if="!stats.sessions.length && !loading" class="card-kahoot p-12 text-center">
        <p class="text-white/40 text-lg">No sessions yet.</p>
        <p class="text-white/25 text-sm mt-1">
          Implement <code class="bg-white/10 px-1.5 py-0.5 rounded text-xs">fetchAdminStats()</code>
          in <code class="bg-white/10 px-1.5 py-0.5 rounded text-xs">services/sessionService.js</code>
          to populate this dashboard.
        </p>
      </div>

      <!-- Sessions Table -->
      <div v-else class="card-kahoot overflow-hidden">
        <div class="px-6 py-4 border-b border-white/10">
          <h2 class="text-lg font-bold text-white">Recent Sessions</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-white/10 text-white/40 text-xs uppercase tracking-wide">
                <th class="text-left px-6 py-3 font-semibold">Session</th>
                <th class="text-left px-6 py-3 font-semibold">PIN</th>
                <th class="text-left px-6 py-3 font-semibold">Players</th>
                <th class="text-left px-6 py-3 font-semibold">Avg Score</th>
                <th class="text-left px-6 py-3 font-semibold">Status</th>
                <th class="text-right px-6 py-3 font-semibold">Actions</th>
                <th class="text-right px-6 py-3 font-semibold">Created</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="s in stats.sessions"
                :key="s.id"
                class="border-b border-white/5 hover:bg-white/5 transition cursor-pointer"
                @click="router.push({ name: 'Host', query: { pin: s.pin } })"
              >
                <td class="px-6 py-4 font-semibold text-white">{{ s.name }}</td>
                <td class="px-6 py-4 font-mono text-kahoot-yellow">{{ s.pin }}</td>
                <td class="px-6 py-4 text-white/70">{{ s.players?.length ?? 0 }}</td>
                <td class="px-6 py-4 text-white/70">—</td>
                <td class="px-6 py-4">
                  <span :class="statusBadge(s.status)" class="text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {{ s.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <button
                    v-if="s.status !== 'completed'"
                    type="button"
                    class="btn-kahoot bg-kahoot-red/90 text-xs px-3 py-1"
                    @click.stop="handleEndSessionRow(s)"
                  >
                    End
                  </button>
                  <span v-else class="text-white/25 text-xs">—</span>
                </td>
                <td class="px-6 py-4 text-white/40 text-right">
                  {{ s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchAdminStats, createGameSession, endSession } from '@/services/sessionService'

const router = useRouter()

const loading = ref(false)
const stats = ref({ totalSessions: 0, totalPlayers: 0, avgCompletion: 0, activeSessions: 0, sessions: [] })

const statCards = computed(() => [
  { label: 'Total Sessions', value: stats.value.totalSessions, color: 'text-white' },
  { label: 'Total Players', value: stats.value.totalPlayers, color: 'text-kahoot-blue' },
  { label: 'Avg Completion', value: stats.value.avgCompletion + '%', color: 'text-kahoot-green' },
  { label: 'Active Now', value: stats.value.activeSessions, color: 'text-kahoot-yellow' },
])

const STATUS_COLORS = {
  active: 'bg-kahoot-green/20 text-kahoot-green',
  completed: 'bg-kahoot-blue/20 text-kahoot-blue',
  scheduled: 'bg-kahoot-yellow/20 text-kahoot-yellow',
  lobby: 'bg-kahoot-purple-light/20 text-kahoot-purple-light',
}

function statusBadge(status) {
  return STATUS_COLORS[status] || 'bg-white/10 text-white/50'
}

async function handleNewSession() {
  try {
    const session = await createGameSession({ hostId: 'admin' })
    router.push({ name: 'Host', query: { pin: session.pin } })
  } catch (e) {
    alert(`Failed to create session: ${e.message}`)
  }
}

async function handleEndSessionRow(s) {
  if (!s.pin || s.status === 'completed') return
  if (!confirm(`End session ${s.pin}? Students on the game screen will see the final scoreboard.`)) return
  try {
    await endSession(s.pin)
    stats.value = await fetchAdminStats()
  } catch (e) {
    alert(`Failed to end session: ${e.message}`)
  }
}

onMounted(async () => {
  loading.value = true
  stats.value = await fetchAdminStats()
  loading.value = false
})
</script>
