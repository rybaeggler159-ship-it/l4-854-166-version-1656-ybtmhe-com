(function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        if (input) {
          input.focus();
        }
      }
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle('is-active', i === current);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var index = Number(thumb.getAttribute('data-hero-thumb')) || 0;
        showSlide(index);
        startTimer();
      });
    });

    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);
    startTimer();
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var grid = scope.parentElement ? scope.parentElement.querySelector('[data-filter-grid]') : null;
    if (!grid) {
      return;
    }

    var input = scope.querySelector('[data-filter-input]');
    var typeSelect = scope.querySelector('[data-filter-type]');
    var categorySelect = scope.querySelector('[data-filter-category]');
    var resetButton = scope.querySelector('[data-filter-reset]');
    var empty = document.createElement('div');
    empty.className = 'filter-empty';
    empty.textContent = '当前筛选条件下没有匹配影片。';

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var query = normalize(input && input.value);
      var type = normalize(typeSelect && typeSelect.value);
      var category = normalize(categorySelect && categorySelect.value);
      var visibleCount = 0;
      var cards = Array.prototype.slice.call(grid.children).filter(function (child) {
        return child !== empty;
      });

      cards.forEach(function (card) {
        var search = normalize(card.getAttribute('data-search'));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardCategory = normalize(card.getAttribute('data-category'));
        var match = true;

        if (query && search.indexOf(query) === -1) {
          match = false;
        }
        if (type && cardType !== type) {
          match = false;
        }
        if (category && cardCategory !== category) {
          match = false;
        }

        card.hidden = !match;
        if (match) {
          visibleCount += 1;
        }
      });

      if (visibleCount === 0) {
        if (!empty.parentElement) {
          grid.appendChild(empty);
        }
      } else if (empty.parentElement) {
        empty.remove();
      }
    }

    [input, typeSelect, categorySelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        if (categorySelect) {
          categorySelect.value = '';
        }
        applyFilter();
      });
    }
  });
})();
