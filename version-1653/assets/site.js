(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    restart();
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var textInput = scope.querySelector('[data-filter-text]');
    var yearInput = scope.querySelector('[data-filter-year]');
    var regionInput = scope.querySelector('[data-filter-region]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var empty = scope.querySelector('[data-empty-state]');

    function applyFilter() {
      var query = textInput ? textInput.value.trim().toLowerCase() : '';
      var year = yearInput ? yearInput.value : '';
      var region = regionInput ? regionInput.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-category') || '',
          card.getAttribute('data-tags') || ''
        ].join(' ').toLowerCase();
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchYear = !year || card.getAttribute('data-year') === year;
        var matchRegion = !region || card.getAttribute('data-region') === region;
        var shouldShow = matchQuery && matchYear && matchRegion;

        card.style.display = shouldShow ? '' : 'none';

        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [textInput, yearInput, regionInput].forEach(function (input) {
      if (input) {
        input.addEventListener('input', applyFilter);
        input.addEventListener('change', applyFilter);
      }
    });
  });

  var searchPage = document.querySelector('[data-search-page]');

  if (searchPage && window.MovieCatalog) {
    var form = searchPage.querySelector('[data-search-form]');
    var input = searchPage.querySelector('[data-search-input]');
    var results = searchPage.querySelector('[data-search-results]');
    var status = searchPage.querySelector('[data-search-status]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function cardTemplate(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return [
        '<article class="movie-card">',
        '<a class="movie-poster" href="' + escapeHtml(movie.link) + '">',
        '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span class="poster-shade"></span>',
        '<span class="play-dot">▶</span>',
        '<span class="quality">高清</span>',
        '</a>',
        '<div class="movie-info">',
        '<a class="movie-title" href="' + escapeHtml(movie.link) + '">' + escapeHtml(movie.title) + '</a>',
        '<p class="movie-desc">' + escapeHtml(movie.summary) + '</p>',
        '<div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
        '<div class="tag-row">' + tags + '</div>',
        '</div>',
        '</article>'
      ].join('');
    }

    function runSearch() {
      var query = input.value.trim().toLowerCase();
      var matches = window.MovieCatalog.filter(function (movie) {
        if (!query) {
          return true;
        }

        return [movie.title, movie.region, movie.year, movie.type, movie.genre, (movie.tags || []).join(' '), movie.summary]
          .join(' ')
          .toLowerCase()
          .indexOf(query) !== -1;
      }).slice(0, 96);

      results.innerHTML = matches.map(cardTemplate).join('');
      status.textContent = query ? '正在展示相关影片' : '正在展示热门相关影片';
    }

    if (input) {
      input.value = initialQuery;
      input.addEventListener('input', runSearch);
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        runSearch();
      });
    }

    if (initialQuery) {
      runSearch();
    }
  }
})();
