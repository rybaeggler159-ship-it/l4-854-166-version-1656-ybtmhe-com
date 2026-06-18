(function () {
  function qs(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-main-nav]');
    var search = document.querySelector('.top-search');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      if (search) {
        search.classList.toggle('open');
      }
    });
  }

  function initHero() {
    var slider = document.querySelector('[data-hero]');
    if (!slider) {
      return;
    }
    var slides = qs('.hero-slide', slider);
    var dots = qs('.hero-dots button', slider);
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(i);
        start();
      });
    });

    show(0);
    start();
  }

  function initCardFilters() {
    qs('[data-filter-list]').forEach(function (wrap) {
      var input = wrap.querySelector('[data-card-search]');
      var yearSelect = wrap.querySelector('[data-year-filter]');
      var typeSelect = wrap.querySelector('[data-type-filter]');
      var cards = qs('.movie-card', wrap);

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var year = yearSelect ? yearSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        cards.forEach(function (card) {
          var text = (card.textContent || '').toLowerCase();
          var okKeyword = !keyword || text.indexOf(keyword) !== -1;
          var okYear = !year || (card.dataset.year || '').indexOf(year) !== -1;
          var okType = !type || (card.dataset.type || '').indexOf(type) !== -1;
          card.style.display = okKeyword && okYear && okType ? '' : 'none';
        });
      }

      [input, yearSelect, typeSelect].forEach(function (el) {
        if (el) {
          el.addEventListener('input', apply);
          el.addEventListener('change', apply);
        }
      });
    });
  }

  function initSearchPage() {
    var root = document.querySelector('[data-search-page]');
    if (!root || !window.SEARCH_INDEX) {
      return;
    }
    var form = root.querySelector('form');
    var input = root.querySelector('input[name="q"]');
    var results = root.querySelector('[data-search-results]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function render() {
      var query = input.value.trim().toLowerCase();
      var list = window.SEARCH_INDEX.filter(function (item) {
        if (!query) {
          return true;
        }
        return [item.title, item.region, item.type, item.year, item.category, item.tags, item.oneLine]
          .join(' ')
          .toLowerCase()
          .indexOf(query) !== -1;
      }).slice(0, 80);

      if (!list.length) {
        results.innerHTML = '<div class="empty-state">没有找到匹配内容</div>';
        return;
      }

      results.innerHTML = list.map(function (item) {
        return '<article class="movie-card">' +
          '<a class="poster-link" href="' + item.url + '">' +
          '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<span class="poster-mask"></span><span class="play-dot">▶</span></a>' +
          '<div class="card-body"><p class="card-meta">' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.type) + '</p>' +
          '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>' +
          '<p class="card-desc">' + escapeHtml(item.oneLine || '') + '</p>' +
          '<div class="tag-row"><span>' + escapeHtml(item.category) + '</span></div></div></article>';
      }).join('');
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, function (ch) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
      });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var url = new URL(window.location.href);
      url.searchParams.set('q', input.value.trim());
      history.replaceState(null, '', url.toString());
      render();
    });
    input.addEventListener('input', render);
    render();
  }

  function initPlayers() {
    qs('[data-player]').forEach(function (shell) {
      var video = shell.querySelector('video');
      var trigger = shell.querySelector('[data-play]');
      var src = shell.getAttribute('data-video');
      var loaded = false;
      var hls;

      function loadAndPlay() {
        if (!video || !src) {
          return;
        }
        if (!loaded) {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(src);
            hls.attachMedia(video);
          } else {
            video.src = src;
          }
          loaded = true;
        }
        shell.classList.add('is-playing');
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      if (trigger) {
        trigger.addEventListener('click', loadAndPlay);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (!loaded) {
            loadAndPlay();
          }
        });
        video.addEventListener('emptied', function () {
          if (hls && hls.destroy) {
            hls.destroy();
          }
        });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initHero();
    initCardFilters();
    initSearchPage();
    initPlayers();
  });
})();
