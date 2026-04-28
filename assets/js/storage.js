(function () {
    const { defaultSettings, storageKeys } = window.StartPageConfig;

    function isObject(value) {
        return Boolean(value) && typeof value === "object" && !Array.isArray(value);
    }

    function deepMerge(base, incoming) {
        const output = Array.isArray(base) ? [...base] : { ...base };
        Object.keys(incoming || {}).forEach((key) => {
            const sourceValue = incoming[key];
            const baseValue = base ? base[key] : undefined;
            if (isObject(baseValue) && isObject(sourceValue)) {
                output[key] = deepMerge(baseValue, sourceValue);
                return;
            }
            output[key] = sourceValue;
        });
        return output;
    }

    function safeRead(key, fallback) {
        try {
            const raw = window.localStorage.getItem(key);
            if (!raw) {
                return fallback;
            }
            return JSON.parse(raw);
        } catch (error) {
            console.warn("Failed to read local storage:", key, error);
            return fallback;
        }
    }

    function safeWrite(key, value) {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn("Failed to write local storage:", key, error);
        }
    }

    function readSettings() {
        const stored = safeRead(storageKeys.settings, {});
        return deepMerge(defaultSettings, stored);
    }

    function writeSettings(settings) {
        safeWrite(storageKeys.settings, settings);
    }

    function readBookmarks() {
        const stored = safeRead(storageKeys.bookmarks, []);
        return Array.isArray(stored) ? stored : [];
    }

    function writeBookmarks(bookmarks) {
        safeWrite(storageKeys.bookmarks, bookmarks);
    }

    function resetAll() {
        try {
            window.localStorage.removeItem(storageKeys.settings);
            window.localStorage.removeItem(storageKeys.bookmarks);
        } catch (error) {
            console.warn("Failed to clear local storage:", error);
        }
    }

    window.StartPageStorage = {
        deepMerge,
        readSettings,
        writeSettings,
        readBookmarks,
        writeBookmarks,
        resetAll,
    };
})();
