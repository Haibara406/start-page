"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import BackgroundEffects from "./BackgroundEffects";
import { ChevronIcon, EngineIcon, PencilIcon, SearchIcon, SettingsIcon, TrashIcon } from "./icons";
import { backgroundOptions, colorSchemes, defaultBookmarks, defaultSettings, searchEngines, storageKeys } from "../lib/config";

function deepMerge(base, incoming) {
  const output = Array.isArray(base) ? [...base] : { ...base };
  Object.keys(incoming || {}).forEach((key) => {
    const sourceValue = incoming[key];
    const baseValue = base?.[key];
    if (sourceValue && typeof sourceValue === "object" && !Array.isArray(sourceValue) && baseValue && typeof baseValue === "object" && !Array.isArray(baseValue)) {
      output[key] = deepMerge(baseValue, sourceValue);
      return;
    }
    output[key] = sourceValue;
  });
  return output;
}

function readJson(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function normalizeBookmarks(items) {
  return [...items]
    .map((item, index) => ({ ...item, id: item.id || `bm-${Date.now()}-${index}`, position: Number.isFinite(item.position) ? item.position : index }))
    .sort((a, b) => a.position - b.position)
    .map((item, index) => ({ ...item, position: index }));
}

export default function AppShell() {
  const [settings, setSettings] = useState(defaultSettings);
  const [bookmarks, setBookmarks] = useState(defaultBookmarks);
  const [currentEngineId, setCurrentEngineId] = useState(defaultSettings.search.defaultEngine);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const [formState, setFormState] = useState(null);
  const [toast, setToast] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const storedSettings = deepMerge(defaultSettings, readJson(storageKeys.settings, {}));
      setSettings(storedSettings);
      setBookmarks(normalizeBookmarks(readJson(storageKeys.bookmarks, defaultBookmarks)));
      setCurrentEngineId(storedSettings.search.defaultEngine);
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const scheme = colorSchemes.find((item) => item.value === settings.appearance.colorScheme) || colorSchemes[0];
    const root = document.documentElement;
    root.dataset.colorScheme = scheme.value;
    root.style.setProperty("--color-accent", scheme.color);
    root.style.setProperty("--color-accent-hover", scheme.hover);
    root.style.setProperty("--color-accent-light", scheme.light);
    root.style.setProperty("--color-accent-dark", scheme.dark);
    root.style.setProperty("--color-accent-mid", scheme.mid);
    const applyTheme = () => {
      const useDark = settings.appearance.theme === "dark" || (settings.appearance.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      root.classList.toggle("dark", useDark);
      root.classList.add("theme-ready");
    };
    applyTheme();
    if (hydrated) {
      writeJson(storageKeys.settings, settings);
    }
    if (settings.appearance.theme === "system") {
      const query = window.matchMedia("(prefers-color-scheme: dark)");
      query.addEventListener("change", applyTheme);
      return () => query.removeEventListener("change", applyTheme);
    }
  }, [settings, hydrated]);

  useEffect(() => {
    if (hydrated) {
      writeJson(storageKeys.bookmarks, bookmarks);
    }
  }, [bookmarks, hydrated]);

  useEffect(() => {
    const syncViewport = () => setIsMobile(window.innerWidth < 768);
    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  useEffect(() => {
    const close = (event) => {
      if (event.key === "Escape") {
        setSettingsOpen(false);
        setBookmarksOpen(false);
        setFormState(null);
      }
      const target = event.target;
      const editable = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || target?.isContentEditable;
      if (!editable && event.key === "/") {
        event.preventDefault();
        document.getElementById("search-input")?.focus();
      }
      if ((event.metaKey || event.ctrlKey) && event.key === ",") {
        event.preventDefault();
        setSettingsOpen(true);
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b") {
        event.preventDefault();
        setBookmarksOpen(true);
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  useEffect(() => {
    const isInteractiveTarget = (target) =>
      target?.closest?.("button, a, input, select, textarea, [role='button'], [role='dialog'], .engine-menu, .modal-layer");
    const openFromContext = (event) => {
      if (isInteractiveTarget(event.target)) return;
      event.preventDefault();
      setBookmarksOpen(true);
    };
    const toggleFromMobileTap = (event) => {
      if (!isMobile || isInteractiveTarget(event.target)) return;
      setBookmarksOpen((open) => !open);
    };
    document.addEventListener("contextmenu", openFromContext);
    document.addEventListener("click", toggleFromMobileTap);
    return () => {
      document.removeEventListener("contextmenu", openFromContext);
      document.removeEventListener("click", toggleFromMobileTap);
    };
  }, [isMobile]);

  useEffect(() => () => window.clearTimeout(toastTimerRef.current), []);

  const currentEngine = searchEngines.find((engine) => engine.id === currentEngineId) || searchEngines[0];

  function updateAppearance(patch) {
    setSettings((current) => ({ ...current, appearance: { ...current.appearance, ...patch } }));
  }

  function updateSearch(patch) {
    setSettings((current) => ({ ...current, search: { ...current.search, ...patch } }));
    if (patch.defaultEngine) {
      setCurrentEngineId(patch.defaultEngine);
    }
  }

  function updateBookmarksSettings(patch) {
    setSettings((current) => ({ ...current, bookmarks: { ...current.bookmarks, ...patch } }));
  }

  function showToast(message, type = "success") {
    setToast({ message, type });
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2400);
  }

  function exportBookmarks(format) {
    const sorted = [...bookmarks].sort((a, b) => a.position - b.position);
    if (format === "html") {
      const rows = sorted
        .map((bookmark) => `    <DT><A HREF="${escapeHtml(bookmark.url)}">${escapeHtml(bookmark.title)}</A>`)
        .join("\n");
      downloadText(`navir-bookmarks-${Date.now()}.html`, "text/html", `<!DOCTYPE NETSCAPE-Bookmark-file-1>\n<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n<TITLE>Bookmarks</TITLE>\n<H1>Bookmarks</H1>\n<DL><p>\n${rows}\n</DL><p>\n`);
      showToast("Bookmarks exported.");
      return;
    }
    downloadText(
      `navir-bookmarks-${Date.now()}.json`,
      "application/json",
      JSON.stringify({ version: 1, exportDate: new Date().toISOString(), bookmarks: sorted }, null, 2),
    );
    showToast("Bookmarks exported.");
  }

  function importBookmarks(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const imported = parseImportedBookmarks(file.name, String(reader.result || ""));
      if (!imported.length) {
        showToast("No valid bookmarks found.", "error");
        return;
      }
      setBookmarks((current) => {
        const existingUrls = new Set(current.map((bookmark) => normalizeUrl(bookmark.url)));
        const unique = imported.filter((bookmark) => !existingUrls.has(normalizeUrl(bookmark.url)));
        if (!unique.length) {
          showToast("All imported bookmarks already exist.", "error");
          return current;
        }
        showToast(`Imported ${unique.length} bookmarks.`);
        const startIndex = current.length;
        return normalizeBookmarks([
          ...current,
          ...unique.map((bookmark, index) => ({
            ...bookmark,
            id: `bm-${Date.now()}-${index}`,
            position: startIndex + index,
            createdAt: new Date().toISOString(),
          })),
        ]);
      });
    };
    reader.onerror = () => showToast("Failed to read file.", "error");
    reader.readAsText(file);
  }

  return (
    <main className="app-main">
      <BackgroundEffects effect={settings.appearance.backgroundEffect} showGrid={settings.appearance.showGrid} />
      <div className="content-stage">
        <div className="center-stack">
          <Clock format={settings.appearance.clockFormat} />
          <SearchBox currentEngine={currentEngine} setCurrentEngineId={setCurrentEngineId} settings={settings} />
        </div>
      </div>
      <div className="brand-position"><BrandMark /></div>
      <div className="top-actions">
        <button className="round-button" type="button" aria-label="Open settings" onClick={() => setSettingsOpen(true)}><SettingsIcon /></button>
      </div>
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        updateAppearance={updateAppearance}
        updateSearch={updateSearch}
        updateBookmarks={updateBookmarksSettings}
        exportBookmarks={exportBookmarks}
        importBookmarks={importBookmarks}
        resetSettings={() => {
          setSettings(defaultSettings);
          setCurrentEngineId(defaultSettings.search.defaultEngine);
        }}
        resetLocalData={() => {
          setSettings(defaultSettings);
          setBookmarks(defaultBookmarks);
          setCurrentEngineId(defaultSettings.search.defaultEngine);
          showToast("Local data reset.");
        }}
      />
      <BookmarksModal
        open={bookmarksOpen}
        onClose={() => setBookmarksOpen(false)}
        bookmarks={bookmarks}
        enableBlur={settings.appearance.enableBlur}
        showTitle={settings.bookmarks.showTitle}
        setBookmarks={setBookmarks}
        setFormState={setFormState}
      />
      <BookmarkForm
        key={formState?.id || (formState ? "new" : "closed")}
        formState={formState}
        onClose={() => setFormState(null)}
        onSave={(bookmark) => {
          setBookmarks((current) => {
            if (bookmark.id) {
              return normalizeBookmarks(current.map((item) => (item.id === bookmark.id ? { ...item, ...bookmark } : item)));
            }
            return normalizeBookmarks([...current, { ...bookmark, id: `bm-${Date.now()}`, position: current.length, createdAt: new Date().toISOString() }]);
          });
          setFormState(null);
          setBookmarksOpen(true);
        }}
      />
      {toast && <div className={`toast is-${toast.type}`}>{toast.message}</div>}
    </main>
  );
}

function Clock({ format }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const value = useMemo(() => {
    if (format !== "12h") {
      return { hours: String(now.getHours()).padStart(2, "0"), minutes: String(now.getMinutes()).padStart(2, "0"), period: null };
    }
    const hours = now.getHours() % 12 || 12;
    return { hours: String(hours).padStart(2, "0"), minutes: String(now.getMinutes()).padStart(2, "0"), period: now.getHours() >= 12 ? "PM" : "AM" };
  }, [now, format]);
  return (
    <section className="clock-block" aria-live="polite">
      <div className="text-small tracking-widest">LOCAL TIME</div>
      <div className="text-large clock-value">
        {value.hours}<span className="text-accent">:</span>{value.minutes}{value.period && <span className="text-medium clock-period">{value.period}</span>}
      </div>
    </section>
  );
}

function SearchBox({ currentEngine, setCurrentEngineId, settings }) {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  function runSearch() {
    const trimmed = query.trim();
    if (!trimmed) return;
    const targetUrl = currentEngine.searchUrl.replace("{query}", encodeURIComponent(trimmed));
    if (settings.search.openInNewTab) {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
      return;
    }
    window.location.href = targetUrl;
  }

  return (
    <section className={`search-row ${focused ? "is-active" : ""}`} aria-label="Search">
      <div className="search-edge search-edge-left">(</div>
      <div className="search-panel">
        <div className="engine-picker">
          <button className="engine-trigger" type="button" aria-haspopup="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
            <EngineIcon id={currentEngine.id} size={24} />
            <ChevronIcon open={menuOpen} />
          </button>
          {menuOpen && (
            <div className="engine-menu" role="menu">
              {searchEngines.map((engine) => (
                <button
                  className={`engine-option ${engine.id === currentEngine.id ? "is-active" : ""}`}
                  type="button"
                  key={engine.id}
                  onClick={() => {
                    setCurrentEngineId(engine.id);
                    setMenuOpen(false);
                  }}
                >
                  <span className="engine-option-icon"><EngineIcon id={engine.id} size={20} /></span>
                  <span>{engine.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <input
          id="search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(event) => event.key === "Enter" && runSearch()}
          type="text"
          placeholder="TYPE YOUR QUERY"
          spellCheck={false}
          autoComplete="off"
        />
        <button className="search-submit" type="button" aria-label="Search" onClick={runSearch}><SearchIcon /></button>
      </div>
      <div className="search-edge search-edge-right">)</div>
    </section>
  );
}

function BrandMark() {
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (!ref.current) return undefined;
    const context = gsap.context(() => {
      gsap.fromTo(".brand-word", { y: 100, opacity: 0, rotateX: -90 }, { y: 0, opacity: 1, rotateX: 0, duration: 1.2, stagger: 0.15, ease: "expo.out" });
    }, ref);
    return () => {
      context.revert();
    };
  }, []);
  return (
    <div ref={ref} className="brand-mark" aria-label="Haibara">
      <h1>
        <div className="brand-word text-hero">HAIBARA</div>
        <div className="brand-word text-medium brand-subline">
          <span className="text-inverted">SEARCH</span><span className="text-accent brand-dot">•</span><span>DISCOVER</span>
        </div>
      </h1>
    </div>
  );
}

function SettingsModal({ open, onClose, settings, updateAppearance, updateSearch, updateBookmarks, exportBookmarks, importBookmarks, resetSettings, resetLocalData }) {
  const [active, setActive] = useState("appearance");
  const backdropRef = useRef(null);
  const panelRef = useRef(null);
  useLayoutEffect(() => {
    if (!open || !backdropRef.current || !panelRef.current) return undefined;
    const context = gsap.context(() => {
      gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(panelRef.current, { scale: 0.9, opacity: 0, y: 30 }, { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "expo.out" });
    });
    return () => context.revert();
  }, [open]);
  if (!open) return null;
  const nav = [
    ["appearance", "APPEARANCE", "◐"],
    ["search", "SEARCH", "⌕"],
    ["bookmarks", "BOOKMARKS", "★"],
    ["data", "DATA", "⬡"],
  ];
  return (
    <div ref={backdropRef} className={`modal-layer is-open ${settings.appearance.enableBlur ? "has-blur" : ""}`} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={panelRef} className="settings-modal modal-panel" role="dialog" aria-modal="true">
        <aside className="settings-nav">
          <div className="settings-title">Settings</div>
          <nav>
            {nav.map(([id, label, icon]) => (
              <button key={id} className={`settings-tab ${active === id ? "is-active" : ""}`} type="button" onClick={() => setActive(id)}>
                <span>{icon}</span><span>{label}</span>
              </button>
            ))}
          </nav>
        </aside>
        <section className="settings-content">
          <button className="modal-close" type="button" aria-label="Close settings" onClick={onClose}>×</button>
          {active === "appearance" && <AppearanceSettings settings={settings.appearance} update={updateAppearance} />}
          {active === "search" && <SearchSettings settings={settings.search} update={updateSearch} />}
          {active === "bookmarks" && <BookmarkSettings settings={settings.bookmarks} update={updateBookmarks} />}
          {active === "data" && (
            <DataSettings
              exportBookmarks={exportBookmarks}
              importBookmarks={importBookmarks}
              resetSettings={resetSettings}
              resetLocalData={resetLocalData}
            />
          )}
        </section>
      </div>
    </div>
  );
}

function SelectRow({ label, value, options, onChange }) {
  const id = useId();
  return (
    <div className="setting-block">
      <label htmlFor={id}>{label}</label>
      <select id={id} name={id} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
  );
}

function Switch({ checked, label, onChange }) {
  return <button className={`switch ${checked ? "is-on" : ""}`} type="button" role="switch" aria-label={label} aria-checked={checked} onClick={() => onChange(!checked)}><span /></button>;
}

function AppearanceSettings({ settings, update }) {
  return (
    <div className="settings-section">
      <h2>Appearance</h2>
      <SelectRow label="Theme" value={settings.theme} onChange={(theme) => update({ theme })} options={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }, { value: "system", label: "System" }]} />
      <SelectRow label="Background Effect" value={settings.backgroundEffect} onChange={(backgroundEffect) => update({ backgroundEffect })} options={backgroundOptions} />
      <SelectRow label="Clock Format" value={settings.clockFormat} onChange={(clockFormat) => update({ clockFormat })} options={[{ value: "24h", label: "24-Hour (14:30)" }, { value: "12h", label: "12-Hour (2:30 PM)" }]} />
      <div className="setting-block">
        <span className="setting-label">Color Scheme</span>
        <div className="swatch-grid">
          {colorSchemes.map((scheme) => <button key={scheme.value} className={`swatch ${settings.colorScheme === scheme.value ? "is-active" : ""}`} title={scheme.label} style={{ backgroundColor: scheme.color }} onClick={() => update({ colorScheme: scheme.value })} />)}
        </div>
        <p>{colorSchemes.find((scheme) => scheme.value === settings.colorScheme)?.label}</p>
      </div>
      <div className="switch-row"><div><span className="setting-label">Grid Lines</span><p>Show background grid lines</p></div><Switch label="Grid Lines" checked={settings.showGrid} onChange={(showGrid) => update({ showGrid })} /></div>
      <div className="switch-row"><div><span className="setting-label">Blur Effect</span><p>Enable backdrop blur (may affect performance on mobile)</p></div><Switch label="Blur Effect" checked={settings.enableBlur} onChange={(enableBlur) => update({ enableBlur })} /></div>
    </div>
  );
}

function SearchSettings({ settings, update }) {
  return (
    <div className="settings-section">
      <h2>Search</h2>
      <SelectRow label="Default Search Engine" value={settings.defaultEngine} onChange={(defaultEngine) => update({ defaultEngine })} options={searchEngines.map((engine) => ({ value: engine.id, label: engine.name }))} />
      <div className="switch-row"><div><span className="setting-label">Open in New Tab</span><p>Open search results in a new browser tab</p></div><Switch label="Open in New Tab" checked={settings.openInNewTab} onChange={(openInNewTab) => update({ openInNewTab })} /></div>
    </div>
  );
}

function BookmarkSettings({ settings, update }) {
  return (
    <div className="settings-section">
      <h2>Bookmarks</h2>
      <div className="switch-row"><div><span className="setting-label">Show Bookmark Titles</span><p>Display title text below bookmark icons</p></div><Switch label="Show Bookmark Titles" checked={settings.showTitle} onChange={(showTitle) => update({ showTitle })} /></div>
    </div>
  );
}

function DataSettings({ exportBookmarks, importBookmarks, resetSettings, resetLocalData }) {
  const fileInputRef = useRef(null);
  return (
    <div className="settings-section">
      <h2>Data</h2>
      <div className="setting-card">
        <span className="setting-label">Export Bookmarks</span>
        <p>Download your current bookmarks as JSON or Netscape HTML.</p>
        <div className="setting-actions">
          <button className="secondary-action" type="button" onClick={() => exportBookmarks("json")}>Export JSON</button>
          <button className="secondary-action" type="button" onClick={() => exportBookmarks("html")}>Export HTML</button>
        </div>
      </div>
      <div className="setting-card">
        <span className="setting-label">Import Bookmarks</span>
        <p>Append bookmarks from JSON or HTML. Duplicate URLs are skipped.</p>
        <button className="secondary-action" type="button" onClick={() => fileInputRef.current?.click()}>Choose File</button>
        <input
          ref={fileInputRef}
          className="hidden-file-input"
          type="file"
          name="bookmark-import"
          accept=".json,.html,.htm,application/json,text/html"
          onChange={(event) => {
            importBookmarks(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </div>
      <div className="setting-card"><span className="setting-label">Reset Settings</span><p>Restore display and search preferences.</p><button className="secondary-action" type="button" onClick={resetSettings}>Reset Settings</button></div>
      <div className="setting-card"><span className="setting-label">Reset Local Data</span><p>Restore default settings and bookmarks.</p><button className="danger-action" type="button" onClick={resetLocalData}>Reset Local Data</button></div>
    </div>
  );
}

function BookmarksModal({ open, onClose, bookmarks, enableBlur, showTitle, setBookmarks, setFormState }) {
  const [dragging, setDragging] = useState(null);
  const backdropRef = useRef(null);
  const panelRef = useRef(null);
  useLayoutEffect(() => {
    if (!open || !backdropRef.current || !panelRef.current) return undefined;
    const context = gsap.context(() => {
      gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(panelRef.current, { scale: 0.9, opacity: 0, y: 50 }, { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "expo.out" });
    });
    return () => context.revert();
  }, [open]);
  if (!open) return null;
  const sorted = [...bookmarks].sort((a, b) => a.position - b.position);
  function reorder(targetId) {
    if (!dragging || dragging === targetId) return;
    const ids = sorted.map((item) => item.id);
    const from = ids.indexOf(dragging);
    const to = ids.indexOf(targetId);
    ids.splice(to, 0, ids.splice(from, 1)[0]);
    setBookmarks(ids.map((id, index) => ({ ...bookmarks.find((item) => item.id === id), position: index })));
  }
  return (
    <div ref={backdropRef} className={`modal-layer is-open ${enableBlur ? "has-blur" : ""}`} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={panelRef} className="bookmarks-modal modal-panel bookmark-modal" role="dialog" aria-modal="true">
        <div className="bookmark-pattern" />
        <div className="bookmarks-grid">
          {sorted.map((bookmark) => (
            <article
              key={bookmark.id}
              className={`bookmark-card ${dragging === bookmark.id ? "is-dragging" : ""}`}
              draggable
              onDragStart={() => setDragging(bookmark.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => reorder(bookmark.id)}
              onDragEnd={() => setDragging(null)}
              onDoubleClick={() => window.open(bookmark.url, "_blank", "noopener,noreferrer")}
            >
              <img src={faviconUrl(bookmark.url)} alt="" />
              <div className="bookmark-actions">
                <button type="button" aria-label="Edit bookmark" onClick={() => setFormState(bookmark)}><PencilIcon /></button>
                <button type="button" aria-label="Delete bookmark" onClick={() => setBookmarks((current) => normalizeBookmarks(current.filter((item) => item.id !== bookmark.id)))}><TrashIcon /></button>
              </div>
              {showTitle && <p>{bookmark.title}</p>}
            </article>
          ))}
          <button className="bookmark-add-card" type="button" onClick={() => setFormState({ title: "", url: "" })}>+</button>
        </div>
      </div>
    </div>
  );
}

function BookmarkForm({ formState, onClose, onSave }) {
  const [draft, setDraft] = useState(() => formState || { title: "", url: "" });
  const panelRef = useRef(null);
  useLayoutEffect(() => {
    if (!formState || !panelRef.current) return undefined;
    const context = gsap.context(() => {
      gsap.fromTo(panelRef.current, { scale: 0.94, opacity: 0, y: 24 }, { scale: 1, opacity: 1, y: 0, duration: 0.32, ease: "expo.out" });
    });
    return () => context.revert();
  }, [formState]);
  if (!formState) return null;
  return (
    <div className="modal-layer is-open">
      <div ref={panelRef} className="form-modal modal-panel" role="dialog" aria-modal="true">
        <div className="form-header">
          <div><span>BOOKMARK</span><h2>{draft.id ? "Edit Bookmark" : "Add Bookmark"}</h2></div>
          <button className="modal-close" type="button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={(event) => {
          event.preventDefault();
          const url = normalizeUrl(draft.url);
          onSave({ ...draft, url, title: draft.title.trim() || new URL(url).hostname });
        }}>
          <label>Title<input name="title" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="My Website" /></label>
          <label>URL<input name="url" value={draft.url} onChange={(event) => setDraft({ ...draft, url: event.target.value })} placeholder="https://example.com" required /></label>
          <div className="form-actions"><button className="primary-action" type="submit">Save</button><button className="secondary-action" type="button" onClick={onClose}>Cancel</button></div>
        </form>
      </div>
    </div>
  );
}

function faviconUrl(url) {
  try {
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(new URL(normalizeUrl(url)).hostname)}&sz=64`;
  } catch {
    return "";
  }
}

function normalizeUrl(url) {
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function downloadText(filename, type, text) {
  const blob = new Blob([text], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function parseImportedBookmarks(filename, text) {
  try {
    if (filename.toLowerCase().endsWith(".json")) {
      const parsed = JSON.parse(text);
      const list = Array.isArray(parsed) ? parsed : parsed.bookmarks;
      return normalizeImportedList(list || []);
    }
    const parsedDocument = new DOMParser().parseFromString(text, "text/html");
    const anchors = Array.from(parsedDocument.querySelectorAll("a[href]"));
    return normalizeImportedList(anchors.map((anchor) => ({ title: anchor.textContent?.trim(), url: anchor.getAttribute("href") })));
  } catch {
    return [];
  }
}

function normalizeImportedList(list) {
  return list
    .map((bookmark) => {
      try {
        const url = normalizeUrl(String(bookmark.url || bookmark.href || ""));
        return { title: String(bookmark.title || bookmark.name || new URL(url).hostname).trim(), url };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
