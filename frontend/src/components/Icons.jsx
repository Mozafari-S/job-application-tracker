// Small inline SVG icons (no icon library needed).
const PATHS = {
  home: "M3 11 12 3l9 8M5 9.5V20h5v-6h4v6h5V9.5",
  notes: "M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7",
  summary: "M4 6h16M4 11h16M4 16h10",
  quiz: "M9.5 9a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1 1-1.1 1.8M12 17h.01M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z",
  cards: "M3 8h14v11H3zM7 8V5h14v11h-4",
  planner: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4M9 15l2 2 4-4",
  copy: "M9 9h11v11H9zM5 15V4h11",
  check: "M5 12.5 10 17.5 19 7",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  flip: "M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5",
  left: "M15 5l-7 7 7 7",
  right: "M9 5l7 7-7 7",
  shuffle: "M3 7h4c4 0 6 10 10 10h4M3 17h4c1.5 0 2.7-1.2 3.7-2.8M14 8.8C15 7.2 16 7 17 7h4M18 4l3 3-3 3M18 14l3 3-3 3",
  plus: "M12 5v14M5 12h14",
  spark: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z",
  alert: "M12 8v5M12 16.5h.01M10.3 4.2 2.7 17.5A2 2 0 0 0 4.4 20.5h15.2a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z",
  reset: "M4 12a8 8 0 1 0 2.5-5.8L4 8.5M4 4v4.5h4.5",
};

export default function Icon({ name, size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
