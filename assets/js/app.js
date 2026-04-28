(function () {
    const {
        searchEngines,
        accentSchemes,
        backgroundOptions,
        settingsTabs,
        defaultBookmarks,
        defaultSettings,
    } = window.StartPageConfig;
    const storage = window.StartPageStorage;

    const state = {
        settings: storage.readSettings(),
        bookmarks: normalizeBookmarks(storage.readBookmarks()),
        activeSettingsTab: "appearance",
        currentEngineId: null,
        openModal: null,
        draggedBookmarkId: null,
        toastTimerIds: [],
    };

    const elements = {};
    let clockTimer = null;
    let mediaThemeListener = null;
    let typewriterTimer = null;
    let typewriterActive = false;
    let typewriterAbort = 0;
    const typewriterWords = ["BROWSE", "SEARCH", "SURF", "QUERY", "DISCOVER", "EXPLORE"];
    const typewriterPositions = [
        { left: "50%", top: "28%" },
        { left: "22%", top: "58%" },
        { left: "72%", top: "67%" },
        { left: "56%", top: "18%" },
    ];

    document.addEventListener("DOMContentLoaded", init);

    function init() {
        cacheElements();
        seedDefaultBookmarksIfNeeded();
        ensureSessionEngine();
        bindEvents();
        applyAppearance();
        renderEngine();
        renderSettingsNav();
        renderSettingsContent();
        renderBookmarkPattern();
        renderBookmarks();
        tickClock();
        clockTimer = window.setInterval(tickClock, 1000);
    }

    function cacheElements() {
        elements.searchShell = document.querySelector(".search-shell");
        elements.searchInput = document.getElementById("search-input");
        elements.searchSubmit = document.getElementById("search-submit");
        elements.engineTrigger = document.getElementById("engine-trigger");
        elements.engineBadge = document.getElementById("engine-badge");
        elements.engineLabel = document.getElementById("engine-label");
        elements.engineMenu = document.getElementById("engine-menu");
        elements.clockHours = document.getElementById("clock-hours");
        elements.clockMinutes = document.getElementById("clock-minutes");
        elements.clockPeriod = document.getElementById("clock-period");
        elements.settingsButton = document.getElementById("settings-button");
        elements.settingsModal = document.getElementById("settings-modal");
        elements.bookmarksModal = document.getElementById("bookmarks-modal");
        elements.bookmarkFormModal = document.getElementById("bookmark-form-modal");
        elements.settingsNav = document.getElementById("settings-nav");
        elements.settingsContent = document.getElementById("settings-content");
        elements.bookmarkPattern = document.getElementById("bookmark-pattern");
        elements.bookmarksGrid = document.getElementById("bookmarks-grid");
        elements.bookmarkForm = document.getElementById("bookmark-form");
        elements.bookmarkFormTitle = document.getElementById("bookmark-form-title");
        elements.bookmarkId = document.getElementById("bookmark-id");
        elements.bookmarkTitle = document.getElementById("bookmark-title");
        elements.bookmarkUrl = document.getElementById("bookmark-url");
        elements.toastStack = document.getElementById("toast-stack");
        elements.importFileInput = document.getElementById("import-file-input");
        elements.backgroundTyper = document.getElementById("background-typer");
    }

    function bindEvents() {
        elements.searchInput.addEventListener("focus", () => {
            elements.searchShell.classList.add("is-active");
        });
        elements.searchInput.addEventListener("blur", () => {
            elements.searchShell.classList.remove("is-active");
        });
        elements.searchInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                runSearch();
            }
        });
        elements.searchSubmit.addEventListener("click", runSearch);

        elements.engineTrigger.addEventListener("click", toggleEngineMenu);
        document.addEventListener("click", handleDocumentClick);

        elements.settingsButton.addEventListener("click", () => openModal("settings"));
        document.querySelectorAll("[data-close-modal]").forEach((button) => {
            button.addEventListener("click", (event) => {
                closeModal(event.currentTarget.getAttribute("data-close-modal"));
            });
        });

        document.querySelectorAll(".modal-layer").forEach((modal) => {
            modal.addEventListener("click", (event) => {
                if (event.target === modal) {
                    closeModal(modal.getAttribute("data-modal"));
                }
            });
        });

        window.addEventListener("keydown", handleGlobalKeys);
        document.addEventListener("contextmenu", handleGlobalContextMenu);
        elements.settingsNav.addEventListener("click", handleSettingsNavClick);
        elements.settingsContent.addEventListener("click", handleSettingsContentClick);
        elements.settingsContent.addEventListener("change", handleSettingsContentChange);
        elements.settingsContent.addEventListener("input", handleSettingsContentInput);

        elements.bookmarkForm.addEventListener("submit", handleBookmarkSubmit);
        elements.bookmarkUrl.addEventListener("blur", autofillBookmarkTitle);

        elements.bookmarksGrid.addEventListener("click", handleBookmarksGridClick);
        elements.bookmarksGrid.addEventListener("dragstart", handleBookmarkDragStart);
        elements.bookmarksGrid.addEventListener("dragover", handleBookmarkDragOver);
        elements.bookmarksGrid.addEventListener("dragleave", handleBookmarkDragLeave);
        elements.bookmarksGrid.addEventListener("drop", handleBookmarkDrop);
        elements.bookmarksGrid.addEventListener("dragend", handleBookmarkDragEnd);

        elements.importFileInput.addEventListener("change", handleImportFileChange);
        window.addEventListener("resize", debounce(renderBookmarkPattern, 120));
        document.addEventListener("visibilitychange", handleVisibilityChange);

        window.addEventListener("storage", (event) => {
            if (event.key === window.StartPageConfig.storageKeys.settings) {
                state.settings = storage.readSettings();
                ensureSessionEngine();
                applyAppearance();
                renderEngine();
                renderSettingsContent();
            }
            if (event.key === window.StartPageConfig.storageKeys.bookmarks) {
                state.bookmarks = normalizeBookmarks(storage.readBookmarks());
                renderBookmarks();
            }
        });
    }

    function seedDefaultBookmarksIfNeeded() {
        if (state.bookmarks.length > 0) {
            return;
        }
        state.bookmarks = normalizeBookmarks(
            defaultBookmarks.map((bookmark, index) => ({
                id: createId(),
                title: bookmark.title,
                url: bookmark.url,
                position: index,
            })),
        );
        storage.writeBookmarks(state.bookmarks);
    }

    function ensureSessionEngine() {
        const preferredId = state.settings.search.defaultEngine;
        const engineExists = searchEngines.some((engine) => engine.id === state.currentEngineId);
        if (!engineExists) {
            state.currentEngineId = preferredId;
        }
        if (!findEngine(state.currentEngineId)) {
            state.currentEngineId = searchEngines[0].id;
        }
    }

    function applyAppearance() {
        const appearance = state.settings.appearance;
        const scheme = accentSchemes.find((item) => item.id === appearance.colorScheme) || accentSchemes[0];
        const backgroundEffect = normalizeBackgroundEffect(appearance.backgroundEffect);
        document.documentElement.style.setProperty("--accent", scheme.value);
        document.documentElement.style.setProperty("--accent-strong", darkenColor(scheme.value, 0.18));
        document.documentElement.style.setProperty("--accent-soft", mixColorWithWhite(scheme.value, 0.58));
        document.documentElement.style.setProperty("--accent-muted", hexToRgba(scheme.value, 0.18));
        document.documentElement.style.setProperty("--accent-glow", hexToRgba(scheme.value, 0.24));
        document.documentElement.dataset.background = backgroundEffect;
        document.documentElement.dataset.grid = appearance.showGrid ? "on" : "off";
        document.documentElement.dataset.blur = appearance.enableBlur ? "on" : "off";
        applyResolvedTheme(appearance.theme);
        updateTypewriterState(backgroundEffect);
    }

    function applyResolvedTheme(themeMode) {
        const apply = () => {
            const resolved = resolveTheme(themeMode);
            document.documentElement.dataset.theme = resolved;
        };
        if (mediaThemeListener) {
            mediaThemeListener.query.removeEventListener("change", mediaThemeListener.listener);
            mediaThemeListener = null;
        }
        apply();
        if (themeMode === "system") {
            const query = window.matchMedia("(prefers-color-scheme: dark)");
            const listener = () => apply();
            query.addEventListener("change", listener);
            mediaThemeListener = { query, listener };
        }
    }

    function resolveTheme(themeMode) {
        if (themeMode === "dark") {
            return "dark";
        }
        if (themeMode === "light") {
            return "light";
        }
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    function renderEngine() {
        const engine = findEngine(state.currentEngineId) || searchEngines[0];
        elements.engineBadge.innerHTML = engineIconMarkup(engine.id);
        elements.engineLabel.textContent = engine.name;

        elements.engineMenu.innerHTML = searchEngines
            .map((item) => {
                const isActive = item.id === engine.id;
                return `
                    <button
                        class="engine-option${isActive ? " is-active" : ""}"
                        type="button"
                        role="menuitemradio"
                        aria-checked="${isActive ? "true" : "false"}"
                        data-engine-id="${item.id}"
                    >
                        <span class="engine-badge engine-badge-option">${engineIconMarkup(item.id)}</span>
                        <span class="engine-option-name">${escapeHtml(item.name)}</span>
                        <span class="engine-option-check">${isActive ? "●" : ""}</span>
                    </button>
                `;
            })
            .join("");
    }

    function renderSettingsNav() {
        elements.settingsNav.innerHTML = `
            <h2 class="settings-nav-heading">Settings</h2>
            <div class="settings-nav-list">
                ${settingsTabs
                    .map((tab) => {
                        const isActive = tab.id === state.activeSettingsTab;
                        return `
                            <button
                                class="settings-tab${isActive ? " is-active" : ""}"
                                type="button"
                                data-settings-tab="${tab.id}"
                            >
                                <span class="settings-tab-mark">${tab.mark}</span>
                                <span class="settings-tab-label">${escapeHtml(tab.label)}</span>
                            </button>
                        `;
                    })
                    .join("")}
            </div>
        `;
    }

    function renderSettingsContent() {
        switch (state.activeSettingsTab) {
            case "appearance":
                elements.settingsContent.innerHTML = renderAppearanceSettings();
                break;
            case "search":
                elements.settingsContent.innerHTML = renderSearchSettings();
                break;
            case "bookmarks":
                elements.settingsContent.innerHTML = renderBookmarkSettings();
                break;
            case "data":
                elements.settingsContent.innerHTML = renderDataSettings();
                break;
            default:
                elements.settingsContent.innerHTML = "";
        }
    }

    function renderAppearanceSettings() {
        const settings = state.settings.appearance;
        const backgroundEffect = normalizeBackgroundEffect(settings.backgroundEffect);
        return `
            <section class="settings-section">
                <div>
                    <span class="modal-kicker">DISPLAY</span>
                    <h2>Appearance</h2>
                </div>
                <div class="settings-list">
                    <article class="setting-card">
                        <label class="setting-card-label" for="setting-theme">Theme</label>
                        <select id="setting-theme" class="setting-select" data-setting-path="appearance.theme">
                            ${renderOptions(
                                [
                                    { value: "light", label: "Light" },
                                    { value: "dark", label: "Dark" },
                                    { value: "system", label: "System" },
                                ],
                                settings.theme,
                            )}
                        </select>
                    </article>
                    <article class="setting-card">
                        <label class="setting-card-label" for="setting-background">Background Effect</label>
                        <select id="setting-background" class="setting-select" data-setting-path="appearance.backgroundEffect">
                            ${renderOptions(
                                backgroundOptions.map((item) => ({ value: item.id, label: item.label })),
                                backgroundEffect,
                            )}
                        </select>
                    </article>
                    <article class="setting-card">
                        <label class="setting-card-label" for="setting-clock-format">Clock Format</label>
                        <select id="setting-clock-format" class="setting-select" data-setting-path="appearance.clockFormat">
                            ${renderOptions(
                                [
                                    { value: "24h", label: "24-Hour" },
                                    { value: "12h", label: "12-Hour" },
                                ],
                                settings.clockFormat,
                            )}
                        </select>
                    </article>
                    <article class="setting-card">
                        <span class="setting-card-label">Color Scheme</span>
                        <div class="swatch-grid">
                            ${accentSchemes
                                .map((item) => {
                                    const activeClass = item.id === settings.colorScheme ? " is-active" : "";
                                    return `
                                        <button
                                            class="swatch${activeClass}"
                                            type="button"
                                            data-color-scheme="${item.id}"
                                            style="background:${item.value}"
                                            title="${escapeHtml(item.label)}"
                                        ></button>
                                    `;
                                })
                                .join("")}
                        </div>
                        <div class="swatch-label">${escapeHtml(
                            (accentSchemes.find((item) => item.id === settings.colorScheme) || accentSchemes[0]).label,
                        )}</div>
                    </article>
                    <article class="setting-card">
                        <div class="control-row">
                            <div>
                                <div class="setting-card-label">Grid Lines</div>
                                <div class="setting-card-note">Show background grid lines.</div>
                            </div>
                            ${renderSwitch("appearance.showGrid", settings.showGrid)}
                        </div>
                    </article>
                    <article class="setting-card">
                        <div class="control-row">
                            <div>
                                <div class="setting-card-label">Blur Effect</div>
                                <div class="setting-card-note">Use backdrop blur on panels and modals.</div>
                            </div>
                            ${renderSwitch("appearance.enableBlur", settings.enableBlur)}
                        </div>
                    </article>
                </div>
            </section>
        `;
    }

    function renderSearchSettings() {
        const settings = state.settings.search;
        return `
            <section class="settings-section">
                <div>
                    <span class="modal-kicker">QUERY</span>
                    <h2>Search</h2>
                </div>
                <div class="settings-list">
                    <article class="setting-card">
                        <label class="setting-card-label" for="setting-default-engine">Default Search Engine</label>
                        <select id="setting-default-engine" class="setting-select" data-setting-path="search.defaultEngine">
                            ${renderOptions(
                                searchEngines.map((item) => ({ value: item.id, label: item.name })),
                                settings.defaultEngine,
                            )}
                        </select>
                    </article>
                    <article class="setting-card">
                        <div class="control-row">
                            <div>
                                <div class="setting-card-label">Open In New Tab</div>
                                <div class="setting-card-note">Send results to a new browser tab.</div>
                            </div>
                            ${renderSwitch("search.openInNewTab", settings.openInNewTab)}
                        </div>
                    </article>
                </div>
            </section>
        `;
    }

    function renderBookmarkSettings() {
        const settings = state.settings.bookmarks;
        return `
            <section class="settings-section">
                <div>
                    <span class="modal-kicker">BOARD</span>
                    <h2>Bookmarks</h2>
                </div>
                <div class="settings-list">
                    <article class="setting-card">
                        <div class="control-row">
                            <div>
                                <div class="setting-card-label">Show Bookmark Titles</div>
                                <div class="setting-card-note">Display title text below bookmark icons.</div>
                            </div>
                            ${renderSwitch("bookmarks.showTitle", settings.showTitle)}
                        </div>
                    </article>
                </div>
            </section>
        `;
    }

    function renderDataSettings() {
        return `
            <section class="settings-section">
                <div>
                    <span class="modal-kicker">LOCAL</span>
                    <h2>Data</h2>
                </div>
                <div class="settings-list">
                    <article class="setting-card">
                        <div class="setting-card-label">Export Bookmarks</div>
                        <div class="setting-card-note">Download your current bookmarks as JSON or Netscape HTML.</div>
                        <div class="data-actions">
                            <button class="secondary-button" type="button" data-export-format="json">Export JSON</button>
                            <button class="secondary-button" type="button" data-export-format="html">Export HTML</button>
                        </div>
                    </article>
                    <article class="setting-card">
                        <div class="setting-card-label">Import Bookmarks</div>
                        <div class="setting-card-note">Append bookmarks from JSON or Netscape HTML. Duplicate URLs are skipped.</div>
                        <div class="data-actions">
                            <button class="secondary-button" type="button" data-action="import-bookmarks">Choose File</button>
                        </div>
                    </article>
                    <article class="setting-card">
                        <div class="setting-card-label">Reset Local Data</div>
                        <div class="setting-card-note">Clear local settings and bookmarks and restore the default state.</div>
                        <div class="data-actions">
                            <button class="primary-button danger-button" type="button" data-action="reset-local-data">Reset Local Data</button>
                        </div>
                    </article>
                </div>
            </section>
        `;
    }

    function renderBookmarkPattern() {
        if (!elements.bookmarkPattern) {
            return;
        }
        const symbols = ["/", "\\", "|", "-", "_", "+", "=", "*", "#", ".", "~", "^", "<", ">"];
        const host = elements.bookmarksModal.querySelector(".bookmarks-modal");
        const width = host?.clientWidth || window.innerWidth;
        const height = host?.clientHeight || window.innerHeight;
        const rows = Math.max(22, Math.ceil(height / 24));
        const cols = Math.max(96, Math.ceil(width / 10));

        const markup = Array.from({ length: rows }, (_, rowIndex) => {
            const text = Array.from(
                { length: cols },
                () => symbols[Math.floor(Math.random() * symbols.length)],
            ).join(" ");
            const duration = 18 + (rowIndex % 6) * 2.6;
            const offset = rowIndex % 2 === 0 ? "-120px" : "-28px";
            return `<div class="pattern-line" style="--pattern-duration:${duration}s; --pattern-offset:${offset}">${escapeHtml(text)}</div>`;
        }).join("");

        elements.bookmarkPattern.innerHTML = `<div class="pattern-stage">${markup}</div>`;
    }

    function renderBookmarks() {
        const items = state.bookmarks;
        const sorted = [...items].sort((left, right) => left.position - right.position);
        const cards = sorted
            .map((bookmark) => renderBookmarkCard(bookmark))
            .join("");
        const emptyState =
            sorted.length === 0
                ? `<div class="empty-state">No bookmarks yet.</div>`
                : "";

        elements.bookmarksGrid.innerHTML = `
            ${cards}
            <button class="bookmark-add-card" type="button" data-bookmark-action="add">
                <span aria-hidden="true">+</span>
            </button>
            ${emptyState}
        `;
    }

    function renderBookmarkCard(bookmark) {
        const favicon = getFaviconUrl(bookmark.url);
        const showTitle = state.settings.bookmarks.showTitle;
        return `
            <article
                class="bookmark-card"
                data-bookmark-id="${bookmark.id}"
                draggable="true"
            >
                <div class="bookmark-card-body">
                    <div class="bookmark-card-top">
                        <img class="bookmark-favicon" src="${favicon}" alt="" loading="lazy" />
                        <div class="bookmark-actions">
                            <button
                                class="bookmark-action"
                                type="button"
                                aria-label="Edit bookmark"
                                data-bookmark-action="edit"
                                data-bookmark-id="${bookmark.id}"
                            >
                                ${iconPencil()}
                            </button>
                            <button
                                class="bookmark-action"
                                type="button"
                                aria-label="Delete bookmark"
                                data-bookmark-action="delete"
                                data-bookmark-id="${bookmark.id}"
                            >
                                ${iconTrash()}
                            </button>
                        </div>
                    </div>
                    ${
                        showTitle
                            ? `<p class="bookmark-title">${escapeHtml(bookmark.title)}</p>`
                            : ""
                    }
                    <span class="bookmark-url">${escapeHtml(getHostname(bookmark.url))}</span>
                </div>
            </article>
        `;
    }

    function renderOptions(options, selectedValue) {
        return options
            .map((option) => {
                const selected = option.value === selectedValue ? " selected" : "";
                return `<option value="${escapeHtml(option.value)}"${selected}>${escapeHtml(option.label)}</option>`;
            })
            .join("");
    }

    function renderSwitch(path, checked) {
        return `
            <button
                class="switch${checked ? " is-on" : ""}"
                type="button"
                role="switch"
                aria-checked="${checked ? "true" : "false"}"
                data-switch-path="${path}"
            ></button>
        `;
    }

    function runSearch() {
        const query = elements.searchInput.value.trim();
        if (!query) {
            elements.searchInput.focus();
            return;
        }
        const engine = findEngine(state.currentEngineId) || searchEngines[0];
        const targetUrl = engine.searchUrl.replace("{query}", encodeURIComponent(query));
        if (state.settings.search.openInNewTab) {
            window.open(targetUrl, "_blank", "noopener,noreferrer");
            return;
        }
        window.location.href = targetUrl;
    }

    function toggleEngineMenu(event) {
        event.stopPropagation();
        const hidden = elements.engineMenu.hasAttribute("hidden");
        if (hidden) {
            elements.engineMenu.removeAttribute("hidden");
            elements.engineTrigger.setAttribute("aria-expanded", "true");
            return;
        }
        closeEngineMenu();
    }

    function closeEngineMenu() {
        elements.engineMenu.setAttribute("hidden", "");
        elements.engineTrigger.setAttribute("aria-expanded", "false");
    }

    function handleDocumentClick(event) {
        if (elements.engineMenu.hasAttribute("hidden")) {
            return;
        }
        const insideTrigger = elements.engineTrigger.contains(event.target);
        const insideMenu = elements.engineMenu.contains(event.target);
        if (!insideTrigger && !insideMenu) {
            closeEngineMenu();
            return;
        }
        const option = event.target.closest("[data-engine-id]");
        if (!option) {
            return;
        }
        state.currentEngineId = option.getAttribute("data-engine-id");
        renderEngine();
        closeEngineMenu();
    }

    function openModal(name) {
        state.openModal = name;
        document.body.classList.add("modal-open");
        getModalElement(name).classList.add("is-open");
        getModalElement(name).setAttribute("aria-hidden", "false");
        if (name === "bookmarks") {
            renderBookmarkPattern();
            renderBookmarks();
        }
        if (name === "settings") {
            renderSettingsNav();
            renderSettingsContent();
        }
    }

    function closeModal(name) {
        const modal = getModalElement(name);
        if (modal.contains(document.activeElement)) {
            const focusTarget = name === "settings" ? elements.settingsButton : document.body;
            focusTarget.focus({ preventScroll: true });
        }
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        if (state.openModal === name) {
            state.openModal = null;
        }
        if (!document.querySelector(".modal-layer.is-open")) {
            document.body.classList.remove("modal-open");
        }
        if (name === "bookmark-form") {
            elements.bookmarkForm.reset();
            elements.bookmarkId.value = "";
        }
    }

    function getModalElement(name) {
        if (name === "settings") return elements.settingsModal;
        if (name === "bookmarks") return elements.bookmarksModal;
        return elements.bookmarkFormModal;
    }

    function handleGlobalKeys(event) {
        if (event.key === "Escape" && state.openModal) {
            closeModal(state.openModal);
            return;
        }

        const target = event.target;
        const isEditable =
            target instanceof HTMLInputElement ||
            target instanceof HTMLTextAreaElement ||
            target instanceof HTMLSelectElement ||
            target?.isContentEditable;

        if (!isEditable && event.key === "/") {
            event.preventDefault();
            elements.searchInput.focus();
        }

        if ((event.metaKey || event.ctrlKey) && event.key === ",") {
            event.preventDefault();
            openModal("settings");
        }

        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b") {
            event.preventDefault();
            openModal("bookmarks");
        }
    }

    function handleSettingsNavClick(event) {
        const button = event.target.closest("[data-settings-tab]");
        if (!button) {
            return;
        }
        state.activeSettingsTab = button.getAttribute("data-settings-tab");
        renderSettingsNav();
        renderSettingsContent();
    }

    function handleSettingsContentClick(event) {
        const switchButton = event.target.closest("[data-switch-path]");
        if (switchButton) {
            const path = switchButton.getAttribute("data-switch-path");
            updateSettingByPath(path, switchButton.getAttribute("aria-checked") !== "true");
            return;
        }

        const swatch = event.target.closest("[data-color-scheme]");
        if (swatch) {
            updateSettingByPath("appearance.colorScheme", swatch.getAttribute("data-color-scheme"));
            return;
        }

        const exportButton = event.target.closest("[data-export-format]");
        if (exportButton) {
            exportBookmarks(exportButton.getAttribute("data-export-format"));
            return;
        }

        const actionButton = event.target.closest("[data-action]");
        if (!actionButton) {
            return;
        }

        const action = actionButton.getAttribute("data-action");
        if (action === "import-bookmarks") {
            elements.importFileInput.click();
            return;
        }
        if (action === "reset-local-data") {
            resetLocalData();
        }
    }

    function handleSettingsContentChange(event) {
        const select = event.target.closest("[data-setting-path]");
        if (!select) {
            return;
        }
        updateSettingByPath(select.getAttribute("data-setting-path"), select.value);
    }

    function handleSettingsContentInput(event) {
        const input = event.target.closest("[data-setting-input]");
        if (!input) {
            return;
        }
        updateSettingByPath(input.getAttribute("data-setting-input"), input.value);
    }

    function updateSettingByPath(path, value) {
        const [section, key] = path.split(".");
        state.settings = storage.deepMerge(state.settings, {
            [section]: {
                [key]: value,
            },
        });
        storage.writeSettings(state.settings);
        if (path === "search.defaultEngine") {
            state.currentEngineId = value;
            renderEngine();
        }
        applyAppearance();
        renderSettingsNav();
        renderSettingsContent();
        renderBookmarks();
    }

    function tickClock() {
        const now = new Date();
        const mode = state.settings.appearance.clockFormat;
        let hours = now.getHours();
        let period = "";
        if (mode === "12h") {
            period = hours >= 12 ? "PM" : "AM";
            hours = hours % 12 || 12;
        }
        elements.clockHours.textContent = String(hours).padStart(2, "0");
        elements.clockMinutes.textContent = String(now.getMinutes()).padStart(2, "0");
        elements.clockPeriod.textContent = period;
    }

    function openBookmarkForm(bookmark) {
        elements.bookmarkFormTitle.textContent = bookmark ? "Edit Bookmark" : "Add Bookmark";
        elements.bookmarkId.value = bookmark ? bookmark.id : "";
        elements.bookmarkTitle.value = bookmark ? bookmark.title : "";
        elements.bookmarkUrl.value = bookmark ? bookmark.url : "";
        openModal("bookmark-form");
        window.setTimeout(() => {
            elements.bookmarkTitle.focus();
        }, 0);
    }

    function handleBookmarkSubmit(event) {
        event.preventDefault();
        const id = elements.bookmarkId.value;
        const title = elements.bookmarkTitle.value.trim();
        const url = normalizeUrl(elements.bookmarkUrl.value.trim());

        if (!title || !url) {
            showToast("Title and URL are required.", "error");
            return;
        }

        if (id) {
            state.bookmarks = state.bookmarks.map((bookmark) =>
                bookmark.id === id ? { ...bookmark, title, url } : bookmark,
            );
            showToast("Bookmark updated.", "success");
        } else {
            const duplicate = state.bookmarks.some((bookmark) => bookmark.url === url);
            if (duplicate) {
                showToast("This URL already exists.", "error");
                return;
            }
            state.bookmarks.push({
                id: createId(),
                title,
                url,
                position: state.bookmarks.length,
            });
            showToast("Bookmark added.", "success");
        }

        persistBookmarks();
        renderBookmarks();
        closeModal("bookmark-form");
    }

    function autofillBookmarkTitle() {
        if (elements.bookmarkTitle.value.trim()) {
            return;
        }
        const url = elements.bookmarkUrl.value.trim();
        if (!url) {
            return;
        }
        elements.bookmarkTitle.value = getHostname(normalizeUrl(url));
    }

    function handleBookmarksGridClick(event) {
        const addCard = event.target.closest("[data-bookmark-action='add']");
        if (addCard) {
            openBookmarkForm();
            return;
        }

        const actionButton = event.target.closest("[data-bookmark-action]");
        if (actionButton) {
            const bookmarkId = actionButton.getAttribute("data-bookmark-id");
            const bookmark = findBookmark(bookmarkId);
            if (!bookmark) {
                return;
            }
            const action = actionButton.getAttribute("data-bookmark-action");
            if (action === "edit") {
                openBookmarkForm(bookmark);
                return;
            }
            if (action === "delete") {
                deleteBookmark(bookmark.id);
            }
            return;
        }

        const card = event.target.closest("[data-bookmark-id]");
        if (!card) {
            return;
        }
        const bookmark = findBookmark(card.getAttribute("data-bookmark-id"));
        if (!bookmark) {
            return;
        }
        window.open(bookmark.url, "_blank", "noopener,noreferrer");
    }

    function deleteBookmark(bookmarkId) {
        const bookmark = findBookmark(bookmarkId);
        if (!bookmark) {
            return;
        }
        const confirmed = window.confirm(`Delete bookmark "${bookmark.title}"?`);
        if (!confirmed) {
            return;
        }
        state.bookmarks = state.bookmarks.filter((item) => item.id !== bookmarkId);
        persistBookmarks();
        renderBookmarks();
        showToast("Bookmark deleted.", "success");
    }

    function handleBookmarkDragStart(event) {
        const card = event.target.closest("[data-bookmark-id]");
        if (!card) {
            return;
        }
        state.draggedBookmarkId = card.getAttribute("data-bookmark-id");
        card.classList.add("is-dragging");
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", state.draggedBookmarkId);
    }

    function handleBookmarkDragOver(event) {
        const card = event.target.closest("[data-bookmark-id]");
        if (!card) {
            return;
        }
        event.preventDefault();
        if (card.getAttribute("data-bookmark-id") === state.draggedBookmarkId) {
            return;
        }
        card.classList.add("is-drop-target");
        event.dataTransfer.dropEffect = "move";
    }

    function handleBookmarkDragLeave(event) {
        const card = event.target.closest("[data-bookmark-id]");
        if (card) {
            card.classList.remove("is-drop-target");
        }
    }

    function handleBookmarkDrop(event) {
        const targetCard = event.target.closest("[data-bookmark-id]");
        if (!targetCard) {
            return;
        }
        event.preventDefault();
        targetCard.classList.remove("is-drop-target");

        const draggedId = state.draggedBookmarkId || event.dataTransfer.getData("text/plain");
        const targetId = targetCard.getAttribute("data-bookmark-id");
        if (!draggedId || draggedId === targetId) {
            return;
        }

        const sorted = [...state.bookmarks].sort((left, right) => left.position - right.position);
        const draggedIndex = sorted.findIndex((item) => item.id === draggedId);
        const targetIndex = sorted.findIndex((item) => item.id === targetId);
        if (draggedIndex === -1 || targetIndex === -1) {
            return;
        }

        const [draggedBookmark] = sorted.splice(draggedIndex, 1);
        sorted.splice(targetIndex, 0, draggedBookmark);
        state.bookmarks = sorted.map((item, index) => ({
            ...item,
            position: index,
        }));
        persistBookmarks();
        renderBookmarks();
        showToast("Bookmark order updated.", "success");
    }

    function handleBookmarkDragEnd() {
        state.draggedBookmarkId = null;
        elements.bookmarksGrid
            .querySelectorAll(".bookmark-card")
            .forEach((card) => card.classList.remove("is-dragging", "is-drop-target"));
    }

    function exportBookmarks(format) {
        const sorted = [...state.bookmarks].sort((left, right) => left.position - right.position);
        let fileName = `start-page-bookmarks-${Date.now()}`;
        let blob;

        if (format === "json") {
            blob = new Blob(
                [
                    JSON.stringify(
                        {
                            version: "1.0",
                            exportDate: new Date().toISOString(),
                            bookmarks: sorted,
                        },
                        null,
                        2,
                    ),
                ],
                { type: "application/json" },
            );
            fileName += ".json";
        } else {
            const lines = [
                "<!DOCTYPE NETSCAPE-Bookmark-file-1>",
                '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">',
                "<TITLE>Bookmarks</TITLE>",
                "<H1>Bookmarks</H1>",
                "<DL><p>",
            ];
            sorted.forEach((bookmark) => {
                lines.push(
                    `    <DT><A HREF="${escapeAttribute(bookmark.url)}">${escapeHtml(bookmark.title)}</A>`,
                );
            });
            lines.push("</DL><p>");
            blob = new Blob([lines.join("\n")], { type: "text/html" });
            fileName += ".html";
        }

        downloadBlob(blob, fileName);
        showToast("Bookmarks exported.", "success");
    }

    function handleImportFileChange(event) {
        const file = event.target.files && event.target.files[0];
        if (!file) {
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const imported = parseImportedBookmarks(file.name, String(reader.result || ""));
                if (imported.length === 0) {
                    showToast("No valid bookmarks found in the selected file.", "error");
                    return;
                }

                const existingUrls = new Set(state.bookmarks.map((bookmark) => bookmark.url));
                const uniqueBookmarks = imported.filter((bookmark) => !existingUrls.has(bookmark.url));
                if (uniqueBookmarks.length === 0) {
                    showToast("All imported bookmarks already exist.", "error");
                    return;
                }

                const startIndex = state.bookmarks.length;
                uniqueBookmarks.forEach((bookmark, index) => {
                    state.bookmarks.push({
                        ...bookmark,
                        id: createId(),
                        position: startIndex + index,
                    });
                });

                persistBookmarks();
                renderBookmarks();
                showToast(`Imported ${uniqueBookmarks.length} bookmarks.`, "success");
            } catch (error) {
                console.error(error);
                showToast("Import failed. Use JSON or Netscape HTML.", "error");
            } finally {
                event.target.value = "";
            }
        };
        reader.readAsText(file);
    }

    function parseImportedBookmarks(fileName, text) {
        const normalizedName = fileName.toLowerCase();
        if (normalizedName.endsWith(".json")) {
            const parsed = JSON.parse(text);
            const list = Array.isArray(parsed) ? parsed : parsed.bookmarks;
            if (!Array.isArray(list)) {
                return [];
            }
            return list
                .map((item) => ({
                    title: String(item.title || "").trim(),
                    url: normalizeUrl(String(item.url || "").trim()),
                }))
                .filter((item) => item.title && item.url);
        }

        const parsedDocument = new DOMParser().parseFromString(text, "text/html");
        return [...parsedDocument.querySelectorAll("a")]
            .map((link) => ({
                title: String(link.textContent || "").trim() || getHostname(link.href),
                url: normalizeUrl(String(link.href || "").trim()),
            }))
            .filter((item) => item.url.startsWith("http://") || item.url.startsWith("https://"));
    }

    function resetLocalData() {
        const confirmed = window.confirm("Reset local settings and bookmarks?");
        if (!confirmed) {
            return;
        }
        storage.resetAll();
        state.settings = storage.deepMerge({}, defaultSettings);
        state.bookmarks = normalizeBookmarks(
            defaultBookmarks.map((bookmark, index) => ({
                id: createId(),
                title: bookmark.title,
                url: bookmark.url,
                position: index,
            })),
        );
        storage.writeBookmarks(state.bookmarks);
        state.activeSettingsTab = "appearance";
        ensureSessionEngine();
        applyAppearance();
        renderEngine();
        renderSettingsNav();
        renderSettingsContent();
        renderBookmarks();
        tickClock();
        closeModal("bookmark-form");
        showToast("Local data reset.", "success");
    }

    function persistBookmarks() {
        state.bookmarks = normalizeBookmarks(state.bookmarks);
        storage.writeBookmarks(state.bookmarks);
    }

    function normalizeBackgroundEffect(effect) {
        if (effect === "matrix") {
            return "world-map";
        }
        if (backgroundOptions.some((item) => item.id === effect)) {
            return effect;
        }
        return "blob";
    }

    function handleVisibilityChange() {
        if (document.hidden) {
            stopTypewriter();
            return;
        }
        updateTypewriterState(normalizeBackgroundEffect(state.settings.appearance.backgroundEffect));
    }

    function updateTypewriterState(backgroundEffect) {
        if (!elements.backgroundTyper) {
            return;
        }
        if (backgroundEffect === "none" || document.hidden) {
            stopTypewriter();
            elements.backgroundTyper.textContent = "";
            elements.backgroundTyper.classList.remove("is-visible");
            return;
        }
        if (!typewriterTimer && !typewriterActive) {
            typewriterTimer = window.setTimeout(runTypewriterCycle, 900);
        }
    }

    function stopTypewriter() {
        typewriterAbort += 1;
        window.clearTimeout(typewriterTimer);
        typewriterTimer = null;
        typewriterActive = false;
    }

    async function runTypewriterCycle() {
        typewriterTimer = null;
        typewriterActive = true;
        const token = typewriterAbort;
        const word = typewriterWords[Math.floor(Math.random() * typewriterWords.length)];
        const position = typewriterPositions[Math.floor(Math.random() * typewriterPositions.length)];
        elements.backgroundTyper.style.left = position.left;
        elements.backgroundTyper.style.top = position.top;
        elements.backgroundTyper.textContent = "";
        elements.backgroundTyper.classList.add("is-visible");

        for (let index = 1; index <= word.length; index += 1) {
            if (token !== typewriterAbort || document.hidden) {
                if (token === typewriterAbort) typewriterActive = false;
                return;
            }
            elements.backgroundTyper.textContent = word.slice(0, index);
            await sleep(150);
        }
        await sleep(1500);
        for (let index = word.length - 1; index >= 0; index -= 1) {
            if (token !== typewriterAbort || document.hidden) {
                if (token === typewriterAbort) typewriterActive = false;
                return;
            }
            elements.backgroundTyper.textContent = word.slice(0, index);
            await sleep(115);
        }
        elements.backgroundTyper.classList.remove("is-visible");
        typewriterActive = false;
        if (token !== typewriterAbort || document.hidden) return;
        typewriterTimer = window.setTimeout(runTypewriterCycle, 2600 + Math.random() * 2800);
    }

    function sleep(duration) {
        return new Promise((resolve) => window.setTimeout(resolve, duration));
    }

    function handleGlobalContextMenu(event) {
        if (state.openModal === "settings" || state.openModal === "bookmark-form") {
            return;
        }
        const interactive = event.target.closest(
            "button, input, select, textarea, a, [role='switch'], .settings-modal, .form-modal",
        );
        if (interactive) {
            return;
        }
        event.preventDefault();
        openModal("bookmarks");
    }

    function showToast(message, type) {
        const toast = document.createElement("div");
        toast.className = `toast ${type === "error" ? "is-error" : "is-success"}`;
        toast.textContent = message;
        elements.toastStack.appendChild(toast);
        const timerId = window.setTimeout(() => {
            toast.remove();
        }, 2600);
        state.toastTimerIds.push(timerId);
    }

    function normalizeBookmarks(bookmarks) {
        return [...bookmarks]
            .map((bookmark, index) => {
                const title = String(bookmark.title || "").trim();
                const url = normalizeUrl(String(bookmark.url || "").trim());
                if (!title || !url) {
                    return null;
                }
                return {
                    id: String(bookmark.id || createId()),
                    title,
                    url,
                    position:
                        Number.isFinite(bookmark.position) && bookmark.position >= 0
                            ? bookmark.position
                            : index,
                };
            })
            .filter(Boolean)
            .sort((left, right) => left.position - right.position)
            .map((bookmark, index) => ({
                ...bookmark,
                position: index,
            }));
    }

    function normalizeUrl(url) {
        if (!url) {
            return "";
        }
        const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`;
        try {
            return new URL(withProtocol).toString();
        } catch (error) {
            return "";
        }
    }

    function findEngine(engineId) {
        return searchEngines.find((engine) => engine.id === engineId);
    }

    function findBookmark(bookmarkId) {
        return state.bookmarks.find((bookmark) => bookmark.id === bookmarkId);
    }

    function getHostname(url) {
        try {
            return new URL(url).hostname.replace(/^www\./i, "");
        } catch (error) {
            return url;
        }
    }

    function getFaviconUrl(url) {
        try {
            const hostname = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
        } catch (error) {
            return "";
        }
    }

    function createId() {
        return `bm_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
    }

    function debounce(fn, delay) {
        let timerId = null;
        return (...args) => {
            window.clearTimeout(timerId);
            timerId = window.setTimeout(() => fn(...args), delay);
        };
    }

    function downloadBlob(blob, fileName) {
        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = objectUrl;
        anchor.download = fileName;
        anchor.click();
        URL.revokeObjectURL(objectUrl);
    }

    function darkenColor(hex, amount) {
        const rgb = hexToRgb(hex);
        const factor = Math.max(0, 1 - amount);
        return rgbToHex(
            Math.round(rgb.r * factor),
            Math.round(rgb.g * factor),
            Math.round(rgb.b * factor),
        );
    }

    function hexToRgba(hex, alpha) {
        const rgb = hexToRgb(hex);
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
    }

    function mixColorWithWhite(hex, whiteAmount) {
        const rgb = hexToRgb(hex);
        const factor = Math.max(0, Math.min(1, whiteAmount));
        return rgbToHex(
            Math.round(rgb.r * (1 - factor) + 255 * factor),
            Math.round(rgb.g * (1 - factor) + 255 * factor),
            Math.round(rgb.b * (1 - factor) + 255 * factor),
        );
    }

    function hexToRgb(hex) {
        const value = hex.replace("#", "");
        const normalized = value.length === 3 ? value.split("").map((part) => part + part).join("") : value;
        const number = Number.parseInt(normalized, 16);
        return {
            r: (number >> 16) & 255,
            g: (number >> 8) & 255,
            b: number & 255,
        };
    }

    function rgbToHex(r, g, b) {
        return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
    }

    function escapeHtml(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }

    function escapeAttribute(value) {
        return escapeHtml(value);
    }

    function iconPencil() {
        return `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m4 20 4.1-1 9.4-9.4-3.1-3.1L5 15.9 4 20Z"></path>
                <path d="m13.9 6.5 3.1 3.1"></path>
            </svg>
        `;
    }

    function iconTrash() {
        return `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 7h16"></path>
                <path d="M9 7V4.8h6V7"></path>
                <path d="M7.5 7 8.3 19h7.4l.8-12"></path>
            </svg>
        `;
    }

    function engineIconMarkup(engineId) {
        switch (engineId) {
            case "google":
                return `
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                    </svg>
                `;
            case "bing":
            case "bingcn":
                return `
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M5 3v18l5-3 7 4V6l-7 2-5-5z" fill="#008373"></path>
                        <path d="M12 11l5-2v9l-5-3v-4z" fill="#00BCF2"></path>
                    </svg>
                `;
            case "baidu":
                return `
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="7" cy="8" r="2" fill="#2932E1"></circle>
                        <circle cx="17" cy="8" r="2" fill="#2932E1"></circle>
                        <circle cx="12" cy="5" r="2" fill="#2932E1"></circle>
                        <path d="M6 14c0-1.5 1-3 3-3h6c2 0 3 1.5 3 3v4c0 1.5-1.5 2-3 2H9c-1.5 0-3-.5-3-2v-4z" fill="#2932E1"></path>
                    </svg>
                `;
            case "github":
                return `
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="#24292E" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"></path>
                    </svg>
                `;
            case "zhihu":
                return `
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <rect x="3" y="4" width="7" height="14" rx="1" fill="#0084FF"></rect>
                        <path d="M11 4h7v2h-7V4zm0 4h7v2h-7V8z" fill="#0084FF"></path>
                        <path d="M14 12h4l-2 6-2-6z" fill="#0084FF"></path>
                    </svg>
                `;
            case "bilibili":
                return `
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <rect x="4" y="7" width="16" height="12" rx="2" fill="#00A1D6"></rect>
                        <circle cx="9" cy="11" r="1" fill="#fff"></circle>
                        <circle cx="15" cy="11" r="1" fill="#fff"></circle>
                        <path d="M8 14h8" stroke="#fff" stroke-width="2" stroke-linecap="round"></path>
                        <path d="M7 5l2 2M17 5l-2 2" stroke="#00A1D6" stroke-width="2" stroke-linecap="round"></path>
                    </svg>
                `;
            case "duckduckgo":
                return `
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" fill="#DE5833"></circle>
                        <ellipse cx="12" cy="13" rx="6" ry="5" fill="#fff"></ellipse>
                        <ellipse cx="10" cy="11" rx="2" ry="2.5" fill="#2D4F8E"></ellipse>
                        <circle cx="10.5" cy="10.5" r="0.8" fill="#fff"></circle>
                        <ellipse cx="15" cy="12" rx="1.5" ry="2" fill="#2D4F8E"></ellipse>
                        <path d="M8 16c1.5 1 4.5 1 6 0" stroke="#DE5833" stroke-width="1.5" stroke-linecap="round"></path>
                        <ellipse cx="14" cy="8" rx="3" ry="2" fill="#65BC46"></ellipse>
                    </svg>
                `;
            case "yandex":
                return `
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <rect x="2" y="2" width="20" height="20" rx="4" fill="#FF0000"></rect>
                        <path d="M13.5 18V9.5L16 6h-2.5l-3 4.5V6H8v12h2.5v-5l3.5 5h2.5l-3-4.5V18z" fill="#fff"></path>
                    </svg>
                `;
            default:
                return `<span>${escapeHtml((findEngine(engineId) || { badge: "?" }).badge)}</span>`;
        }
    }
})();
