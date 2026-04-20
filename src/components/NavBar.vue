<template>
  <header class="bg-kahoot-purple-dark/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
    <nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <RouterLink to="/" class="flex items-center gap-1 group">
          <span class="text-xl font-black text-white group-hover:text-white/90 transition">Co</span>
          <span class="text-xl font-black text-kahoot-yellow group-hover:text-kahoot-yellow/90 transition">Hooter</span>
        </RouterLink>
        <div class="flex items-center gap-2">
          <RouterLink
            v-for="link in navRouterLinks"
            :key="link.to"
            :to="link.to"
            class="rounded-lg px-3 py-2 text-sm font-semibold text-white/60 hover:bg-white/10 hover:text-white transition"
          >
            {{ link.label }}
          </RouterLink>
          <button
            type="button"
            class="rounded-lg px-3 py-2 text-sm font-semibold transition"
            :class="resolvedScoreboardPin
              ? 'text-white/60 hover:bg-white/10 hover:text-white'
              : 'text-white/25 cursor-not-allowed'"
            :disabled="!resolvedScoreboardPin"
            :title="scoreboardTitle"
            @click="openNavScoreboard"
          >
            Scoreboard
          </button>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSession } from '@/composables/useSession'
import { useScoreboardOverlay } from '@/composables/useScoreboardOverlay'

const route = useRoute()
const { session, player } = useSession()
const { open } = useScoreboardOverlay()

const navRouterLinks = computed(() => {
  const links = [{ to: '/', label: 'Home' }]
  if (!player.value) {
    links.push({ to: '/admin', label: 'Admin' })
  }
  return links
})

const resolvedScoreboardPin = computed(() =>
  String(session.value?.pin || route.query.pin || '').trim()
)

const scoreboardTitle = computed(() =>
  resolvedScoreboardPin.value
    ? 'Open session scoreboard'
    : 'Join a game (or open Host) so this session has a PIN'
)

function openNavScoreboard() {
  const p = resolvedScoreboardPin.value
  if (!p) return
  open(p)
}
</script>
