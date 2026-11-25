(() => {
  const editor = document.querySelector('[data-project-editor]');
  if (!editor) return;
  const tabs = [...editor.querySelectorAll('[role="tab"]')];
  const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
  const filename = editor.querySelector('[data-project-file]');
  function select(index, moveFocus = false) {
    tabs.forEach((tab, position) => {
      const selected = position === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[position].hidden = !selected;
      panels[position].tabIndex = selected ? 0 : -1;
    });
    filename.textContent = tabs[index].dataset.file;
    if (moveFocus) tabs[index].focus();
    const list = tabs[index].parentElement;
    const tabRect = tabs[index].getBoundingClientRect();
    const listRect = list.getBoundingClientRect();
    if (tabRect.left < listRect.left) list.scrollLeft += tabRect.left - listRect.left;
    if (tabRect.right > listRect.right) list.scrollLeft += tabRect.right - listRect.right;
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(index));
    tab.addEventListener('keydown', event => {
      const keys = {
        ArrowRight: (index + 1) % tabs.length,
        ArrowLeft: (index + tabs.length - 1) % tabs.length,
        Home: 0,
        End: tabs.length - 1
      };
      if (!(event.key in keys)) return;
      event.preventDefault();
      select(keys[event.key], true);
    });
    tab.disabled = false;
  });
  editor.querySelector('[data-project-fallback]').hidden = true;
})();
