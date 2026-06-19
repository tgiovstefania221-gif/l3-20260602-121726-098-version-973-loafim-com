(function () {
    const menuButton = document.querySelector("[data-menu-toggle]");
    const mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
    let activeSlide = 0;
    let slideTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, current) {
            slide.classList.toggle("is-active", current === activeSlide);
        });
        dots.forEach(function (dot, current) {
            dot.classList.toggle("is-active", current === activeSlide);
        });
    }

    function startCarousel() {
        if (slides.length < 2) {
            return;
        }
        slideTimer = window.setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            window.clearInterval(slideTimer);
            showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
            startCarousel();
        });
    });

    showSlide(0);
    startCarousel();

    const searchInput = document.querySelector(".js-movie-search");
    const yearFilter = document.querySelector(".js-year-filter");
    const categoryFilter = document.querySelector(".js-category-filter");
    const cards = Array.from(document.querySelectorAll(".js-movie-card"));

    function applyFilters() {
        const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
        const year = yearFilter ? yearFilter.value : "";
        const category = categoryFilter ? categoryFilter.value : "";

        cards.forEach(function (card) {
            const text = (card.getAttribute("data-search") || "").toLowerCase();
            const cardYear = card.getAttribute("data-card-year") || "";
            const cardCategory = card.getAttribute("data-card-category") || "";
            const matchesQuery = !query || text.indexOf(query) !== -1;
            const matchesYear = !year || cardYear === year;
            const matchesCategory = !category || cardCategory === category;
            card.classList.toggle("is-hidden-by-filter", !(matchesQuery && matchesYear && matchesCategory));
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
    }
    if (yearFilter) {
        yearFilter.addEventListener("change", applyFilters);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener("change", applyFilters);
    }
}());
