// ===== Иконки-заглушки по категориям (пока нет реальных фото) =====
const CATEGORY_ICON = {
  electro: 'img/icons/electro.svg',
  pitbike: 'img/icons/pitbike.svg',
  quad: 'img/icons/quad.svg'
};

function specsShort(specs) {
  return specs.slice(0, 3).map(s => `${s.label} ${s.value}`).join(' · ');
}

function productCardHtml(p) {
  const photos = p.photos && p.photos.length ? p.photos : [CATEGORY_ICON[p.category]];
  const multi = photos.length > 1;
  const soldOut = p.inStock === false;
  return `
    <article class="card ${soldOut ? 'card--soldout' : ''}" data-category="${p.category}" data-id="${p.id}">
      <a href="product.html?id=${encodeURIComponent(p.id)}" class="card__link">
        <div class="card__media card__media--${p.category}" data-index="0">
          <img src="${photos[0]}" alt="${p.name}" loading="lazy" onerror="this.src='${CATEGORY_ICON[p.category]}'">
          ${soldOut ? '<span class="card__badge">Нет в наличии</span>' : ''}
          ${multi ? `
            <button type="button" class="card__nav card__nav--prev" aria-label="Предыдущее фото">‹</button>
            <button type="button" class="card__nav card__nav--next" aria-label="Следующее фото">›</button>
            <div class="card__dots">${photos.map((_, i) => `<span class="card__dot${i === 0 ? ' is-active' : ''}"></span>`).join('')}</div>
          ` : ''}
        </div>
        <div class="card__body">
          <h3 class="card__title">${p.name}</h3>
          <p class="card__spec">${specsShort(p.specs)}</p>
        </div>
      </a>
      <div class="card__foot">
        <span class="card__price">от ${p.price} ₽</span>
        <button class="btn btn--small ${soldOut ? 'btn--ghost' : 'btn--accent'} order-btn"
                data-product="${p.name}" ${soldOut ? 'disabled' : ''}>
          ${soldOut ? 'Нет в наличии' : 'Заказать'}
        </button>
      </div>
    </article>
  `;
}

// Вешает свайп/стрелки на карточки, у которых больше одного фото.
// Клик по карточке при только что случившемся свайпе не должен уводить на страницу товара.
function wireCardGalleries(products) {
  document.querySelectorAll('.card').forEach(card => {
    const product = products.find(p => p.id === card.dataset.id);
    if (!product) return;
    const photos = product.photos && product.photos.length ? product.photos : [CATEGORY_ICON[product.category]];
    if (photos.length <= 1) return;

    const media = card.querySelector('.card__media');
    const img = media.querySelector('img');
    const dots = media.querySelectorAll('.card__dot');

    function show(i) {
      const idx = (i + photos.length) % photos.length;
      media.dataset.index = idx;
      img.src = photos[idx];
      dots.forEach((d, di) => d.classList.toggle('is-active', di === idx));
    }
    const next = () => show(Number(media.dataset.index) + 1);
    const prev = () => show(Number(media.dataset.index) - 1);

    media.querySelector('.card__nav--prev').addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation(); prev();
    });
    media.querySelector('.card__nav--next').addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation(); next();
    });

    enableSwipe(media, { onSwipeLeft: next, onSwipeRight: prev });
  });

  // Свайп на карточке не должен запускать переход по ссылке
  document.querySelectorAll('.card__link').forEach(link => {
    link.addEventListener('click', (e) => {
      const media = link.querySelector('.card__media');
      if (media && media.dataset.justSwiped) e.preventDefault();
    });
  });
}

const grid = document.getElementById('grid');
const filters = document.querySelectorAll('.filter');
let allProducts = [];

function renderGrid(products) {
  if (!products.length) {
    grid.innerHTML = '<p class="grid__empty">Пока пусто в этой категории.</p>';
    return;
  }
  grid.innerHTML = products.map(productCardHtml).join('');
  wireCardGalleries(products);
}

function applyFilter(value) {
  const filtered = value === 'all'
    ? allProducts
    : allProducts.filter(p => p.category === value);
  renderGrid(filtered);
}

filters.forEach(btn => {
  btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    applyFilter(btn.dataset.filter);
  });
});

fetch('data/products.json')
  .then(res => {
    if (!res.ok) throw new Error('network');
    return res.json();
  })
  .then(products => {
    allProducts = products;
    renderGrid(allProducts);
  })
  .catch(() => {
    grid.innerHTML = '<p class="grid__empty">Не получилось загрузить каталог. Обновите страницу.</p>';
  });
