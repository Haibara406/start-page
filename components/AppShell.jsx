"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import BackgroundEffects from "./BackgroundEffects";
import { ChevronIcon, EngineIcon, LetterIcon, PencilIcon, SearchIcon, SettingsIcon, TrashIcon } from "./icons";
import { backgroundOptions, colorSchemes, defaultBookmarks, defaultSettings, searchEngines, storageKeys } from "../lib/config";
import { getLanguage, translate } from "../lib/i18n";

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
    .map((item, index) => {
      try {
        const url = normalizeUrl(String(item.url || ""));
        return {
          ...item,
          url,
          iconUrl: normalizeIconUrl(item.iconUrl || item.icon || item.icon_uri, url) || preferredIconUrl(url),
          id: item.id || `bm-${Date.now()}-${index}`,
          position: Number.isFinite(item.position) ? item.position : index,
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
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
  const language = getLanguage(settings.language);
  const t = useMemo(() => (key, params) => translate(language, key, params), [language]);

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
    root.lang = language;
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
  }, [settings, hydrated, language]);

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

  function updateLanguage(languageValue) {
    setSettings((current) => ({ ...current, language: getLanguage(languageValue) }));
  }

  function updateBrand(patch) {
    setSettings((current) => ({ ...current, brand: { ...defaultSettings.brand, ...current.brand, ...patch } }));
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
        .map((bookmark) => `    <DT><A HREF="${escapeHtml(bookmark.url)}"${bookmark.iconUrl ? ` ICON="${escapeHtml(bookmark.iconUrl)}"` : ""}>${escapeHtml(bookmark.title)}</A>`)
        .join("\n");
      downloadText(`navir-bookmarks-${Date.now()}.html`, "text/html", `<!DOCTYPE NETSCAPE-Bookmark-file-1>\n<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n<TITLE>Bookmarks</TITLE>\n<H1>Bookmarks</H1>\n<DL><p>\n${rows}\n</DL><p>\n`);
      showToast(t("bookmarksExported"));
      return;
    }
    downloadText(
      `navir-bookmarks-${Date.now()}.json`,
      "application/json",
      JSON.stringify({ version: 1, exportDate: new Date().toISOString(), bookmarks: sorted }, null, 2),
    );
    showToast(t("bookmarksExported"));
  }

  function importBookmarks(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const imported = parseImportedBookmarks(file.name, String(reader.result || ""));
      if (!imported.length) {
        showToast(t("noValidBookmarks"), "error");
        return;
      }
      setBookmarks((current) => {
        const existingUrls = new Set(current.map((bookmark) => normalizeUrl(bookmark.url)));
        const unique = imported.filter((bookmark) => !existingUrls.has(normalizeUrl(bookmark.url)));
        if (!unique.length) {
          showToast(t("allImportedExist"), "error");
          return current;
        }
        showToast(t("importedBookmarks", { count: unique.length }));
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
    reader.onerror = () => showToast(t("failedReadFile"), "error");
    reader.readAsText(file);
  }

  return (
    <main className="app-main">
      <BackgroundEffects effect={settings.appearance.backgroundEffect} showGrid={settings.appearance.showGrid} />
      <div className="content-stage">
        <div className="center-stack">
          <Clock format={settings.appearance.clockFormat} t={t} />
          <SearchBox currentEngine={currentEngine} setCurrentEngineId={setCurrentEngineId} settings={settings} t={t} />
        </div>
      </div>
      <div className="brand-position"><BrandMark brand={settings.brand} /></div>
      <div className="top-actions">
        <button className="round-button" type="button" aria-label={t("openSettings")} onClick={() => setSettingsOpen(true)}><SettingsIcon /></button>
      </div>
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        updateAppearance={updateAppearance}
        updateLanguage={updateLanguage}
        updateBrand={updateBrand}
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
          showToast(t("localDataReset"));
        }}
        t={t}
      />
      <BookmarksModal
        open={bookmarksOpen}
        onClose={() => setBookmarksOpen(false)}
        bookmarks={bookmarks}
        enableBlur={settings.appearance.enableBlur}
        showTitle={settings.bookmarks.showTitle}
        setBookmarks={setBookmarks}
        setFormState={setFormState}
        t={t}
      />
      <BookmarkForm
        key={formState?.id || (formState ? "new" : "closed")}
        formState={formState}
        onClose={() => setFormState(null)}
        t={t}
        onSave={(bookmark) => {
          const url = normalizeUrl(bookmark.url);
          const nextBookmark = { ...bookmark, url, iconUrl: normalizeIconUrl(bookmark.iconUrl, url) || preferredIconUrl(url) };
          setBookmarks((current) => {
            if (bookmark.id) {
              return normalizeBookmarks(current.map((item) => (item.id === bookmark.id ? { ...item, ...nextBookmark } : item)));
            }
            return normalizeBookmarks([...current, { ...nextBookmark, id: `bm-${Date.now()}`, position: current.length, createdAt: new Date().toISOString() }]);
          });
          setFormState(null);
          setBookmarksOpen(true);
        }}
      />
      {toast && <div className={`toast is-${toast.type}`}>{toast.message}</div>}
    </main>
  );
}

function Clock({ format, t }) {
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
      <div className="text-small tracking-widest">{t("localTime")}</div>
      <div className="text-large clock-value">
        {value.hours}<span className="text-accent">:</span>{value.minutes}{value.period && <span className="text-medium clock-period">{value.period}</span>}
      </div>
    </section>
  );
}

function SearchBox({ currentEngine, setCurrentEngineId, settings, t }) {
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
    <section className={`search-row ${focused ? "is-active" : ""}`} aria-label={t("search")}>
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
                  role="menuitem"
                  key={engine.id}
                  onClick={() => {
                    setCurrentEngineId(engine.id);
                    setMenuOpen(false);
                  }}
                >
                  <span className="engine-option-icon"><EngineIcon id={engine.id} size={20} /></span>
                  <span>{engine.name}</span>
                  <span className="engine-option-check">{engine.id === currentEngine.id ? "●" : ""}</span>
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
          aria-label={t("search")}
          placeholder={t("searchPlaceholder")}
          spellCheck={false}
          autoComplete="off"
        />
        <button className="search-submit" type="button" aria-label={t("search")} onClick={runSearch}><SearchIcon /></button>
      </div>
      <div className="search-edge search-edge-right">)</div>
    </section>
  );
}

function BrandMark({ brand }) {
  const ref = useRef(null);
  const brandText = { ...defaultSettings.brand, ...brand };
  useLayoutEffect(() => {
    if (!ref.current) return undefined;
    const context = gsap.context(() => {
      gsap.fromTo(".brand-word", { y: 100, opacity: 0, rotateX: -90 }, { y: 0, opacity: 1, rotateX: 0, duration: 1.2, stagger: 0.15, ease: "expo.out" });
    }, ref);
    return () => {
      context.revert();
    };
  }, [brandText.title, brandText.primaryTag, brandText.secondaryTag]);
  return (
    <div ref={ref} className="brand-mark" aria-label={brandText.title}>
      <h1>
        <div className="brand-word text-hero brand-title">{brandText.title}</div>
        <div className="brand-word text-medium brand-subline">
          <span className="text-inverted">{brandText.primaryTag}</span><span className="text-accent brand-dot">•</span><span>{brandText.secondaryTag}</span>
        </div>
      </h1>
    </div>
  );
}

function SettingsModal({ open, onClose, settings, updateAppearance, updateLanguage, updateBrand, updateSearch, updateBookmarks, exportBookmarks, importBookmarks, resetSettings, resetLocalData, t }) {
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
    ["appearance", t("navAppearance"), "◐"],
    ["personalization", t("navPersonalization"), "✎"],
    ["search", t("navSearch"), "⌕"],
    ["bookmarks", t("navBookmarks"), "★"],
    ["data", t("navData"), "⬡"],
  ];
  return (
    <div ref={backdropRef} className={`modal-layer is-open ${settings.appearance.enableBlur ? "has-blur" : ""}`} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={panelRef} className="settings-modal modal-panel" role="dialog" aria-modal="true">
        <aside className="settings-nav">
          <div className="settings-title">{t("settings")}</div>
          <nav>
            {nav.map(([id, label, icon]) => (
              <button key={id} className={`settings-tab ${active === id ? "is-active" : ""}`} type="button" onClick={() => setActive(id)}>
                <span>{icon}</span><span>{label}</span>
              </button>
            ))}
          </nav>
        </aside>
        <section className="settings-content">
          <button className="modal-close" type="button" aria-label={t("closeSettings")} onClick={onClose}>×</button>
          {active === "appearance" && <AppearanceSettings settings={settings.appearance} update={updateAppearance} t={t} />}
          {active === "personalization" && <PersonalizationSettings settings={settings} updateLanguage={updateLanguage} updateBrand={updateBrand} t={t} />}
          {active === "search" && <SearchSettings settings={settings.search} update={updateSearch} t={t} />}
          {active === "bookmarks" && <BookmarkSettings settings={settings.bookmarks} update={updateBookmarks} t={t} />}
          {active === "data" && (
            <DataSettings
              exportBookmarks={exportBookmarks}
              importBookmarks={importBookmarks}
              resetSettings={resetSettings}
              resetLocalData={resetLocalData}
              t={t}
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

function TextRow({ label, value, placeholder, onChange, maxLength = 28 }) {
  const id = useId();
  return (
    <div className="setting-block">
      <label htmlFor={id}>{label}</label>
      <input id={id} name={id} value={value} maxLength={maxLength} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function Switch({ checked, label, onChange }) {
  return <button className={`switch ${checked ? "is-on" : ""}`} type="button" role="switch" aria-label={label} aria-checked={checked} onClick={() => onChange(!checked)}><span /></button>;
}

function AppearanceSettings({ settings, update, t }) {
  return (
    <div className="settings-section">
      <h2>{t("appearance")}</h2>
      <SelectRow label={t("theme")} value={settings.theme} onChange={(theme) => update({ theme })} options={[{ value: "light", label: t("themeLight") }, { value: "dark", label: t("themeDark") }, { value: "system", label: t("themeSystem") }]} />
      <SelectRow label={t("backgroundEffect")} value={settings.backgroundEffect} onChange={(backgroundEffect) => update({ backgroundEffect })} options={backgroundOptions.map((option) => ({ ...option, label: t(option.labelKey) }))} />
      <SelectRow label={t("clockFormat")} value={settings.clockFormat} onChange={(clockFormat) => update({ clockFormat })} options={[{ value: "24h", label: t("clock24") }, { value: "12h", label: t("clock12") }]} />
      <div className="setting-block">
        <span className="setting-label">{t("colorScheme")}</span>
        <div className="swatch-grid">
          {colorSchemes.map((scheme) => <button key={scheme.value} className={`swatch ${settings.colorScheme === scheme.value ? "is-active" : ""}`} title={scheme.label} style={{ backgroundColor: scheme.color }} onClick={() => update({ colorScheme: scheme.value })} />)}
        </div>
        <p>{colorSchemes.find((scheme) => scheme.value === settings.colorScheme)?.label}</p>
      </div>
      <div className="switch-row"><div><span className="setting-label">{t("gridLines")}</span><p>{t("gridLinesNote")}</p></div><Switch label={t("gridLines")} checked={settings.showGrid} onChange={(showGrid) => update({ showGrid })} /></div>
      <div className="switch-row"><div><span className="setting-label">{t("blurEffect")}</span><p>{t("blurEffectNote")}</p></div><Switch label={t("blurEffect")} checked={settings.enableBlur} onChange={(enableBlur) => update({ enableBlur })} /></div>
    </div>
  );
}

function PersonalizationSettings({ settings, updateLanguage, updateBrand, t }) {
  const brand = { ...defaultSettings.brand, ...settings.brand };
  return (
    <div className="settings-section">
      <h2>{t("personalization")}</h2>
      <SelectRow label={t("language")} value={getLanguage(settings.language)} onChange={updateLanguage} options={[{ value: "en", label: t("languageEnglish") }, { value: "zh", label: t("languageChinese") }]} />
      <TextRow label={t("brandTitle")} value={brand.title} placeholder="HAIBARA" maxLength={24} onChange={(title) => updateBrand({ title })} />
      <TextRow label={t("brandPrimaryTag")} value={brand.primaryTag} placeholder="SEARCH" maxLength={16} onChange={(primaryTag) => updateBrand({ primaryTag })} />
      <TextRow label={t("brandSecondaryTag")} value={brand.secondaryTag} placeholder="DISCOVER" maxLength={16} onChange={(secondaryTag) => updateBrand({ secondaryTag })} />
    </div>
  );
}

function SearchSettings({ settings, update, t }) {
  return (
    <div className="settings-section">
      <h2>{t("search")}</h2>
      <SelectRow label={t("defaultSearchEngine")} value={settings.defaultEngine} onChange={(defaultEngine) => update({ defaultEngine })} options={searchEngines.map((engine) => ({ value: engine.id, label: engine.name }))} />
      <div className="switch-row"><div><span className="setting-label">{t("openInNewTab")}</span><p>{t("openInNewTabNote")}</p></div><Switch label={t("openInNewTab")} checked={settings.openInNewTab} onChange={(openInNewTab) => update({ openInNewTab })} /></div>
    </div>
  );
}

function BookmarkSettings({ settings, update, t }) {
  return (
    <div className="settings-section">
      <h2>{t("bookmarks")}</h2>
      <div className="switch-row"><div><span className="setting-label">{t("showBookmarkTitles")}</span><p>{t("showBookmarkTitlesNote")}</p></div><Switch label={t("showBookmarkTitles")} checked={settings.showTitle} onChange={(showTitle) => update({ showTitle })} /></div>
    </div>
  );
}

function DataSettings({ exportBookmarks, importBookmarks, resetSettings, resetLocalData, t }) {
  const fileInputRef = useRef(null);
  return (
    <div className="settings-section">
      <h2>{t("data")}</h2>
      <div className="setting-card">
        <span className="setting-label">{t("exportBookmarks")}</span>
        <p>{t("exportBookmarksNote")}</p>
        <div className="setting-actions">
          <button className="secondary-action" type="button" onClick={() => exportBookmarks("json")}>{t("exportJson")}</button>
          <button className="secondary-action" type="button" onClick={() => exportBookmarks("html")}>{t("exportHtml")}</button>
        </div>
      </div>
      <div className="setting-card">
        <span className="setting-label">{t("importBookmarks")}</span>
        <p>{t("importBookmarksNote")}</p>
        <button className="secondary-action" type="button" onClick={() => fileInputRef.current?.click()}>{t("chooseFile")}</button>
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
      <div className="setting-card"><span className="setting-label">{t("resetSettings")}</span><p>{t("resetSettingsNote")}</p><button className="secondary-action" type="button" onClick={resetSettings}>{t("resetSettings")}</button></div>
      <div className="setting-card"><span className="setting-label">{t("resetLocalData")}</span><p>{t("resetLocalDataNote")}</p><button className="danger-action" type="button" onClick={resetLocalData}>{t("resetLocalData")}</button></div>
    </div>
  );
}

function BookmarksModal({ open, onClose, bookmarks, enableBlur, showTitle, setBookmarks, setFormState, t }) {
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
  function deleteBookmark(bookmark) {
    if (window.confirm(t("confirmDeleteBookmark", { title: bookmark.title }))) {
      setBookmarks((current) => normalizeBookmarks(current.filter((item) => item.id !== bookmark.id)));
    }
  }
  return (
    <div ref={backdropRef} className={`modal-layer is-open ${enableBlur ? "has-blur" : ""}`} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={panelRef} className="bookmarks-modal modal-panel bookmark-modal" role="dialog" aria-modal="true">
        <BookmarkPattern />
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
              onClick={() => openBookmarkUrl(bookmark.url)}
            >
              <BookmarkVisual key={bookmark.url} bookmark={bookmark} />
              <div className="bookmark-actions">
                <button type="button" aria-label={t("editBookmark")} onClick={(event) => { event.stopPropagation(); setFormState(bookmark); }}><PencilIcon /></button>
                <button type="button" aria-label={t("deleteBookmark")} onClick={(event) => { event.stopPropagation(); deleteBookmark(bookmark); }}><TrashIcon /></button>
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

function BookmarkPattern() {
  const symbols = ["/", "\\", "|", "-", "_", "+", "=", "*", "#", ".", "~", "^", "<", ">"];
  const lines = Array.from({ length: 28 }, (_, rowIndex) => {
    const text = Array.from({ length: 128 }, (_, index) => symbols[(index * 5 + rowIndex * 7) % symbols.length]).join(" ");
    return { id: rowIndex, text, duration: 18 + (rowIndex % 6) * 2.6, offset: rowIndex % 2 === 0 ? "-120px" : "-28px" };
  });
  return (
    <div className="bookmark-pattern" aria-hidden="true">
      <div className="pattern-stage">
        {lines.map((line) => (
          <div className="pattern-line" key={line.id} style={{ "--pattern-duration": `${line.duration}s`, "--pattern-offset": line.offset }}>{line.text}</div>
        ))}
      </div>
    </div>
  );
}

function BookmarkVisual({ bookmark }) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const host = getHostname(bookmark.url);
  const sources = useMemo(() => faviconSources(bookmark.url, bookmark.iconUrl), [bookmark.url, bookmark.iconUrl]);
  if (sourceIndex < sources.length) {
    return (
      <span className="bookmark-icon-shell">
        <img
          className="bookmark-favicon"
          src={sources[sourceIndex]}
          alt=""
          loading="lazy"
          onError={() => setSourceIndex((index) => index + 1)}
        />
      </span>
    );
  }
  return <LetterIcon label={bookmark.title || host} size={42} />;
}

function BookmarkForm({ formState, onClose, onSave, t }) {
  const [draft, setDraft] = useState(() => formState || { title: "", url: "", iconUrl: "" });
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
          <div><span>{t("bookmark")}</span><h2>{draft.id ? t("editBookmarkTitle") : t("addBookmarkTitle")}</h2></div>
          <button className="modal-close" type="button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={(event) => {
          event.preventDefault();
          const url = normalizeUrl(draft.url);
          onSave({ ...draft, url, title: draft.title.trim() || new URL(url).hostname, iconUrl: normalizeIconUrl(draft.iconUrl, url) || preferredIconUrl(url) });
        }}>
          <label>{t("title")}<input name="title" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder={t("titlePlaceholder")} /></label>
          <label>{t("url")}<input name="url" value={draft.url} onChange={(event) => setDraft({ ...draft, url: event.target.value })} onBlur={() => {
            try {
              const url = normalizeUrl(draft.url);
              setDraft((current) => ({ ...current, url, iconUrl: normalizeIconUrl(current.iconUrl, url) || preferredIconUrl(url) }));
            } catch {}
          }} placeholder={t("urlPlaceholder")} required /></label>
          <div className="form-actions"><button className="primary-action" type="submit">{t("save")}</button><button className="secondary-action" type="button" onClick={onClose}>{t("cancel")}</button></div>
        </form>
      </div>
    </div>
  );
}

function faviconSources(url, iconUrl) {
  try {
    const parsed = new URL(normalizeUrl(url));
    const origin = parsed.origin;
    const hostname = parsed.hostname;
    return uniqueUrls([
      normalizeIconUrl(iconUrl, parsed.href),
      preferredIconUrl(url),
      ...domainIconAliases(hostname),
      `${origin}/favicon.ico`,
      `${origin}/favicon.svg`,
      `${origin}/favicon-32x32.png`,
      `${origin}/favicon-16x16.png`,
      `${origin}/icon.svg`,
      `${origin}/apple-touch-icon.png`,
      `${origin}/apple-touch-icon-precomposed.png`,
      `${origin}/apple-touch-icon-180x180.png`,
      `https://icons.duckduckgo.com/ip3/${hostname}.ico`,
      `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=128`,
    ]);
  } catch {
    return [];
  }
}

function preferredIconUrl(url) {
  const host = getHostname(url);
  const defaults = defaultBookmarks.find((bookmark) => getHostname(bookmark.url) === host);
  if (defaults?.iconUrl) return defaults.iconUrl;
  const aliases = domainIconAliases(host);
  return aliases[0] || "";
}

function domainIconAliases(hostname) {
  if (!hostname) return [];
  if (hostname.includes("deepseek.com")) return ["https://www.deepseek.com/favicon.ico"];
  if (hostname.includes("chatgpt.com") || hostname.includes("openai.com")) return [
    "https://icons.duckduckgo.com/ip3/chatgpt.com.ico",
    "https://www.google.com/s2/favicons?domain=chatgpt.com&sz=128",
  ];
  if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) return ["https://www.youtube.com/favicon.ico"];
  return [];
}

function uniqueUrls(urls) {
  return Array.from(new Set(urls.filter(Boolean)));
}

function normalizeIconUrl(iconUrl, pageUrl) {
  const value = String(iconUrl || "").trim();
  if (!value) return "";
  if (/^data:image\/(?:png|jpe?g|gif|webp|svg\+xml|x-icon|vnd\.microsoft\.icon)/i.test(value)) {
    return value;
  }
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  if (value.startsWith("//")) {
    return `https:${value}`;
  }
  try {
    return new URL(value, normalizeUrl(pageUrl)).href;
  } catch {
    return "";
  }
}

function openBookmarkUrl(url) {
  const target = normalizeUrl(url);
  const opened = window.open(target, "_blank");
  if (opened) {
    opened.opener = null;
    return;
  }
  window.location.href = target;
}

function getHostname(url) {
  try {
    return new URL(normalizeUrl(url)).hostname.replace(/^www\./, "");
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
    return normalizeImportedList(anchors.map((anchor) => ({
      title: anchor.textContent?.trim(),
      url: anchor.getAttribute("href"),
      iconUrl: anchor.getAttribute("icon") || anchor.getAttribute("icon_uri"),
    })));
  } catch {
    return [];
  }
}

function normalizeImportedList(list) {
  return list
    .map((bookmark) => {
      try {
        const url = normalizeUrl(String(bookmark.url || bookmark.href || ""));
        const iconUrl = String(bookmark.iconUrl || bookmark.icon || bookmark.icon_uri || "").trim();
        return { title: String(bookmark.title || bookmark.name || new URL(url).hostname).trim(), url, iconUrl: normalizeIconUrl(iconUrl, url) || preferredIconUrl(url) };
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
