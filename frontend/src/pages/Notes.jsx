import Icon from "../components/Icons.jsx";
import { PageHeader } from "../components/ui.jsx";
import { SAMPLE_NOTES } from "../sampleData.js";
import { countWords } from "../utils.js";

export default function Notes({ notes, setNotes, onNavigate }) {
  const words = countWords(notes);

  function handleClear() {
    if (!notes.trim() || window.confirm("Clear all of your notes? This cannot be undone.")) {
      setNotes("");
    }
  }

  function handleSample() {
    if (!notes.trim() || window.confirm("Replace your current notes with the sample notes?")) {
      setNotes(SAMPLE_NOTES);
    }
  }

  return (
    <>
      <PageHeader
        title="Study notes"
        subtitle="Type or paste what you are studying. Your notes save automatically in this browser."
      />

      <section className="card">
        <label htmlFor="notes-input" className="field-label">
          Your notes
        </label>
        <textarea
          id="notes-input"
          className="textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Paste your notes here. Full sentences work best, for example: Photosynthesis is the process plants use to make food."
          rows={14}
        />
        <div className="row row-between">
          <span className="muted">
            {words.toLocaleString()} {words === 1 ? "word" : "words"} · saved in this browser
          </span>
          <div className="row">
            <button className="btn btn-ghost" onClick={handleSample}>
              Load sample notes
            </button>
            <button className="btn btn-ghost btn-danger-text" onClick={handleClear}>
              <Icon name="trash" size={18} /> Clear
            </button>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>What do you want to make?</h2>
        <div className="row row-wrap">
          <button className="btn btn-primary" onClick={() => onNavigate("summary")}>
            Summarize
          </button>
          <button className="btn btn-secondary" onClick={() => onNavigate("quiz")}>
            Make a quiz
          </button>
          <button className="btn btn-secondary" onClick={() => onNavigate("flashcards")}>
            Make flashcards
          </button>
        </div>
      </section>
    </>
  );
}
