const form = document.getElementById('leadForm');
const successState = document.getElementById('successState');

const validators = {
  fullName: (v) => v.trim().length >= 2,
  companyName: (v) => v.trim().length >= 1,
  website: (v) => {
    try {
      const url = new URL(v.trim());
      return url.protocol === 'https:' || url.protocol === 'http:';
    } catch {
      return false;
    }
  },
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  revenue: (v) => v.trim().length >= 1,
};

function getField(name) {
  return document.querySelector(`[name="${name}"]`);
}

function setValid(input) {
  input.closest('.field-group').classList.remove('invalid');
}

function setInvalid(input) {
  input.closest('.field-group').classList.add('invalid');
}

function validateField(input) {
  const name = input.name;
  const isValid = validators[name] ? validators[name](input.value) : input.value.trim().length > 0;
  if (isValid) {
    setValid(input);
  } else {
    setInvalid(input);
  }
  return isValid;
}

// Validate on blur (after user leaves the field)
Object.keys(validators).forEach((name) => {
  const input = getField(name);
  if (!input) return;

  input.addEventListener('blur', () => {
    if (input.value.trim() !== '') {
      validateField(input);
    }
  });

  // Clear error as user types
  input.addEventListener('input', () => {
    if (input.closest('.field-group').classList.contains('invalid')) {
      if (validators[name](input.value)) {
        setValid(input);
      }
    }
  });
});

form.addEventListener('submit', (e) => {
  e.preventDefault();

  let allValid = true;

  Object.keys(validators).forEach((name) => {
    const input = getField(name);
    if (!input) return;
    const valid = validateField(input);
    if (!valid) {
      allValid = false;
    }
  });

  if (!allValid) {
    const firstInvalid = form.querySelector('.field-group.invalid input');
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  const btn = form.querySelector('.btn-primary');
  btn.textContent = 'Sending…';
  btn.disabled = true;

  const payload = {
    fullName:    getField('fullName').value.trim(),
    companyName: getField('companyName').value.trim(),
    website:     getField('website').value.trim(),
    email:       getField('email').value.trim(),
    revenue:     getField('revenue').value.trim(),
  };

  fetch('https://script.google.com/macros/s/AKfycbxAESDc0GS8aJztfEv4r328Z8NC2Q4hPqoWzu_aprMDzl-rF9VXWVpTHFgW_N7hXaym/exec', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
    .then((res) => res.json())
    .then(() => {
      form.style.transition = 'opacity 200ms ease';
      form.style.opacity = '0';
      setTimeout(() => {
        form.style.display = 'none';
        successState.classList.add('visible');
      }, 200);
    })
    .catch(() => {
      btn.textContent = 'Get in Touch';
      btn.disabled = false;
      const errEl = document.getElementById('submitError');
      if (errEl) errEl.style.display = 'block';
    });
});
