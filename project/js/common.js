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
  telegramUsername: 'your_username'
};

const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalCall = document.getElementById('modal-call');
const modalWa = document.getElementById('modal-wa');
const modalTg = document.getElementById('modal-tg');

function openOrderModal(productName) {
  modalTitle.textContent = productName;

  modalCall.href = CONTACT.phoneHref;

  const waText = encodeURIComponent(`Здравствуйте! Хочу узнать про "${productName}"`);
  modalWa.href = `https://wa.me/${CONTACT.whatsappNumber}?text=${waText}`;

  modalTg.href = `https://t.me/${CONTACT.telegramUsername}`;

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
