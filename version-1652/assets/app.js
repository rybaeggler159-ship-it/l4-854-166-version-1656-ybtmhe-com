(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function initHero() {
    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var next = hero.querySelector("[data-hero-next]");
      var prev = hero.querySelector("[data-hero-prev]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === index);
        });
      }

      function auto() {
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        auto();
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }
      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          restart();
        });
      });
      show(0);
      auto();
    });
  }

  function text(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initSearchRedirect() {
    document.querySelectorAll("[data-search-redirect]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var url = "./search.html";
        if (query) {
          url += "?q=" + encodeURIComponent(query);
        }
        window.location.href = url;
      });
    });
  }

  function initFilters() {
    var input = document.querySelector("[data-filter-input]");
    var grid = document.querySelector(".filter-grid");
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var empty = document.querySelector("[data-empty-state]");
    var activeValue = "all";
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get("q") || "";

    if (input && queryValue) {
      input.value = queryValue;
    }

    function matchesCard(card, query, chip) {
      var cardText = text(card.textContent + " " + card.getAttribute("data-keywords") + " " + card.getAttribute("data-title") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-type") + " " + card.getAttribute("data-year"));
      var chipText = text(chip);
      var queryText = text(query);
      var chipMatch = chipText === "all" || cardText.indexOf(chipText) !== -1;
      var queryMatch = !queryText || cardText.indexOf(queryText) !== -1;
      return chipMatch && queryMatch;
    }

    function apply() {
      var query = input ? input.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var ok = matchesCard(card, query, activeValue);
        card.classList.toggle("is-hidden", !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener("input", apply);
      var form = input.closest("form");
      if (form) {
        form.addEventListener("submit", function (event) {
          event.preventDefault();
          apply();
        });
      }
    }

    document.querySelectorAll("[data-filter-value]").forEach(function (button) {
      button.addEventListener("click", function () {
        document.querySelectorAll("[data-filter-value]").forEach(function (item) {
          item.classList.remove("active");
        });
        button.classList.add("active");
        activeValue = button.getAttribute("data-filter-value") || "all";
        apply();
      });
    });

    apply();
  }

  function initPlayer() {
    var video = document.getElementById("movie-player");
    if (!video) {
      return;
    }
    var stream = video.getAttribute("data-stream");
    var cover = document.querySelector("[data-player-cover]");
    var shell = document.querySelector("[data-player-shell]");
    var errorBox = document.querySelector("[data-player-error]");
    var prepared = false;
    var hls = null;

    function showError() {
      if (errorBox) {
        errorBox.hidden = false;
        errorBox.textContent = "视频暂时无法播放，请稍后重试。";
      }
    }

    function prepare() {
      if (prepared) {
        return true;
      }
      if (!stream) {
        showError();
        return false;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        prepared = true;
        return true;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              showError();
            }
          }
        });
        prepared = true;
        return true;
      }
      showError();
      return false;
    }

    function playMovie() {
      if (!prepare()) {
        return;
      }
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (cover) {
            cover.classList.remove("is-hidden");
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener("click", playMovie);
    }
    if (shell) {
      shell.addEventListener("click", function (event) {
        if (event.target === shell) {
          playMovie();
        }
      });
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        playMovie();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initSearchRedirect();
    initFilters();
    initPlayer();
  });
})();
