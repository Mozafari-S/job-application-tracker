import { useEffect, useState } from "react";

// Works like useState, but the value is also saved in the browser's localStorage,
// so it is still there after a page refresh.
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = window.localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue; // storage blocked or corrupted: start fresh
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage may be full or disabled (private mode). The app still works.
    }
  }, [key, value]);

  return [value, setValue];
}
