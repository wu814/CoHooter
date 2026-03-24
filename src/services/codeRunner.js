/**
 * Code execution service — runs or judges player-submitted code.
 *
 * Connects to the Flask/Judge0 backend at VITE_BACKEND_URL.
 * Falls back gracefully if backend is not configured or unavailable.
 */

import { createTestResult } from '@/models'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

/**
 * Run code and return raw stdout output (no judging).
 * @param {{ code: string, language: string, stdin?: string }} params
 * @returns {Promise<string>} stdout output
 */
export async function runCode({ code, language, stdin = '' }) {
  // If no backend URL configured, return informative message
  if (!BACKEND_URL) {
    return '[Backend not configured. Set VITE_BACKEND_URL in .env]'
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_code: code,
        stdin: stdin,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    const result = await response.json()

    // Format output for display
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
