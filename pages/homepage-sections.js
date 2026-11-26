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

