// ===== Мобильное меню =====
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');

burger.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', String(isOpen));
});
nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => nav.classList.remove('is-open'));
});

// ===== Настройки контактов для модалки =====
// TODO: замени на реальные номер/юзернеймы — см. DEV_SETUP.md
const CONTACT = {
  phoneHref: 'tel:+79000000000',
  whatsappNumber: '79000000000', // только цифры, без + и пробелов
  telegramUsername: 'your_username',
  // MAX не поддерживает открытие чата по номеру телефона (в отличие от WhatsApp) —
  // это фиксированная ссылка на профиль, получаешь её внутри своего приложения MAX:
  // аватар в левом верхнем углу → значок QR-кода → «Поделиться» → скопировать ссылку.
  maxUrl: 'https://max.ru/u/REPLACE_ME'
};

const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalCall = document.getElementById('modal-call');
const modalWa = document.getElementById('modal-wa');
const modalTg = document.getElementById('modal-tg');
const modalMax = document.getElementById('modal-max');

function openOrderModal(productName) {
  modalTitle.textContent = productName;

  modalCall.href = CONTACT.phoneHref;

  const waText = encodeURIComponent(`Здравствуйте! Хочу узнать про "${productName}"`);
  modalWa.href = `https://wa.me/${CONTACT.whatsappNumber}?text=${waText}`;

  modalTg.href = `https://t.me/${CONTACT.telegramUsername}`;
  modalMax.href = CONTACT.maxUrl;

  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeOrderModal() {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// Делегирование — работает и для кнопок, отрисованных динамически из products.json
document.addEventListener('click', (e) => {
  const orderBtn = e.target.closest('.order-btn');
  if (orderBtn) {
    e.preventDefault();
    openOrderModal(orderBtn.dataset.product);
    return;
  }
  if (e.target.closest('[data-close]')) {
    closeOrderModal();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('is-open')) closeOrderModal();
});

// ===== Свайп для листания фото (используется в catalog.js и product.js) =====
// Различает свайп и обычный тап: после настоящего свайпа на элемент на 300мс
// ставится data-just-swiped, чтобы обёртывающая ссылка не сработала на переход.
function enableSwipe(el, { onSwipeLeft, onSwipeRight, threshold = 40 } = {}) {
  let startX = 0, startY = 0, tracking = false, isSwipe = false;

  el.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    tracking = true;
    isSwipe = false;
  }, { passive: true });

  el.addEventListener('touchmove', (e) => {
    if (!tracking) return;
    const t = e.touches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    if (!isSwipe && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
      isSwipe = true;
    }
    if (isSwipe) e.preventDefault(); // не даём странице скроллиться вертикально во время горизонтального свайпа
  }, { passive: false });

  el.addEventListener('touchend', (e) => {
    if (!tracking) return;
    tracking = false;
    if (!isSwipe) return;

    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    if (Math.abs(dx) >= threshold) {
      if (dx < 0) onSwipeLeft && onSwipeLeft();
      else onSwipeRight && onSwipeRight();
    }
    el.dataset.justSwiped = '1';
    setTimeout(() => { delete el.dataset.justSwiped; }, 300);
  });
}
