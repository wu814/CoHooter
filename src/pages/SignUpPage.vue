<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
    <div class="card-kahoot w-full max-w-sm p-8">
      <h1 class="text-2xl font-black text-white mb-1">Create Account</h1>
      <p class="text-white/40 text-sm mb-6">Sign up to host and manage sessions</p>

      <form v-if="!confirmed" @submit.prevent="handleSubmit" class="flex flex-col gap-4">
        <div>
          <label class="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-1">Email</label>
          <input
            v-model="email"
            type="text"
            autocomplete="email"
            class="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-kahoot-yellow"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            required
            autocomplete="new-password"
            minlength="6"
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
          {{ submitting ? 'Creating account…' : 'Sign Up' }}
        </button>

        <p class="text-center text-sm text-white/40">
          Already have an account?
          <RouterLink to="/login" class="text-kahoot-yellow hover:underline">Sign in</RouterLink>
        </p>
      </form>

      <div v-else class="text-center">
        <p class="text-kahoot-green font-semibold mb-2">Check your email</p>
        <p class="text-white/50 text-sm">We sent a confirmation link to <span class="text-white">{{ email }}</span>. Click it to activate your account.</p>
        <RouterLink to="/login" class="inline-block mt-6 text-sm text-kahoot-yellow hover:underline">Back to sign in</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { signUp } = useAuth()

const email = ref('')
const password = ref('')
const submitting = ref(false)
const errorMsg = ref('')
const confirmed = ref(false)

async function handleSubmit() {
  submitting.value = true
  errorMsg.value = ''
  try {
    await signUp(email.value, password.value)
    confirmed.value = true
  } catch (e) {
    const msg = e.message ?? ''
    if (msg.toLowerCase().includes('invalid email') || msg.toLowerCase().includes('unable to validate email'))
      errorMsg.value = 'Please enter a valid email address.'
    else if (msg.toLowerCase().includes('password') && msg.toLowerCase().includes('6'))
      errorMsg.value = 'Password must be at least 6 characters.'
    else if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already been registered'))
      errorMsg.value = 'An account with this email already exists.'
    else
      errorMsg.value = msg || 'Sign up failed. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>
