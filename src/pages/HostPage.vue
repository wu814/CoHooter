<template>
  <div class="min-h-[calc(100vh-4rem)] p-6">
    <div class="max-w-4xl mx-auto">

      <!-- Header -->
      <div class="mb-8">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 class="text-3xl font-bold text-white">Host Session</h1>
            <p class="text-white/50 mt-1">
              PIN: <span class="text-kahoot-yellow font-mono text-2xl font-black">{{ pin }}</span>
              <span class="text-white/30 ml-2">— share this with your students</span>
            </p>
          </div>
          <div class="flex flex-wrap gap-3 shrink-0">
            <button
              type="button"
              class="btn-kahoot bg-kahoot-red text-sm"
              :disabled="!pin || sessionEnded"
              @click="handleEndSession"
            >
              End session
            </button>
            <button
              type="button"
              class="btn-kahoot bg-kahoot-blue text-sm"
              :disabled="!pin"
              @click="openScoreboard"
            >
              Scoreboard
            </button>
            <RouterLink to="/admin" class="btn-kahoot bg-white/10 text-sm">
              Back
            </RouterLink>
          </div>
        </div>
        <p v-if="sessionEnded" class="mt-3 text-sm font-semibold text-kahoot-green">
          This session has ended. Students see the final scoreboard on their game screen.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- Left: Players -->
        <div class="card-kahoot p-6">
          <h2 class="text-sm font-bold text-white/40 uppercase tracking-wider mb-4">
            Players ({{ players.length }})
          </h2>
          <div v-if="!players.length" class="text-white/30 text-sm italic">
            Waiting for students to join...
          </div>
          <ul class="space-y-2">
            <li
              v-for="p in players"
              :key="p.id"
              class="flex items-center justify-between bg-white/5 rounded-lg px-4 py-2"
            >
              <span class="text-white font-semibold text-sm">{{ p.nickname }}</span>
              <span class="text-kahoot-yellow text-xs font-bold">{{ p.score }} pts</span>
            </li>
          </ul>
        </div>

        <!-- Right: Question Control -->
        <div class="lg:col-span-2 space-y-6">

          <!-- Generate -->
          <div class="card-kahoot p-6">
            <h2 class="text-sm font-bold text-white/40 uppercase tracking-wider mb-4">
              Generate Question
            </h2>
            <div class="flex gap-3">
              <input
                v-model="topic"
                placeholder="e.g. Strings, Arrays, Math..."
                class="flex-1 bg-gray-950 text-white text-sm px-4 py-3 rounded-lg border border-white/10
                       outline-none focus:ring-2 focus:ring-kahoot-purple-light"
                :disabled="sessionEnded"
                @keyup.enter="handleGenerate"
              />
              <button
                @click="handleGenerate"
                :disabled="generating || sessionEnded"
                class="btn-kahoot bg-kahoot-purple text-sm"
              >
                {{ generating ? 'Generating...' : 'Generate' }}
              </button>
            </div>
          </div>

          <!-- Preview -->
          <div v-if="question" class="card-kahoot p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-sm font-bold text-white/40 uppercase tracking-wider">
                Question Preview
              </h2>
              <button
                @click="handlePush"
                :disabled="pushing || sessionEnded"
                class="btn-kahoot bg-kahoot-green text-sm"
              >
                {{ pushing ? 'Pushing...' : 'Push to All Students' }}
              </button>
            </div>

            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <span class="bg-kahoot-orange text-white text-xs font-bold px-2 py-0.5 rounded">
                  {{ question.difficulty }}
                </span>
                <span class="text-white/40 text-xs">{{ question.category }}</span>
              </div>

              <h3 class="text-xl font-bold text-white">{{ question.title }}</h3>
              <p class="text-sm text-white/80 leading-relaxed">{{ question.description }}</p>

              <div class="bg-gray-950 rounded-lg p-4 font-mono text-sm text-green-400">
                <pre class="whitespace-pre-wrap">{{ question.starterCode?.python }}</pre>
              </div>

              <div class="space-y-1">
                <p class="text-xs font-bold text-white/40 uppercase tracking-wider">Test Cases</p>
                <div
                  v-for="(tc, i) in question.testCases"
                  :key="i"
                  class="flex gap-4 text-xs font-mono bg-white/5 rounded px-3 py-2"
                >
                  <span class="text-kahoot-blue">{{ tc.input }}</span>
                  <span class="text-white/30">&rarr;</span>
                  <span class="text-kahoot-green">{{ tc.expected }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Pushed confirmation -->
          <div v-if="pushed" class="card-kahoot p-6 ring-2 ring-kahoot-green/50">
            <p class="text-kahoot-green font-bold text-center">
              Question pushed! All connected students should see it now.
            </p>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { generateQuestion } from '@/services/questionService'
import { pushQuestion, fetchSessionPlayers, endSession, fetchSessionByPin, subscribeToSession } from '@/services/sessionService'
import { useScoreboardOverlay } from '@/composables/useScoreboardOverlay'

const route = useRoute()
const pin = route.query.pin ?? ''
const { open: openScoreboardOverlay } = useScoreboardOverlay()

function openScoreboard() {
  if (pin) openScoreboardOverlay(pin)
}

const topic = ref('')
const question = ref(null)
const generating = ref(false)
const pushing = ref(false)
const pushed = ref(false)
const players = ref([])
const sessionEnded = ref(false)

let playerPoll = null
let sessionUnsub = null

async function loadSessionStatus() {
  const row = await fetchSessionByPin(pin)
  if (row?.status === 'completed') sessionEnded.value = true
}

async function handleEndSession() {
  if (!pin) return
  if (!confirm('End this session for everyone? Students will see the final scoreboard and the game will stop.')) return
  try {
    await endSession(pin)
    sessionEnded.value = true
  } catch (e) {
    alert(e.message)
  }
}

async function handleGenerate() {
  generating.value = true
  pushed.value = false
  try {
    question.value = await generateQuestion({ category: topic.value })
  } catch (e) {
    alert(`Generation failed: ${e.message}`)
  } finally {
    generating.value = false
  }
}

async function handlePush() {
  if (!question.value) return
  pushing.value = true
  try {
    await pushQuestion(pin, question.value)
    pushed.value = true
  } catch (e) {
    alert(`Push failed: ${e.message}`)
  } finally {
    pushing.value = false
  }
}

async function refreshPlayers() {
  players.value = await fetchSessionPlayers(pin)
}

onMounted(async () => {
  await loadSessionStatus()
  refreshPlayers()
  playerPoll = setInterval(refreshPlayers, 5000)
  if (pin) {
    sessionUnsub = subscribeToSession(pin, (row) => {
      if (row.status === 'completed') sessionEnded.value = true
    })
  }
})

onUnmounted(() => {
  if (playerPoll) clearInterval(playerPoll)
  if (sessionUnsub) sessionUnsub()
})
</script>
