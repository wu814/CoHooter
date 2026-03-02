/**
 * Code execution service — runs or judges player-submitted code.
 *
 * IMPLEMENT: Replace the stubs below with your execution backend.
 *   Options include:
 *   - A serverless function (Supabase Edge Function, AWS Lambda, etc.)
 *   - A sandboxed execution API (Judge0, Piston, etc.)
 *   - Your own containerized runner
 *
 * Both functions return arrays of TestResult objects (see models/index.js).
 */

import { createTestResult } from '@/models'

/**
 * Run code and return raw stdout output (no judging).
 * @param {{ code: string, language: string, stdin?: string }} params
 * @returns {Promise<string>} stdout output
 */
export async function runCode({ code, language, stdin = '' }) {
  // IMPLEMENT: Send code to your execution backend.
  //   e.g. const res = await fetch('/api/run', {
  //     method: 'POST',
  //     body: JSON.stringify({ code, language, stdin }),
  //   })
  //   const { stdout } = await res.json()
  //   return stdout

  return `[placeholder] Running ${language} code…\nConnect a code execution backend in services/codeRunner.js`
}

/**
 * Submit code against a question's test cases and return results.
 * @param {{ code: string, language: string, testCases: Array }} params
 * @returns {Promise<TestResult[]>}
 */
export async function submitCode({ code, language, testCases = [] }) {
  // IMPLEMENT: Send code + test cases to your judging backend.
  //   e.g. const res = await fetch('/api/submit', {
  //     method: 'POST',
  //     body: JSON.stringify({ code, language, testCases }),
  //   })
  //   return (await res.json()).results.map(r => createTestResult(r))

  return testCases.map((tc, i) =>
    createTestResult({
      passed: false,
      input: tc.input ?? `test ${i + 1}`,
      expected: tc.expected ?? '',
      actual: '',
      error: 'Code runner not connected. Implement submitCode() in services/codeRunner.js',
    })
  )
}
