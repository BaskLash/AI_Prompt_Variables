/**
 * Generic empty state component.
 * Props:
 *   icon     — emoji or character to display
 *   title    — heading text
 *   body     — supporting description
 *   action   — optional React node (e.g. a <button> or <Link>)
 */
export default function EmptyState({ icon = '📄', title, body, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
      {body && <p className="text-sm text-gray-500 max-w-xs mb-6">{body}</p>}
      {action}
    </div>
  );
}
