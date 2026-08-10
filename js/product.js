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

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function render(p) {
  document.title = `${p.name} — Мототовары`;

  const photos = p.photos && p.photos.length
    ? p.photos
    : [CATEGORY_ICON[p.category]];

  const fallbackIcon = CATEGORY_ICON[p.category] || CATEGORY_ICON.electro;
  const soldOut = p.inStock === false;

  const specs = Array.isArray(p.specs) ? p.specs : [];

  const gallery = photos.map((src, i) => `
    <button
      class="gallery__thumb ${i === 0 ? 'is-active' : ''}"
      data-src="${escapeHtml(src)}"
      aria-label="Фото ${i + 1}"
      type="button"
    >
      <img
        src="${escapeHtml(src)}"
        alt=""
      >
    </button>
  `).join('');

  const specsRows = specs.map(s => `
    <div class="spec-row">
      <span class="spec-row__label">${escapeHtml(s.label)}</span>
      <span class="spec-row__value">${escapeHtml(s.value)}</span>
    </div>
  `).join('');

  root.innerHTML = `
    <a href="index.html#catalog" class="back-link">← Назад в каталог</a>

    <div class="product">
      <div class="product__gallery">
        <div class="gallery__main">
          <img
            id="gallery-main-img"
            src="${escapeHtml(photos[0])}"
            alt="${escapeHtml(p.name)}"
          >

          ${photos.length > 1 ? `
            <button
              type="button"
              class="gallery__nav gallery__nav--prev"
              aria-label="Предыдущее фото"
            >‹</button>

            <button
              type="button"
              class="gallery__nav gallery__nav--next"
              aria-label="Следующее фото"
            >›</button>
          ` : ''}
        </div>

        ${photos.length > 1
          ? `<div class="gallery__thumbs">${gallery}</div>`
          : ''
        }
      </div>

      <div class="product__info">
        <p class="eyebrow">
          ${escapeHtml(CATEGORY_LABEL[p.category] || '')}
        </p>

        <h1 class="product__title">
          ${escapeHtml(p.name)}
        </h1>

        <p class="product__price">
          от ${escapeHtml(p.price)} ₽
        </p>

        <button
          class="btn ${soldOut ? 'btn--ghost' : 'btn--accent'} order-btn"
          data-product="${escapeHtml(p.name)}"
          ${soldOut ? 'disabled' : ''}
        >
          ${soldOut ? 'Нет в наличии' : 'Заказать'}
        </button>

        <div class="spec-table">
          ${specsRows}
        </div>

        <p class="product__desc">
          ${escapeHtml(p.description || '')}
        </p>
      </div>
    </div>
  `;

  // Fallback для отсутствующих изображений.
  const allImages = root.querySelectorAll('img');

  allImages.forEach(img => {
    img.addEventListener('error', () => {
      if (img.dataset.fallbackApplied === 'true') return;

      img.dataset.fallbackApplied = 'true';
      img.src = fallbackIcon;
    });
  });

  const thumbs = root.querySelectorAll('.gallery__thumb');
  const mainImg = document.getElementById('gallery-main-img');

  let currentIndex = 0;

  function showPhoto(i) {
    currentIndex = (i + photos.length) % photos.length;

    mainImg.src = photos[currentIndex];

    thumbs.forEach((t, ti) => {
      t.classList.toggle('is-active', ti === currentIndex);
    });
  }

  thumbs.forEach((thumb, i) => {
    thumb.addEventListener('click', () => showPhoto(i));
  });

  if (photos.length > 1) {
    const mainEl = root.querySelector('.gallery__main');

    mainEl
      .querySelector('.gallery__nav--prev')
      .addEventListener('click', () => {
        showPhoto(currentIndex - 1);
      });

    mainEl
      .querySelector('.gallery__nav--next')
      .addEventListener('click', () => {
        showPhoto(currentIndex + 1);
      });

    enableSwipe(mainEl, {
      onSwipeLeft: () => showPhoto(currentIndex + 1),
      onSwipeRight: () => showPhoto(currentIndex - 1)
    });
  }
}

function renderNotFound() {
  root.innerHTML = `
    <a href="index.html#catalog" class="back-link">
      ← Назад в каталог
    </a>

    <p class="grid__empty">
      Такой товар не найден — возможно, он был убран из каталога.
    </p>
  `;
}

fetch('data/products.json')
  .then(res => {
    if (!res.ok) throw new Error('network');
    return res.json();
  })
  .then(products => {
    const product = products.find(p => p.id === id);

    if (!product) {
      return renderNotFound();
    }

    render(product);
  })
  .catch(() => {
    root.innerHTML = `
      <p class="grid__empty">
        Не получилось загрузить товар. Обновите страницу.
      </p>
    `;
  });
