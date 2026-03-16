/**
 * Extracts variable names from a prompt template string.
 * Variables are wrapped in double curly braces: {{variable_name}}
 *
 * Example input:  "Write a {{tone}} article about {{topic}}"
 * Example output: ["tone", "topic"]
 */
function extractVariables(promptText) {
  if (!promptText) return [];

  const regex = /\{\{(\w+)\}\}/g;
  const found = new Set();
  let match;

  while ((match = regex.exec(promptText)) !== null) {
    found.add(match[1]);
  }

  return Array.from(found);
}

/**
 * Renders a prompt template by replacing {{variable}} tokens with provided values.
 *
 * Example:
 *   template: "Write a {{tone}} post about {{topic}}"
 *   values:   { tone: "friendly", topic: "AI" }
 *   output:   "Write a friendly post about AI"
 */
function renderPrompt(promptText, values = {}) {
  return promptText.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return values[key] !== undefined ? values[key] : match;
  });
}

module.exports = { extractVariables, renderPrompt };
