(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function autoplay() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        autoplay();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        autoplay();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        autoplay();
      });
    });
    autoplay();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-card-search]");
      var list = scope.parentElement.querySelector("[data-card-list]");
      var buttons = Array.prototype.slice.call(scope.querySelectorAll("button"));
      var activeType = "all";
      var activeRegion = "all";
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

      function apply() {
        var q = input ? input.value.trim().toLowerCase() : "";
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.textContent
          ].join(" ").toLowerCase();
          var typeMatch = activeType === "all" || card.getAttribute("data-type") === activeType;
          var regionMatch = activeRegion === "all" || card.getAttribute("data-region") === activeRegion;
          var queryMatch = !q || haystack.indexOf(q) !== -1;
          card.classList.toggle("is-hidden", !(typeMatch && regionMatch && queryMatch));
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          if (button.hasAttribute("data-filter-type")) {
            activeType = button.getAttribute("data-filter-type");
            buttons.filter(function (btn) { return btn.hasAttribute("data-filter-type"); }).forEach(function (btn) {
              btn.classList.toggle("is-active", btn === button);
            });
          }
          if (button.hasAttribute("data-filter-region")) {
            activeRegion = button.getAttribute("data-filter-region");
            buttons.filter(function (btn) { return btn.hasAttribute("data-filter-region"); }).forEach(function (btn) {
              btn.classList.toggle("is-active", btn === button);
            });
          }
          apply();
        });
      });
    });
  }

  function initPlayer() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector("[data-play]");
      var message = box.querySelector("[data-player-message]");
      var stream = box.getAttribute("data-stream");
      if (!video || !button || !stream) {
        return;
      }

      function setMessage(text) {
        if (message) {
          message.textContent = text || "";
        }
      }

      function playVideo() {
        setMessage("正在加载播放源…");
        if (window.Hls && window.Hls.isSupported()) {
          if (box._hls) {
            box._hls.destroy();
          }
          var hls = new window.Hls({ enableWorker: true });
          box._hls = hls;
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().then(function () {
              box.classList.add("is-playing");
              setMessage("");
            }).catch(function () {
              setMessage("浏览器阻止自动播放，请再次点击视频播放。 ");
            });
          });
          hls.on(window.Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
              setMessage("播放源加载失败，请检查网络或稍后重试。 ");
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          video.play().then(function () {
            box.classList.add("is-playing");
            setMessage("");
          }).catch(function () {
            setMessage("浏览器阻止自动播放，请再次点击视频播放。 ");
          });
        } else {
          setMessage("当前浏览器不支持 HLS 播放，请更换浏览器访问。 ");
        }
      }

      button.addEventListener("click", playVideo);
    });
  }

  function initSearchPage() {
    var input = document.getElementById("site-search-input");
    var results = document.getElementById("search-results");
    var status = document.getElementById("search-status");
    if (!input || !results || !status || !window.SEARCH_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    input.value = params.get("q") || "";

    function card(movie) {
      return [
        '<article class="movie-card" data-title="', escapeHtml(movie.title), '">',
        '<a class="poster" href="', escapeHtml(movie.url), '">',
        '<img src="', escapeHtml(movie.cover), '" alt="', escapeHtml(movie.title), '" loading="lazy">',
        '<span class="poster-shade"></span><span class="play-chip">播放</span></a>',
        '<div class="card-body"><div class="meta-line"><span>', escapeHtml(movie.region), '</span><span>', movie.year, '</span><span>', escapeHtml(movie.type), '</span></div>',
        '<h3><a href="', escapeHtml(movie.url), '">', escapeHtml(movie.title), '</a></h3>',
        '<p>', escapeHtml(movie.oneLine), '</p>',
        '<div class="tags"><span>', escapeHtml(movie.category), '</span></div></div></article>'
      ].join("");
    }

    function escapeHtml(value) {
      return String(value || "").replace(/[&<>"']/g, function (char) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;"
        }[char];
      });
    }

    function run() {
      var q = input.value.trim().toLowerCase();
      if (!q) {
        results.innerHTML = "";
        status.textContent = "请输入关键词开始搜索。";
        return;
      }
      var matched = window.SEARCH_INDEX.filter(function (movie) {
        return movie.searchText.indexOf(q) !== -1;
      }).slice(0, 120);
      status.textContent = matched.length ? "找到 " + matched.length + " 条相关结果，最多展示前 120 条。" : "没有找到匹配影片。";
      results.innerHTML = matched.map(card).join("");
    }

    input.addEventListener("input", run);
    run();
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
    initSearchPage();
  });
})();
