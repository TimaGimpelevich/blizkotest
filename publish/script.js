const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.nav');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Открыть меню');
  navigation.classList.remove('open');
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  navigation.classList.toggle('open', open);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.addEventListener('click', event => { if (!event.target.closest('.header')) closeMenu(); });

const grid = document.querySelector('.portfolio-grid');
document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(other => {
      const active = other === button;
      other.classList.toggle('active', active);
      other.setAttribute('aria-pressed', String(active));
    });
    grid.classList.toggle('filtered', filter !== 'all');
    grid.querySelectorAll('[data-category]').forEach(item => {
      item.hidden = filter !== 'all' && item.dataset.category !== filter;
    });
  });
});

function openDialog(dialog) {
  dialog.showModal();
  document.body.classList.add('modal-open');
}
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
});
const lightbox = document.querySelector('#lightbox');
document.querySelectorAll('.portfolio-item').forEach(item => {
  item.addEventListener('click', () => {
    const source = item.querySelector('img');
    const target = document.querySelector('#lightbox-image');
    target.src = source.src;
    target.alt = source.alt;
    document.querySelector('#lightbox-caption').textContent = item.dataset.caption;
    openDialog(lightbox);
  });
});

const typeField = document.querySelector('#shoot-type');
const wishesField = document.querySelector('#wishes');
let previousSelection = '';
document.querySelectorAll('[data-type], [data-package], [data-album]').forEach(link => {
  link.addEventListener('click', () => {
    if (link.dataset.type) typeField.value = link.dataset.type;
    let selection = '';
    if (link.dataset.album) {
      typeField.value = 'Выпускные альбомы';
      selection = `Интересует альбом «${link.dataset.album}».`;
    }
    if (link.dataset.package) selection = `Интересует пакет «${link.dataset.package}».`;
    if (selection) {
      const personalWishes = previousSelection ? wishesField.value.replace(previousSelection, '').trim() : wishesField.value.trim();
      wishesField.value = [selection, personalWishes].filter(Boolean).join('\n');
      previousSelection = selection;
    }
    clearPreparedBrief();
  });
});

let briefDownloadUrl = '';
function clearPreparedBrief() {
  document.querySelector('#form-status').hidden = true;
  document.querySelector('#brief-download').removeAttribute('href');
  if (briefDownloadUrl) URL.revokeObjectURL(briefDownloadUrl);
  briefDownloadUrl = '';
}

document.querySelector('#brief-form').addEventListener('submit', event => {
  event.preventDefault();
  clearPreparedBrief();
  const fields = new FormData(event.currentTarget);
  const labels = {
    type: 'Тип съёмки', participants: 'Количество участников',
    date: 'Желаемая дата', location: 'Место', name: 'Имя',
    contact: 'Телефон / Telegram', wishes: 'Пожелания',
  };
  const lines = ['Близко — бриф на фотосессию', '', ...Object.entries(labels).map(([key, label]) => {
    const value = String(fields.get(key) || '').trim();
    return `${label}: ${value || 'Обсудим вместе'}`;
  })];
  const file = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/plain;charset=utf-8' });
  briefDownloadUrl = URL.createObjectURL(file);
  document.querySelector('#brief-download').href = briefDownloadUrl;
  const status = document.querySelector('#form-status');
  status.hidden = false;
  status.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'nearest' });
});
document.querySelector('#brief-form').addEventListener('input', clearPreparedBrief);
