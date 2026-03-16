import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { renderPrompt, copyToClipboard } from '../lib/utils';

/**
 * Workflow Runner — steps through each prompt in a workflow,
 * collects variable values, and lets the user copy each output.
 */
export default function WorkflowRunner({ showToast }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workflow, setWorkflow] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [allValues, setAllValues] = useState({}); // { stepIndex: { varName: value } }
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.workflows.get(id)
      .then(wf => {
        setWorkflow(wf);
        // Init empty values for each step
        const init = {};
        wf.steps.forEach((s, i) => {
          init[i] = {};
          s.prompt?.variables?.forEach(v => { init[i][v] = ''; });
        });
        setAllValues(init);
      })
      .catch(() => showToast('Workflow not found', 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  const step = workflow?.steps[currentStep];
  const stepValues = allValues[currentStep] || {};
  const rendered = useMemo(() => {
    if (!step?.prompt) return '';
    return renderPrompt(step.prompt.promptText, stepValues);
  }, [step, stepValues]);

  function setStepValue(varName, val) {
    setAllValues(prev => ({
      ...prev,
      [currentStep]: { ...prev[currentStep], [varName]: val },
    }));
  }

  async function handleCopy() {
    try {
      await copyToClipboard(rendered);
      setCopied(true);
      showToast(`Step ${currentStep + 1} copied!`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Failed to copy', 'error');
    }
  }

  if (loading) return <div className="px-8 py-8 text-sm text-gray-400">Loading…</div>;
  if (!workflow) return <div className="px-8 py-8 text-sm text-red-500">Workflow not found.</div>;

  const totalSteps = workflow.steps.length;
  const isLast = currentStep === totalSteps - 1;

  return (
    <div className="px-8 py-8 max-w-3xl">
      {/* Workflow header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/workflows')}
          className="text-xs text-gray-400 hover:text-gray-600 mb-3 flex items-center gap-1 transition-colors"
        >
          ← Back to Workflows
        </button>
        <h1 className="text-xl font-semibold text-gray-900">{workflow.name}</h1>
        {workflow.description && <p className="text-sm text-gray-500 mt-1">{workflow.description}</p>}
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span className="text-xs text-gray-400">
            {Math.round(((currentStep + 1) / totalSteps) * 100)}% complete
          </span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>

        {/* Step tabs */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {workflow.steps.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(i)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                i === currentStep
                  ? 'bg-brand-600 text-white'
                  : i < currentStep
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
              }`}
            >
              {i + 1}. {s.prompt?.title ?? '?'}
            </button>
          ))}
        </div>
      </div>

      {/* Current step card */}
      {step?.prompt && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
          <div className="mb-1">
            <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
              Step {currentStep + 1}
            </span>
          </div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">{step.prompt.title}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Variable inputs */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Variables</p>
              {step.prompt.variables.length === 0 ? (
                <p className="text-sm text-gray-400">No variables for this step.</p>
              ) : (
                step.prompt.variables.map(v => (
                  <div key={v}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                      {v.replace(/_/g, ' ')}
                    </label>
                    <input
                      type="text"
                      placeholder={`Enter ${v}…`}
                      value={stepValues[v] || ''}
                      onChange={e => setStepValue(v, e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                    />
                  </div>
                ))
              )}
            </div>

            {/* Output preview */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Output</p>
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 min-h-[100px]">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{rendered}</p>
              </div>
              <button
                onClick={handleCopy}
                className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-brand-600 text-white hover:bg-brand-700'
                }`}
              >
                {copied ? '✓ Copied!' : 'Copy This Step'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(i => Math.max(0, i - 1))}
          disabled={currentStep === 0}
          className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-30"
        >
          ← Previous Step
        </button>

        {isLast ? (
          <button
            onClick={() => navigate('/workflows')}
            className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Finish Workflow ✓
          </button>
        ) : (
          <button
            onClick={() => setCurrentStep(i => Math.min(totalSteps - 1, i + 1))}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            Next Step →
          </button>
        )}
      </div>
    </div>
  );
}
