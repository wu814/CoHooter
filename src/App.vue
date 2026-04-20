<template>
  <div class="min-h-screen flex flex-col bg-kahoot-purple-deep">
    <NavBar />
    <main class="flex-1 flex flex-col">
      <RouterView />
    </main>

    <Teleport to="body">
      <div
        v-if="overlayVisible && overlayPin"
        class="fixed inset-0 z-[100] flex justify-end"
        role="dialog"
        aria-modal="true"
        aria-label="Scoreboard"
      >
        <div
          class="absolute inset-0 bg-black/60 cursor-pointer"
          role="presentation"
          @click="closeOverlay"
        />
        <div class="relative z-10 w-full max-w-md h-full max-h-[100dvh]" @click.stop>
          <LeaderboardPanel
            :pin="overlayPin"
            :highlight-player-id="player?.id ?? ''"
            @close="closeOverlay"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'
import LeaderboardPanel from '@/components/LeaderboardPanel.vue'
import { useScoreboardOverlay } from '@/composables/useScoreboardOverlay'
import { useSession } from '@/composables/useSession'

const { visible: overlayVisible, pin: overlayPin, close: closeOverlay } = useScoreboardOverlay()
const { player } = useSession()
</script>
