(function () {
  var app = document.querySelector('[data-search-app]');
  if (!app) {
    return;
  }

  var base = document.body.getAttribute('data-base') || '';
  var input = app.querySelector('[data-search-input]');
  var categorySelect = app.querySelector('[data-search-category]');
  var regionSelect = app.querySelector('[data-search-region]');
  var yearSelect = app.querySelector('[data-search-year]');
  var results = app.querySelector('[data-search-results]');
  var count = app.querySelector('[data-search-count]');
  var form = app.querySelector('form');
  var movies = [];

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function uniqueSorted(values, limit) {
    var map = {};
    values.forEach(function (value) {
      if (value) {
        map[value] = true;
      }
    });
    return Object.keys(map).sort().slice(0, limit || 9999);
  }

  function setOptions(select, values, defaultText) {
    if (!select) {
      return;
    }
    select.innerHTML = '<option value="">' + defaultText + '</option>' + values.map(function (value) {
      return '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>';
    }).join('');
  }

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return '<span class="tag">' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="poster-frame" data-title="' + escapeHtml(movie.title) + '" href="' + base + escapeHtml(movie.url) + '">',
      '    <img src="' + base + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" data-fallback-title="' + escapeHtml(movie.title) + '">',
      '    <span class="poster-shade"></span>',
      '    <span class="poster-badge">HD</span>',
      '    <span class="poster-play">▶</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="movie-card-topline">',
      '      <a class="movie-title" href="' + base + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>',
      '      <span class="movie-year">' + escapeHtml(movie.year) + '</span>',
      '    </div>',
      '    <p class="movie-one-line">' + escapeHtml(movie.one_line) + '</p>',
      '    <div class="movie-meta">',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.type) + '</span>',
      '      <span>' + escapeHtml(movie.duration) + '</span>',
      '    </div>',
      '    <div class="movie-tags">' + tags + '</div>',
      '    <a class="category-pill" href="' + base + escapeHtml(movie.category_url) + '">' + escapeHtml(movie.category_name) + '</a>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function applySearch() {
    var q = normalize(input && input.value);
    var category = normalize(categorySelect && categorySelect.value);
    var region = normalize(regionSelect && regionSelect.value);
    var year = normalize(yearSelect && yearSelect.value);

    var filtered = movies.filter(function (movie) {
      var haystack = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.one_line,
        (movie.tags || []).join(' '),
        movie.category_name
      ].join(' '));
      var okQuery = !q || haystack.indexOf(q) !== -1;
      var okCategory = !category || normalize(movie.category_name) === category;
      var okRegion = !region || normalize(movie.region) === region;
      var okYear = !year || normalize(movie.year) === year;
      return okQuery && okCategory && okRegion && okYear;
    });

    var limited = filtered.slice(0, 240);
    results.innerHTML = limited.map(card).join('');
    count.textContent = '找到 ' + filtered.length + ' 部影片' + (filtered.length > limited.length ? '，当前展示前 ' + limited.length + ' 部' : '');

    Array.prototype.slice.call(results.querySelectorAll('img[data-fallback-title]')).forEach(function (image) {
      image.addEventListener('error', function () {
        var frame = image.closest('.poster-frame');
        if (frame) {
          frame.setAttribute('data-missing', 'true');
        }
        image.classList.add('is-hidden');
      });
    });
  }

  function readInitialQuery() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    if (input) {
      input.value = q;
    }
  }

  fetch(base + 'assets/movies-index.json')
    .then(function (response) {
      if (!response.ok) {
        throw new Error('影片索引加载失败');
      }
      return response.json();
    })
    .then(function (data) {
      movies = data.movies || [];
      setOptions(regionSelect, uniqueSorted(movies.map(function (movie) { return movie.region; }), 80), '全部地区');
      setOptions(yearSelect, uniqueSorted(movies.map(function (movie) { return movie.year; }), 80).reverse(), '全部年份');
      readInitialQuery();
      applySearch();
    })
    .catch(function (error) {
      count.textContent = error.message || '搜索暂时不可用';
    });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    applySearch();
    var q = input ? input.value.trim() : '';
    var url = new URL(window.location.href);
    if (q) {
      url.searchParams.set('q', q);
    } else {
      url.searchParams.delete('q');
    }
    window.history.replaceState(null, '', url.toString());
  });

  form.addEventListener('input', applySearch);
  form.addEventListener('change', applySearch);
})();
