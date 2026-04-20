<template>
  <div class="flex flex-col h-full bg-kahoot-purple-deep border-l border-white/10 shadow-2xl">
    <div class="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
      <h2 class="text-lg font-black text-white">{{ panelTitle }}</h2>
      <button
        v-if="showClose"
        type="button"
        class="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white transition"
        aria-label="Close"
        @click="$emit('close')"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-4">
      <div v-if="loading" class="text-center text-white/40 py-12 text-sm">Loading…</div>

      <div v-else-if="error" class="card-kahoot p-4 text-center">
        <p class="text-kahoot-red text-sm font-semibold">{{ error }}</p>
      </div>

      <div v-else-if="!entries.length" class="text-center text-white/40 py-12 text-sm">
        <p>No players yet.</p>
        <p class="text-white/25 text-xs mt-2">Scores update after each submit.</p>
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="entry in entries"
          :key="entry.playerId"
          :class="[
            rowClass(entry.rank),
            entry.playerId === highlightPlayerId ? 'ring-2 ring-kahoot-yellow/60' : '',
          ]"
          class="card-kahoot flex items-center gap-3 px-4 py-3 transition-all"
        >
          <div
            :class="rankBadge(entry.rank)"
            class="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shrink-0"
          >
            {{ entry.rank }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-bold text-white text-sm truncate">{{ entry.nickname }}</p>
            <p class="text-[10px] text-white/40">{{ entry.questionsCompleted }} solved</p>
          </div>
          <div class="text-right shrink-0">
            <p class="text-lg font-black text-kahoot-yellow">{{ entry.score }}</p>
            <p class="text-[10px] text-white/30">pts</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useScoreboard } from '@/composables/useScoreboard'

const props = defineProps({
  pin: { type: String, required: true },
  highlightPlayerId: { type: String, default: '' },
  panelTitle: { type: String, default: 'Scoreboard' },
  showClose: { type: Boolean, default: true },
  /** Polling interval in ms. Set to 0 for a single fetch (e.g. final frozen scoreboard). */
  pollIntervalMs: { type: Number, default: 4000 },
})

defineEmits(['close'])

const { entries, loading, error, load, startPolling, stopPolling } = useScoreboard()

function rowClass(rank) {
  if (rank === 1) return 'ring-1 ring-kahoot-yellow/40'
  if (rank === 2) return 'ring-1 ring-white/15'
  if (rank === 3) return 'ring-1 ring-kahoot-orange/25'
  return ''
}

function rankBadge(rank) {
  if (rank === 1) return 'bg-kahoot-yellow text-kahoot-purple-deep'
  if (rank === 2) return 'bg-white/20 text-white'
  if (rank === 3) return 'bg-kahoot-orange/80 text-white'
  return 'bg-white/10 text-white/50'
}

onMounted(() => {
  if (!props.pin) return
  if (props.pollIntervalMs > 0) startPolling(props.pin, props.pollIntervalMs)
  else load(props.pin)
})

onUnmounted(() => {
  stopPolling()
})
</script>
