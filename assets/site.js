(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.visual-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-slide-dot]'));
    var prev = slider.querySelector('[data-slide-prev]');
    var next = slider.querySelector('[data-slide-next]');
    var current = 0;
    var timer = null;

    var showSlide = function (index) {
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
    };

    var restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    };

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide-dot')) || 0);
        restart();
      });
    });

    showSlide(0);
    restart();
  }

  var playerBlocks = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));

  var startPlayer = function (block) {
    var video = block.querySelector('video');
    var stream = block.getAttribute('data-stream');

    if (!video || !stream) {
      return;
    }

    if (!block.getAttribute('data-ready')) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        block._hls = hls;
      } else {
        video.src = stream;
      }

      block.setAttribute('data-ready', '1');
    }

    block.classList.add('is-playing');

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  };

  playerBlocks.forEach(function (block) {
    var cover = block.querySelector('.player-cover');
    var video = block.querySelector('video');

    if (cover) {
      cover.addEventListener('click', function () {
        startPlayer(block);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!block.getAttribute('data-ready')) {
          startPlayer(block);
        }
      });
    }
  });

  var searchPage = document.querySelector('[data-search-page]');

  if (searchPage) {
    var keywordInput = searchPage.querySelector('[data-filter-keyword]');
    var categorySelect = searchPage.querySelector('[data-filter-category]');
    var typeSelect = searchPage.querySelector('[data-filter-type]');
    var regionSelect = searchPage.querySelector('[data-filter-region]');
    var yearInput = searchPage.querySelector('[data-filter-year]');
    var resetButton = searchPage.querySelector('[data-filter-reset]');
    var countBox = searchPage.querySelector('[data-filter-count]');
    var cards = Array.prototype.slice.call(searchPage.querySelectorAll('.movie-card'));
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (keywordInput && query) {
      keywordInput.value = query;
    }

    var getValue = function (node) {
      return node ? node.value.trim().toLowerCase() : '';
    };

    var applyFilter = function () {
      var keyword = getValue(keywordInput);
      var category = getValue(categorySelect);
      var type = getValue(typeSelect);
      var region = getValue(regionSelect);
      var year = getValue(yearInput);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-category') || '',
          card.getAttribute('data-tags') || '',
          card.textContent || ''
        ].join(' ').toLowerCase();
        var ok = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          ok = false;
        }

        if (category && (card.getAttribute('data-category') || '').toLowerCase() !== category) {
          ok = false;
        }

        if (type && (card.getAttribute('data-type') || '').toLowerCase() !== type) {
          ok = false;
        }

        if (region && (card.getAttribute('data-region') || '').toLowerCase() !== region) {
          ok = false;
        }

        if (year && (card.getAttribute('data-year') || '').toLowerCase() !== year) {
          ok = false;
        }

        card.style.display = ok ? '' : 'none';

        if (ok) {
          visible += 1;
        }
      });

      if (countBox) {
        countBox.textContent = String(visible);
      }
    };

    [keywordInput, categorySelect, typeSelect, regionSelect, yearInput].forEach(function (node) {
      if (node) {
        node.addEventListener('input', applyFilter);
        node.addEventListener('change', applyFilter);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        [keywordInput, categorySelect, typeSelect, regionSelect, yearInput].forEach(function (node) {
          if (node) {
            node.value = '';
          }
        });
        applyFilter();
      });
    }

    applyFilter();
  }
})();
