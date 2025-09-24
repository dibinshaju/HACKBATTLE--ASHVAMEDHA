(function () {
  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const togglePassword = document.getElementById('toggle-password');
  const submitButton = document.getElementById('submit');
  const formStatus = document.getElementById('form-status');

  function setError(inputEl, errorEl, message) {
    errorEl.textContent = message || '';
    inputEl.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function isValidEmail(value) {
    // Simple and permissive RFC 5322-inspired email regex
    const re = /^(?:[a-zA-Z0-9_'^&\+`{}~!-]+(?:\.[a-zA-Z0-9_'^&\+`{}~!-]+)*)@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    return re.test(String(value).trim());
  }

  function validateEmail() {
    const value = emailInput.value.trim();
    if (!value) {
      setError(emailInput, emailError, 'Email is required.');
      return false;
    }
    if (!isValidEmail(value)) {
      setError(emailInput, emailError, 'Enter a valid email.');
      return false;
    }
    setError(emailInput, emailError, '');
    return true;
  }

  function validatePassword() {
    const value = passwordInput.value;
    if (!value) {
      setError(passwordInput, passwordError, 'Password is required.');
      return false;
    }
    if (value.length < 8) {
      setError(passwordInput, passwordError, 'Password must be at least 8 characters.');
      return false;
    }
    setError(passwordInput, passwordError, '');
    return true;
  }

  function updateSubmitState() {
    const ok = validateEmail() & validatePassword();
    submitButton.disabled = !ok;
    return ok;
  }

  // Live validation
  emailInput.addEventListener('input', () => {
    validateEmail();
    updateSubmitState();
  });
  passwordInput.addEventListener('input', () => {
    validatePassword();
    updateSubmitState();
  });

  // Toggle password visibility
  togglePassword.addEventListener('click', () => {
    const isHidden = passwordInput.getAttribute('type') === 'password';
    passwordInput.setAttribute('type', isHidden ? 'text' : 'password');
    togglePassword.setAttribute('aria-pressed', String(isHidden));
    togglePassword.textContent = isHidden ? 'Hide' : 'Show';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const valid = updateSubmitState();
    if (!valid) return;

    submitButton.disabled = true;
    formStatus.textContent = 'Signing in...';

    // Simulate async login; replace with real API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      formStatus.textContent = 'Signed in successfully.';

      // Example: emit custom event; integrate with your app here
      const detail = {
        email: emailInput.value.trim(),
        remember: document.getElementById('remember').checked
      };
      form.dispatchEvent(new CustomEvent('login:success', { detail }));
    } catch (err) {
      formStatus.textContent = 'Unable to sign in. Please try again.';
      submitButton.disabled = false;
    }
  });

  // Initialize state on load
  updateSubmitState();
})();


