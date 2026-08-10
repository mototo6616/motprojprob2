const CATEGORY_ICON = {
  electro: 'img/icons/electro.svg',
  pitbike: 'img/icons/pitbike.svg',
  quad: 'img/icons/quad.svg'
};
const CATEGORY_LABEL = {
  electro: 'Электротранспорт',
  pitbike: 'Питбайки',
  quad: 'Квадроциклы'
};

const root = document.getElementById('product-root');
const params = new URLSearchParams(window.location.search);
const id = params.get('id');

function render(p) {
  document.title = `${p.name} — Мототовары`;

  const photos = p.photos && p.photos.length ? p.photos : [CATEGORY_ICON[p.category]];
  const soldOut = p.inStock === false;

  const gallery = photos.map((src, i) => `
    <button class="gallery__thumb ${i === 0 ? 'is-active' : ''}" data-src="${src}" aria-label="Фото ${i + 1}">
      <img src="${src}" alt="" onerror="this.src='${CATEGORY_ICON[p.category]}'">
    </button>
  `).join('');

  const specsRows = p.specs.map(s => `
    <div class="spec-row">
      <span class="spec-row__label">${s.label}</span>
      <span class="spec-row__value">${s.value}</span>
    </div>
  `).join('');

  root.innerHTML = `
    <a href="index.html#catalog" class="back-link">← Назад в каталог</a>

    <div class="product">
      <div class="product__gallery">
        <div class="gallery__main">
          <img id="gallery-main-img" src="${photos[0]}" alt="${p.name}" onerror="this.src='${CATEGORY_ICON[p.category]}'">
          ${photos.length > 1 ? `
            <button type="button" class="gallery__nav gallery__nav--prev" aria-label="Предыдущее фото">‹</button>
            <button type="button" class="gallery__nav gallery__nav--next" aria-label="Следующее фото">›</button>
          ` : ''}
        </div>
        ${photos.length > 1 ? `<div class="gallery__thumbs">${gallery}</div>` : ''}
      </div>

      <div class="product__info">
        <p class="eyebrow">${CATEGORY_LABEL[p.category] || ''}</p>
        <h1 class="product__title">${p.name}</h1>
        <p class="product__price">от ${p.price} ₽</p>

        <button class="btn ${soldOut ? 'btn--ghost' : 'btn--accent'} order-btn" data-product="${p.name}" ${soldOut ? 'disabled' : ''}>
          ${soldOut ? 'Нет в наличии' : 'Заказать'}
        </button>

        <div class="spec-table">${specsRows}</div>

        <p class="product__desc">${p.description || ''}</p>
      </div>
    </div>
  `;

  const thumbs = root.querySelectorAll('.gallery__thumb');
  const mainImg = document.getElementById('gallery-main-img');
  let currentIndex = 0;

  function showPhoto(i) {
    currentIndex = (i + photos.length) % photos.length;
    mainImg.src = photos[currentIndex];
    thumbs.forEach((t, ti) => t.classList.toggle('is-active', ti === currentIndex));
  }

  thumbs.forEach((thumb, i) => thumb.addEventListener('click', () => showPhoto(i)));

  if (photos.length > 1) {
    const mainEl = root.querySelector('.gallery__main');
    mainEl.querySelector('.gallery__nav--prev').addEventListener('click', () => showPhoto(currentIndex - 1));
    mainEl.querySelector('.gallery__nav--next').addEventListener('click', () => showPhoto(currentIndex + 1));
    enableSwipe(mainEl, {
      onSwipeLeft: () => showPhoto(currentIndex + 1),
      onSwipeRight: () => showPhoto(currentIndex - 1)
    });
  }
}

function renderNotFound() {
  root.innerHTML = `
    <a href="index.html#catalog" class="back-link">← Назад в каталог</a>
    <p class="grid__empty">Такой товар не найден — возможно, он был убран из каталога.</p>
  `;
}

fetch('data/products.json')
  .then(res => {
    if (!res.ok) throw new Error('network');
    return res.json();
  })
  .then(products => {
    const product = products.find(p => p.id === id);
    if (!product) return renderNotFound();
    render(product);
  })
  .catch(() => {
    root.innerHTML = '<p class="grid__empty">Не получилось загрузить товар. Обновите страницу.</p>';
  });
