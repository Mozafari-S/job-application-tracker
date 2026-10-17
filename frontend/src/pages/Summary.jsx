import { useState } from "react";
import Icon from "../components/Icons.jsx";
import { BasicLogicNotice, EmptyState, ErrorBox, Loading, PageHeader } from "../components/ui.jsx";
import { summarizeText } from "../api.js";
import { copyText } from "../utils.js";

export default function Summary({ notes, onNavigate }) {
  const [length, setLength] = useState(""); // "" means automatic
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleSummarize() {
    setError("");
    setCopied(false);
    if (!notes.trim()) {
      setError("Your notes are empty. Add some notes first, or load the sample notes.");
      return;
    }
    setLoading(true);
    try {
      const data = await summarizeText(notes, length ? Number(length) : undefined);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    const ok = await copyText(result.summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setError("Could not copy automatically. Please select the text and copy it manually.");
    }
  }

  return (
    <>
      <PageHeader title="Summary" subtitle="Get the most important sentences from your notes." />
      <BasicLogicNotice />

      <section className="card">
        <div className="row row-wrap row-between">
          <div className="field-inline">
            <label htmlFor="length" className="field-label">
              Summary length
            </label>
            <select id="length" className="select" value={length} onChange={(e) => setLength(e.target.value)}>
              <option value="">Automatic</option>
              <option value="2">2 sentences</option>
              <option value="3">3 sentences</option>
              <option value="4">4 sentences</option>
              <option value="5">5 sentences</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleSummarize} disabled={loading}>
            <Icon name="summary" size={18} /> {result ? "Summarize again" : "Summarize notes"}
          </button>
        </div>
      </section>

      <ErrorBox message={error} onDismiss={() => setError("")} />
      {loading && <Loading label="Summarizing your notes..." />}

      {!loading && result && (
        <section className="card result-card">
          <div className="row row-between">
            <h2>Your summary</h2>
            <button className="btn btn-secondary btn-small" onClick={handleCopy}>
              <Icon name={copied ? "check" : "copy"} size={16} /> {copied ? "Copied" : "Copy summary"}
            </button>
          </div>
          <p className="summary-text">{result.summary}</p>
          <p className="muted">
            {result.summary_sentences} of {result.original_sentences} sentences · {result.summary_words} of{" "}
            {result.original_words} words
          </p>
        </section>
      )}

      {!loading && !result && !error && (
        <EmptyState
          title="No summary yet"
          text="Choose a length and select Summarize notes."
          actionLabel="Edit my notes"
          onAction={() => onNavigate("notes")}
        />
      )}
    </>
  );
}
