(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }

    var slides = selectAll('[data-hero-slide]', slider);
    var dots = selectAll('[data-hero-dot]', slider);
    var previous = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        start();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupCategoryFilters() {
    var form = document.querySelector('[data-filter-root]');
    var list = document.querySelector('[data-filter-list]');
    var count = document.querySelector('[data-filter-count]');
    if (!form || !list) {
      return;
    }

    var keywordInput = form.querySelector('[data-filter-keyword]');
    var regionSelect = form.querySelector('[data-filter-region]');
    var typeSelect = form.querySelector('[data-filter-type]');
    var yearSelect = form.querySelector('[data-filter-year]');
    var cards = selectAll('[data-movie-card]', list);

    function applyFilter() {
      var keyword = normalize(keywordInput && keywordInput.value);
      var region = normalize(regionSelect && regionSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' '));
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchRegion = !region || normalize(card.getAttribute('data-region')) === region;
        var matchType = !type || normalize(card.getAttribute('data-type')) === type;
        var matchYear = !year || normalize(card.getAttribute('data-year')) === year;
        var isVisible = matchKeyword && matchRegion && matchType && matchYear;

        card.hidden = !isVisible;
        if (isVisible) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '显示 ' + visible + ' 部影片';
      }
    }

    form.addEventListener('input', applyFilter);
    form.addEventListener('change', applyFilter);
    form.addEventListener('reset', function () {
      window.setTimeout(applyFilter, 0);
    });
    applyFilter();
  }

  function setupImageFallbacks() {
    selectAll('img[data-fallback-title]').forEach(function (image) {
      image.addEventListener('error', function () {
        var frame = image.closest('.poster-frame');
        if (frame) {
          frame.setAttribute('data-missing', 'true');
          if (!frame.getAttribute('data-title')) {
            frame.setAttribute('data-title', image.getAttribute('data-fallback-title') || image.alt || '影片封面');
          }
        }
        image.classList.add('is-hidden');
      });
    });
  }

  function fillSearchInputFromQuery() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (!q) {
      return;
    }
    selectAll('form[data-site-search] input[name="q"]').forEach(function (input) {
      input.value = q;
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHeroSlider();
    setupCategoryFilters();
    setupImageFallbacks();
    fillSearchInputFromQuery();
  });
})();
