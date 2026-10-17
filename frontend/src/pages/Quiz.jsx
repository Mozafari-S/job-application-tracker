import { useState } from "react";
import Icon from "../components/Icons.jsx";
import { BasicLogicNotice, EmptyState, ErrorBox, Loading, PageHeader } from "../components/ui.jsx";
import { generateQuiz } from "../api.js";

const LETTERS = ["A", "B", "C", "D"];

export default function Quiz({ notes, onNavigate, onScore }) {
  const [count, setCount] = useState(5);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({}); // { questionId: chosenOptionIndex }
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const questions = quiz?.questions ?? [];
  const score = questions.filter((q) => answers[q.id] === q.correct_index).length;
  const answeredCount = Object.keys(answers).length;

  async function handleGenerate() {
    setError("");
    if (!notes.trim()) {
      setError("Your notes are empty. Add some notes first, or load the sample notes.");
      return;
    }
    setLoading(true);
    try {
      const data = await generateQuiz(notes, count);
      setQuiz(data);
      setAnswers({});
      setSubmitted(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit() {
    if (answeredCount === 0) {
      setError("Choose at least one answer before checking your score.");
      return;
    }
    setError("");
    setSubmitted(true);
    onScore(score, questions.length);
  }

  function handleRetry() {
    setAnswers({});
    setSubmitted(false);
    setError("");
  }

  function optionClass(q, index) {
    const chosen = answers[q.id] === index;
    if (!submitted) return chosen ? "option selected" : "option";
    if (index === q.correct_index) return "option correct";
    if (chosen) return "option wrong";
    return "option dim";
  }

  return (
    <>
      <PageHeader title="Practice quiz" subtitle="Fill-in-the-blank questions built from your notes." />
      <BasicLogicNotice />

      <section className="card">
        <div className="row row-wrap row-between">
          <div className="field-inline">
            <label htmlFor="quiz-count" className="field-label">
              Number of questions
            </label>
            <select
              id="quiz-count"
              className="select"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            >
              {[3, 5, 8, 10].map((n) => (
                <option key={n} value={n}>
                  {n} questions
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
            <Icon name="quiz" size={18} /> {quiz ? "Make a new quiz" : "Generate quiz"}
          </button>
        </div>
      </section>

      <ErrorBox message={error} onDismiss={() => setError("")} />
      {loading && <Loading label="Building your quiz..." />}

      {!loading && quiz && (
        <>
          {submitted && (
            <section className="card score-card" role="status">
              <div className="score-ring">
                {score}/{questions.length}
              </div>
              <div>
                <h2>
                  {Math.round((score / questions.length) * 100)}%{" "}
                  {score === questions.length ? "· Perfect score" : score >= questions.length / 2 ? "· Nice work" : "· Keep practicing"}
                </h2>
                <p>Correct answers are marked in green. Read each explanation to see the original sentence.</p>
              </div>
            </section>
          )}

          {questions.map((q, qi) => (
            <section className="card question" key={q.id}>
              <h3>
                <span className="q-number">{qi + 1}</span>
                {q.question}
              </h3>
              <div className="options" role="radiogroup" aria-label={`Question ${qi + 1}`}>
                {q.options.map((opt, oi) => (
                  <button
                    key={oi}
                    type="button"
                    role="radio"
                    aria-checked={answers[q.id] === oi}
                    className={optionClass(q, oi)}
                    disabled={submitted}
                    onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: oi }))}
                  >
                    <span className="option-letter">{LETTERS[oi]}</span>
                    {opt}
                  </button>
                ))}
              </div>
              {submitted && (
                <p className="explanation">
                  <strong>
                    {answers[q.id] === q.correct_index
                      ? "Correct. "
                      : answers[q.id] === undefined
                      ? "Not answered. "
                      : "Not quite. "}
                  </strong>
                  Answer: {q.options[q.correct_index]}. From your notes: “{q.explanation}”
                </p>
              )}
            </section>
          ))}

          <div className="row row-wrap">
            {!submitted ? (
              <button className="btn btn-primary" onClick={handleSubmit}>
                <Icon name="check" size={18} /> Check my score ({answeredCount}/{questions.length} answered)
              </button>
            ) : (
              <button className="btn btn-secondary" onClick={handleRetry}>
                <Icon name="reset" size={18} /> Try the same quiz again
              </button>
            )}
          </div>
        </>
      )}

      {!loading && !quiz && !error && (
        <EmptyState
          title="No quiz yet"
          text="Choose how many questions you want and select Generate quiz."
          actionLabel="Edit my notes"
          onAction={() => onNavigate("notes")}
        />
      )}
    </>
  );
}
