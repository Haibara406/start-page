(function () {
    const searchEngines = [
        {
            id: "google",
            name: "Google",
            badge: "G",
            color: "#4285F4",
            searchUrl: "https://www.google.com/search?q={query}",
        },
        {
            id: "bing",
            name: "Bing",
            badge: "B",
            color: "#008373",
            searchUrl: "https://www.bing.com/search?q={query}",
        },
        {
            id: "baidu",
            name: "Baidu",
            badge: "百",
            color: "#2932E1",
            searchUrl: "https://www.baidu.com/s?wd={query}",
        },
        {
            id: "bingcn",
            name: "Bing CN",
            badge: "BC",
            color: "#008373",
            searchUrl: "https://cn.bing.com/search?q={query}",
        },
        {
            id: "github",
            name: "GitHub",
            badge: "GH",
            color: "#24292E",
            searchUrl: "https://github.com/search?q={query}",
        },
        {
            id: "zhihu",
            name: "Zhihu",
            badge: "知",
            color: "#0084FF",
            searchUrl: "https://www.zhihu.com/search?q={query}",
        },
        {
            id: "bilibili",
            name: "Bilibili",
            badge: "B站",
            color: "#00A1D6",
            searchUrl: "https://search.bilibili.com/all?keyword={query}",
        },
        {
            id: "duckduckgo",
            name: "DuckDuckGo",
            badge: "DDG",
            color: "#DE5833",
            searchUrl: "https://duckduckgo.com/?q={query}",
        },
        {
            id: "yandex",
            name: "Yandex",
            badge: "Y",
            color: "#FF0000",
            searchUrl: "https://yandex.com/search/?text={query}",
        },
    ];

    const accentSchemes = [
        { id: "orange", label: "Warm Orange", value: "#ff6b35" },
        { id: "blue", label: "Ocean Blue", value: "#1778f2" },
        { id: "green", label: "Forest Green", value: "#20a464" },
        { id: "red", label: "Cherry Red", value: "#d63f3f" },
        { id: "teal", label: "Mint Teal", value: "#0f9b9b" },
        { id: "amber", label: "Golden Amber", value: "#d18f00" },
    ];

    const backgroundOptions = [
        { id: "blob", label: "Blob" },
        { id: "wave", label: "Wave" },
        { id: "matrix", label: "Matrix" },
        { id: "none", label: "None" },
    ];

    const settingsTabs = [
        { id: "appearance", label: "Appearance", mark: "◐" },
        { id: "search", label: "Search", mark: "⌕" },
        { id: "bookmarks", label: "Bookmarks", mark: "★" },
        { id: "data", label: "Data", mark: "⬡" },
    ];

    const defaultBookmarks = [
        { title: "哔哩哔哩", url: "https://www.bilibili.com/" },
        { title: "ChatGPT", url: "https://chatgpt.com/" },
        { title: "DeepSeek", url: "https://chat.deepseek.com/" },
        { title: "网易云音乐", url: "https://music.163.com/" },
        { title: "GitHub", url: "https://github.com/" },
        { title: "YouTube", url: "https://www.youtube.com/" },
    ];

    const defaultSettings = {
        appearance: {
            theme: "system",
            backgroundEffect: "blob",
            clockFormat: "24h",
            enableBlur: true,
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

    window.StartPageConfig = {
        searchEngines,
        accentSchemes,
        backgroundOptions,
        settingsTabs,
        defaultBookmarks,
        defaultSettings,
        storageKeys: {
            settings: "start_page_settings",
            bookmarks: "start_page_bookmarks",
        },
    };
})();
