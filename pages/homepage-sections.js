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
