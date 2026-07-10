(function () {
    "use strict";

    var LOCALES = ["ja", "en", "zh-Hans", "zh-Hant", "ko"];
    var DEFAULT_LOCALE = "ja";
    var STORAGE_KEY = "tmf-web-locale";

    var strings = null;
    var originalMainHTML = null;
    var currentPage = null;

    function normalizeLocale(raw) {
        if (!raw) return DEFAULT_LOCALE;
        var value = String(raw).trim();
        if (value === "zh" || value === "zh-CN" || value === "zh-Hans") return "zh-Hans";
        if (value === "zh-TW" || value === "zh-HK" || value === "zh-Hant") return "zh-Hant";
        if (LOCALES.indexOf(value) !== -1) return value;
        var base = value.split("-")[0];
        if (base === "zh") return "zh-Hans";
        if (LOCALES.indexOf(base) !== -1) return base;
        return DEFAULT_LOCALE;
    }

    function detectLocale() {
        var params = new URLSearchParams(window.location.search);
        if (params.has("lang")) {
            return normalizeLocale(params.get("lang"));
        }
        try {
            var stored = localStorage.getItem(STORAGE_KEY);
            if (stored) return normalizeLocale(stored);
        } catch (error) {
            /* ignore */
        }
        var languages = navigator.languages || [navigator.language || DEFAULT_LOCALE];
        for (var i = 0; i < languages.length; i += 1) {
            var candidate = normalizeLocale(languages[i]);
            if (candidate !== DEFAULT_LOCALE) return candidate;
        }
        return DEFAULT_LOCALE;
    }

    function localeText(key, locale) {
        var node = strings;
        key.split(".").forEach(function (part) {
            node = node && node[part];
        });
        if (!node) return null;
        return node[locale] || node[DEFAULT_LOCALE] || null;
    }

    function withLang(href, locale) {
        try {
            var url = new URL(href, window.location.href);
            if (locale === DEFAULT_LOCALE) {
                url.searchParams.delete("lang");
            } else {
                url.searchParams.set("lang", locale);
            }
            var query = url.searchParams.toString();
            return url.pathname + (query ? "?" + query : "") + url.hash;
        } catch (error) {
            return href;
        }
    }

    function updateDocumentMeta(locale) {
        if (!strings || !currentPage) return;
        var page = strings.pages[currentPage];
        if (!page) return;
        var title = localeText("pages." + currentPage + ".title", locale);
        var description = localeText("pages." + currentPage + ".description", locale);
        if (title) document.title = title;
        if (description) {
            var meta = document.querySelector('meta[name="description"]');
            if (meta) meta.setAttribute("content", description);
        }
        document.documentElement.lang = locale;
    }

    function applyShared(locale) {
        document.querySelectorAll("[data-i18n]").forEach(function (element) {
            var key = element.getAttribute("data-i18n");
            var value = localeText("shared." + key, locale);
            if (value == null) return;
            element.textContent = value;
        });

        document.querySelectorAll("[data-i18n-placeholder]").forEach(function (element) {
            var key = element.getAttribute("data-i18n-placeholder");
            var value = localeText("shared." + key, locale);
            if (value == null) return;
            element.setAttribute("placeholder", value);
        });

        document.querySelectorAll("a[data-nav]").forEach(function (link) {
            link.setAttribute("href", withLang(link.getAttribute("data-nav"), locale));
        });

        var footerContact = document.querySelector("[data-footer-contact]");
        if (footerContact) {
            var label = localeText("shared.footer.contact_label", locale) || "";
            var email = footerContact.querySelector("a");
            if (email) {
                footerContact.innerHTML = label + ' <a href="mailto:truemyface@rarari.org">truemyface@rarari.org</a>';
            }
        }
    }

    function applyMain(locale) {
        var main = document.querySelector("main");
        if (!main || !strings || !currentPage) return;

        if (locale === DEFAULT_LOCALE) {
            if (originalMainHTML != null) {
                main.innerHTML = originalMainHTML;
            }
            return;
        }

        var body = localeText("pages." + currentPage + ".body", locale);
        if (body) {
            main.innerHTML = body;
        }
    }

    function updateSwitcher(locale) {
        var switcher = document.querySelector(".locale-switcher");
        if (!switcher) return;
        switcher.querySelectorAll("[data-locale]").forEach(function (button) {
            var active = button.getAttribute("data-locale") === locale;
            button.classList.toggle("active", active);
            button.setAttribute("aria-pressed", active ? "true" : "false");
        });
    }

    function persistLocale(locale) {
        try {
            localStorage.setItem(STORAGE_KEY, locale);
        } catch (error) {
            /* ignore */
        }
        var url = new URL(window.location.href);
        if (locale === DEFAULT_LOCALE) {
            url.searchParams.delete("lang");
        } else {
            url.searchParams.set("lang", locale);
        }
        window.history.replaceState({}, "", url.pathname + url.search + url.hash);
    }

    function applyLocale(locale) {
        applyShared(locale);
        applyMain(locale);
        updateDocumentMeta(locale);
        updateSwitcher(locale);
        persistLocale(locale);
    }

    function buildSwitcher() {
        var header = document.querySelector(".header-inner");
        if (!header || !strings) return;

        var switcher = document.createElement("div");
        switcher.className = "locale-switcher";
        switcher.setAttribute("role", "group");
        switcher.setAttribute("aria-label", localeText("shared.locale.group_label", detectLocale()) || "Language");

        LOCALES.forEach(function (locale) {
            var button = document.createElement("button");
            button.type = "button";
            button.className = "locale-button";
            button.setAttribute("data-locale", locale);
            button.textContent = strings.localeLabels[locale] || locale;
            button.addEventListener("click", function () {
                applyLocale(locale);
            });
            switcher.appendChild(button);
        });

        header.appendChild(switcher);
    }

    function init() {
        currentPage = document.body.getAttribute("data-page");
        var main = document.querySelector("main");
        if (main) {
            originalMainHTML = main.innerHTML;
        }

        fetch("assets/strings.json")
            .then(function (response) {
                if (!response.ok) throw new Error("strings.json not found");
                return response.json();
            })
            .then(function (payload) {
                strings = payload;
                buildSwitcher();
                applyLocale(detectLocale());
            })
            .catch(function () {
                /* Japanese HTML remains as fallback */
            });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();