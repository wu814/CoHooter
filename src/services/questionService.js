/**
 * Question service — fetches or generates coding questions.
 *
 * IMPLEMENT: Replace the stub implementations below with real logic.
 *   - fetchQuestion()    → pull from Supabase, an API, or AI generation
 *   - generateQuestion() → call an LLM endpoint to create a new question
 *
 * Both functions return a Question object (see models/index.js).
 */

import { createQuestion } from '@/models'

/**
 * Fetch a question by ID from the backend.
 * @param {string} questionId
 * @returns {Promise<Question>}
 */
export async function fetchQuestion(questionId) {
  // IMPLEMENT: e.g. const { data } = await supabase.from('questions').select('*').eq('id', questionId).single()
  return createQuestion({
    id: questionId,
    title: 'Sample Question',
    description: 'This is a placeholder. Implement fetchQuestion() in services/questionService.js.',
    examples: [{ input: 'example input', output: 'example output' }],
    constraints: ['Implement your backend to serve real questions.'],
    starterCode: {
      python: '# Write your solution here\n',
      javascript: '// Write your solution here\n',
      java: '// Write your solution here\n',
      cpp: '// Write your solution here\n',
    },
  })
}

/**
 * Generate a new question using AI.
 * @param {{ difficulty: string, category: string }} params
 * @returns {Promise<Question>}
 */
export async function generateQuestion({ difficulty = 'Easy', category = '' } = {}) {
  // IMPLEMENT: Call your AI/LLM endpoint here.
  //   e.g. const res = await fetch('/api/generate-question', {
  //     method: 'POST',
  //     body: JSON.stringify({ difficulty, category }),
  //   })
  //   return createQuestion(await res.json())

  return createQuestion({
    id: crypto.randomUUID(),
    title: `AI Generated (${difficulty})`,
    difficulty,
    category: category || 'General',
    description: 'Implement generateQuestion() to call your AI endpoint and produce real questions.',
    examples: [],
    constraints: [],
    starterCode: {
      python: '# Your AI-generated starter code here\n',
      javascript: '// Your AI-generated starter code here\n',
      java: '// Your AI-generated starter code here\n',
      cpp: '// Your AI-generated starter code here\n',
    },
  })
}
