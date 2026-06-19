(function () {
  const $ = function (selector, root) {
    return (root || document).querySelector(selector);
  };

  const $$ = function (selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  };

  $$('[data-mobile-toggle]').forEach(function (button) {
    button.addEventListener('click', function () {
      const nav = $('[data-mobile-nav]');
      if (nav) {
        nav.classList.toggle('is-open');
      }
    });
  });

  $$('img[data-cover-image]').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('is-hidden');
    });
  });

  $$('[data-carousel]').forEach(function (carousel) {
    const slides = $$('.hero-slide', carousel);
    const dots = $$('.hero-dot', carousel);
    const prev = $('[data-carousel-prev]', carousel);
    const next = $('[data-carousel-next]', carousel);
    let current = 0;
    let timer = null;

    const show = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    };

    const start = function () {
      stop();
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    };

    const stop = function () {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    if (prev) {
      prev.addEventListener('click', function () {
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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide-to')) || 0);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  $$('[data-filter-form]').forEach(function (form) {
    const scope = form.parentElement || document;
    const input = $('[data-filter-input]', form);
    const category = $('[data-filter-category]', form);
    const type = $('[data-filter-type]', form);
    const year = $('[data-filter-year]', form);
    const list = $('[data-filter-list]', scope);
    const empty = $('[data-empty-state]', scope);
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    const apply = function () {
      const query = input ? input.value.trim().toLowerCase() : '';
      const categoryValue = category ? category.value : '';
      const typeValue = type ? type.value : '';
      const yearValue = year ? year.value : '';
      let visible = 0;
      $$('.filter-item', list || scope).forEach(function (item) {
        const text = item.getAttribute('data-title') || '';
        const okQuery = !query || text.indexOf(query) !== -1;
        const okCategory = !categoryValue || item.getAttribute('data-category') === categoryValue;
        const okType = !typeValue || item.getAttribute('data-type') === typeValue;
        const okYear = !yearValue || item.getAttribute('data-year') === yearValue;
        const ok = okQuery && okCategory && okType && okYear;
        item.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };

    [input, category, type, year].forEach(function (field) {
      if (field) {
        field.addEventListener('input', apply);
        field.addEventListener('change', apply);
      }
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      apply();
    });

    apply();
  });

  $$('[data-player-stage]').forEach(function (stage) {
    const video = $('video', stage);
    const cover = $('.player-cover', stage);
    const buttons = $$('[data-play-button]', stage);
    const stream = stage.getAttribute('data-stream');
    let ready = false;
    let hls = null;

    const bind = function () {
      if (!video || !stream || ready) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    };

    const play = function () {
      if (!video) {
        return;
      }
      bind();
      stage.classList.add('is-playing');
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          stage.classList.remove('is-playing');
        });
      }
    };

    buttons.forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    });

    if (cover) {
      cover.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('play', function () {
        stage.classList.add('is-playing');
      });
      video.addEventListener('ended', function () {
        stage.classList.remove('is-playing');
      });
      video.addEventListener('error', function () {
        stage.classList.remove('is-playing');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  });
})();
