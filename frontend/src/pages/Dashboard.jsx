import Icon from "../components/Icons.jsx";
import { PageHeader } from "../components/ui.jsx";
import { countWords } from "../utils.js";

export default function Dashboard({ notes, tasks, lastScore, onNavigate }) {
  const words = countWords(notes);
  const done = tasks.filter((t) => t.done).length;

  const tools = [
    { id: "summary", icon: "summary", title: "Summarize", text: "Boil your notes down to the key sentences." },
    { id: "quiz", icon: "quiz", title: "Practice quiz", text: "Test yourself with multiple-choice questions." },
    { id: "flashcards", icon: "cards", title: "Flashcards", text: "Flip through question-and-answer cards." },
    { id: "planner", icon: "planner", title: "Study planner", text: "Track what you need to study next." },
  ];

  return (
    <>
      <PageHeader
        title="Welcome back"
        subtitle="Paste your notes once, then turn them into a summary, a quiz and flashcards."
      />

      <section className="stats">
        <div className="card stat">
          <span className="stat-value">{words.toLocaleString()}</span>
          <span className="stat-label">words in your notes</span>
        </div>
        <div className="card stat">
          <span className="stat-value">
            {done}/{tasks.length}
          </span>
          <span className="stat-label">study tasks completed</span>
        </div>
        <div className="card stat">
          <span className="stat-value">
            {lastScore ? `${Math.round((lastScore.score / lastScore.total) * 100)}%` : "–"}
          </span>
          <span className="stat-label">
            {lastScore ? `last quiz (${lastScore.score} of ${lastScore.total})` : "take a quiz to see your score"}
          </span>
        </div>
      </section>

      <section className="card hero-card">
        <div>
          <h2>Start with your notes</h2>
          <p>
            Everything is built from the text on the Notes page. It is saved in this browser, so it
            will be here next time you open the app.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => onNavigate("notes")}>
          <Icon name="notes" size={18} /> Open notes
        </button>
      </section>

      <section className="tool-grid">
        {tools.map((t) => (
          <button key={t.id} className="card tool-card" onClick={() => onNavigate(t.id)}>
            <span className="tool-icon">
              <Icon name={t.icon} />
            </span>
            <strong>{t.title}</strong>
            <span>{t.text}</span>
          </button>
        ))}
      </section>
    </>
  );
}
