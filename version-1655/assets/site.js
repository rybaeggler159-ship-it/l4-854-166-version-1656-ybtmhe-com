(function () {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-search-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      const input = form.querySelector("input[name='q']");
      if (!input || !input.value.trim()) {
        event.preventDefault();
        if (input) {
          input.focus();
        }
      }
    });
  });

  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let index = 0;
    let timer = null;

    const show = function (next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    };

    const start = function () {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    };

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    show(0);
    start();
  }

  document.querySelectorAll("[data-filter-scope]").forEach(function (tools) {
    const targetId = tools.getAttribute("data-filter-scope");
    const target = document.getElementById(targetId);
    const input = tools.querySelector("[data-local-search]");
    const buttons = Array.from(tools.querySelectorAll("[data-filter-button]"));
    let category = "all";

    const apply = function () {
      if (!target) {
        return;
      }
      const query = input ? input.value.trim().toLowerCase() : "";
      const cards = Array.from(target.querySelectorAll("[data-card]"));
      cards.forEach(function (card) {
        const text = (card.getAttribute("data-text") || "").toLowerCase();
        const cardCategory = card.getAttribute("data-category") || "";
        const matchedQuery = !query || text.indexOf(query) !== -1;
        const matchedCategory = category === "all" || cardCategory === category;
        card.classList.toggle("is-hidden", !(matchedQuery && matchedCategory));
      });
    };

    if (input) {
      input.addEventListener("input", apply);
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        category = button.getAttribute("data-filter-button") || "all";
        buttons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        apply();
      });
    });
  });

  const results = document.querySelector("[data-search-results]");
  const status = document.querySelector("[data-search-status]");
  if (results && status && Array.isArray(window.MOVIES_SEARCH)) {
    const params = new URLSearchParams(window.location.search);
    const query = (params.get("q") || "").trim();
    const formInput = document.querySelector(".search-page-form input[name='q']");
    if (formInput) {
      formInput.value = query;
    }

    const makeCard = function (movie) {
      const tags = [movie.category, movie.year, movie.type].filter(Boolean).join(" · ");
      return [
        '<a class="movie-card" href="' + movie.href + '">',
        '<span class="poster-wrap">',
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span class="poster-shade"></span>',
        '<span class="badge">' + escapeHtml(movie.category) + '</span>',
        '<span class="score">' + escapeHtml(movie.score) + '</span>',
        '<span class="play-chip">▶</span>',
        '</span>',
        '<span class="card-body">',
        '<strong>' + escapeHtml(movie.title) + '</strong>',
        '<em>' + escapeHtml(movie.oneLine) + '</em>',
        '<span class="meta-line">' + escapeHtml(tags) + '</span>',
        '</span>',
        '</a>'
      ].join("");
    };

    const normalized = query.toLowerCase();
    const list = normalized ? window.MOVIES_SEARCH.filter(function (movie) {
      const haystack = [movie.title, movie.category, movie.year, movie.region, movie.type, movie.genre, (movie.tags || []).join(" "), movie.oneLine].join(" ").toLowerCase();
      return haystack.indexOf(normalized) !== -1;
    }).slice(0, 120) : window.MOVIES_SEARCH.slice(0, 60);

    status.textContent = normalized ? "搜索结果" : "热门推荐";
    results.innerHTML = list.map(makeCard).join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
})();
