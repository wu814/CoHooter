<template>
  <div class="min-h-[calc(100vh-4rem)] p-6">
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-black text-white">Scoreboard</h1>
        <p v-if="$route.query.pin" class="text-white/40 mt-1">
          Game PIN: <span class="text-kahoot-yellow font-mono">{{ $route.query.pin }}</span>
        </p>
      </div>

      <!-- Loading / empty states -->
      <div v-if="loading" class="text-center text-white/40 py-16">Loading leaderboard…</div>

      <div v-else-if="error" class="card-kahoot p-8 text-center">
        <p class="text-kahoot-red font-semibold">{{ error }}</p>
      </div>

      <div v-else-if="!entries.length" class="card-kahoot p-12 text-center">
        <p class="text-white/40 text-lg">No scores yet.</p>
        <p class="text-white/25 text-sm mt-1">
          Implement <code class="bg-white/10 px-1.5 py-0.5 rounded text-xs">fetchLeaderboard()</code>
          in <code class="bg-white/10 px-1.5 py-0.5 rounded text-xs">services/sessionService.js</code>
          to populate this board.
        </p>
        <RouterLink
          to="/"
          class="btn-kahoot bg-kahoot-purple-light text-sm mt-6 inline-flex"
        >
          Back to Home
        </RouterLink>
      </div>

      <!-- Leaderboard list -->
      <div v-else class="space-y-3">
        <div
          v-for="entry in entries"
          :key="entry.playerId"
          :class="podiumClass(entry.rank)"
          class="card-kahoot flex items-center gap-4 px-6 py-4 transition-all"
        >
          <!-- Rank badge -->
          <div
            :class="rankBadge(entry.rank)"
            class="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shrink-0"
          >
            {{ entry.rank }}
          </div>

          <!-- Player info -->
          <div class="flex-1 min-w-0">
            <p class="font-bold text-white truncate">{{ entry.nickname }}</p>
            <p class="text-xs text-white/40">
              {{ entry.questionsCompleted }} solved
              <span v-if="entry.avgTimeSeconds"> · avg {{ entry.avgTimeSeconds }}s</span>
            </p>
          </div>

          <!-- Score -->
          <div class="text-right">
            <p class="text-2xl font-black text-kahoot-yellow">{{ entry.score }}</p>
            <p class="text-xs text-white/30">pts</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useScoreboard } from '@/composables/useScoreboard'

const route = useRoute()
const { entries, loading, error, load, startPolling } = useScoreboard()

function podiumClass(rank) {
  if (rank === 1) return 'ring-2 ring-kahoot-yellow/50'
  if (rank === 2) return 'ring-1 ring-white/20'
  if (rank === 3) return 'ring-1 ring-kahoot-orange/30'
  return ''
}

function rankBadge(rank) {
  if (rank === 1) return 'bg-kahoot-yellow text-kahoot-purple-deep'
  if (rank === 2) return 'bg-white/20 text-white'
  if (rank === 3) return 'bg-kahoot-orange/80 text-white'
  return 'bg-white/10 text-white/50'
}

onMounted(() => {
  const sessionId = route.query.pin ?? ''
  if (sessionId) {
    startPolling(sessionId)
  } else {
    load('')
  }
})
</script>
