export const searchEngines = [
  { id: "google", name: "Google", icon: "google", searchUrl: "https://www.google.com/search?q={query}", color: "#4285F4" },
  { id: "bing", name: "Bing", icon: "bing", searchUrl: "https://www.bing.com/search?q={query}", color: "#008373" },
  { id: "baidu", name: "Baidu", icon: "baidu", searchUrl: "https://www.baidu.com/s?wd={query}", color: "#2932E1" },
  { id: "bingcn", name: "BingCN", icon: "bing", searchUrl: "https://cn.bing.com/search?q={query}", color: "#008373" },
  { id: "github", name: "GitHub", icon: "github", searchUrl: "https://github.com/search?q={query}", color: "#24292e" },
  { id: "zhihu", name: "Zhihu", icon: "zhihu", searchUrl: "https://www.zhihu.com/search?q={query}", color: "#0084FF" },
  { id: "bilibili", name: "Bilibili", icon: "bilibili", searchUrl: "https://search.bilibili.com/all?keyword={query}", color: "#00A1D6" },
  { id: "duckduckgo", name: "DuckDuckGo", icon: "duckduckgo", searchUrl: "https://duckduckgo.com/?q={query}", color: "#DE5833" },
  { id: "yandex", name: "Yandex", icon: "yandex", searchUrl: "https://yandex.com/search/?text={query}", color: "#FF0000" },
];

export const backgroundOptions = [
  { value: "blob", label: "Blob Animation", labelKey: "bgBlob" },
  { value: "wave", label: "Wave", labelKey: "bgWave" },
  { value: "blob-scatter", label: "Blob Scatter", labelKey: "bgBlobScatter" },
  { value: "layered-peaks", label: "Layered Peaks", labelKey: "bgLayeredPeaks" },
  { value: "layered-steps", label: "Layered Steps", labelKey: "bgLayeredSteps" },
  { value: "world-map", label: "World Map", labelKey: "bgWorldMap" },
  { value: "none", label: "None", labelKey: "bgNone" },
];

export const colorSchemes = [
  { value: "orange", label: "Warm Orange", color: "#FF6B35", hover: "#e85a2b", light: "#ffb798", dark: "#ab2b00", mid: "#d54b1b" },
  { value: "blue", label: "Ocean Blue", color: "#0084FF", hover: "#0066cc", light: "#7fbfff", dark: "#003d75", mid: "#0057a8" },
  { value: "green", label: "Forest Green", color: "#22C55E", hover: "#16a34a", light: "#86efac", dark: "#14532d", mid: "#15803d" },
  { value: "purple", label: "Grape Purple", color: "#A855F7", hover: "#9333ea", light: "#d8b4fe", dark: "#581c87", mid: "#7e22ce" },
  { value: "pink", label: "Rose Pink", color: "#EC4899", hover: "#db2777", light: "#f9a8d4", dark: "#831843", mid: "#be185d" },
  { value: "red", label: "Cherry Red", color: "#EF4444", hover: "#dc2626", light: "#fca5a5", dark: "#7f1d1d", mid: "#b91c1c" },
  { value: "cyan", label: "Turquoise", color: "#06B6D4", hover: "#0891b2", light: "#67e8f9", dark: "#164e63", mid: "#0e7490" },
  { value: "yellow", label: "Sunflower", color: "#EAB308", hover: "#ca8a04", light: "#fde047", dark: "#713f12", mid: "#a16207" },
  { value: "indigo", label: "Midnight Indigo", color: "#6366F1", hover: "#4f46e5", light: "#a5b4fc", dark: "#312e81", mid: "#4338ca" },
  { value: "teal", label: "Mint Teal", color: "#14B8A6", hover: "#0d9488", light: "#5eead4", dark: "#134e4a", mid: "#0f766e" },
  { value: "amber", label: "Golden Amber", color: "#F59E0B", hover: "#d97706", light: "#fcd34d", dark: "#78350f", mid: "#b45309" },
  { value: "slate", label: "Cool Slate", color: "#64748B", hover: "#475569", light: "#cbd5e1", dark: "#1e293b", mid: "#334155" },
];

export const defaultSettings = {
  language: "en",
  brand: {
    title: "HAIBARA",
    primaryTag: "SEARCH",
    secondaryTag: "DISCOVER",
  },
  appearance: {
    theme: "light",
    backgroundEffect: "blob",
    clockFormat: "24h",
    enableBlur: false,
    showGrid: true,
    colorScheme: "orange",
  },
  search: {
    defaultEngine: "google",
    openInNewTab: true,
  },
  bookmarks: {
    showTitle: true,
  },
};

export const defaultBookmarks = [
  { id: "default-1", title: "哔哩哔哩", url: "https://www.bilibili.com", position: 0, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "default-2", title: "ChatGPT", url: "https://chatgpt.com", position: 1, createdAt: "2026-01-01T00:00:01.000Z" },
  { id: "default-3", title: "DeepSeek", url: "https://chat.deepseek.com", position: 2, createdAt: "2026-01-01T00:00:02.000Z" },
  { id: "default-4", title: "网易云音乐", url: "https://music.163.com", position: 3, createdAt: "2026-01-01T00:00:03.000Z" },
  { id: "default-5", title: "GitHub", url: "https://github.com", position: 4, createdAt: "2026-01-01T00:00:04.000Z" },
  { id: "default-6", title: "YouTube", url: "https://www.youtube.com", position: 5, createdAt: "2026-01-01T00:00:05.000Z" },
];

export const storageKeys = {
  settings: "navir_settings",
  bookmarks: "navir_bookmarks",
};
