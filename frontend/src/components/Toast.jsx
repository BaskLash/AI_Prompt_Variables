/**
 * Toast notification container — renders at bottom-right of screen.
 */
export default function Toast({ toasts }) {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium
            animate-in slide-in-from-bottom-2 duration-200
            ${toast.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-gray-900 text-white'}
          `}
        >
          {toast.type === 'error' ? '✕' : '✓'} {toast.message}
        </div>
      ))}
    </div>
  );
}
