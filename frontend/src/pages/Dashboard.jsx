import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { formatDate } from '../lib/utils';
import PageHeader from '../components/PageHeader';

/**
 * Dashboard / Home page.
 * Shows quick stats and recent prompts/workflows.
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const [prompts, setPrompts] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.prompts.list(), api.workflows.list()])
      .then(([p, w]) => { setPrompts(p); setWorkflows(w); })
      .finally(() => setLoading(false));
  }, []);

  const recent = prompts.slice(0, 5);

  return (
    <div className="px-8 py-8 max-w-4xl">
      <PageHeader
        title="Dashboard"
        description="Welcome to PromptFlow. Build and manage your prompt templates."
        action={
          <button
            onClick={() => navigate('/prompts/new')}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            + New Prompt
          </button>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Prompts', value: prompts.length, icon: '◧', onClick: () => navigate('/prompts') },
          { label: 'Workflows', value: workflows.length, icon: '⟶', onClick: () => navigate('/workflows') },
          { label: 'Variables', value: prompts.reduce((sum, p) => sum + (p.variables?.length ?? 0), 0), icon: '{}', onClick: null },
        ].map(stat => (
          <div
            key={stat.label}
            onClick={stat.onClick}
            className={`bg-white border border-gray-100 rounded-xl p-5 ${stat.onClick ? 'cursor-pointer hover:shadow-sm' : ''} transition-shadow`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.label}</span>
              <span className="text-gray-300 text-lg">{stat.icon}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{loading ? '—' : stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent prompts */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Recent Prompts</h2>
          <button
            onClick={() => navigate('/prompts')}
            className="text-xs text-brand-600 hover:text-brand-700 font-medium"
          >
            View all →
          </button>
        </div>

        {loading ? (
          <div className="px-5 py-8 text-sm text-gray-400 text-center">Loading…</div>
        ) : recent.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-gray-500 mb-3">You don't have any prompts yet. Create your first one.</p>
            <button
              onClick={() => navigate('/prompts/new')}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
            >
              Create Prompt
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {recent.map(p => (
              <li
                key={p.id}
                className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/prompts/${p.id}/generate`)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.variables?.length ?? 0} variables · {formatDate(p.createdAt)}</p>
                </div>
                <span className="text-xs text-brand-600 font-medium ml-4 hover:text-brand-700">Generate →</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quick-start guide */}
      {!loading && prompts.length === 0 && (
        <div className="mt-6 bg-brand-50 border border-brand-100 rounded-xl px-6 py-5">
          <h3 className="text-sm font-semibold text-brand-700 mb-2">Quick Start</h3>
          <ol className="text-sm text-brand-700 space-y-1 list-decimal list-inside">
            <li>Click <strong>New Prompt</strong> to create your first template</li>
            <li>Use <code className="bg-brand-100 px-1 rounded">{'{{'+'variable'+'}}'}</code> syntax to define variables</li>
            <li>Hit <strong>Generate</strong> to fill variables and copy the result</li>
            <li>Chain prompts together with <strong>Workflows</strong></li>
          </ol>
        </div>
      )}
    </div>
  );
}
