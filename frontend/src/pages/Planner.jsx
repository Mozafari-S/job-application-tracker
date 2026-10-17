import { useState } from "react";
import Icon from "../components/Icons.jsx";
import { PageHeader } from "../components/ui.jsx";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "active", label: "To do" },
  { id: "done", label: "Done" },
];

function todayString() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

function formatDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function Planner({ tasks, setTasks }) {
  const [text, setText] = useState("");
  const [due, setDue] = useState("");
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  const doneCount = tasks.filter((t) => t.done).length;
  const percent = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;
  const today = todayString();

  const visible = tasks.filter((t) => (filter === "all" ? true : filter === "done" ? t.done : !t.done));

  function handleAdd(e) {
    e.preventDefault();
    const clean = text.trim();
    if (!clean) {
      setError("Type a task before adding it.");
      return;
    }
    setTasks((prev) => [...prev, { id: Date.now(), text: clean, due, done: false }]);
    setText("");
    setDue("");
    setError("");
  }

  const toggle = (id) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const remove = (id) => setTasks((prev) => prev.filter((t) => t.id !== id));
  const clearDone = () => setTasks((prev) => prev.filter((t) => !t.done));

  return (
    <>
      <PageHeader title="Study planner" subtitle="Write down what to study and tick it off when it is done." />

      <section className="card">
        <form className="task-form" onSubmit={handleAdd}>
          <div className="task-form-main">
            <label htmlFor="task-text" className="field-label">
              New task
            </label>
            <input
              id="task-text"
              className="input"
              type="text"
              maxLength={120}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setError("");
              }}
              placeholder="For example: Review chapter 3"
            />
          </div>
          <div>
            <label htmlFor="task-due" className="field-label">
              Due date (optional)
            </label>
            <input id="task-due" className="input" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </div>
          <button className="btn btn-primary" type="submit">
            <Icon name="plus" size={18} /> Add task
          </button>
        </form>
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
      </section>

      <section className="card">
        <div className="row row-between row-wrap">
          <div className="tabs" role="tablist" aria-label="Filter tasks">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                role="tab"
                aria-selected={filter === f.id}
                className={`tab ${filter === f.id ? "active" : ""}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button className="btn btn-ghost btn-small" onClick={clearDone} disabled={doneCount === 0}>
            Clear completed
          </button>
        </div>

        <div className="progress" aria-label={`${percent}% of tasks completed`}>
          <div className="progress-bar" style={{ width: `${percent}%` }} />
        </div>
        <p className="muted">
          {doneCount} of {tasks.length} tasks completed
        </p>

        {visible.length === 0 ? (
          <p className="empty-line">
            {tasks.length === 0
              ? "No tasks yet. Add your first one above."
              : filter === "done"
              ? "Nothing is completed yet."
              : "Everything is done. Nice work."}
          </p>
        ) : (
          <ul className="task-list">
            {visible.map((t) => (
              <li key={t.id} className={`task ${t.done ? "done" : ""}`}>
                <label className="task-check">
                  <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
                  <span className="task-text">{t.text}</span>
                </label>
                {t.due && (
                  <span className={`due ${!t.done && t.due < today ? "overdue" : ""}`}>
                    {!t.done && t.due < today ? "Overdue · " : "Due "}
                    {formatDate(t.due)}
                  </span>
                )}
                <button className="icon-btn" onClick={() => remove(t.id)} aria-label={`Delete task: ${t.text}`}>
                  <Icon name="trash" size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
