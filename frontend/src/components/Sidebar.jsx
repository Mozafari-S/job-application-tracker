import Icon from "./Icons.jsx";

export const PAGES = [
  { id: "dashboard", label: "Overview", icon: "home" },
  { id: "notes", label: "Notes", icon: "notes" },
  { id: "summary", label: "Summary", icon: "summary" },
  { id: "quiz", label: "Quiz", icon: "quiz" },
  { id: "flashcards", label: "Cards", icon: "cards" },
  { id: "planner", label: "Planner", icon: "planner" },
];

const STATUS_TEXT = {
  checking: "checking...",
  online: "connected",
  offline: "offline",
};

// A sidebar on large screens, turns into a bottom tab bar on phones and tablets.
export default function Sidebar({ page, onNavigate, status, onRetry }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">
          <Icon name="spark" size={20} />
        </span>
        <span className="brand-name">
          AI Study <br />
          Assistant
        </span>
      </div>

      <nav aria-label="Main">
        {PAGES.map((p) => (
          <button
            key={p.id}
            className={`nav-item ${page === p.id ? "active" : ""}`}
            onClick={() => onNavigate(p.id)}
            aria-current={page === p.id ? "page" : undefined}
          >
            <Icon name={p.icon} />
            <span>{p.label}</span>
          </button>
        ))}
      </nav>

      <div className={`status status-${status}`}>
        <span className="status-dot" />
        <span>
          <span className="status-prefix">Backend </span>
          {STATUS_TEXT[status]}
        </span>
        {status === "offline" && (
          <button className="status-retry" onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    </aside>
  );
}
