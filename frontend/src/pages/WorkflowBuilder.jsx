import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import PageHeader from '../components/PageHeader';

/**
 * Workflow Builder — create or edit a multi-step prompt workflow.
 * Steps are ordered and each step references an existing prompt.
 */
export default function WorkflowBuilder({ showToast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState([]); // [{ promptId, promptTitle }]
  const [allPrompts, setAllPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const prompts = await api.prompts.list();
      setAllPrompts(prompts);

      if (isEditing) {
        const wf = await api.workflows.get(id);
        setName(wf.name);
        setDescription(wf.description || '');
        setSteps(
          wf.steps.map(s => ({
            promptId: s.promptId,
            promptTitle: s.prompt?.title ?? '?',
          }))
        );
      }
    };

    fetchData()
      .catch(e => showToast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  function addStep(promptId) {
    const prompt = allPrompts.find(p => p.id === promptId);
    if (!prompt) return;
    setSteps(prev => [...prev, { promptId: prompt.id, promptTitle: prompt.title }]);
  }

  function removeStep(index) {
    setSteps(prev => prev.filter((_, i) => i !== index));
  }

  function moveStep(index, direction) {
    const newSteps = [...steps];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newSteps.length) return;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    setSteps(newSteps);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { showToast('Name is required', 'error'); return; }
    if (steps.length === 0) { showToast('Add at least one step', 'error'); return; }

    setSaving(true);
    try {
      const payload = {
        name,
        description,
        steps: steps.map((s, i) => ({ promptId: s.promptId, stepOrder: i + 1 })),
      };

      if (isEditing) {
        await api.workflows.update(id, payload);
        showToast('Workflow saved');
      } else {
        await api.workflows.create(payload);
        showToast('Workflow created');
      }
      navigate('/workflows');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="px-8 py-8 text-sm text-gray-400">Loading…</div>;

  return (
    <div className="px-8 py-8 max-w-2xl">
      <PageHeader
        title={isEditing ? 'Edit Workflow' : 'New Workflow'}
        description="Chain prompts together into a step-by-step workflow."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Workflow name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Workflow Name *</label>
          <input
            type="text"
            placeholder="e.g. Blog Post Creator"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
          <input
            type="text"
            placeholder="What does this workflow do?"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
          />
        </div>

        {/* Steps */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Steps ({steps.length})
          </label>

          {steps.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 rounded-xl py-8 text-center">
              <p className="text-sm text-gray-400">No steps yet. Add prompts from the list below.</p>
            </div>
          ) : (
            <div className="space-y-2 mb-4">
              {steps.map((step, i) => (
                <div
                  key={`${step.promptId}-${i}`}
                  className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg px-4 py-3"
                >
                  <span className="text-xs font-bold text-gray-400 w-5 text-center">{i + 1}</span>
                  <p className="flex-1 text-sm font-medium text-gray-800">{step.promptTitle}</p>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => moveStep(i, -1)}
                      disabled={i === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveStep(i, 1)}
                      disabled={i === steps.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeStep(i)}
                      className="p-1 text-red-400 hover:text-red-600 transition-colors ml-1"
                      title="Remove step"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Prompt picker */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Add a Step</p>
            {allPrompts.length === 0 ? (
              <p className="text-xs text-gray-400">No prompts found. Create some prompts first.</p>
            ) : (
              <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto">
                {allPrompts.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addStep(p.id)}
                    className="text-left px-3 py-2 text-sm rounded-lg hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100 text-gray-700"
                  >
                    <span className="font-medium">{p.title}</span>
                    {p.variables?.length > 0 && (
                      <span className="text-xs text-gray-400 ml-2">
                        {p.variables.length} var{p.variables.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : isEditing ? 'Save Workflow' : 'Create Workflow'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
