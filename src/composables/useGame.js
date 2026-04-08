/**
 * Reactive game state for the coding challenge page.
 *
 * Manages the current question, code editor contents, timer,
 * and delegates execution / submission to the service layer.
 */

import { ref, computed, watch, onUnmounted } from 'vue'
import { fetchQuestion, generateQuestion } from '@/services/questionService'
import { runCode as execRun, submitCode as execSubmit } from '@/services/codeRunner'
import { LANGUAGES } from '@/models'

export function useGame() {
  const question = ref(null)
  const language = ref('python')
  const code = ref('')
  const output = ref('')
  const testResults = ref([])
  const submitted = ref(false)
  const running = ref(false)
  const submitting = ref(false)
  const generating = ref(false) // Tracks if Gemini is currently thinking (you can add like a loading circle for this)

  // Timer
  const timerSeconds = ref(0)
  const timerRunning = ref(false)
  let timerInterval = null

  function startTimer(seconds) {
    stopTimer()
    timerSeconds.value = seconds
    timerRunning.value = true
    timerInterval = setInterval(() => {
      if (timerSeconds.value <= 0) {
        stopTimer()
        return
      }
      timerSeconds.value--
    }, 1000)
  }

  function stopTimer() {
    timerRunning.value = false
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  onUnmounted(stopTimer)

  // Question loading
  async function loadQuestion(questionId) {
    question.value = await fetchQuestion(questionId)
    resetEditor()
  }

  async function loadAIQuestion(topic = '') {
    generating.value = true 
    try {
      // 1. Fetch the question from your service
      const result = await generateQuestion({ category: topic }) 
      
      if (result) {
        // 2. Update the main question state
        question.value = result 
        
        // 3. This triggers resetEditor() which puts the code in the text area
        resetEditor()
        
        // 4. LOG THIS: can show the data is ready
        console.log("🚀 useGame: AI Data Loaded", {
          title: result.title,
          testCases: result.testCases
        })
      }
    } catch (e) {
      console.error("useGame AI Load Error:", e)
      output.value = `AI Error: ${e.message}. Try clicking Gen AI again.`
    } finally {
      generating.value = false 
    }
  }

  function setQuestion(q) {
    question.value = q
    resetEditor()
  }

  function resetEditor() {
    if (question.value?.starterCode?.[language.value]) {
      code.value = question.value.starterCode[language.value]
    } else {
      code.value = ''
    }
    output.value = ''
    testResults.value = []
    submitted.value = false
    if (question.value?.timeLimitSeconds) {
      startTimer(question.value.timeLimitSeconds)
    }
  }

  // Sync starter code when language changes
  watch(language, (lang) => {
    if (question.value?.starterCode?.[lang]) {
      code.value = question.value.starterCode[lang]
    }
  })

  // Code execution
  async function run() {
    running.value = true
    output.value = ''
    try {
      output.value = await execRun({
        code: code.value,
        language: language.value,
        testCases: question.value?.testCases ?? [],
      })
    } catch (e) {
      output.value = `Error: ${e.message}`
    } finally {
      running.value = false
    }
  }

  async function submit() {
    submitting.value = true
    testResults.value = []
    try {
      testResults.value = await execSubmit({
        code: code.value,
        language: language.value,
        testCases: question.value?.testCases ?? [],
      })
      submitted.value = true
    } catch (e) {
      output.value = `Submission error: ${e.message}`
    } finally {
      submitting.value = false
    }
  }

  const passedCount = computed(() => testResults.value.filter(r => r.passed).length)
  const totalTests = computed(() => testResults.value.length)
  const allPassed = computed(() => totalTests.value > 0 && passedCount.value === totalTests.value)
  const lineCount = computed(() => Math.max((code.value ?? '').split('\n').length, 20))

  return {
    question,
    language,
    code,
    output,
    testResults,
    submitted,
    running,
    submitting,
    generating, // added this to have something to show while gemini generates a question
    timerSeconds,
    timerRunning,
    passedCount,
    totalTests,
    allPassed,
    lineCount,
    languages: LANGUAGES,
    loadQuestion,
    loadAIQuestion,
    setQuestion,
    resetEditor,
    startTimer,
    stopTimer,
    run,
    submit,
  }
}
