/**
 * Extract {{variable}} tokens from a template string.
 * Mirrors the backend logic so the UI can react without a round-trip.
 */
export function extractVariables(text) {
  if (!text) return [];
  const regex = /\{\{(\w+)\}\}/g;
  const found = new Set();
  let match;
  while ((match = regex.exec(text)) !== null) {
    found.add(match[1]);
  }
  return Array.from(found);
}

/**
 * Replace {{variable}} tokens with values from a plain object.
 * Unmatched tokens are left as-is.
 */
export function renderPrompt(text, values = {}) {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) =>
    values[key] !== undefined ? values[key] : match
  );
}

/**
 * Copy text to clipboard. Returns a promise.
 */
export function copyToClipboard(text) {
  return navigator.clipboard.writeText(text);
}

/**
 * Format an ISO date string to a human-readable relative label.
 */
export function formatDate(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
