<template>
  <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
    <div class="text-center">
      <h1 class="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
        Welcome to <span class="text-primary-600">CoHooter</span>
      </h1>
      <p class="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
        Your Vue&nbsp;3 + Tailwind&nbsp;CSS + Supabase starter is ready to go.
        Edit <code class="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono">src/pages/HomePage.vue</code> to get started.
      </p>

      <div class="mt-10 flex justify-center gap-4">
        <a
          href="https://vuejs.org/guide/introduction.html"
          target="_blank"
          class="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition"
        >
          Vue Docs
        </a>
        <a
          href="https://supabase.com/docs"
          target="_blank"
          class="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition"
        >
          Supabase Docs
        </a>
      </div>
    </div>

    <!-- Example: Supabase connection test -->
    <div class="mt-16 mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 class="text-lg font-semibold text-gray-900">Supabase Connection</h2>
      <p class="mt-1 text-sm text-gray-500">
        Click below to verify your Supabase connection.
      </p>
      <button
        @click="testConnection"
        :disabled="loading"
        class="mt-4 w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 transition"
      >
        {{ loading ? 'Testing…' : 'Test Connection' }}
      </button>
      <p v-if="status" :class="statusClass" class="mt-3 text-sm font-medium">
        {{ status }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

const loading = ref(false)
const status = ref('')
const statusClass = ref('')

async function testConnection() {
  loading.value = true
  status.value = ''
  try {
    const { error } = await supabase.from('_test_ping').select('*').limit(1)
    if (error && error.code === '42P01') {
      // Table doesn't exist — that's fine, connection itself worked
      status.value = 'Connected to Supabase successfully!'
      statusClass.value = 'text-green-600'
    } else if (error) {
      status.value = `Error: ${error.message}`
      statusClass.value = 'text-red-600'
    } else {
      status.value = 'Connected to Supabase successfully!'
      statusClass.value = 'text-green-600'
    }
  } catch (err) {
    status.value = `Connection failed: ${err.message}`
    statusClass.value = 'text-red-600'
  } finally {
    loading.value = false
  }
}
</script>
