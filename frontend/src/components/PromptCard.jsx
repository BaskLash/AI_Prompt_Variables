import { useNavigate } from 'react-router-dom';

/**
 * Reusable card that displays a single prompt in the library.
 * Props:
 *   prompt       — the prompt object
 *   onDelete     — callback(id)
 *   onDuplicate  — callback(id)
 *   showToast    — from useToast hook
 */
export default function PromptCard({ prompt, onDelete, onDuplicate }) {
  const navigate = useNavigate();
  const varCount = prompt.variables?.length ?? 0;

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-sm transition-shadow flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{prompt.title}</h3>
          {prompt.description && (
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{prompt.description}</p>
          )}
        </div>
      </div>

      {/* Variable pills */}
      <div className="flex flex-wrap gap-1.5">
        {prompt.variables?.length > 0 ? (
          prompt.variables.map(v => (
            <span
              key={v}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-100"
            >
              {'{{'}{v}{'}}'}
            </span>
          ))
        ) : (
          <span className="text-xs text-gray-400">No variables</span>
        )}
      </div>

      {/* Footer: meta + actions */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-50">
        <span className="text-xs text-gray-400">
          {varCount} variable{varCount !== 1 ? 's' : ''}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/prompts/${prompt.id}/generate`)}
            className="px-3 py-1.5 text-xs font-medium bg-brand-600 text-white rounded-md hover:bg-brand-700 transition-colors"
          >
            Generate
          </button>
          <button
            onClick={() => navigate(`/prompts/${prompt.id}/edit`)}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDuplicate(prompt.id)}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
          >
            Copy
          </button>
          <button
            onClick={() => onDelete(prompt.id)}
            className="px-3 py-1.5 text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
