import { useState, useCallback } from 'react';

/**
 * Simple toast notification hook.
 * Usage:
 *   const { toasts, showToast } = useToast();
 *   showToast('Copied!');          // default success
 *   showToast('Error!', 'error');  // error variant
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  return { toasts, showToast };
}
