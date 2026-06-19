import { H as Hls } from "./hls-vendor-dru42stk.js";

const menuButton = document.querySelector("[data-menu-button]");
const mobilePanel = document.querySelector("[data-mobile-panel]");

if (menuButton && mobilePanel) {
  menuButton.addEventListener("click", () => {
    mobilePanel.classList.toggle("is-open");
  });
}

const carousel = document.querySelector("[data-hero-carousel]");

if (carousel) {
  const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
  let index = 0;

  const showSlide = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, current) => {
      slide.classList.toggle("is-active", current === index);
    });
    dots.forEach((dot, current) => {
      dot.classList.toggle("is-active", current === index);
    });
  };

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      showSlide(Number(dot.dataset.heroDot || 0));
    });
  });

  if (slides.length > 1) {
    setInterval(() => {
      showSlide(index + 1);
    }, 5600);
  }
}

const playerShell = document.querySelector("[data-video-src]");

if (playerShell) {
  const video = playerShell.querySelector("video");
  const playButton = playerShell.querySelector("[data-play-button]");
  const source = playerShell.dataset.videoSrc;
  let hlsInstance = null;

  const loadVideo = () => {
    if (!video || !source || video.dataset.ready === "true") {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }

    video.dataset.ready = "true";
    playerShell.classList.add("is-ready");
  };

  const startVideo = () => {
    loadVideo();
    if (video) {
      video.play().catch(() => {});
    }
  };

  if (playButton) {
    playButton.addEventListener("click", startVideo);
  }

  playerShell.addEventListener("click", (event) => {
    if (event.target !== video) {
      startVideo();
    }
  });

  if (video) {
    video.addEventListener("play", () => {
      playerShell.classList.add("is-playing");
    });
    video.addEventListener("pause", () => {
      playerShell.classList.remove("is-playing");
    });
  }

  window.addEventListener("pagehide", () => {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

const searchList = document.querySelector("[data-search-list]");
const searchInput = document.querySelector("[data-search-input]");
const emptyState = document.querySelector("[data-empty-state]");
const clearSearch = document.querySelector("[data-clear-search]");

if (searchList && searchInput) {
  const cards = Array.from(searchList.querySelectorAll(".movie-card"));
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q") || "";

  const filterCards = () => {
    const query = searchInput.value.trim().toLowerCase();
    let visible = 0;

    cards.forEach((card) => {
      const haystack = `${card.dataset.title || ""} ${card.dataset.meta || ""}`;
      const matched = !query || haystack.includes(query);
      card.style.display = matched ? "" : "none";
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle("is-visible", visible === 0);
    }
  };

  searchInput.value = initialQuery;
  searchInput.addEventListener("input", filterCards);

  if (clearSearch) {
    clearSearch.addEventListener("click", () => {
      searchInput.value = "";
      filterCards();
      searchInput.focus();
    });
  }

  filterCards();
}

const filterList = document.querySelector("[data-filter-list]");
const filterButtons = Array.from(document.querySelectorAll("[data-filter-button]"));

if (filterList && filterButtons.length) {
  const cards = Array.from(filterList.querySelectorAll(".movie-card"));

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.dataset.filterButton || "all";
      filterButtons.forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });
      cards.forEach((card) => {
        const haystack = `${card.dataset.title || ""} ${card.dataset.meta || ""}`;
        card.style.display = value === "all" || haystack.includes(value) ? "" : "none";
      });
    });
  });
}
