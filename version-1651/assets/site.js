(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var searchInput = document.querySelector('[data-search-input]');
  var clearButton = document.querySelector('[data-clear-search]');
  var list = document.querySelector('[data-card-list]');

  if (searchInput && list) {
    var cards = Array.prototype.slice.call(list.children);

    function filterCards() {
      var query = searchInput.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.textContent
        ].join(' ').toLowerCase();
        card.classList.toggle('is-filtered-out', query && text.indexOf(query) === -1);
      });
    }

    searchInput.addEventListener('input', filterCards);
    if (clearButton) {
      clearButton.addEventListener('click', function () {
        searchInput.value = '';
        filterCards();
        searchInput.focus();
      });
    }
  }
})();
