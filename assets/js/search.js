(function () {
  var form = document.querySelector('[data-search-page-form]');
  var results = document.querySelector('[data-search-results]');
  var summary = document.querySelector('[data-search-summary]');
  var input = form ? form.querySelector('input[name="q"]') : null;
  var movies = window.MOVIE_SEARCH_INDEX || [];

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="movie-card__poster" href="' + escapeHtml(movie.href) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="movie-card__play">▶</span>',
      '    <span class="movie-card__score">' + escapeHtml(movie.score) + '</span>',
      '  </a>',
      '  <div class="movie-card__body">',
      '    <div class="movie-card__meta">',
      '      <a href="' + escapeHtml(movie.categoryHref) + '">' + escapeHtml(movie.category) + '</a>',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '    </div>',
      '    <h3><a href="' + escapeHtml(movie.href) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="movie-card__tags">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function render(query) {
    var q = normalize(query);
    if (input) {
      input.value = query || '';
    }

    if (!q) {
      results.innerHTML = '';
      summary.textContent = '请输入关键词开始搜索。';
      return;
    }

    var matches = movies.filter(function (movie) {
      return normalize(movie.search).indexOf(q) !== -1;
    });

    summary.textContent = '关键词“' + query + '”共找到 ' + matches.length + ' 部影片。';
    results.innerHTML = matches.slice(0, 240).map(movieCard).join('');

    if (matches.length > 240) {
      var note = document.createElement('div');
      note.className = 'filter-empty';
      note.textContent = '结果较多，当前显示前 240 条，请继续输入更精确关键词。';
      results.appendChild(note);
    }

    if (matches.length === 0) {
      results.innerHTML = '<div class="filter-empty">没有找到匹配影片，请尝试其他关键词。</div>';
    }
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input ? input.value.trim() : '';
      var url = new URL(window.location.href);
      url.searchParams.set('q', query);
      window.history.replaceState(null, '', url.toString());
      render(query);
    });
  }

  var params = new URLSearchParams(window.location.search);
  render(params.get('q') || '');
})();
