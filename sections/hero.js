(() => {
  const hero = document.querySelector('.lm-home-hero');
  if (!hero) return;
  const canvas = hero.querySelector('.lm-hero-dots');
  const glow = hero.querySelector('.lm-hero-glow');
  const toggle = hero.querySelector('[data-hero-motion]');
  const context = canvas?.getContext('2d');
  if (!context || !toggle || !glow) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const forced = matchMedia('(forced-colors: active)');
  let width = 0, height = 0, frame = 0, enabled = true, visible = false;
  let pointer = null, dots = [];
  const start = performance.now();
  const allowed = () => !reduced.matches && !forced.matches;
  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    pointer = null;
    glow.style.transform = '';
    hero.removeAttribute('data-dot-active');
    context.clearRect(0, 0, width, height);
  }
  function draw(time) {
    if (!enabled || !visible || document.hidden || !allowed()) { stop(); return; }
    context.clearRect(0, 0, width, height);
    const elapsed = (time - start) / 1000;
    const dark = document.documentElement.dataset.theme === 'dark';
    const blue = dark ? '105,151,255' : '29,79,216';
    const neutral = dark ? '201,210,224' : '10,19,32';
    for (const dot of dots) {
      const dx = dot.x - (pointer?.x ?? -9999);
      const dy = dot.y - (pointer?.y ?? -9999);
      const distance = Math.hypot(dx, dy);
      const near = Math.max(0, 1 - distance / 150);
      if (near) {
        const force = near * 2.2;
        dot.vx += dx / (distance || 1) * force;
        dot.vy += dy / (distance || 1) * force;
      }
      dot.vx = (dot.vx + (dot.ox - dot.x) * .06) * .82;
      dot.vy = (dot.vy + (dot.oy - dot.y) * .06) * .82;
      dot.x += dot.vx;
      dot.y += dot.vy;
      const wave = Math.sin(dot.ox * .0085 - elapsed * 1.25 + dot.oy * .0015);
      const crest = ((wave + 1) / 2) ** 3;
      const alpha = near ? .18 + near * .6 : .08 + crest * .24;
      context.fillStyle = near || crest > .04 ? 'rgba(' + blue + ',' + alpha + ')' : 'rgba(' + neutral + ',.08)';
      context.beginPath();
      context.arc(dot.x, dot.y - wave * 5, 1.1 + crest * .7 + near * 1.6, 0, Math.PI * 2);
      context.fill();
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
  new ResizeObserver(() => {
    width = hero.clientWidth; height = hero.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    const gap = width < 700 ? 22 : 26;
    dots = [];
    for (let y = gap / 2; y < height; y += gap) {
      for (let x = gap / 2; x < width; x += gap) {
        dots.push({ ox: x, oy: y, x, y, vx: 0, vy: 0 });
      }
    }
  }).observe(hero);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }).observe(hero);
  toggle.addEventListener('click', () => { enabled = !enabled; sync(); });
  for (const query of [reduced, forced]) query.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  hero.addEventListener('pointermove', event => {
    if (!enabled || !allowed() || event.pointerType === 'touch') return;
    const rect = hero.getBoundingClientRect();
    pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    glow.style.transform = 'translate(' + ((pointer.x / width - .5) * 120) + 'px,' + ((pointer.y / height - .5) * 90) + 'px)';
  });
  hero.addEventListener('pointerleave', () => { pointer = null; glow.style.transform = ''; });
  sync();
})();
