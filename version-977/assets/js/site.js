(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-nav-menu]");

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    setupHeroCarousel();
    setupLocalFilters();
    setupSiteSearch();
    setupPlayers();
  });

  function setupHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
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

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    restart();
  }

  function setupLocalFilters() {
    var searchInput = document.querySelector("[data-local-search]");
    var categorySelect = document.querySelector("[data-local-category]");
    var yearSelect = document.querySelector("[data-year-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

    if (!searchInput && !categorySelect && !yearSelect) {
      return;
    }

    function apply() {
      var keyword = normalize(searchInput ? searchInput.value : "");
      var category = normalize(categorySelect ? categorySelect.value : "");
      var year = normalize(yearSelect ? yearSelect.value : "");

      cards.forEach(function (card) {
        var title = normalize(card.getAttribute("data-title"));
        var cardCategory = normalize(card.getAttribute("data-category"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var text = normalize(card.textContent);
        var matchesKeyword = !keyword || title.indexOf(keyword) >= 0 || text.indexOf(keyword) >= 0;
        var matchesCategory = !category || cardCategory === category;
        var matchesYear = !year || cardYear === year;
        card.style.display = matchesKeyword && matchesCategory && matchesYear ? "" : "none";
      });
    }

    [searchInput, categorySelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  }

  function setupSiteSearch() {
    var input = document.getElementById("siteSearch");
    var category = document.getElementById("searchCategory");
    var results = document.getElementById("searchResults");

    if (!input || !results || !window.SEARCH_INDEX) {
      return;
    }

    function card(item) {
      var title = escapeHtml(item.title);
      var url = escapeHtml(item.url);
      var cover = escapeHtml(item.cover);
      var rating = escapeHtml(item.rating);
      var year = escapeHtml(item.year);
      var region = escapeHtml(item.region);
      var type = escapeHtml(item.type);
      var oneLine = escapeHtml(item.oneLine);
      var category = escapeHtml(item.category);

      return [
        '<article class="movie-card">',
        '  <a class="movie-poster" href="' + url + '">',
        '    <img src="' + cover + '" alt="' + title + '" loading="lazy" onerror="this.classList.add(\'image-missing\');" />',
        '    <span class="score">' + rating + '</span>',
        '  </a>',
        '  <div class="movie-card__body">',
        '    <h3><a href="' + url + '">' + title + '</a></h3>',
        '    <p class="movie-meta">' + year + ' · ' + region + ' · ' + type + '</p>',
        '    <p class="movie-one-line">' + oneLine + '</p>',
        '    <div class="tag-row"><span>' + category + '</span></div>',
        '  </div>',
        '</article>'
      ].join("");
    }

    function render() {
      var q = normalize(input.value);
      var cat = normalize(category ? category.value : "");
      var matches = window.SEARCH_INDEX.filter(function (item) {
        var haystack = normalize(item.title + " " + item.year + " " + item.region + " " + item.type + " " + item.genre + " " + item.tags + " " + item.oneLine);
        var matchesQuery = !q || haystack.indexOf(q) >= 0;
        var matchesCategory = !cat || normalize(item.category) === cat;
        return matchesQuery && matchesCategory;
      }).slice(0, 120);

      if (matches.length === 0) {
        results.innerHTML = '<p class="movie-meta">没有找到匹配影片。</p>';
        return;
      }

      results.innerHTML = matches.map(card).join("");
    }

    input.addEventListener("input", render);
    if (category) {
      category.addEventListener("change", render);
    }

    var params = new URLSearchParams(window.location.search);
    if (params.get("q")) {
      input.value = params.get("q");
    }
    render();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("video[data-hls]"));

    players.forEach(function (video) {
      var source = video.getAttribute("data-hls");
      var box = video.closest(".player-box");
      var button = box ? box.querySelector(".player-start") : null;
      var initialized = false;

      function initialize() {
        if (initialized || !source) {
          return;
        }
        initialized = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          var link = document.createElement("a");
          link.href = source;
          link.textContent = "当前浏览器不支持 HLS，点击打开播放源";
          link.className = "btn btn-primary";
          if (box) {
            box.appendChild(link);
          }
        }
      }

      function start() {
        initialize();
        if (box) {
          box.classList.add("is-playing");
        }
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", start);
      }

      video.addEventListener("play", function () {
        if (box) {
          box.classList.add("is-playing");
        }
      });
    });
  }
})();
