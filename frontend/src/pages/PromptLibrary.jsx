import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import PromptCard from '../components/PromptCard';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';

/**
 * Lists all prompts. Supports delete and duplicate.
 */
export default function PromptLibrary({ showToast }) {
  const navigate = useNavigate();
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.prompts.list()
      .then(setPrompts)
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id) {
    if (!confirm('Delete this prompt?')) return;
    try {
      await api.prompts.delete(id);
      setPrompts(prev => prev.filter(p => p.id !== id));
      showToast('Prompt deleted');
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  async function handleDuplicate(id) {
    try {
      const copy = await api.prompts.duplicate(id);
      setPrompts(prev => [copy, ...prev]);
      showToast('Prompt duplicated');
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  const filtered = prompts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-8 py-8 max-w-5xl">
      <PageHeader
        title="Prompt Library"
        description="All your reusable prompt templates in one place."
        action={
          <button
            onClick={() => navigate('/prompts/new')}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            + New Prompt
          </button>
        }
      />

      {/* Search */}
      {prompts.length > 0 && (
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search prompts…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-sm px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
          />
        </div>
      )}

      {loading ? (
        <div className="text-sm text-gray-400 py-12 text-center">Loading prompts…</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="◧"
          title={search ? 'No matching prompts' : "You don't have any prompts yet"}
          body={search ? 'Try a different search term.' : 'Create your first prompt template to get started.'}
          action={
            !search && (
              <button
                onClick={() => navigate('/prompts/new')}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
              >
                Create Prompt
              </button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(p => (
            <PromptCard
              key={p.id}
              prompt={p}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
