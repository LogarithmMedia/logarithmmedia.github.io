/* Exclusive category selection with a native radio group. */
document.querySelectorAll('[data-services]').forEach(section => {
  const filters = section.querySelector('[data-service-filters]');
  const cards = Array.from(section.querySelectorAll('[data-category]'));
  const status = section.querySelector('[data-service-status]');

  function updateResults() {
    const selection = filters.querySelector('input:checked');
    if (!selection) return;
    const category = selection.value;
    let count = 0;
    cards.forEach(card => {
      const visible = category === 'all' || card.dataset.category === category;
      if (!visible && card.contains(document.activeElement)) selection.focus();
      card.hidden = !visible;
      if (visible) count += 1;
    });
    status.textContent = category === 'all'
      ? 'Showing all ' + count + ' services.'
      : 'Showing ' + count + ' of ' + cards.length + ' services.';
  }

  filters.addEventListener('change', updateResults);
  filters.hidden = false;
  updateResults();
  window.addEventListener('pageshow', updateResults);
});