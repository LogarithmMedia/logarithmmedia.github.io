/* Reveal a service reached through a navigation fragment even after filtering. */
(() => {
  const grid = document.querySelector('[data-services]');
  if (!grid) return;
  function revealTarget() {
    const id = location.hash.slice(1);
    const card = [...grid.querySelectorAll('[data-category][id]')].find(item => item.id === id);
    if (!card || !card.hidden) return;
    grid.querySelector('input[value="all"]').click();
    card.scrollIntoView({block:'start'});
    card.focus({preventScroll:true});
  }
  window.addEventListener('hashchange', revealTarget);
  window.addEventListener('pageshow', revealTarget);
})();
