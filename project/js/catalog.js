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
  const photo = p.photos && p.photos[0] ? p.photos[0] : CATEGORY_ICON[p.category];
  const soldOut = p.inStock === false;
  return `
    <article class="card ${soldOut ? 'card--soldout' : ''}" data-category="${p.category}">
      <a href="product.html?id=${encodeURIComponent(p.id)}" class="card__link">
        <div class="card__media card__media--${p.category}">
          <img src="${photo}" alt="${p.name}" loading="lazy" onerror="this.src='${CATEGORY_ICON[p.category]}'">
          ${soldOut ? '<span class="card__badge">Нет в наличии</span>' : ''}
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

const grid = document.getElementById('grid');
const filters = document.querySelectorAll('.filter');
let allProducts = [];

function renderGrid(products) {
  if (!products.length) {
    grid.innerHTML = '<p class="grid__empty">Пока пусто в этой категории.</p>';
    return;
  }
  grid.innerHTML = products.map(productCardHtml).join('');
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
