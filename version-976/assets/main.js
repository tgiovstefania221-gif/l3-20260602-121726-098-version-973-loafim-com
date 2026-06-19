(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function makeFallbackImage(image) {
    if (image.dataset.fallbackApplied === '1') {
      return;
    }
    image.dataset.fallbackApplied = '1';
    var fallback = document.createElement('div');
    fallback.className = 'cover-fallback';
    fallback.textContent = image.getAttribute('data-fallback-title') || image.alt || '影视封面';
    image.replaceWith(fallback);
  }

  function setupImageFallbacks() {
    document.querySelectorAll('img[data-fallback-title]').forEach(function (image) {
      image.addEventListener('error', function () {
        makeFallbackImage(image);
      });
      if (image.complete && image.naturalWidth === 0) {
        makeFallbackImage(image);
      }
    });
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-mobile-menu]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupBackTop() {
    document.querySelectorAll('[data-back-top]').forEach(function (button) {
      button.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
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
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

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

    show(0);
    restart();
  }

  function setupCardSearch() {
    var input = document.querySelector('[data-card-search]');
    var grid = document.querySelector('[data-card-grid]');
    var count = document.querySelector('[data-filter-count]');
    if (!input || !grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    function update() {
      var keyword = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region')
        ].join(' ').toLowerCase();
        var matched = !keyword || haystack.indexOf(keyword) !== -1;
        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = visible + ' 部影片';
      }
    }

    input.addEventListener('input', update);
    update();
  }

  function movieCardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '' +
      '<article class="movie-card">' +
      '  <a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="查看 ' + escapeHtml(movie.title) + '">' +
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" data-fallback-title="' + escapeHtml(movie.title) + '">' +
      '    <span class="poster-badge">' + escapeHtml(movie.region) + '</span>' +
      '    <span class="poster-play">▶</span>' +
      '  </a>' +
      '  <div class="movie-card-body">' +
      '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
      '    <p class="movie-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.genre) + '</p>' +
      '    <p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>' +
      '    <div class="tag-row">' + tags + '</div>' +
      '  </div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[character];
    });
  }

  function setupGlobalSearch() {
    var input = document.querySelector('[data-global-search]');
    var output = document.querySelector('[data-global-search-results]');
    var count = document.querySelector('[data-global-search-count]');
    if (!input || !output || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    function update() {
      var keyword = input.value.trim().toLowerCase();
      if (!keyword) {
        output.innerHTML = '';
        count.textContent = '请先输入关键词。';
        return;
      }
      var results = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
        return movie.searchText.indexOf(keyword) !== -1;
      }).slice(0, 72);
      output.innerHTML = results.map(movieCardTemplate).join('');
      count.textContent = '找到 ' + results.length + ' 部匹配影片';
      setupImageFallbacks();
    }

    input.addEventListener('input', update);
    update();
  }

  ready(function () {
    setupImageFallbacks();
    setupMobileMenu();
    setupBackTop();
    setupHero();
    setupCardSearch();
    setupGlobalSearch();
  });
})();
