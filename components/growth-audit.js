(() => {
  const form = document.querySelector('[data-audit-form]');
  if (!form) return;
  const fields = [...form.querySelectorAll('[data-audit-field]')];
  const status = form.querySelector('[role="status"]');
  const messageFor = input => {
    if (input.id === 'audit-name' && !input.value.trim()) return 'Enter your name.';
    if (input.validity.valueMissing) return 'Enter your work email.';
    if (input.validity.typeMismatch) return input.type === 'email'
      ? 'Enter an email address like name@example.com.'
      : 'Enter a full website URL, such as https://example.com.';
    if (input.type === 'url' && input.value && !/^https?:\/\//i.test(input.value)) return 'Use a website URL starting with https:// or http://.';
    return '';
  };
  function validate(input) {
    const error = document.getElementById(input.id + '-error');
    const message = messageFor(input);
    error.textContent = message;
    error.hidden = !message;
    if (message) {
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', error.id);
    } else {
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    }
    return !message;
  }
  fields.forEach(input => {
    input.addEventListener('input', () => {
      if (input.hasAttribute('aria-invalid')) validate(input);
      status.textContent = '';
    });
    input.addEventListener('blur', () => {
      if (input.value || input.hasAttribute('aria-invalid')) validate(input);
    });
  });
  form.addEventListener('change', () => { status.textContent = ''; });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const invalid = fields.filter(input => !validate(input));
    if (invalid.length) {
      status.textContent = 'Please correct ' + invalid.length + (invalid.length === 1 ? ' field.' : ' fields.');
      invalid[0].focus();
      return;
    }
    status.textContent = 'All fields are valid. Nothing submitted. This is a local demonstration.';
  });
  form.addEventListener('reset', () => {
    fields.forEach(input => {
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
      const error = document.getElementById(input.id + '-error');
      error.hidden = true;
      error.textContent = '';
    });
    status.textContent = 'Form cleared.';
  });
  form.querySelector('[data-audit-controls]').disabled = false;
  document.querySelector('[data-audit-unavailable]').hidden = true;
})();
