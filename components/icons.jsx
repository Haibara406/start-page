export function EngineIcon({ id, size = 24 }) {
  switch (id) {
    case "google":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
      );
    case "github":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.02c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18.92-.26 1.91-.38 2.89-.39.98.01 1.97.13 2.89.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.35.78 1.05.78 2.12v3.15c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
        </svg>
      );
    case "bing":
    case "bingcn":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 2.8v18.4l5.3-3.2 7.7 4.2V6.1l-7.6 2.3L5 2.8Z" fill="#008373" />
          <path d="M11.7 10.9 18 8.8v9.5l-6.3-3.5v-3.9Z" fill="#00BCF2" />
          <path d="m5 2.8 5.4 5.6 1.3 2.5v3.9L5 21.2V2.8Z" fill="#00A4EF" opacity="0.9" />
        </svg>
      );
    case "baidu":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="7" cy="8" r="2" fill="#2932E1" />
          <circle cx="17" cy="8" r="2" fill="#2932E1" />
          <circle cx="12" cy="5" r="2" fill="#2932E1" />
          <circle cx="5" cy="12" r="1.8" fill="#2932E1" />
          <circle cx="19" cy="12" r="1.8" fill="#2932E1" />
          <path d="M6 15c0-2 1.4-3.6 3.4-3.6h5.2c2 0 3.4 1.6 3.4 3.6v2.6c0 1.7-1.4 2.8-3.4 2.8H9.4C7.4 20.4 6 19.3 6 17.6V15Z" fill="#2932E1" />
        </svg>
      );
    case "zhihu":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 4h8v2H8.6v4H11v2H8.4c-.2 2.6-1.1 5.3-3.2 7.8L3.5 18c1.6-1.9 2.4-3.9 2.6-6H3.5v-2h2.7V6H3V4Z" fill="#0084FF" />
          <path d="M12.5 4H21v15h-2.2l-.6-1.7-1.5 2H14l2.7-3.5h-4.2V4Zm2.2 2v7.8h4.1V6h-4.1Z" fill="#0084FF" />
        </svg>
      );
    case "bilibili":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path d="m8 4 2.2 2.7M16 4l-2.2 2.7" stroke="#00A1D6" strokeWidth="2" strokeLinecap="round" />
          <rect x="3.5" y="7" width="17" height="13" rx="3" fill="#00A1D6" />
          <circle cx="9" cy="12" r="1.2" fill="#fff" />
          <circle cx="15" cy="12" r="1.2" fill="#fff" />
          <path d="M8.5 16h7" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "duckduckgo":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="10" fill="#DE5833" />
          <ellipse cx="12" cy="13" rx="5.8" ry="5.2" fill="#fff" />
          <ellipse cx="10" cy="11" rx="1.7" ry="2.2" fill="#2D4F8E" />
          <ellipse cx="15" cy="12" rx="1.4" ry="1.9" fill="#2D4F8E" />
          <circle cx="10.5" cy="10.4" r="0.65" fill="#fff" />
          <path d="M8.5 16.1c1.8 1 4.7 1 6.4-.1" stroke="#DE5833" strokeWidth="1.4" strokeLinecap="round" />
          <ellipse cx="14.2" cy="7.9" rx="3.1" ry="1.9" fill="#65BC46" />
        </svg>
      );
    case "yandex":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="4" fill="#FF0000" />
          <path d="M13.6 18.5v-7.6L16.5 5.5h-2.8l-3.1 5.8V5.5H8v13h2.6v-4.9l3.3 4.9h2.9l-3.2-4.8Z" fill="#fff" />
        </svg>
      );
    default:
      return (
        <span className="engine-letter" aria-hidden="true">
          {id === "baidu" ? "百" : id === "zhihu" ? "知" : id === "bilibili" ? "B" : id === "duckduckgo" ? "D" : id === "yandex" ? "Y" : "B"}
        </span>
      );
  }
}

export function BookmarkSiteIcon({ id, size = 42 }) {
  if (id === "openai") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect width="48" height="48" rx="10" fill="#111" />
        <path d="M24 10.5c3.2 0 5.9 1.7 7.3 4.3 3 .4 5.2 2.9 5.2 6 0 1.3-.4 2.5-1.1 3.5.7 1 1.1 2.2 1.1 3.5 0 3.1-2.3 5.7-5.3 6-1.4 2.6-4.1 4.2-7.2 4.2-1.3 0-2.6-.3-3.7-.9-1 .6-2.2.9-3.5.9-3.4 0-6.2-2.8-6.2-6.2 0-1.3.4-2.5 1.1-3.5-.7-1-1.1-2.2-1.1-3.5 0-3.4 2.8-6.2 6.2-6.2 1.2 0 2.4.4 3.4 1 1.1-.6 2.4-.9 3.8-.9Z" stroke="#fff" strokeWidth="2" />
        <path d="M18 20.2 24 16l6 4.2v7.6L24 32l-6-4.2v-7.6Z" stroke="#fff" strokeWidth="2" />
      </svg>
    );
  }
  if (id === "deepseek") {
    return <LetterIcon size={size} label="D" bg="#102A43" fg="#67E8F9" />;
  }
  if (id === "netease") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
        <rect width="48" height="48" rx="10" fill="#D81E06" />
        <path d="M17 28.2c0-5.5 4.7-9.8 10.5-8.4-1-2.2-3.3-3.6-6-3.6-4.8 0-8.5 3.7-8.5 8.4 0 5.1 4.2 9.2 9.8 9.2 6.8 0 11.2-5.2 11.2-11.5 0-3.9-1.9-7.8-5.3-9.8" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        <circle cx="24" cy="27" r="4" fill="#fff" />
      </svg>
    );
  }
  if (id === "youtube") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
        <rect width="48" height="48" rx="10" fill="#FF0000" />
        <path d="M20 16.5 32 24 20 31.5v-15Z" fill="#fff" />
      </svg>
    );
  }
  if (id === "bilibili") return <EngineIcon id="bilibili" size={size} />;
  if (id === "github") return <EngineIcon id="github" size={size} />;
  return null;
}

export function LetterIcon({ label, size = 42, bg = "var(--color-accent)", fg = "#fff" }) {
  return (
    <span className="bookmark-letter-icon" style={{ width: size, height: size, background: bg, color: fg }} aria-hidden="true">
      {String(label || "?").slice(0, 1).toUpperCase()}
    </span>
  );
}

export function SettingsIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

export function ChevronIcon({ open }) {
  return (
    <svg className={open ? "chevron is-open" : "chevron"} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 15H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}
