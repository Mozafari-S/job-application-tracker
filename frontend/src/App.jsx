import { useCallback, useEffect, useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Notes from "./pages/Notes.jsx";
import Summary from "./pages/Summary.jsx";
import Quiz from "./pages/Quiz.jsx";
import Flashcards from "./pages/Flashcards.jsx";
import Planner from "./pages/Planner.jsx";
import useLocalStorage from "./hooks/useLocalStorage.js";
import { checkHealth } from "./api.js";
import { SAMPLE_NOTES, SAMPLE_TASKS } from "./sampleData.js";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [status, setStatus] = useState("checking"); // checking | online | offline

  // Data saved in the browser (localStorage)
  const [notes, setNotes] = useLocalStorage("study-assistant:notes", SAMPLE_NOTES);
  const [tasks, setTasks] = useLocalStorage("study-assistant:tasks", SAMPLE_TASKS);
  const [lastScore, setLastScore] = useLocalStorage("study-assistant:last-score", null);

  const pingBackend = useCallback(() => {
    setStatus("checking");
    checkHealth()
      .then(() => setStatus("online"))
      .catch(() => setStatus("offline"));
  }, []);

  useEffect(() => {
    pingBackend();
  }, [pingBackend]);

  function navigate(id) {
    setPage(id);
    window.scrollTo({ top: 0 });
  }

  // Every page stays mounted (just hidden), so generated summaries, quizzes and
  // flashcards are still there when you come back to a page.
  const show = (id) => ({ hidden: page !== id });

  return (
    <div className="app">
      <Sidebar page={page} onNavigate={navigate} status={status} onRetry={pingBackend} />
      <main className="main">
        <div {...show("dashboard")}>
          <Dashboard notes={notes} tasks={tasks} lastScore={lastScore} onNavigate={navigate} />
        </div>
        <div {...show("notes")}>
          <Notes notes={notes} setNotes={setNotes} onNavigate={navigate} />
        </div>
        <div {...show("summary")}>
          <Summary notes={notes} onNavigate={navigate} />
        </div>
        <div {...show("quiz")}>
          <Quiz
            notes={notes}
            onNavigate={navigate}
            onScore={(score, total) => setLastScore({ score, total })}
          />
        </div>
        <div {...show("flashcards")}>
          <Flashcards notes={notes} onNavigate={navigate} />
        </div>
        <div {...show("planner")}>
          <Planner tasks={tasks} setTasks={setTasks} />
        </div>
      </main>
    </div>
  );
}
