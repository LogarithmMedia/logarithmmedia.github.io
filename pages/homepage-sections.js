// Enhance ordinary anchor navigation only after JavaScript is available.
document.querySelectorAll('[data-hs-tabs]').forEach(group => {
  const list = group.querySelector('[data-hs-tablist]');
  const tabs = Array.from(list.querySelectorAll('[data-hs-tab]'));
  const panels = Array.from(group.querySelectorAll('[data-hs-panel]'));
  list.setAttribute('role', 'tablist');
  list.setAttribute('aria-label', 'Choose a topic');
  list.setAttribute('aria-orientation', 'vertical');
  function select(index, focus = false) {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
    if (focus) tabs[index].focus();
  }
  tabs.forEach((tab, i) => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panels[i].id);
    panels[i].setAttribute('role', 'tabpanel');
    panels[i].setAttribute('aria-labelledby', tab.id);
    panels[i].tabIndex = 0;
    tab.addEventListener('click', event => { event.preventDefault(); select(i); });
    tab.addEventListener('keydown', event => {
      const keys = { ArrowDown: (i + 1) % tabs.length, ArrowUp: (i + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 };
      if (event.key in keys) { event.preventDefault(); select(keys[event.key], true); }
      if (event.key === ' ') { event.preventDefault(); select(i); }
    });
  });
  select(Math.max(0, panels.findIndex(panel => '#' + panel.id === location.hash)));
});
document.querySelectorAll('[data-hs-form]').forEach(form => {
  form.querySelector('button').disabled = false;
  form.addEventListener('submit', event => {
    event.preventDefault();
    form.querySelector('[data-hs-status]').textContent = 'Preview complete. No information was sent.';
  });
});


// Keep content readable without JavaScript; animations start only on viewport entry.
const hsMotion = matchMedia('(prefers-reduced-motion: no-preference) and (forced-colors: none)');
const hsTargets = '.hs-heading, .hs-card, .hs-graphic, .hs-strip>div, .hs-lines article, .hs-system article, .hs-timeline li, .hs-sequence li, .hs-faq details, .hs-glow, .hs-cta, .hs-nav-demo';
const hsVariants = [...document.querySelectorAll('.hs-variant')];
if ('IntersectionObserver' in window && hsVariants.length) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting || !hsMotion.matches) continue;
      entry.target.classList.add('hs-play');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.12 });

  function reset(section) {
    const targets = [...section.querySelectorAll(hsTargets)];
    targets.forEach(target => {
      observer.unobserve(target);
      target.classList.remove('hs-play');
    });
    // Allow the removal to render before observing again, including replay in place.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (hsMotion.matches) targets.forEach(target => observer.observe(target));
    }));
  }

  function syncMotion() {
    hsVariants.forEach(section => {
      section.querySelector('[data-hs-replay]').hidden = !hsMotion.matches;
      reset(section);
    });
    const note = document.querySelector('[data-hs-motion-note]');
    if (note) note.hidden = !hsMotion.matches;
  }

  hsVariants.forEach(section => {
    section.querySelector('[data-hs-replay]').addEventListener('click', () => {
      reset(section);
    });
    // Re-trigger newly selected illustrations even after revisiting the same tab.
    section.querySelectorAll('[data-hs-tab]').forEach(tab => {
      function refresh() {
        const panel = document.getElementById(tab.getAttribute('aria-controls'));
        if (!panel || panel.hidden || !hsMotion.matches) return;
        panel.querySelectorAll('.hs-graphic').forEach(graphic => {
          observer.unobserve(graphic);
          graphic.classList.remove('hs-play');
          requestAnimationFrame(() => requestAnimationFrame(() => {
            if (hsMotion.matches) observer.observe(graphic);
          }));
        });
      }
      tab.addEventListener('click', refresh);
      tab.addEventListener('focus', refresh);
    });
  });
  hsMotion.addEventListener('change', syncMotion);
  syncMotion();
}
// Native document scrolling drives every stage in both directions.
const scrollStories = [...document.querySelectorAll('[data-scroll-story]')].map(story => {
  const stage = story.querySelector('[data-scroll-stage]');
  const cards = [...story.querySelectorAll('[data-scroll-card]')];
  const links = [...story.querySelectorAll('[data-scroll-step]')];
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const stack = story.classList.contains('hs-scrollstack');
  let selected = -1;
  let enabled = false;
  let top = 0;
  let distance = 0;
  function select(index) {
    if (index === selected) return;
    selected = index;
    cards.forEach((card, i) => {
      card.classList.toggle('is-active', i === index);
      card.inert = i !== index;
      if (i === index) card.removeAttribute('aria-hidden');
      else card.setAttribute('aria-hidden', 'true');
      if (i === index) links[i].setAttribute('aria-current', 'step');
      else links[i].removeAttribute('aria-current');
    });
  }
  function reset() {
    enabled = false;
    selected = -1;
    story.classList.remove('is-scroll');
    cards.forEach(card => {
      card.inert = false;
      card.removeAttribute('aria-hidden');
      card.classList.remove('is-active');
    });
    links.forEach(link => link.removeAttribute('aria-current'));
  }
  function measure() {
    if (!hsMotion.matches || innerHeight < 520) { reset(); return; }
    story.classList.add('is-scroll');
    story.style.setProperty('--scroll-count', cards.length - 1);
    const height = stage.offsetHeight;
    if (height > innerHeight - 30) { reset(); return; }
    top = Math.max(12, Math.round((innerHeight - height) / 2));
    story.style.setProperty('--stage-height', height + 'px');
    story.style.setProperty('--stage-top', top + 'px');
    distance = story.offsetHeight - height;
    enabled = distance > 0;
    if (!enabled) { reset(); return; }
    update();
  }
  function update() {
    if (!enabled) return;
    const progress = clamp((top - story.getBoundingClientRect().top) / distance, 0, 1);
    const position = progress * (cards.length - 1);
    story.style.setProperty('--scroll-progress', progress);
    select(Math.round(position));
    if (stack) cards.forEach((card, i) => {
      const offset = i - position;
      const y = offset > 0 ? Math.min(120, offset * 120) : Math.max(-10, offset * 4);
      card.style.setProperty('--stack-y', y + '%');
      card.style.setProperty('--stack-scale', String(1 - Math.min(.12, Math.max(0, -offset) * .055)));
      card.style.setProperty('--stack-layer', String(i + 1));
    });
  }
  links.forEach((link, i) => link.addEventListener('click', event => {
    if (!enabled) return;
    event.preventDefault();
    const start = story.getBoundingClientRect().top + scrollY - top;
    window.scrollTo({top: start + distance * i / (cards.length - 1), behavior: 'instant'});
    update();
  }));
  story.closest('.hs-variant')?.querySelector('[data-hs-replay]')?.addEventListener('click', () => { if (enabled) links[0].click(); });
  return {measure, update};
});
if (scrollStories.length) {
  let pending = false;
  function updateScrollStories() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      scrollStories.forEach(story => story.update());
      pending = false;
    });
  }
  const measureStories = () => scrollStories.forEach(story => story.measure());
  addEventListener('scroll', updateScrollStories, {passive:true});
  addEventListener('resize', measureStories);
  hsMotion.addEventListener('change', measureStories);
  measureStories();
  document.fonts?.ready.then(measureStories);
}
const opening = document.querySelector('[data-loader]');
if (opening && typeof opening.showModal === 'function') {
  const replay = document.querySelector('[data-loader-replay]');
  const skip = opening.querySelector('[data-loader-skip]');
  let timer;
  function finish() {
    clearTimeout(timer);
    if (opening.open) opening.close();
  }
  function play() {
    if (!hsMotion.matches || opening.open) return;
    opening.showModal();
    timer = setTimeout(finish, 2150);
  }
  function syncOpening() {
    replay.hidden = !hsMotion.matches;
    if (!hsMotion.matches) finish();
  }
  opening.addEventListener('cancel', event => { event.preventDefault(); finish(); });
  opening.addEventListener('close', () => { if (!replay.hidden) replay.focus({preventScroll:true}); });
  skip.addEventListener('click', finish);
  replay.addEventListener('click', play);
  hsMotion.addEventListener('change', syncOpening);
  syncOpening();
  play();
}
