(() => {
  const band = document.querySelector('[data-service-band]');
  if (!band) return;
  const toggle = band.querySelector('[data-band-toggle]');
  const list = band.querySelector('[data-band-list]');
  const copy = list.cloneNode(true);
  copy.removeAttribute('data-band-list');
  copy.setAttribute('data-band-copy', '');
  copy.setAttribute('aria-hidden', 'true');
  list.after(copy);

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const forced = matchMedia('(forced-colors: active)');
  const unavailable = () => reduced.matches || forced.matches;
  function setMoving(moving) {
    const active = moving && !unavailable();
    band.toggleAttribute('data-moving', active);
    toggle.textContent = active ? 'Stop scrolling' : 'Start scrolling';
    toggle.setAttribute('aria-disabled', String(unavailable()));
    if (unavailable()) toggle.textContent = 'Scrolling unavailable in this display mode';
  }
  toggle.addEventListener('click', () => setMoving(!band.hasAttribute('data-moving')));
  reduced.addEventListener('change', () => setMoving(false));
  forced.addEventListener('change', () => setMoving(false));
  setMoving(true);
  toggle.hidden = false;
})();