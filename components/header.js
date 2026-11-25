/* LM-COMP-001 — responsive, non-modal website navigation. */
(() => {
  for (const header of document.querySelectorAll('[data-site-header]')) {
    const menu = header.querySelector('[data-site-menu]');
    const nav = header.querySelector('[data-site-nav]');
    const actions = header.querySelector('.lm-site-actions');
    const services = header.querySelector('[data-site-services]');
    const trigger = services.querySelector('button');
    const panel = services.querySelector('[data-site-mega]');
    const wide = matchMedia('(min-width: 1181px)');
    const hover = matchMedia('(hover: hover)');
    const supportsPopover = typeof panel.showPopover === 'function';
    let preview = false, closeTimer = 0;

    const isOpen = () => wide.matches && supportsPopover ? panel.matches(':popover-open') : !panel.hidden;
    const setExpanded = (button, value) => button.setAttribute('aria-expanded', String(value));
    function placePanel() {
      const width = Math.min(928, document.documentElement.clientWidth - 32);
      const row = header.querySelector('.lm-site-row').getBoundingClientRect();
      const below = window.innerHeight - row.bottom - 8;
      const above = row.top - 8;
      const openBelow = below >= 250 || below >= above;
      const height = Math.min(window.innerHeight - 16, Math.max(44, openBelow ? below : above));
      panel.style.setProperty('--lm-menu-width', `${width}px`);
      panel.style.setProperty('--lm-menu-left', `${(document.documentElement.clientWidth - width) / 2}px`);
      panel.style.setProperty('--lm-menu-height', `${height}px`);
      const actualHeight = panel.getBoundingClientRect().height || height;
      const top = openBelow ? row.bottom : row.top - actualHeight;
      panel.style.setProperty('--lm-menu-top', `${Math.max(8, Math.min(top, window.innerHeight - actualHeight - 8))}px`);
    }
    function setServices(open) {
      if (wide.matches && supportsPopover) {
        if (open) { placePanel(); if (!isOpen()) panel.showPopover({source: trigger}); placePanel(); }
        else if (isOpen()) panel.hidePopover();
      } else panel.hidden = !open;
      setExpanded(trigger, open);
      if (!open) preview = false;
    }
    function setMenu(open) {
      nav.hidden = !wide.matches && !open;
      setExpanded(menu, open);
      if (!open) {
        setServices(false);
        if (!wide.matches && nav.contains(document.activeElement)) menu.focus();
      }
    }
    function syncLayout() {
      const focus = document.activeElement;
      const focusInNav = nav.contains(focus);
      const focusInPanel = panel.contains(focus);
      if (panel.hasAttribute('popover') && panel.matches(':popover-open')) panel.hidePopover();
      preview = false;
      clearTimeout(closeTimer);
      if (wide.matches && supportsPopover) {
        panel.hidden = false;
        panel.setAttribute('popover','auto');
        trigger.setAttribute('popovertarget',panel.id);
      } else {
        panel.removeAttribute('popover');
        trigger.removeAttribute('popovertarget');
        panel.hidden = true;
      }
      setExpanded(trigger,false);
      if (wide.matches && nav.nextElementSibling !== actions) actions.before(nav);
      else if (!wide.matches && actions.nextElementSibling !== nav) actions.after(nav);
      nav.hidden = !wide.matches;
      setExpanded(menu,false);
      if (!wide.matches && focusInNav) menu.focus();
      else if (wide.matches && (focus === menu || focusInPanel)) trigger.focus();
      else if (wide.matches && focusInNav) focus.focus();
    }
    menu.addEventListener('click',() => setMenu(nav.hidden));
    trigger.addEventListener('click',event => {
      clearTimeout(closeTimer);
      if (wide.matches && supportsPopover) {
        placePanel();
        if (preview && isOpen()) { event.preventDefault(); preview = false; }
      } else {
        if (preview && isOpen()) preview = false;
        else setServices(!isOpen());
      }
    });
    panel.addEventListener('toggle',() => {
      if (panel.hasAttribute('popover')) {
        setExpanded(trigger,isOpen());
        if (isOpen()) placePanel();
        else preview = false;
      }
    });
    services.addEventListener('pointerenter',event => {
      clearTimeout(closeTimer);
      if (wide.matches && hover.matches && event.pointerType !== 'touch' && !isOpen()) {
        preview = true;
        setServices(true);
      }
    });
    services.addEventListener('pointerleave',() => {
      if (preview) closeTimer = setTimeout(() => {
        if (preview && !services.contains(document.activeElement)) setServices(false);
      },120);
    });
    panel.addEventListener('pointerenter',() => clearTimeout(closeTimer));
    services.addEventListener('focusout',event => {
      if (wide.matches && event.relatedTarget && !services.contains(event.relatedTarget)) setServices(false);
    });
    header.addEventListener('keydown',event => {
      if (event.key !== 'Escape' || wide.matches && supportsPopover) return;
      if (isOpen()) { event.preventDefault(); setServices(false); trigger.focus(); }
      else if (!wide.matches && !nav.hidden) { event.preventDefault(); setMenu(false); menu.focus(); }
    });
    document.addEventListener('pointerdown',event => {
      if (!wide.matches && !nav.hidden && !header.contains(event.target)) setMenu(false);
      if (wide.matches && !supportsPopover && isOpen() && !services.contains(event.target)) setServices(false);
    });
    header.addEventListener('click',event => {
      const link = event.target.closest('a[href^="#"]');
      if (!link || !nav.contains(link)) return;
      setServices(false);
      if (!wide.matches) setMenu(false);
      const destination = document.getElementById(link.hash.slice(1));
      if (destination) destination.focus({preventScroll:true});
    });
    window.addEventListener('resize',() => { if (wide.matches && isOpen() && supportsPopover) placePanel(); });
    window.addEventListener('scroll',() => { if (wide.matches && isOpen() && supportsPopover) placePanel(); },{passive:true});
    wide.addEventListener('change',syncLayout);
    header.dataset.enhanced = '';
    syncLayout();
  }
})();
