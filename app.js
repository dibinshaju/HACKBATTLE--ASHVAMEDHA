(function () {
  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const togglePassword = document.getElementById('toggle-password');
  const submitButton = document.getElementById('submit');
  const formStatus = document.getElementById('form-status');
  const langSelect = document.getElementById('lang-select');

  // i18n strings
  const STRINGS = {
    en: {
      app_name: 'Finance Tracker',
      subtitle: 'Track budgets, visualize spend, and hit your goals.',
      language: 'Language',
      continue_google: 'Continue with Google',
      continue_microsoft: 'Continue with Microsoft',
      or: 'or',
      email: 'Email',
      email_hint: 'Use your work email address.',
      password: 'Password',
      password_hint: 'At least 8 characters.',
      show: 'Show',
      hide: 'Hide',
      remember: 'Remember me',
      sign_in: 'Sign in',
      forgot: 'Forgot password?',
      create_account: 'Create account',
      signing_in: 'Signing in...',
      signed_in: 'Signed in successfully. Redirecting...',
      sign_in_error: 'Unable to sign in. Please try again.',
      email_required: 'Email is required.',
      email_invalid: 'Enter a valid email.',
      password_required: 'Password is required.',
      password_length: 'Password must be at least 8 characters.'
    },
    hi: {
      app_name: 'वित्त ट्रैकर',
      subtitle: 'बजट ट्रैक करें, खर्च देखें, और लक्ष्य हासिल करें।',
      language: 'भाषा',
      continue_google: 'Google से जारी रखें',
      continue_microsoft: 'Microsoft से जारी रखें',
      or: 'या',
      email: 'ईमेल',
      email_hint: 'अपना कार्य ईमेल उपयोग करें।',
      password: 'पासवर्ड',
      password_hint: 'कम से कम 8 अक्षर।',
      show: 'दिखाएँ',
      hide: 'छिपाएँ',
      remember: 'मुझे याद रखें',
      sign_in: 'साइन इन',
      forgot: 'पासवर्ड भूल गए?',
      create_account: 'खाता बनाएँ',
      signing_in: 'साइन इन हो रहा है...',
      signed_in: 'सफलतापूर्वक साइन इन। रीडायरेक्ट हो रहा है...',
      sign_in_error: 'साइन इन नहीं हो सका। कृपया पुनः प्रयास करें।',
      email_required: 'ईमेल आवश्यक है।',
      email_invalid: 'मान्य ईमेल दर्ज करें।',
      password_required: 'पासवर्ड आवश्यक है।',
      password_length: 'पासवर्ड कम से कम 8 अक्षर का होना चाहिए।'
    }
  };

  function getLang() {
    try { return localStorage.getItem('ft_lang') || 'en'; } catch (_) { return 'en'; }
  }
  function setLang(lang) {
    try { localStorage.setItem('ft_lang', lang); } catch (_) {}
  }
  function t(key) {
    const lang = getLang();
    return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;
  }

  function applyTranslations() {
    const mapping = [
      ['login-title', 'app_name'],
      ['subtitle', 'subtitle'],
      ['lang-label', 'language'],
      ['oauth-google-text', 'continue_google'],
      ['oauth-microsoft-text', 'continue_microsoft'],
      ['divider-or', 'or'],
      ['label-email', 'email'],
      ['email-hint', 'email_hint'],
      ['label-password', 'password'],
      ['password-hint', 'password_hint'],
      ['remember-text', 'remember'],
      ['submit', 'sign_in'],
      ['forgot', 'forgot'],
      ['create-account', 'create_account']
    ];
    mapping.forEach(([id, key]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = t(key);
    });
    const toggle = document.getElementById('toggle-password');
    if (toggle) toggle.textContent = toggle.getAttribute('aria-pressed') === 'true' ? t('hide') : t('show');
  }

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
    togglePassword.textContent = isHidden ? t('hide') : t('show');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const valid = updateSubmitState();
    if (!valid) return;

    submitButton.disabled = true;
    formStatus.textContent = t('signing_in');

    // Simulate async login; replace with real API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      formStatus.textContent = t('signed_in');

      // Emit success and redirect to dashboard
      const detail = {
        email: emailInput.value.trim(),
        remember: document.getElementById('remember').checked
      };
      form.dispatchEvent(new CustomEvent('login:success', { detail }));

      // Simple auth flag (demo only; replace with real auth in production)
      try {
        localStorage.setItem('ft_auth', 'signed_in');
      } catch (_) {}

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 600);
    } catch (err) {
      formStatus.textContent = t('sign_in_error');
      submitButton.disabled = false;
    }
  });

  // Initialize language selector and translation on load
  const initLang = getLang();
  if (langSelect) {
    langSelect.value = initLang;
    langSelect.addEventListener('change', () => {
      setLang(langSelect.value);
      applyTranslations();
    });
  }
  applyTranslations();

  // Initialize state on load
  updateSubmitState();
})();


p