import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Toast from './components/Toast';
import { useToast } from './hooks/useToast';

// Pages
import Dashboard from './pages/Dashboard';
import PromptLibrary from './pages/PromptLibrary';
import PromptEditor from './pages/PromptEditor';
import PromptGenerator from './pages/PromptGenerator';
import WorkflowList from './pages/WorkflowList';
import WorkflowBuilder from './pages/WorkflowBuilder';
import WorkflowRunner from './pages/WorkflowRunner';

/**
 * Root app — sets up routing and passes the toast helper down.
 */
export default function App() {
  const { toasts, showToast } = useToast();

  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard showToast={showToast} />} />

          {/* Prompt routes */}
          <Route path="/prompts" element={<PromptLibrary showToast={showToast} />} />
          <Route path="/prompts/new" element={<PromptEditor showToast={showToast} />} />
          <Route path="/prompts/:id/edit" element={<PromptEditor showToast={showToast} />} />
          <Route path="/prompts/:id/generate" element={<PromptGenerator showToast={showToast} />} />
          {/* Shareable link: /prompt/123 */}
          <Route path="/prompt/:id" element={<PromptGenerator showToast={showToast} />} />

          {/* Workflow routes */}
          <Route path="/workflows" element={<WorkflowList showToast={showToast} />} />
          <Route path="/workflows/new" element={<WorkflowBuilder showToast={showToast} />} />
          <Route path="/workflows/:id/edit" element={<WorkflowBuilder showToast={showToast} />} />
          <Route path="/workflows/:id/run" element={<WorkflowRunner showToast={showToast} />} />

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="px-8 py-20 text-center">
                <p className="text-4xl mb-4">404</p>
                <p className="text-gray-500 text-sm">Page not found.</p>
              </div>
            }
          />
        </Routes>
      </Layout>

      {/* Global toast portal */}
      <Toast toasts={toasts} />
    </>
  );
}
