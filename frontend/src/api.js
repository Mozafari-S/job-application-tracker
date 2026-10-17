// All communication with the Flask backend lives in this one file.
//
// The backend address comes from the VITE_API_URL environment variable.
//  - In development we fall back to http://localhost:5001 so it "just works".
//  - In production there is NO fallback: you must set VITE_API_URL (see README).
const API_URL = (
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5001" : "")
).replace(/\/$/, "");

const TIMEOUT_MS = 60000; // free hosting can take ~50 seconds to wake up

async function request(path, options = {}) {
  if (!API_URL) {
    throw new Error(
      "The backend address is not configured. Set the VITE_API_URL environment variable and redeploy."
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, signal: controller.signal });
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("The server took too long to respond. It may be waking up, so please try again in a moment.");
    }
    throw new Error(
      `Cannot reach the backend at ${API_URL}. Make sure it is running (see the README) and try again.`
    );
  } finally {
    clearTimeout(timer);
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // The response was not JSON; handled below.
  }

  if (!response.ok) {
    throw new Error(data?.error || `The server returned an error (${response.status}).`);
  }
  if (data === null) {
    throw new Error("The server sent an unexpected response.");
  }
  return data;
}

function post(path, body) {
  return request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export const checkHealth = () => request("/api/health");
export const summarizeText = (text, sentences) =>
  post("/api/summarize", sentences ? { text, sentences } : { text });
export const generateQuiz = (text, count) => post("/api/generate-quiz", { text, count });
export const generateFlashcards = (text, count) => post("/api/generate-flashcards", { text, count });
export { API_URL };
