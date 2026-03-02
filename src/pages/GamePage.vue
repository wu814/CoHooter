<template>
  <div class="flex flex-col h-[calc(100vh-4rem)]">
    <!-- Top bar -->
    <div class="flex items-center justify-between px-4 py-3 bg-kahoot-purple-dark border-b border-white/10">
      <div class="flex items-center gap-3">
        <span class="bg-kahoot-blue text-white text-xs font-bold px-2.5 py-1 rounded-full">
          Q{{ session.value?.currentQuestionIndex + 1 || 1 }}
        </span>
        <span class="text-sm text-white/60">
          Playing as <strong class="text-kahoot-yellow">{{ playerName }}</strong>
        </span>
      </div>
      <div class="flex items-center gap-3">
        <RouterLink
          :to="{ name: 'Scoreboard', query: { pin: $route.query.pin } }"
          class="text-xs font-semibold text-white/40 hover:text-white transition"
        >
          Scoreboard
        </RouterLink>
        <div class="flex items-center gap-2 text-sm">
          <div
            :class="timerSeconds <= 10 ? 'bg-kahoot-red animate-pulse' : 'bg-kahoot-purple-light'"
            class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white transition-colors"
          >
            {{ timerSeconds }}
          </div>
          <span class="text-white/50">sec</span>
        </div>
      </div>
    </div>

    <!-- Main layout -->
    <div class="flex-1 flex flex-col lg:flex-row overflow-hidden">

      <!-- LEFT: Question panel -->
      <div class="lg:w-2/5 border-b lg:border-b-0 lg:border-r border-white/10 overflow-y-auto">
        <div v-if="question" class="p-6">
          <div class="flex items-center gap-2 mb-4">
            <span class="bg-kahoot-orange text-white text-xs font-bold px-2 py-0.5 rounded">
              {{ question.difficulty }}
            </span>
            <span class="text-white/40 text-xs">{{ question.category }}</span>
          </div>

          <h2 class="text-xl font-bold text-white mb-4">{{ question.title }}</h2>

          <div class="text-sm text-white/80 leading-relaxed space-y-3">
            <p>{{ question.description }}</p>

            <div v-if="question.examples?.length" class="space-y-3 mt-4">
              <div
                v-for="(ex, i) in question.examples"
                :key="i"
                class="rounded-lg bg-white/5 border border-white/10 p-4"
              >
                <p class="text-xs font-semibold text-white/50 mb-1">Example {{ i + 1 }}</p>
                <div class="font-mono text-xs space-y-1">
                  <p><span class="text-kahoot-blue">Input:</span> {{ ex.input }}</p>
                  <p><span class="text-kahoot-green">Output:</span> {{ ex.output }}</p>
                </div>
              </div>
            </div>

            <div v-if="question.constraints?.length" class="mt-4">
              <p class="text-xs font-semibold text-white/50 mb-2">Constraints</p>
              <ul class="list-disc list-inside text-xs text-white/60 space-y-1">
                <li v-for="(c, i) in question.constraints" :key="i">{{ c }}</li>
              </ul>
            </div>
          </div>
        </div>

        <div v-else class="p-6 text-center text-white/30">
          <p>Loading question…</p>
        </div>
      </div>

      <!-- RIGHT: Editor + results -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Toolbar -->
        <div class="flex items-center justify-between px-4 py-2 bg-gray-900/80 border-b border-white/10">
          <select
            v-model="language"
            class="bg-gray-800 text-white text-sm rounded-md px-3 py-1.5 border border-white/10
                   focus:outline-none focus:ring-1 focus:ring-kahoot-purple-light"
          >
            <option v-for="lang in languages" :key="lang.id" :value="lang.id">
              {{ lang.label }}
            </option>
          </select>
          <div class="flex gap-2">
            <button @click="run" :disabled="running" class="btn-kahoot bg-kahoot-green text-xs px-4 py-1.5">
              <svg class="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.891a1.5 1.5 0 000-2.538L6.3 2.841z" />
              </svg>
              {{ running ? 'Running…' : 'Run' }}
            </button>
            <button @click="submit" :disabled="submitting" class="btn-kahoot bg-kahoot-blue text-xs px-4 py-1.5">
              {{ submitting ? 'Submitting…' : 'Submit' }}
            </button>
          </div>
        </div>

        <!-- Code editor -->
        <div class="flex-1 overflow-hidden relative">
          <div class="absolute inset-0 flex">
            <div class="w-12 bg-gray-900 border-r border-white/5 pt-4 text-right pr-2 overflow-hidden select-none">
              <div v-for="n in lineCount" :key="n" class="text-xs leading-5 text-white/20 font-mono">
                {{ n }}
              </div>
            </div>
            <textarea
              v-model="code"
              spellcheck="false"
              class="flex-1 bg-gray-900 text-green-400 font-mono text-sm p-4 pl-3
                     leading-5 resize-none outline-none overflow-auto"
              @keydown.tab.prevent="insertTab"
            ></textarea>
          </div>
        </div>

        <!-- Results panel -->
        <div class="h-48 border-t border-white/10 bg-gray-950 flex flex-col">
          <div class="flex">
            <button
              v-for="tab in resultTabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'px-4 py-2 text-xs font-semibold border-b-2 transition',
                activeTab === tab.id
                  ? 'text-white border-kahoot-purple-light'
                  : 'text-white/40 border-transparent hover:text-white/60'
              ]"
            >
              {{ tab.label }}
            </button>
          </div>
          <div class="flex-1 overflow-auto p-4 font-mono text-xs">
            <!-- Output tab -->
            <div v-if="activeTab === 'output'" class="text-white/70">
              <p v-if="!output" class="text-white/30 italic">Run your code to see output here…</p>
              <pre v-else class="whitespace-pre-wrap">{{ output }}</pre>
            </div>
            <!-- Test results tab -->
            <div v-else-if="activeTab === 'results'" class="text-white/70">
              <div v-if="!submitted" class="text-white/30 italic">
                Submit your code to see test results…
              </div>
              <div v-else class="space-y-2">
                <div v-for="(r, i) in testResults" :key="i" class="flex items-center gap-2">
                  <span :class="r.passed ? 'text-kahoot-green' : 'text-kahoot-red'" class="font-bold">
                    {{ r.passed ? '✓' : '✗' }}
                  </span>
                  <span>Test {{ i + 1 }}: {{ r.passed ? 'Passed' : 'Failed' }}</span>
                  <span v-if="!r.passed && r.error" class="text-white/40 ml-2">{{ r.error }}</span>
                </div>
                <div
                  class="mt-3 pt-3 border-t border-white/10 font-semibold"
                  :class="allPassed ? 'text-kahoot-green' : 'text-kahoot-yellow'"
                >
                  {{ passedCount }}/{{ totalTests }} tests passed
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSession } from '@/composables/useSession'
import { useGame } from '@/composables/useGame'

const route = useRoute()
const { session, playerName } = useSession()

const {
  question, language, code, output,
  testResults, submitted, running, submitting,
  timerSeconds, passedCount, totalTests, allPassed, lineCount,
  languages,
  loadQuestion, run, submit,
} = useGame()

const activeTab = ref('output')
const resultTabs = [
  { id: 'output', label: 'Output' },
  { id: 'results', label: 'Test Results' },
]

function insertTab(e) {
  const start = e.target.selectionStart
  const end = e.target.selectionEnd
  code.value = code.value.substring(0, start) + '  ' + code.value.substring(end)
  nextTick(() => {
    e.target.selectionStart = e.target.selectionEnd = start + 2
  })
}

onMounted(() => {
  loadQuestion(route.query.qid ?? 'default')
})
</script>
