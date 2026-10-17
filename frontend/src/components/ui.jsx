import { useEffect, useState } from "react";
import Icon from "./Icons.jsx";

export function PageHeader({ title, subtitle, children }) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {children}
    </header>
  );
}

// Spinner with a helpful hint if the server takes a while (free hosting sleeps).
export function Loading({ label = "Working on it..." }) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="loading" role="status" aria-live="polite">
      <span className="spinner" />
      <div>
        <strong>{label}</strong>
        {slow && (
          <p>This is taking a little longer than usual. A free server can take up to a minute to wake up.</p>
        )}
      </div>
    </div>
  );
}

export function ErrorBox({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="error-box" role="alert">
      <Icon name="alert" />
      <p>{message}</p>
      {onDismiss && (
        <button className="btn btn-ghost btn-small" onClick={onDismiss}>
          Dismiss
        </button>
      )}
    </div>
  );
}

// Reminds users that the generators are simple algorithms, not a real AI model.
export function BasicLogicNotice() {
  return (
    <p className="logic-notice">
      <Icon name="spark" size={16} />
      <span>
        This tool uses basic text-processing logic (word counting and pattern matching), not a real
        AI model. Results work best with clear, well-written notes.
      </span>
    </p>
  );
}

export function EmptyState({ title, text, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{text}</p>
      {actionLabel && (
        <button className="btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
