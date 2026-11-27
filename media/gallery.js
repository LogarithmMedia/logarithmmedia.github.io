(() => {
  const cards = [...document.querySelectorAll('.media-card')];
  const sections = [...document.querySelectorAll('[data-media-collection]')];
  const collection = document.querySelector('#media-collection');
  const service = document.querySelector('#media-service');
  const backdrop = document.querySelector('#media-backdrop');
  const summary = document.querySelector('#media-count');
  let available = 0;

  function report() {
    const visible = cards.filter(card => !card.hidden).length;
    summary.textContent = visible + ' draft records shown · ' + available + ' image files loaded across the catalog.';
  }

  function update() {
    for (const card of cards) {
      card.hidden = (collection.value !== 'all' && card.dataset.collection !== collection.value) ||
        (service.value !== 'all' && card.dataset.service !== service.value);
      const preview = card.querySelector('.media-preview');
      preview.dataset.backdrop = backdrop.value === 'auto' ? (preview.dataset.defaultBackdrop || 'light') : backdrop.value;
    }
    for (const section of sections) {
      section.hidden = !section.querySelector('.media-card:not([hidden])');
    }
    report();
  }

  for (const card of cards) {
    const img = card.querySelector('img');
    const pending = card.querySelector('.media-pending');
    const link = card.querySelector('.media-open');
    const status = card.querySelector('.media-status');
    img.addEventListener('load', () => {
      img.hidden = false;
      pending.hidden = true;
      link.hidden = false;
      status.textContent = 'Draft · image loaded';
      available++;
      report();
    }, {once: true});
    img.addEventListener('error', () => {
      img.hidden = true;
      pending.hidden = false;
      link.hidden = true;
      status.textContent = 'Draft · file awaiting import';
    }, {once: true});
    img.src = img.dataset.src;
  }

  collection.addEventListener('change', () => {
    service.value = 'all';
    for (const group of service.querySelectorAll('optgroup')) {
      group.disabled = collection.value !== 'all' && group.dataset.collection !== collection.value;
    }
    update();
  });
  service.addEventListener('change', update);
  backdrop.addEventListener('change', update);
  update();
})();
