/**
 * Code execution service — runs or judges player-submitted code.
 *
 * Connects to the Flask/Judge0 backend at VITE_BACKEND_URL.
 * Falls back gracefully if backend is not configured or unavailable.
 */

import { createTestResult } from '@/models'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

/**
 * Run code and return output. If testCases provided, returns test results.
 * @param {{ code: string, language: string, stdin?: string, testCases?: Array }} params
 * @returns {Promise<string>} formatted output string
 */
export async function runCode({ code, language, stdin = '', testCases = [] }) {
  // If no backend URL configured, return informative message
  if (!BACKEND_URL) {
    return '[Backend not configured. Set VITE_BACKEND_URL in .env]'
  }

  try {
    // Build request body - include test_cases if provided
    const body = { user_code: code }
    if (testCases.length > 0) {
      body.test_cases = testCases.map(tc => ({
        input: tc.input,
        expected: tc.expected,
      }))
    } else {
      body.stdin = stdin
    }

    const response = await fetch(`${BACKEND_URL}/api/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    const result = await response.json()

    // If response has results array, format test case output
    if (result.results) {
      return formatTestCaseResults(result.results)
    }

    // Otherwise, format simple execution output
    let output = ''
    if (result.stdout) output += result.stdout
    if (result.stderr) output += `\n[stderr]\n${result.stderr}`
    if (result.status !== 'Accepted') {
      output += `\n[Status: ${result.status}]`
    }

    return output || '[No output]'
  } catch (err) {
    return `[Run error: ${err.message}]`
  }
}

/**
 * Format test case results for display in the output terminal.
 */
function formatTestCaseResults(results) {
  const lines = []
  let passedCount = 0

  results.forEach((r, i) => {
    const status = r.passed ? 'PASS' : 'FAIL'
    if (r.passed) passedCount++

    lines.push(`Test ${i + 1}: ${status}`)
    lines.push(`  Input:    ${r.input}`)
    lines.push(`  Expected: ${r.expected}`)
    lines.push(`  Actual:   ${r.actual_output || '(no output)'}`)
    if (r.error_message) {
      lines.push(`  Error:    ${r.error_message}`)
    }
    lines.push('')
  })

  const summary = `${passedCount}/${results.length} tests passed`
  lines.push('─'.repeat(30))
  lines.push(summary)

  return lines.join('\n')
}

/**
 * Submit code against a question's test cases and return results.
 * @param {{ code: string, language: string, testCases: Array }} params
 * @returns {Promise<TestResult[]>}
 */
export async function submitCode({ code, language, testCases = [] }) {
  // If no backend URL configured, return informative stub
  if (!BACKEND_URL) {
    return testCases.map((tc, i) =>
      createTestResult({
        passed: false,
        input: tc.input ?? `test ${i + 1}`,
        expected: tc.expected ?? '',
        actual: '',
        error: 'Backend not configured. Set VITE_BACKEND_URL in .env',
      })
    )
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_code: code,
        test_cases: testCases.map(tc => ({
          input: tc.input,
          expected: tc.expected,
        })),
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    const data = await response.json()

    return data.results.map(r =>
      createTestResult({
        passed: r.passed,
        input: r.input,
        expected: r.expected,
        actual: r.actual_output || '',
        error: r.error_message,
      })
    )
  } catch (err) {
    // Network error - return graceful fallback
    return testCases.map((tc, i) =>
      createTestResult({
        passed: false,
        input: tc.input ?? `test ${i + 1}`,
        expected: tc.expected ?? '',
        actual: '',
        error: `Backend error: ${err.message}`,
      })
    )
  }
}
