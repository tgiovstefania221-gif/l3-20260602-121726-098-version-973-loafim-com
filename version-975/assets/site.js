(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var navButton = document.querySelector('.nav-toggle');
        if (navButton) {
            navButton.addEventListener('click', function () {
                var open = document.body.classList.toggle('site-nav-open');
                navButton.setAttribute('aria-expanded', String(open));
            });
        }

        var slider = document.querySelector('.hero-slider');
        if (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
            var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
            var current = 0;

            function show(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, itemIndex) {
                    slide.classList.toggle('is-active', itemIndex === current);
                });
                dots.forEach(function (dot, itemIndex) {
                    dot.classList.toggle('is-active', itemIndex === current);
                });
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener('click', function () {
                    show(index);
                });
            });

            if (slides.length > 1) {
                window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }
        }

        var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.catalog-search'));
        searchInputs.forEach(function (input) {
            var scope = input.closest('section') || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.js-card'));

            input.addEventListener('input', function () {
                var words = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
                    var matched = words.every(function (word) {
                        return haystack.indexOf(word) !== -1;
                    });
                    card.classList.toggle('is-hidden', !matched);
                });
            });
        });
    });
})();
