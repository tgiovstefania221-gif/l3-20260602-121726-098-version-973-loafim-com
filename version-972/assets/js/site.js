document.addEventListener('DOMContentLoaded', function () {
    bindMobileMenu();
    bindSiteSearch();
    bindHeroCarousel();
    bindFilters();
    bindRankingTabs();
    bindVideoPlayers();
});

function bindMobileMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (!button || !panel) {
        return;
    }

    button.addEventListener('click', function () {
        panel.classList.toggle('open');
    });
}

function bindSiteSearch() {
    var forms = document.querySelectorAll('[data-site-search]');

    forms.forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var value = input ? input.value.trim() : '';
            var prefix = getRelativePrefix();
            var target = prefix + 'explore.html';

            if (value) {
                target += '?q=' + encodeURIComponent(value);
            }

            window.location.href = target;
        });
    });
}

function getRelativePrefix() {
    var path = window.location.pathname;

    if (path.indexOf('/movies/') !== -1 || path.indexOf('/categories/') !== -1) {
        return '../';
    }

    return '';
}

function bindHeroCarousel() {
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
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === index);
        });
    }

    function start() {
        stop();
        timer = window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function stop() {
        if (timer) {
            window.clearInterval(timer);
        }
    }

    if (prev) {
        prev.addEventListener('click', function () {
            show(index - 1);
            start();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            show(index + 1);
            start();
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            show(Number(dot.getAttribute('data-hero-dot')) || 0);
            start();
        });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
}

function bindFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    var grid = document.querySelector('[data-filter-grid]');

    if (!panel || !grid) {
        return;
    }

    var keywordInput = panel.querySelector('[data-filter-keyword]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var typeSelect = panel.querySelector('[data-filter-type]');
    var categorySelect = panel.querySelector('[data-filter-category]');
    var resetButton = panel.querySelector('[data-filter-reset]');
    var countNode = panel.querySelector('[data-filter-count]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (keywordInput && initialQuery) {
        keywordInput.value = initialQuery;
    }

    function matchesYear(card, yearValue) {
        if (!yearValue) {
            return true;
        }

        var year = Number(card.getAttribute('data-year') || '0');

        if (yearValue === '2010') {
            return year <= 2010;
        }

        return String(year) === yearValue;
    }

    function filter() {
        var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
        var yearValue = yearSelect ? yearSelect.value : '';
        var typeValue = typeSelect ? typeSelect.value : '';
        var categoryValue = categorySelect ? categorySelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
            var title = (card.getAttribute('data-title') || '').toLowerCase();
            var tags = (card.getAttribute('data-tags') || '').toLowerCase();
            var region = (card.getAttribute('data-region') || '').toLowerCase();
            var type = card.getAttribute('data-type') || '';
            var text = title + ' ' + tags + ' ' + region + ' ' + type.toLowerCase();
            var categoryText = card.getAttribute('data-category') || '';
            var ok = true;

            if (keyword && text.indexOf(keyword) === -1) {
                ok = false;
            }

            if (!matchesYear(card, yearValue)) {
                ok = false;
            }

            if (typeValue && type !== typeValue) {
                ok = false;
            }

            if (categoryValue && categoryText !== categoryValue) {
                ok = false;
            }

            card.classList.toggle('hidden-by-filter', !ok);

            if (ok) {
                visible += 1;
            }
        });

        if (countNode) {
            countNode.textContent = String(visible);
        }
    }

    [keywordInput, yearSelect, typeSelect, categorySelect].forEach(function (node) {
        if (!node) {
            return;
        }
        node.addEventListener('input', filter);
        node.addEventListener('change', filter);
    });

    if (resetButton) {
        resetButton.addEventListener('click', function () {
            if (keywordInput) {
                keywordInput.value = '';
            }
            if (yearSelect) {
                yearSelect.value = '';
            }
            if (typeSelect) {
                typeSelect.value = '';
            }
            if (categorySelect) {
                categorySelect.value = '';
            }
            filter();
        });
    }

    filter();
}

function bindRankingTabs() {
    var ranking = document.querySelector('[data-ranking]');

    if (!ranking) {
        return;
    }

    var tabs = Array.prototype.slice.call(ranking.querySelectorAll('[data-rank-tab]'));
    var panels = Array.prototype.slice.call(ranking.querySelectorAll('[data-rank-panel]'));

    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            var key = tab.getAttribute('data-rank-tab');

            tabs.forEach(function (item) {
                item.classList.toggle('active', item === tab);
            });

            panels.forEach(function (panel) {
                panel.classList.toggle('active', panel.getAttribute('data-rank-panel') === key);
            });
        });
    });
}

function bindVideoPlayers() {
    var cards = document.querySelectorAll('[data-player-card]');

    cards.forEach(function (card) {
        var video = card.querySelector('video[data-hls-src]');
        var button = card.querySelector('[data-play-button]');
        var status = card.querySelector('[data-player-status]');

        if (!video || !button) {
            return;
        }

        button.addEventListener('click', function () {
            initVideoPlayer(card, video, status);
        });
    });
}

function initVideoPlayer(card, video, status) {
    var source = video.getAttribute('data-hls-src');

    if (!source) {
        if (status) {
            status.textContent = '未找到播放源。';
        }
        return;
    }

    card.classList.add('playing');

    if (status) {
        status.textContent = '正在加载播放源...';
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        playVideo(video, status);
        return;
    }

    if (window.Hls && window.Hls.isSupported()) {
        if (!video.hlsInstance) {
            video.hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            video.hlsInstance.loadSource(source);
            video.hlsInstance.attachMedia(video);
            video.hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                playVideo(video, status);
            });
            video.hlsInstance.on(window.Hls.Events.ERROR, function () {
                if (status) {
                    status.textContent = '播放源加载异常，可稍后重试。';
                }
            });
        } else {
            playVideo(video, status);
        }
        return;
    }

    video.src = source;
    playVideo(video, status);
}

function playVideo(video, status) {
    var playPromise = video.play();

    if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(function () {
            if (status) {
                status.textContent = '正在播放。';
            }
        }).catch(function () {
            if (status) {
                status.textContent = '浏览器阻止自动播放，请再次点击视频播放。';
            }
        });
    } else if (status) {
        status.textContent = '正在播放。';
    }
}
