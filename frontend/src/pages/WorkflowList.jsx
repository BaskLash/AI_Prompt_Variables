import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { formatDate } from '../lib/utils';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';

/**
 * Lists all workflows with step count and quick actions.
 */
export default function WorkflowList({ showToast }) {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.workflows.list()
      .then(setWorkflows)
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id) {
    if (!confirm('Delete this workflow?')) return;
    try {
      await api.workflows.delete(id);
      setWorkflows(prev => prev.filter(w => w.id !== id));
      showToast('Workflow deleted');
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  return (
    <div className="px-8 py-8 max-w-4xl">
      <PageHeader
        title="Workflows"
        description="Chain multiple prompts into step-by-step processes."
        action={
          <button
            onClick={() => navigate('/workflows/new')}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            + New Workflow
          </button>
        }
      />

      {loading ? (
        <div className="text-sm text-gray-400 py-12 text-center">Loading…</div>
      ) : workflows.length === 0 ? (
        <EmptyState
          icon="⟶"
          title="No workflows yet"
          body="Create a workflow to chain prompts together into a multi-step process."
          action={
            <button
              onClick={() => navigate('/workflows/new')}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
            >
              Create Workflow
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {workflows.map(w => (
            <WorkflowCard
              key={w.id}
              workflow={w}
              onDelete={handleDelete}
              onEdit={id => navigate(`/workflows/${id}/edit`)}
              onRun={id => navigate(`/workflows/${id}/run`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function WorkflowCard({ workflow, onDelete, onEdit, onRun }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{workflow.name}</h3>
          {workflow.description && (
            <p className="text-sm text-gray-500 mt-0.5">{workflow.description}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {workflow.steps.length} step{workflow.steps.length !== 1 ? 's' : ''} · {formatDate(workflow.createdAt)}
          </p>
        </div>

        <div className="flex gap-1.5 flex-shrink-0">
          <button
            onClick={() => onRun(workflow.id)}
            className="px-3 py-1.5 text-xs font-medium bg-brand-600 text-white rounded-md hover:bg-brand-700 transition-colors"
          >
            Run
          </button>
          <button
            onClick={() => onEdit(workflow.id)}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(workflow.id)}
            className="px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-md transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Step preview */}
      {workflow.steps.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {workflow.steps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-md px-2.5 py-1">
                <span className="text-xs font-medium text-gray-500">{i + 1}.</span>
                <span className="text-xs text-gray-700 font-medium">
                  {step.prompt?.title ?? 'Unknown prompt'}
                </span>
              </div>
              {i < workflow.steps.length - 1 && (
                <span className="text-gray-300 text-xs">→</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
