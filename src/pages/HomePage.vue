<template>
  <div class="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
    <div class="mb-10 text-center">
      <h1 class="text-5xl sm:text-7xl font-black tracking-tight mb-2">
        <span class="text-white">Co</span><span class="text-kahoot-yellow">Hooter</span>
      </h1>
      <p class="text-kahoot-purple-light text-lg font-semibold">
        Code. Compete. Conquer.
      </p>
    </div>

    <div class="card-kahoot w-full max-w-md p-8">
      <div class="space-y-5">
        <div>
          <label for="gamePin" class="block text-sm font-semibold text-white/70 mb-1.5">
            Game PIN
          </label>
          <input
            id="gamePin"
            v-model="gamePin"
            type="text"
            inputmode="numeric"
            maxlength="7"
            placeholder="Enter PIN"
            class="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3
                   text-center text-2xl font-bold tracking-[0.3em] text-white
                   placeholder:text-white/30 placeholder:tracking-normal placeholder:text-base
                   focus:outline-none focus:ring-2 focus:ring-kahoot-yellow focus:border-transparent
                   transition"
          />
        </div>

        <div>
          <label for="nickname" class="block text-sm font-semibold text-white/70 mb-1.5">
            Nickname
          </label>
          <input
            id="nickname"
            v-model="nickname"
            type="text"
            maxlength="20"
            placeholder="Your nickname"
            class="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3
                   text-center text-lg font-bold text-white
                   placeholder:text-white/30 placeholder:font-normal
                   focus:outline-none focus:ring-2 focus:ring-kahoot-yellow focus:border-transparent
                   transition"
            @keyup.enter="handleJoin"
          />
        </div>

        <p v-if="sessionError" class="text-kahoot-red text-sm text-center font-semibold">
          {{ sessionError }}
        </p>

        <button
          :disabled="!canJoin || sessionLoading"
          @click="handleJoin"
          class="btn-kahoot w-full bg-kahoot-green text-lg py-4 mt-2"
        >
          {{ sessionLoading ? 'Joining…' : 'Enter Game' }}
        </button>
      </div>
    </div>

    <RouterLink
      v-if="!player"
      to="/admin"
      class="mt-8 text-sm text-white/40 hover:text-white/70 underline underline-offset-4 transition"
    >
      Educator / Admin Dashboard
    </RouterLink>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSession } from '@/composables/useSession'

const router = useRouter()
const { join, player, loading: sessionLoading, error: sessionError } = useSession()

const gamePin = ref('')
const nickname = ref('')

const canJoin = computed(() =>
  gamePin.value.trim().length >= 4 && nickname.value.trim().length >= 1
)

async function handleJoin() {
  if (!canJoin.value) return
  await join(gamePin.value.trim(), nickname.value.trim())
  if (!sessionError.value) {
    router.push({
      name: 'Game',
      query: { pin: gamePin.value.trim(), nick: nickname.value.trim() },
    })
  }
}
</script>
