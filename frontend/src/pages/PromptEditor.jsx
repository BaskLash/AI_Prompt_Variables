import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { extractVariables } from '../lib/utils';
import PageHeader from '../components/PageHeader';

/**
 * Create or edit a prompt template.
 * Route: /prompts/new  or  /prompts/:id/edit
 */
export default function PromptEditor({ showToast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState({ title: '', description: '', promptText: '' });
  const [detectedVars, setDetectedVars] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  // Load existing prompt when editing
  useEffect(() => {
    if (!isEditing) return;
    api.prompts.get(id)
      .then(p => {
        setForm({ title: p.title, description: p.description || '', promptText: p.promptText });
        setDetectedVars(p.variables);
      })
      .catch(e => showToast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  // Live variable detection as user types
  function handlePromptTextChange(e) {
    const text = e.target.value;
    setForm(f => ({ ...f, promptText: text }));
    setDetectedVars(extractVariables(text));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.promptText.trim()) {
      showToast('Title and prompt text are required', 'error');
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await api.prompts.update(id, form);
        showToast('Prompt updated');
      } else {
        const created = await api.prompts.create(form);
        showToast('Prompt created');
        navigate(`/prompts/${created.id}/generate`);
        return;
      }
      navigate('/prompts');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="px-8 py-8 text-sm text-gray-400">Loading…</div>;
  }

  return (
    <div className="px-8 py-8 max-w-2xl">
      <PageHeader
        title={isEditing ? 'Edit Prompt' : 'New Prompt'}
        description={isEditing ? 'Update your prompt template.' : 'Create a reusable prompt with dynamic variables.'}
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
          <input
            type="text"
            placeholder="e.g. LinkedIn post generator"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
          <input
            type="text"
            placeholder="Optional short description"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
          />
        </div>

        {/* Prompt template */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Prompt Template *
            <span className="ml-2 text-xs font-normal text-gray-400">
              Use {'{{variable}}'} syntax for dynamic values
            </span>
          </label>
          <textarea
            rows={8}
            placeholder={'Write a {{tone}} blog post about {{topic}} for {{audience}}.'}
            value={form.promptText}
            onChange={handlePromptTextChange}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white font-mono leading-relaxed"
          />
        </div>

        {/* Detected variables */}
        <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3">
          <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
            Detected Variables ({detectedVars.length})
          </p>
          {detectedVars.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {detectedVars.map(v => (
                <span
                  key={v}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-100"
                >
                  {'{{'}{v}{'}}'}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">
              No variables detected. Add <code className="bg-gray-200 px-1 rounded">{'{{variable}}'}</code> tokens to your template.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Prompt'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
