import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { renderPrompt, copyToClipboard } from '../lib/utils';
import PageHeader from '../components/PageHeader';

/**
 * Prompt Generator page.
 * Fills variable values and shows a live preview of the rendered prompt.
 * Route: /prompts/:id/generate
 * Also accessible as /prompt/:id (shareable link)
 */
export default function PromptGenerator({ showToast }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState(null);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.prompts.get(id)
      .then(p => {
        setPrompt(p);
        // Pre-fill empty strings for all detected variables
        const initial = {};
        p.variables.forEach(v => { initial[v] = ''; });
        setValues(initial);
      })
      .catch(() => showToast('Prompt not found', 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  // Rendered output recomputes whenever any value changes — no API call needed
  const rendered = useMemo(() => {
    if (!prompt) return '';
    return renderPrompt(prompt.promptText, values);
  }, [prompt, values]);

  const allFilled = prompt?.variables.every(v => values[v]?.trim());

  async function handleCopy() {
    try {
      await copyToClipboard(rendered);
      setCopied(true);
      showToast('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Failed to copy', 'error');
    }
  }

  if (loading) return <div className="px-8 py-8 text-sm text-gray-400">Loading…</div>;
  if (!prompt) return <div className="px-8 py-8 text-sm text-red-500">Prompt not found.</div>;

  return (
    <div className="px-8 py-8 max-w-3xl">
      <PageHeader
        title={prompt.title}
        description={prompt.description || 'Fill in the variables to generate your prompt.'}
        action={
          <div className="flex gap-2">
            <Link
              to={`/prompts/${id}/edit`}
              className="px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Edit Template
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: variable inputs */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Variables</h2>

          {prompt.variables.length === 0 ? (
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-sm text-gray-500">
              This prompt has no variables. Copy it directly below.
            </div>
          ) : (
            prompt.variables.map(varName => (
              <div key={varName}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 capitalize">
                  {varName.replace(/_/g, ' ')}
                </label>
                <input
                  type="text"
                  placeholder={`Enter ${varName}…`}
                  value={values[varName] || ''}
                  onChange={e => setValues(v => ({ ...v, [varName]: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                />
              </div>
            ))
          )}

          {/* Shareable link hint */}
          <div className="pt-2">
            <p className="text-xs text-gray-400">
              Share this prompt:{' '}
              <button
                onClick={() => { copyToClipboard(window.location.href); showToast('Link copied!'); }}
                className="text-brand-600 hover:text-brand-700 underline"
              >
                Copy link
              </button>
            </p>
          </div>
        </div>

        {/* Right: live preview */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-700">Output Preview</h2>

          <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4 min-h-[200px] relative">
            {/* Highlight unfilled variables in the preview */}
            <HighlightedPreview text={rendered} values={values} />
          </div>

          <button
            onClick={handleCopy}
            disabled={!rendered}
            className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
              copied
                ? 'bg-green-500 text-white'
                : allFilled
                  ? 'bg-brand-600 text-white hover:bg-brand-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {copied ? '✓ Copied!' : allFilled ? 'Copy Prompt' : 'Fill all variables to copy'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Renders the prompt text with {{variable}} tokens highlighted
 * if they still have no value.
 */
function HighlightedPreview({ text, values }) {
  if (!text) {
    return <span className="text-gray-400 text-sm">Your rendered prompt will appear here…</span>;
  }

  // Split on {{tokens}} and highlight unresolved ones
  const parts = text.split(/(\{\{\w+\}\})/g);

  return (
    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
      {parts.map((part, i) => {
        const match = part.match(/^\{\{(\w+)\}\}$/);
        if (match) {
          const varName = match[1];
          const resolved = values[varName]?.trim();
          return resolved ? (
            <span key={i}>{resolved}</span>
          ) : (
            <span key={i} className="bg-amber-100 text-amber-700 rounded px-0.5 font-medium">
              {part}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}
