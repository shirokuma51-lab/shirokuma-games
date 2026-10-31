(() => {
  'use strict';
  const safeUrl = value => {
    if (typeof value !== 'string' || !value.trim()) return null;
    try { const url = new URL(value, document.baseURI); return ['http:', 'https:', 'file:'].includes(url.protocol) ? url.href : null; } catch { return null; }
  };
  const games = (window.SHIROKUMA_GAMES || []).filter(g => g.status === 'published' && g.title && safeUrl(g.url) && /^\d{4}-\d{2}-\d{2}$/.test(g.releaseDate) && !Number.isNaN(Date.parse(g.releaseDate)) && Date.parse(g.releaseDate) <= Date.now());
  const el = (tag, className, text) => { const n = document.createElement(tag); if (className) n.className = className; if (text) n.textContent = text; return n; };
  function card(g) {
    const article = el('article', 'card'), link = el('a'); link.href = safeUrl(g.url);
    const cover = el('div', 'cover', '✦');
    if (safeUrl(g.thumbnail)) { const img = el('img'); img.src = safeUrl(g.thumbnail); img.alt = ''; img.loading = 'lazy'; img.addEventListener('error', () => img.replaceWith(cover), { once: true }); link.append(img); } else link.append(cover);
    const body = el('div', 'card-body'); body.append(el('span', 'tag', g.genre || 'その他'), el('h3', '', g.title), el('p', '', g.description || ''), el('span', 'play', 'ゲームを遊ぶ ↗')); link.append(body); article.append(link); return article;
  }
  function render(id, list, title, description) {
    const container = document.getElementById(id); container.replaceChildren();
    if (list.length) container.append(...list.map(card));
    else { const box = el('div', 'empty'), copy = el('div'); copy.append(el('h3', '', title), el('p', '', description)); const icon = el('span', 'empty-icon', '✧'); icon.setAttribute('aria-hidden', 'true'); box.append(icon, copy); container.append(box); }
  }
  render('new-games', [...games].sort((a,b) => b.releaseDate.localeCompare(a.releaseDate)), '最初の「新着」を、お楽しみに。', '公開されたゲームが、ここに新しい順で並びます。');
  render('recommended-games', games.filter(g => Number.isFinite(g.recommendedOrder)).sort((a,b) => a.recommendedOrder-b.recommendedOrder), 'しろくまのおすすめ、準備中。', 'おすすめの作品が決まり次第、ご紹介します。');
  const genres = [...new Set(['すべて', 'パズル', '育成', '謎解き', '冒険', 'シミュレーション', 'RPG', ...games.map(g => g.genre || 'その他')])];
  function select(genre) { const list = genre === 'すべて' ? games : games.filter(g => (g.genre || 'その他') === genre); document.getElementById('count').textContent = `${list.length} 作品`; render('all-games', list, games.length ? 'このジャンルのゲームはまだありません。' : 'ただいま、ゲームを準備しています。', '作品を公開したら、こちらから遊べるようになります。'); document.querySelectorAll('#filters button').forEach(b => b.setAttribute('aria-pressed', String(b.textContent === genre))); }
  genres.forEach(genre => { const b = el('button', '', genre); b.type = 'button'; b.addEventListener('click', () => select(genre)); document.getElementById('filters').append(b); }); select('すべて');
  document.querySelectorAll('.track').forEach(track => {
    const buttons = [...document.querySelectorAll(`[data-track="${track.id}"]`)];
    const update = () => buttons.forEach(b => { b.disabled = Number(b.dataset.dir) < 0 ? track.scrollLeft <= 2 : track.scrollLeft + track.clientWidth >= track.scrollWidth - 2; });
    buttons.forEach(b => b.addEventListener('click', () => { const card = track.querySelector('.card'); track.scrollBy({left: Number(b.dataset.dir) * (card ? card.getBoundingClientRect().width + 22 : track.clientWidth), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'}); }));
    track.addEventListener('scroll', update, {passive:true}); new ResizeObserver(update).observe(track); update();
  });
})();
