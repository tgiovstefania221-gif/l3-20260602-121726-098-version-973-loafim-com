
(() => {
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

  const toggle = qs('.mobile-toggle');
  const panel = qs('.mobile-panel');
  if (toggle && panel) toggle.addEventListener('click', () => panel.classList.toggle('open'));

  const hero = qs('[data-hero-slider]');
  if (hero) {
    const slides = qsa('[data-hero-slide]', hero);
    const dots = qsa('[data-hero-dot]', hero);
    let idx = 0;
    const show = (n) => {
      idx = (n + slides.length) % slides.length;
      slides.forEach((el, i) => el.classList.toggle('active', i === idx));
      dots.forEach((el) => el.classList.toggle('active', Number(el.dataset.heroDot) === idx));
    };
    dots.forEach((btn) => btn.addEventListener('click', () => show(Number(btn.dataset.heroDot))));
    if (slides.length > 1) setInterval(() => show(idx + 1), 5200);
  }

  const normalize = (v) => (v || '').toString().toLowerCase().trim();
  const getCards = () => qsa('[data-card]');
  const filterCards = (term, region, year) => {
    const t = normalize(term);
    let count = 0;
    getCards().forEach((card) => {
      const hay = normalize([card.dataset.title, card.dataset.region, card.dataset.genre, card.dataset.tags, card.dataset.category, card.dataset.year].join(' '));
      const passTerm = !t || hay.includes(t);
      const passRegion = !region || card.dataset.region === region;
      const passYear = !year || card.dataset.year === year;
      const ok = passTerm && passRegion && passYear;
      card.classList.toggle('is-hidden', !ok);
      if (ok) count += 1;
    });
    const c = qs('[data-result-count]');
    if (c) c.textContent = count;
    qsa('.no-results').forEach((n) => n.remove());
    const grid = qs('.movie-grid');
    if (grid && count === 0) {
      const n = document.createElement('div');
      n.className = 'no-results';
      n.textContent = '没有找到匹配影片';
      grid.after(n);
    }
  };

  qsa('[data-inline-filter]').forEach((input) => {
    input.addEventListener('input', () => filterCards(input.value, '', ''));
  });

  const searchForm = qs('[data-search-form]');
  if (searchForm) {
    const input = qs('[data-search-input]');
    const region = qs('[data-region-filter]');
    const year = qs('[data-year-filter]');
    const params = new URLSearchParams(location.search);
    if (params.get('q')) input.value = params.get('q');
    const run = () => filterCards(input.value, region.value, year.value);
    searchForm.addEventListener('submit', (e) => { e.preventDefault(); run(); });
    [input, region, year].forEach((el) => el && el.addEventListener('input', run));
    run();
  }

  qsa('[data-sort-cards]').forEach((select) => {
    const container = select.closest('section') || document;
    const grid = qs('.movie-grid', container) || qs('.rank-list', container);
    if (!grid) return;
    const sort = () => {
      const cards = qsa('[data-card]', grid);
      const val = select.value;
      cards.sort((a, b) => {
        if (val === 'rating') return parseFloat(b.dataset.rating || '0') - parseFloat(a.dataset.rating || '0');
        if (val === 'views') return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
        if (val === 'year') return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        return 0;
      }).forEach((el) => grid.appendChild(el));
    };
    select.addEventListener('change', sort);
  });
})();
