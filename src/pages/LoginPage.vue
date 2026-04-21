<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
    <div class="card-kahoot w-full max-w-sm p-8">
      <h1 class="text-2xl font-black text-white mb-1">Admin Login</h1>
      <p class="text-white/40 text-sm mb-6">Sign in to manage sessions</p>

      <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
        <div>
          <label class="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            required
            autocomplete="email"
            class="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-kahoot-yellow"
            placeholder="admin@example.com"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            class="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-kahoot-yellow"
            placeholder="••••••••"
          />
        </div>

        <p v-if="errorMsg" class="text-kahoot-red text-sm">{{ errorMsg }}</p>

        <button
          type="submit"
          :disabled="submitting"
          class="btn-kahoot bg-kahoot-yellow text-kahoot-purple-dark mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ submitting ? 'Signing in…' : 'Sign In' }}
        </button>

        <p class="text-center text-sm text-white/40">
          New to CoHooter?
          <RouterLink to="/signup" class="text-kahoot-yellow hover:underline">Create an account</RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { signIn } = useAuth()

const email = ref('')
const password = ref('')
const submitting = ref(false)
const errorMsg = ref('')

async function handleSubmit() {
  submitting.value = true
  errorMsg.value = ''
  try {
    await signIn(email.value, password.value)
    router.push({ name: 'Admin' })
  } catch (e) {
    errorMsg.value = e.message ?? 'Sign in failed'
  } finally {
    submitting.value = false
  }
}
</script>
