import { useState } from "react";
import Icon from "../components/Icons.jsx";
import { BasicLogicNotice, EmptyState, ErrorBox, Loading, PageHeader } from "../components/ui.jsx";
import { generateFlashcards } from "../api.js";

export default function Flashcards({ notes, onNavigate }) {
  const [count, setCount] = useState(8);
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const card = cards[index];

  async function handleGenerate() {
    setError("");
    if (!notes.trim()) {
      setError("Your notes are empty. Add some notes first, or load the sample notes.");
      return;
    }
    setLoading(true);
    try {
      const data = await generateFlashcards(notes, count);
      setCards(data.flashcards);
      setIndex(0);
      setFlipped(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function go(step) {
    setFlipped(false);
    setIndex((i) => (i + step + cards.length) % cards.length); // wraps around
  }

  function handleShuffle() {
    const copy = [...cards];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    setCards(copy);
    setIndex(0);
    setFlipped(false);
  }

  function handleKeyDown(e) {
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft") go(-1);
  }

  return (
    <>
      <PageHeader title="Flashcards" subtitle="Flip each card to check your memory." />
      <BasicLogicNotice />

      <section className="card">
        <div className="row row-wrap row-between">
          <div className="field-inline">
            <label htmlFor="card-count" className="field-label">
              Number of cards
            </label>
            <select
              id="card-count"
              className="select"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            >
              {[4, 8, 12, 20].map((n) => (
                <option key={n} value={n}>
                  {n} cards
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
            <Icon name="cards" size={18} /> {cards.length ? "Make new cards" : "Generate flashcards"}
          </button>
        </div>
      </section>

      <ErrorBox message={error} onDismiss={() => setError("")} />
      {loading && <Loading label="Creating your flashcards..." />}

      {!loading && card && (
        <section className="deck">
          <p className="muted deck-count">
            Card {index + 1} of {cards.length}
          </p>

          <button
            className={`flip-card ${flipped ? "flipped" : ""}`}
            onClick={() => setFlipped((f) => !f)}
            onKeyDown={handleKeyDown}
            aria-label={flipped ? "Showing the answer. Select to see the question." : "Showing the question. Select to see the answer."}
          >
            <span className="flip-inner">
              <span className="flip-face flip-front">
                <small>Question</small>
                <span className="flip-text">{card.front}</span>
              </span>
              <span className="flip-face flip-back">
                <small>Answer</small>
                <span className="flip-text">{card.back}</span>
              </span>
            </span>
          </button>

          <div className="row row-wrap deck-controls">
            <button className="btn btn-secondary" onClick={() => go(-1)}>
              <Icon name="left" size={18} /> Previous
            </button>
            <button className="btn btn-primary" onClick={() => setFlipped((f) => !f)}>
              <Icon name="flip" size={18} /> Flip card
            </button>
            <button className="btn btn-secondary" onClick={() => go(1)}>
              Next <Icon name="right" size={18} />
            </button>
            <button className="btn btn-ghost" onClick={handleShuffle}>
              <Icon name="shuffle" size={18} /> Shuffle
            </button>
          </div>
          <p className="muted">Tip: use the left and right arrow keys while a card is selected.</p>
        </section>
      )}

      {!loading && !card && !error && (
        <EmptyState
          title="No flashcards yet"
          text="Choose how many cards you want and select Generate flashcards."
          actionLabel="Edit my notes"
          onAction={() => onNavigate("notes")}
        />
      )}
    </>
  );
}
