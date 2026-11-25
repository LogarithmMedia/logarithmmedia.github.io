/* The rendered links are the search index. No submission or network lookup. */
document.querySelectorAll('[data-local-search]').forEach((root) => {
  const controls = root.querySelector('[data-search-controls]');
  const input = root.querySelector('input[type="search"]');
  const clear = root.querySelector('[data-search-clear]');
  const status = root.querySelector('[data-search-status]');
  const items = [...root.querySelectorAll('[data-search-item]')];
  let composing = false;
  const normalize = (value) => value.normalize('NFKC').toLocaleLowerCase().trim();
  const filter = () => {
    const words = normalize(input.value).split(/\s+/).filter(Boolean);
    let count = 0;
    for (const item of items) {
      const text = normalize(item.textContent);
      item.hidden = !words.every((word) => text.includes(word));
      if (!item.hidden) count++;
    }
    status.textContent = words.length
      ? (count === 0 ? 'No matching specimens. Try a different search.' : count + ' matching specimen' + (count === 1 ? '.' : 's.'))
      : 'Showing all ' + items.length + ' specimens.';
  };
  input.addEventListener('compositionstart', () => { composing = true; });
  input.addEventListener('compositionend', () => { composing = false; filter(); });
  input.addEventListener('input', (event) => { if (!composing && !event.isComposing) filter(); });
  clear.addEventListener('click', () => { input.value = ''; filter(); input.focus(); });
  controls.hidden = false;
  root.querySelector('[data-search-fallback]').hidden = true;
  filter();
});
