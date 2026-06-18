(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getQuery(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || "";
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function setupGlobalSearch() {
        var forms = document.querySelectorAll(".global-search-form");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                var target = "./search.html";
                if (query) {
                    target += "?q=" + encodeURIComponent(query);
                }
                window.location.href = target;
            });
        });
    }

    function setupHero() {
        var slider = document.querySelector(".hero-slider");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        var prev = slider.querySelector(".hero-prev");
        var next = slider.querySelector(".hero-next");
        var index = 0;
        var timer = 0;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide") || 0));
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupCardFilter() {
        var inputs = document.querySelectorAll(".js-card-filter");
        inputs.forEach(function (input) {
            var section = input.closest("section") || document;
            var cards = Array.prototype.slice.call(section.querySelectorAll("[data-search]"));
            input.addEventListener("input", function () {
                var query = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var text = card.getAttribute("data-search") || "";
                    card.classList.toggle("hidden-card", query && text.indexOf(query) === -1);
                });
            });
        });
    }

    function renderSearch() {
        var data = window.MOVIE_SEARCH_INDEX;
        var results = document.getElementById("searchResults");
        if (!data || !results) {
            return;
        }
        var input = document.getElementById("siteSearchInput");
        var category = document.getElementById("siteCategoryFilter");
        var form = document.getElementById("siteSearchForm");
        var initial = getQuery("q");
        if (input) {
            input.value = initial;
        }

        function card(movie) {
            var tags = (movie.tags || []).slice(0, 5).map(function (tag) {
                return "<span>" + escapeHtml(tag) + "</span>";
            }).join("");
            return "" +
                "<article class=\"movie-card\">" +
                    "<a class=\"poster-link\" href=\"./" + escapeHtml(movie.url) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
                        "<img src=\"./" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
                        "<span class=\"poster-shade\"></span>" +
                        "<span class=\"play-mini\">播放</span>" +
                    "</a>" +
                    "<div class=\"card-body\">" +
                        "<div class=\"card-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
                        "<h2><a href=\"./" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h2>" +
                        "<p>" + escapeHtml(movie.oneLine) + "</p>" +
                        "<div class=\"tag-row\">" + tags + "</div>" +
                    "</div>" +
                "</article>";
        }

        function run() {
            var query = input ? input.value.trim().toLowerCase() : "";
            var selectedCategory = category ? category.value : "";
            var filtered = data.filter(function (movie) {
                var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.categoryName].concat(movie.tags || []).join(" ").toLowerCase();
                var matchQuery = !query || text.indexOf(query) !== -1;
                var matchCategory = !selectedCategory || movie.categorySlug === selectedCategory;
                return matchQuery && matchCategory;
            }).slice(0, 96);
            results.innerHTML = filtered.map(card).join("");
        }

        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                run();
            });
        }
        if (input) {
            input.addEventListener("input", run);
        }
        if (category) {
            category.addEventListener("change", run);
        }
        run();
    }

    ready(function () {
        setupMenu();
        setupGlobalSearch();
        setupHero();
        setupCardFilter();
        renderSearch();
    });
}());
