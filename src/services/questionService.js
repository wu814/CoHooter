import { GoogleGenerativeAI } from "@google/generative-ai";
import { createQuestion } from '@/models';

// Setup the API using the key from your .env
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Use the 2.0 version that worked in your testing
const MODEL_NAME = "gemini-2.5-flash";

const SYSTEM_PROMPT = `
You are the CoHooter Question Engine. Generate an EASY Python 3 coding challenge.
Return ONLY a JSON object. Do not include markdown formatting like \`\`\`json.
Use this EXACT JSON structure:
{
  "title": "Short catchy title",
  "description": "Clear instructions for the user",
  "starter_code": "The initial Python code (e.g., 'def solution(s):\\n    pass')",
  "test_cases": [
    { "input": "solution('hello')", "expected": "olleh" },
    { "input": "solution('world')", "expected": "dlrow" }
  ]
}
`;

// A safe backup question for when the API hits rate limits
const MOCK_QUESTION = {
  title: "Mock: Sum of Two Numbers",
  description: "Create a function named 'solution' that takes two numbers, a and b, and returns their sum.",
  starter_code: "def solution(a, b):\n    # Write your code here\n    pass",
  test_cases: [
    { input: "solution(1, 2)", expected: "3" },
    { input: "solution(10, 20)", expected: "30" },
    { input: "solution(-5, 5)", expected: "0" }
  ]
};

/**
 * Generates a coding question using Gemini AI with a mock fallback.
 */
export async function generateQuestion({ category = '' } = {}) {
  const randomTopics = ['Arrays', 'Strings', 'Basic Math', 'Booleans'];
  const selectedTopic = category || randomTopics[Math.floor(Math.random() * randomTopics.length)];

  const model = genAI.getGenerativeModel({ 
    model: MODEL_NAME,
    generationConfig: { responseMimeType: "application/json" } 
  });

  try {
    const result = await model.generateContent(`${SYSTEM_PROMPT}\n\nTopic: ${selectedTopic}`);
    const data = JSON.parse(result.response.text());

    // Successfully generated AI question
    return createQuestion({
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      difficulty: 'Easy',
      category: selectedTopic,
      starterCode: { python: data.starter_code },
      testCases: data.test_cases.map(tc => ({ ...tc, hidden: false }))
    });
  } catch (e) {
    console.warn("AI Generation failed or throttled. Falling back to Mock Data.", e);

    // Return the mock question so the UI doesn't break
    return createQuestion({
      id: crypto.randomUUID(),
      title: MOCK_QUESTION.title,
      description: MOCK_QUESTION.description,
      difficulty: 'Easy',
      category: selectedTopic,
      starterCode: { python: MOCK_QUESTION.starter_code },
      testCases: MOCK_QUESTION.test_cases.map(tc => ({
        input: String(tc.input),
        expected: String(tc.expected),
        hidden: false
      }))
    });
  }
}

/**
 * Placeholder for fetching standard questions from a database.
 */
export async function fetchQuestion(questionId) {
  return createQuestion({
    id: questionId,
    title: 'Database Question',
    description: 'Database integration is pending. Use the AI Generator for now!',
  });
}