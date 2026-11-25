(() => {
  const hero = document.querySelector('.lm-home-hero');
  if (!hero) return;
  const canvas = hero.querySelector('.lm-hero-dots');
  const toggle = hero.querySelector('[data-hero-motion]');
  const context = canvas?.getContext('2d');
  if (!context || !toggle) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const forced = matchMedia('(forced-colors: active)');
  let width = 0, height = 0, frame = 0, enabled = false, visible = false;
  let pointer = null;
  const allowed = () => !reduced.matches && !forced.matches;
  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    hero.removeAttribute('data-dot-active');
    context.clearRect(0, 0, width, height);
  }
  function draw(time) {
    if (!enabled || !visible || document.hidden || !allowed()) { stop(); return; }
    context.clearRect(0, 0, width, height);
    const gap = width < 600 ? 22 : 26;
    for (let y = gap / 2; y < height; y += gap) {
      for (let x = gap / 2; x < width; x += gap) {
        const wave = Math.sin(x * .0085 - time * .00125 + y * .0015);
        let dx = 0, dy = wave * 5;
        if (pointer) {
          const px = x - pointer.x, py = y - pointer.y;
          const distance = Math.hypot(px, py);
          if (distance > 0 && distance < 150) {
            const force = (1 - distance / 150) * 12;
            dx = px / distance * force;
            dy += py / distance * force;
          }
        }
        context.fillStyle = 'rgba(59,106,240,' + (.09 + (wave + 1) * .09) + ')';
        context.beginPath();
        context.arc(x + dx, y + dy, 1, 0, Math.PI * 2);
        context.fill();
      }
    }
    frame = requestAnimationFrame(draw);
  }
  function sync() {
    toggle.hidden = !allowed();
    toggle.textContent = enabled ? 'Pause background' : 'Animate background';
    if (enabled && visible && !document.hidden && allowed()) {
      if (!frame) { hero.setAttribute('data-dot-active', ''); frame = requestAnimationFrame(draw); }
    } else stop();
  }
  const resize = new ResizeObserver(() => {
    width = hero.clientWidth; height = hero.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  });
  resize.observe(hero);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }).observe(hero);
  toggle.addEventListener('click', () => { enabled = !enabled; sync(); });
  for (const query of [reduced, forced]) query.addEventListener('change', () => { enabled = false; sync(); });
  document.addEventListener('visibilitychange', sync);
  hero.addEventListener('pointermove', event => {
    const rect = hero.getBoundingClientRect();
    pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
  });
  hero.addEventListener('pointerleave', () => { pointer = null; });
  sync();
})();
