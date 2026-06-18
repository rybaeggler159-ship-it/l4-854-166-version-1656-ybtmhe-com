(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initMenu() {
        var toggle = qs("[data-menu-toggle]");
        var menu = qs("[data-mobile-nav]");
        if (!toggle || !menu) {
            return;
        }

        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", menu.classList.contains("is-open") ? "true" : "false");
        });
    }

    function initHero() {
        var slider = qs("[data-hero-slider]");
        if (!slider) {
            return;
        }

        var slides = qsa(".hero-slide", slider);
        var dots = qsa(".hero-dot", slider);
        if (!slides.length) {
            return;
        }

        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                play();
            });
        });

        show(0);
        play();
    }

    function initCatalogFilter() {
        var catalogs = qsa("[data-catalog]");
        catalogs.forEach(function (catalog) {
            var input = qs("[data-catalog-search]", catalog);
            var select = qs("[data-catalog-select]", catalog);
            var cards = qsa(".movie-card", catalog);
            var empty = qs("[data-empty-state]", catalog);

            function apply() {
                var keyword = normalize(input ? input.value : "");
                var filter = normalize(select ? select.value : "");
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-text"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-category")
                    ].join(" "));
                    var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchedFilter = !filter || text.indexOf(filter) !== -1;
                    var isVisible = matchedKeyword && matchedFilter;
                    card.style.display = isVisible ? "" : "none";
                    if (isVisible) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            if (select) {
                select.addEventListener("change", apply);
            }

            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");
            if (query && input) {
                input.value = query;
            }

            apply();
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initHero();
        initCatalogFilter();
    });
})();
