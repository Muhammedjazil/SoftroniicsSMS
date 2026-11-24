import React, { useState, useCallback } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi';
import './Toast.css';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    if (!message) return;
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const ToastContainer = useCallback(
    () => (
      <div className="ui-toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`ui-toast-item ui-toast--${t.type}`}>
            <div className="ui-toast-icon">
              {t.type === 'success' && <FiCheckCircle />}
              {t.type === 'error' && <FiAlertCircle />}
              {t.type === 'warning' && <FiAlertTriangle />}
              {t.type === 'info' && <FiInfo />}
            </div>
            <div className="ui-toast-message">{t.message}</div>
            <button
              type="button"
              className="ui-toast-close"
              onClick={() => removeToast(t.id)}
              aria-label="Close notification"
            >
              <FiX />
            </button>
          </div>
        ))}
      </div>
    ),
    [toasts, removeToast]
  );

  return { showToast, ToastContainer };
};

export default useToast;
