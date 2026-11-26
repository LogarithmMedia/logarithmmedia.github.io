(() => {
  const main = document.querySelector('main');
  if (!main || !('IntersectionObserver' in window) || !Element.prototype.animate) return;

  const preference = matchMedia('(prefers-reduced-motion: no-preference) and (forced-colors: none)');
  const rules = [
    ['h1, h2', 'heading'],
    ['.demo-grid > article, .lm-trust-cards > article, .lm-service-card, .lm-process-card, .lm-faq-list > details', 'card'],
    ['.lm-service-card .fig, .lm-project-mock', 'graphic'],
    ['.lm-project-cards > span, .lm-project-query', 'card'],
    ['.lm-process-marker', 'marker'],
    ['.lm-home-hero-audit', 'float'],
    ['.lm-footer-word', 'word'],
    ['.lm-footer-grid > div, .lm-footer-top', 'card'],
    ['.lm-service-band-head', 'heading']
  ];
  const targets = new Map();
  for (const [selector, kind] of rules) {
    main.querySelectorAll(selector).forEach(element => {
      if (!targets.has(element)) targets.set(element, kind);
    });
  }
  const running = new Map();
  const played = new Set();
  const easing = 'cubic-bezier(.2,.7,.2,1)';
  const rise = (distance) => [{transform: 'translateY(' + distance + 'px)'}, {transform: 'none'}];

  function cancel(element) {
    running.get(element)?.forEach(animation => animation.cancel());
    running.delete(element);
  }

  function play(element, kind) {
    if (!preference.matches || document.hidden || element.closest('[hidden]') ||
        element.contains(document.activeElement)) return;
    cancel(element);
    let frames = rise(kind === 'heading' ? 24 : 28);
    let duration = kind === 'heading' ? 1000 : 1200;
    const animations = [];
    if (kind === 'graphic') {
      frames = [{transform: 'scale(.88)'}, {transform: 'scale(1)'}];
      duration = 1500;
      // Only decorative accent paths are drawn; labels and content remain legible.
      element.querySelectorAll('path.a').forEach(path => {
        const length = path.getTotalLength();
        if (!length) return;
        animations.push(path.animate([
          {strokeDasharray: length + ' ' + length, strokeDashoffset: length},
          {strokeDasharray: length + ' ' + length, strokeDashoffset: 0}
        ], {duration: 1550, easing, id: 'lm-section-draw'}));
      });
    } else if (kind === 'marker') {
      frames = [{transform: 'scale(.72)'}, {transform: 'scale(1.12)', offset: .55}, {transform: 'none'}];
      duration = 1250;
    } else if (kind === 'float') {
      frames = [
        {transform: 'none'},
        {transform: 'translateY(-14px)', offset: .45},
        {transform: 'none'}
      ];
      duration = 3400;
    } else if (kind === 'word') {
      frames = [{transform: 'scaleY(.65)'}, {transform: 'none'}];
      duration = 1300;
    }
    animations.push(element.animate(frames, {duration, easing, id: 'lm-section-' + kind}));
    running.set(element, animations);
    Promise.allSettled(animations.map(animation => animation.finished)).then(() => {
      if (running.get(element) === animations) running.delete(element);
    });
  }

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const element = entry.target;
      if (!entry.isIntersecting) {
        cancel(element);
        played.delete(element);
        continue;
      }
      if (entry.intersectionRatio >= .15 && !played.has(element) && preference.matches && !element.closest('[hidden]')) {
        played.add(element);
        play(element, targets.get(element));
      }
    }
  }, {threshold: .15});

  const tools = document.createElement('div');
  tools.className = 'wrap lm-section-motion-tools';
  tools.hidden = true;
  const replay = document.createElement('button');
  replay.type = 'button';
  replay.className = 'lm-btn ghost';
  replay.textContent = 'Replay section motion';
  replay.dataset.sectionReplay = '';
  const hint = document.createElement('p');
  hint.textContent = 'Motion plays when you scroll into view.';
  tools.append(replay, hint);
  main.prepend(tools);

  function reset() {
    observer.disconnect();
    running.forEach((animations, element) => cancel(element));
    played.clear();
    tools.hidden = !preference.matches;
    if (preference.matches && !document.hidden) targets.forEach((kind, element) => observer.observe(element));
  }
  replay.addEventListener('click', reset);
  preference.addEventListener('change', reset);
  document.addEventListener('visibilitychange', reset);

  // Stop a moving surface before a user interacts with a control on it.
  main.addEventListener('focusin', event => {
    running.forEach((animations, element) => {
      if (element.contains(event.target)) cancel(element);
    });
  });
  // Native filters and project tabs toggle hidden; freshly visible content gets its own entry.
  const visibility = new MutationObserver(records => {
    for (const {target} of records) {
      if (target === tools) continue;
      targets.forEach((kind, element) => {
        if (target !== element && !target.contains(element)) return;
        cancel(element);
        played.delete(element);
        observer.unobserve(element);
        if (preference.matches && !element.closest('[hidden]')) observer.observe(element);
      });
    }
  });
  visibility.observe(main, {subtree: true, attributes: true, attributeFilter: ['hidden']});

  main.querySelectorAll('.lm-faq-list > details').forEach(details => {
    details.addEventListener('toggle', () => {
      const answer = details.querySelector('p');
      if (details.open && answer && preference.matches) play(answer, 'heading');
      else if (answer) cancel(answer);
    });
  });
  reset();
})();
