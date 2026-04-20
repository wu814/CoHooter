<template>
  <div class="flex flex-col h-[calc(100vh-4rem)]">
    <div class="flex items-center justify-between px-4 py-3 bg-kahoot-purple-dark border-b border-white/10">
      <div class="flex items-center gap-3">
        <span class="bg-kahoot-blue text-white text-xs font-bold px-2.5 py-1 rounded-full">
          Q{{ session?.currentQuestionIndex + 1 || 1 }}
        </span>
        <span class="text-sm text-white/60">
          Playing as <strong class="text-kahoot-yellow">{{ playerName }}</strong>
        </span>
      </div>
      <div class="flex items-center gap-2 sm:gap-3">
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

    <div class="flex-1 flex flex-col lg:flex-row overflow-hidden">

      <div class="lg:w-2/5 border-b lg:border-b-0 lg:border-r border-white/10 overflow-y-auto">

        <!-- Waiting for host -->
        <div v-if="waitingForHost && !question" class="p-6 flex flex-col items-center justify-center h-full">
          <div class="w-12 h-12 rounded-full bg-kahoot-purple-light/30 flex items-center justify-center mb-4 animate-pulse">
            <svg class="w-6 h-6 text-kahoot-purple-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-white/50 text-lg font-semibold">Waiting for host...</p>
          <p class="text-white/30 text-sm mt-1">The host will push a question shortly.</p>
        </div>

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

        <div v-else-if="!waitingForHost" class="p-6 text-center text-white/30">
          <p>No question loaded yet.</p>
        </div>
      </div>

      <div class="flex-1 flex flex-col overflow-hidden">
        <div class="flex items-center justify-between px-4 py-2 bg-gray-900/80 border-b border-white/10">
          <select
            v-model="language"
            :disabled="showFinalScoreboard"
            class="bg-gray-800 text-white text-sm rounded-md px-3 py-1.5 border border-white/10
                   focus:outline-none focus:ring-1 focus:ring-kahoot-purple-light disabled:opacity-50"
          >
            <option v-for="lang in languages" :key="lang.id" :value="lang.id">
              {{ lang.label }}
            </option>
          </select>
          <div class="flex gap-2">
            <button @click="run" :disabled="running || showFinalScoreboard" class="btn-kahoot bg-kahoot-green text-xs px-4 py-1.5">
              <svg class="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.891a1.5 1.5 0 000-2.538L6.3 2.841z" />
              </svg>
              {{ running ? 'Running…' : 'Run' }}
            </button>
            <button
              @click="handleSubmit"
              :disabled="submitting || submitLocked || showFinalScoreboard"
              class="btn-kahoot bg-kahoot-blue text-xs px-4 py-1.5"
            >
              {{ submitButtonLabel }}
            </button>
          </div>
        </div>

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
              :readonly="showFinalScoreboard"
              class="flex-1 bg-gray-900 text-green-400 font-mono text-sm p-4 pl-3
                     leading-5 resize-none outline-none overflow-auto"
              @keydown.tab.prevent="insertTab"
            ></textarea>
          </div>
        </div>

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
            <div v-if="activeTab === 'output'" class="text-white/70">
              <p v-if="!output" class="text-white/30 italic">Run your code to see output here…</p>
              <pre v-else class="whitespace-pre-wrap">{{ output }}</pre>
            </div>
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

    <Teleport to="body">
      <div
        v-if="showScorePopup"
        class="fixed inset-0 z-[110] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="score-popup-title"
      >
        <div
          class="absolute inset-0 bg-black/70"
          aria-hidden="true"
          @click="closeScorePopup"
        />
        <div
          class="relative card-kahoot max-w-sm w-full p-8 text-center shadow-2xl border border-white/20"
          @click.stop
        >
          <p
            id="score-popup-title"
            class="text-lg font-bold"
            :class="scorePopupSuccess ? 'text-kahoot-green' : 'text-white'"
          >
            {{ scorePopupTitle }}
          </p>

          <div v-if="scorePopupPoints > 0" class="mt-6">
            <p class="text-xs font-bold uppercase tracking-wider text-white/40">You earned</p>
            <p class="text-5xl font-black text-kahoot-yellow mt-1">+{{ scorePopupPoints }}</p>
            <p class="text-sm text-white/50 mt-1">points</p>
          </div>
          <div v-else-if="scorePopupShowZero" class="mt-6">
            <p class="text-3xl font-black text-white/30">0</p>
            <p class="text-sm text-white/50 mt-1">points this round</p>
          </div>
          <div v-else-if="scorePopupSuccess" class="mt-6 text-6xl leading-none text-kahoot-green" aria-hidden="true">
            ✓
          </div>

          <p class="text-sm text-white/60 mt-6 leading-relaxed">{{ scorePopupSubtitle }}</p>

          <button
            type="button"
            class="btn-kahoot bg-kahoot-purple-light w-full mt-8 justify-center"
            @click="closeScorePopup"
          >
            OK
          </button>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="showFinalScoreboard && gamePin"
        class="fixed inset-0 z-[125] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="final-scoreboard-title"
      >
        <div class="absolute inset-0 bg-black/80" aria-hidden="true" />
        <div
          class="relative card-kahoot w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl border border-white/20 overflow-hidden"
          @click.stop
        >
          <div id="final-scoreboard-title" class="px-5 pt-5 pb-2 shrink-0">
            <p class="text-xs font-bold uppercase tracking-wider text-white/40">Session ended</p>
            <p class="text-xl font-black text-white mt-1">Final scoreboard</p>
            <p class="text-sm text-white/50 mt-1">Thanks for playing, {{ playerName }}.</p>
          </div>
          <div class="flex-1 min-h-[280px] border-t border-white/10">
            <LeaderboardPanel
              :key="'final-' + gamePin"
              :pin="gamePin"
              :highlight-player-id="player?.id ?? ''"
              panel-title="Standings"
              :show-close="false"
              :poll-interval-ms="0"
            />
          </div>
          <div class="px-5 py-4 border-t border-white/10 shrink-0">
            <RouterLink
              to="/"
              class="btn-kahoot bg-kahoot-purple-light w-full justify-center text-sm"
            >
              Back to home
            </RouterLink>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSession } from '@/composables/useSession'
import { useGame } from '@/composables/useGame'
import { recordScore, subscribeToSession, computeTimeBasedPoints, fetchSessionByPin } from '@/services/sessionService'
import { createQuestion } from '@/models'
import LeaderboardPanel from '@/components/LeaderboardPanel.vue'

const route = useRoute()
const { session, player, playerName } = useSession()

const {
  question, language, code, output,
  testResults, submitted, running, submitting,
  timerSeconds, passedCount, totalTests, allPassed, lineCount,
  languages,
  setQuestion,
  stopTimer,
  run, submit,
} = useGame()

/** Question id we already awarded points for (prevents double-submit on correct answer). */
const creditedQuestionId = ref(null)
const lastScoredPoints = ref(0)

const showScorePopup = ref(false)
const scorePopupTitle = ref('')
const scorePopupSubtitle = ref('')
const scorePopupPoints = ref(0)
const scorePopupSuccess = ref(false)
const scorePopupShowZero = ref(false)

watch(
  () => question.value?.id,
  () => {
    creditedQuestionId.value = null
    lastScoredPoints.value = 0
  }
)

function closeScorePopup() {
  showScorePopup.value = false
}

function openScorePopup({ title, subtitle, points = 0, success = false, showZero = false }) {
  scorePopupTitle.value = title
  scorePopupSubtitle.value = subtitle
  scorePopupPoints.value = points
  scorePopupSuccess.value = success
  scorePopupShowZero.value = showZero
  showScorePopup.value = true
}

const submitLocked = computed(
  () =>
    submitted.value &&
    allPassed.value &&
    creditedQuestionId.value === question.value?.id
)

const submitButtonLabel = computed(() => {
  if (submitting.value) return 'Submitting…'
  if (submitLocked.value) return 'Scored'
  return 'Submit'
})

const waitingForHost = ref(true)
const showFinalScoreboard = ref(false)
const gamePin = computed(() => String(route.query.pin ?? ''))

let unsubscribe = null

function applySessionEnded() {
  stopTimer()
  showFinalScoreboard.value = true
  showScorePopup.value = false
}

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

async function handleSubmit() {
  if (showFinalScoreboard.value) return
  await submit()
  activeTab.value = 'results'

  if (!submitted.value) return

  if (!session.value?.id || !player.value?.id) {
    openScorePopup({
      title: allPassed.value ? 'All tests passed!' : 'Results',
      subtitle: allPassed.value
        ? 'Scores are saved when you join a game with a PIN from the home page.'
        : `${passedCount.value}/${totalTests.value} tests passed. Join a live session to save attempts.`,
      points: 0,
      success: allPassed.value,
      showZero: !allPassed.value,
    })
    return
  }

  const timeLimit = question.value?.timeLimitSeconds ?? 300
  const secondsRemaining = Math.max(0, timerSeconds.value)
  const elapsed = Math.max(0, timeLimit - secondsRemaining)
  const qid = question.value?.id ?? ''

  try {
    if (!allPassed.value) {
      await recordScore({
        sessionId: session.value.id,
        playerId: player.value.id,
        questionTitle: question.value?.title ?? '',
        score: 0,
        timeSeconds: elapsed,
        code: code.value,
        passed: false,
      })
      openScorePopup({
        title: 'Not quite',
        subtitle: `${passedCount.value} of ${totalTests.value} tests passed. Fix your code and try again — no points until all pass.`,
        points: 0,
        success: false,
        showZero: true,
      })
      return
    }

    if (creditedQuestionId.value === qid) {
      openScorePopup({
        title: 'Already scored',
        subtitle: `You already earned points for this question.`,
        points: lastScoredPoints.value,
        success: true,
        showZero: lastScoredPoints.value === 0,
      })
      return
    }

    const points = computeTimeBasedPoints(secondsRemaining, timeLimit)
    await recordScore({
      sessionId: session.value.id,
      playerId: player.value.id,
      questionTitle: question.value?.title ?? '',
      score: points,
      timeSeconds: elapsed,
      code: code.value,
      passed: true,
    })
    creditedQuestionId.value = qid
    lastScoredPoints.value = points
    openScorePopup({
      title: 'Correct!',
      subtitle: 'Faster answers earn more points. Check the scoreboard to see your rank.',
      points,
      success: true,
      showZero: false,
    })
  } catch (e) {
    console.error('Failed to record score:', e)
    output.value = `Could not save score: ${e.message}`
    openScorePopup({
      title: 'Could not save score',
      subtitle: e.message ?? 'Please try again.',
      points: 0,
      success: false,
      showZero: true,
    })
  }
}

onMounted(() => {
  const pin = route.query.pin
  if (!pin) return

  ;(async () => {
    const row = await fetchSessionByPin(String(pin))
    if (row?.status === 'completed') applySessionEnded()
  })()

  unsubscribe = subscribeToSession(String(pin), (session) => {
    if (session.status === 'completed') {
      applySessionEnded()
      return
    }
    if (session.current_question) {
      const q = session.current_question
      setQuestion(createQuestion({
        id: q.id ?? crypto.randomUUID(),
        title: q.title,
        description: q.description,
        difficulty: q.difficulty ?? 'Easy',
        category: q.category ?? '',
        starterCode: q.starterCode ?? { python: '' },
        testCases: q.testCases ?? [],
        timeLimitSeconds: q.timeLimitSeconds ?? 300,
      }))
      waitingForHost.value = false
    }
  })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>