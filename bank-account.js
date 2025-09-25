(function () {
  const form = document.getElementById('bank-form');
  const bankNameInput = document.getElementById('bank-name');
  const accountNumberInput = document.getElementById('account-number');
  const ifscCodeInput = document.getElementById('ifsc-code');
  const accountHolderInput = document.getElementById('account-holder');
  const mobileNumberInput = document.getElementById('mobile-number');
  const emailInput = document.getElementById('email');
  const upiIdInput = document.getElementById('upi-id');
  const termsCheckbox = document.getElementById('terms');
  const submitButton = document.getElementById('submit');
  const formStatus = document.getElementById('form-status');
  const langSelect = document.getElementById('lang-select');

  // Error elements
  const bankNameError = document.getElementById('bank-name-error');
  const accountNumberError = document.getElementById('account-number-error');
  const ifscCodeError = document.getElementById('ifsc-code-error');
  const accountHolderError = document.getElementById('account-holder-error');
  const mobileNumberError = document.getElementById('mobile-number-error');
  const emailError = document.getElementById('email-error');
  const upiIdError = document.getElementById('upi-id-error');

  // i18n strings
  const STRINGS = {
    en: {
      app_name: 'Finance Tracker',
      bank_setup: 'Bank Account Setup',
      gpay_integration: 'Connect your bank account for seamless GPay integration',
      bank_name: 'Bank Name',
      bank_name_hint: 'Choose your primary bank for GPay integration',
      account_number: 'Account Number',
      account_number_hint: 'Enter your 9-18 digit account number',
      ifsc_code: 'IFSC Code',
      ifsc_code_hint: 'Enter your bank\'s IFSC code (e.g., HDFC0001234)',
      account_holder: 'Account Holder Name',
      account_holder_hint: 'Name as it appears on your bank account',
      mobile_number: 'Mobile Number',
      mobile_number_hint: 'Mobile number linked to your bank account',
      email: 'Email Address',
      email_hint: 'Email address for notifications and verification',
      upi_id: 'UPI ID (Optional)',
      upi_id_hint: 'Your existing UPI ID for quick setup',
      terms_agree: 'I agree to the Terms of Service and Privacy Policy',
      connect_account: 'Connect Bank Account',
      connecting: 'Connecting to bank...',
      connected: 'Bank account connected successfully!',
      connection_error: 'Failed to connect bank account. Please try again.',
      bank_required: 'Please select your bank.',
      account_required: 'Account number is required.',
      account_invalid: 'Account number must be 9-18 digits.',
      ifsc_required: 'IFSC code is required.',
      ifsc_invalid: 'Invalid IFSC code format.',
      holder_required: 'Account holder name is required.',
      mobile_required: 'Mobile number is required.',
      mobile_invalid: 'Mobile number must be 10 digits.',
      email_required: 'Email is required.',
      email_invalid: 'Enter a valid email address.',
      upi_invalid: 'Invalid UPI ID format.',
      terms_required: 'You must agree to the terms and conditions.',
      security_note: 'Your bank details are encrypted and securely stored. We use bank-grade security to protect your information.'
    },
    hi: {
      app_name: 'वित्त ट्रैकर',
      bank_setup: 'बैंक खाता सेटअप',
      gpay_integration: 'सीमलेस GPay एकीकरण के लिए अपना बैंक खाता कनेक्ट करें',
      bank_name: 'बैंक का नाम',
      bank_name_hint: 'GPay एकीकरण के लिए अपना प्राथमिक बैंक चुनें',
      account_number: 'खाता संख्या',
      account_number_hint: 'अपनी 9-18 अंकों की खाता संख्या दर्ज करें',
      ifsc_code: 'IFSC कोड',
      ifsc_code_hint: 'अपने बैंक का IFSC कोड दर्ज करें (जैसे, HDFC0001234)',
      account_holder: 'खाता धारक का नाम',
      account_holder_hint: 'नाम जैसा कि आपके बैंक खाते में दिखाई देता है',
      mobile_number: 'मोबाइल नंबर',
      mobile_number_hint: 'आपके बैंक खाते से जुड़ा मोबाइल नंबर',
      email: 'ईमेल पता',
      email_hint: 'सूचनाओं और सत्यापन के लिए ईमेल पता',
      upi_id: 'UPI ID (वैकल्पिक)',
      upi_id_hint: 'त्वरित सेटअप के लिए आपकी मौजूदा UPI ID',
      terms_agree: 'मैं सेवा की शर्तों और गोपनीयता नीति से सहमत हूं',
      connect_account: 'बैंक खाता कनेक्ट करें',
      connecting: 'बैंक से कनेक्ट हो रहा है...',
      connected: 'बैंक खाता सफलतापूर्वक कनेक्ट हो गया!',
      connection_error: 'बैंक खाता कनेक्ट नहीं हो सका। कृपया पुनः प्रयास करें।',
      bank_required: 'कृपया अपना बैंक चुनें।',
      account_required: 'खाता संख्या आवश्यक है।',
      account_invalid: 'खाता संख्या 9-18 अंकों की होनी चाहिए।',
      ifsc_required: 'IFSC कोड आवश्यक है।',
      ifsc_invalid: 'अमान्य IFSC कोड प्रारूप।',
      holder_required: 'खाता धारक का नाम आवश्यक है।',
      mobile_required: 'मोबाइल नंबर आवश्यक है।',
      mobile_invalid: 'मोबाइल नंबर 10 अंकों का होना चाहिए।',
      email_required: 'ईमेल आवश्यक है।',
      email_invalid: 'मान्य ईमेल पता दर्ज करें।',
      upi_invalid: 'अमान्य UPI ID प्रारूप।',
      terms_required: 'आपको नियम और शर्तों से सहमत होना होगा।',
      security_note: 'आपके बैंक विवरण एन्क्रिप्टेड और सुरक्षित रूप से संग्रहीत हैं। हम आपकी जानकारी की सुरक्षा के लिए बैंक-ग्रेड सुरक्षा का उपयोग करते हैं।'
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
      ['bank-title', 'bank_setup'],
      ['subtitle', 'gpay_integration'],
      ['label-bank-name', 'bank_name'],
      ['bank-name-hint', 'bank_name_hint'],
      ['label-account-number', 'account_number'],
      ['account-number-hint', 'account_number_hint'],
      ['label-ifsc-code', 'ifsc_code'],
      ['ifsc-code-hint', 'ifsc_code_hint'],
      ['label-account-holder', 'account_holder'],
      ['account-holder-hint', 'account_holder_hint'],
      ['label-mobile-number', 'mobile_number'],
      ['mobile-number-hint', 'mobile_number_hint'],
      ['label-email', 'email'],
      ['email-hint', 'email_hint'],
      ['label-upi-id', 'upi_id'],
      ['upi-id-hint', 'upi_id_hint'],
      ['submit', 'connect_account']
    ];
    mapping.forEach(([id, key]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = t(key);
    });
  }

  function setError(inputEl, errorEl, message) {
    errorEl.textContent = message || '';
    inputEl.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function isValidEmail(value) {
    const re = /^(?:[a-zA-Z0-9_'^&\+`{}~!-]+(?:\.[a-zA-Z0-9_'^&\+`{}~!-]+)*)@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    return re.test(String(value).trim());
  }

  function isValidUPI(value) {
    if (!value) return true; // UPI ID is optional
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
    return re.test(String(value).trim());
  }

  function validateBankName() {
    const value = bankNameInput.value;
    if (!value) {
      setError(bankNameInput, bankNameError, t('bank_required'));
      return false;
    }
    setError(bankNameInput, bankNameError, '');
    return true;
  }

  function validateAccountNumber() {
    const value = accountNumberInput.value.trim();
    if (!value) {
      setError(accountNumberInput, accountNumberError, t('account_required'));
      return false;
    }
    if (!/^[0-9]{9,18}$/.test(value)) {
      setError(accountNumberInput, accountNumberError, t('account_invalid'));
      return false;
    }
    setError(accountNumberInput, accountNumberError, '');
    return true;
  }

  function validateIFSCCode() {
    const value = ifscCodeInput.value.trim().toUpperCase();
    if (!value) {
      setError(ifscCodeInput, ifscCodeError, t('ifsc_required'));
      return false;
    }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value)) {
      setError(ifscCodeInput, ifscCodeError, t('ifsc_invalid'));
      return false;
    }
    setError(ifscCodeInput, ifscCodeError, '');
    return true;
  }

  function validateAccountHolder() {
    const value = accountHolderInput.value.trim();
    if (!value) {
      setError(accountHolderInput, accountHolderError, t('holder_required'));
      return false;
    }
    setError(accountHolderInput, accountHolderError, '');
    return true;
  }

  function validateMobileNumber() {
    const value = mobileNumberInput.value.trim();
    if (!value) {
      setError(mobileNumberInput, mobileNumberError, t('mobile_required'));
      return false;
    }
    if (!/^[0-9]{10}$/.test(value)) {
      setError(mobileNumberInput, mobileNumberError, t('mobile_invalid'));
      return false;
    }
    setError(mobileNumberInput, mobileNumberError, '');
    return true;
  }

  function validateEmail() {
    const value = emailInput.value.trim();
    if (!value) {
      setError(emailInput, emailError, t('email_required'));
      return false;
    }
    if (!isValidEmail(value)) {
      setError(emailInput, emailError, t('email_invalid'));
      return false;
    }
    setError(emailInput, emailError, '');
    return true;
  }

  function validateUPI() {
    const value = upiIdInput.value.trim();
    if (value && !isValidUPI(value)) {
      setError(upiIdInput, upiIdError, t('upi_invalid'));
      return false;
    }
    setError(upiIdInput, upiIdError, '');
    return true;
  }

  function validateTerms() {
    if (!termsCheckbox.checked) {
      formStatus.textContent = t('terms_required');
      formStatus.className = 'status error-message';
      return false;
    }
    return true;
  }

  function updateSubmitState() {
    const valid = validateBankName() && validateAccountNumber() && validateIFSCCode() && 
                  validateAccountHolder() && validateMobileNumber() && validateEmail() && 
                  validateUPI() && validateTerms();
    submitButton.disabled = !valid;
    return valid;
  }

  // Live validation
  bankNameInput.addEventListener('change', () => {
    validateBankName();
    updateSubmitState();
  });

  accountNumberInput.addEventListener('input', () => {
    validateAccountNumber();
    updateSubmitState();
  });

  ifscCodeInput.addEventListener('input', () => {
    ifscCodeInput.value = ifscCodeInput.value.toUpperCase();
    validateIFSCCode();
    updateSubmitState();
  });

  accountHolderInput.addEventListener('input', () => {
    validateAccountHolder();
    updateSubmitState();
  });

  mobileNumberInput.addEventListener('input', () => {
    mobileNumberInput.value = mobileNumberInput.value.replace(/[^0-9]/g, '');
    validateMobileNumber();
    updateSubmitState();
  });

  emailInput.addEventListener('input', () => {
    validateEmail();
    updateSubmitState();
  });

  upiIdInput.addEventListener('input', () => {
    validateUPI();
    updateSubmitState();
  });

  termsCheckbox.addEventListener('change', () => {
    updateSubmitState();
  });

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const valid = updateSubmitState();
    if (!valid) return;

    submitButton.disabled = true;
    submitButton.classList.add('loading');
    formStatus.textContent = t('connecting');
    formStatus.className = 'status';

    // Simulate bank connection process
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Store bank account details (demo only - in production, use secure backend)
      const bankData = {
        bankName: bankNameInput.value,
        accountNumber: accountNumberInput.value,
        ifscCode: ifscCodeInput.value.toUpperCase(),
        accountHolder: accountHolderInput.value,
        mobileNumber: mobileNumberInput.value,
        email: emailInput.value,
        upiId: upiIdInput.value,
        connectedAt: new Date().toISOString()
      };

      try {
        localStorage.setItem('ft_bank_account', JSON.stringify(bankData));
        localStorage.setItem('ft_gpay_connected', 'true');
      } catch (_) {}

      formStatus.textContent = t('connected');
      formStatus.className = 'status success-message';

      // Redirect to dashboard after successful connection
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1500);

    } catch (err) {
      formStatus.textContent = t('connection_error');
      formStatus.className = 'status error-message';
      submitButton.disabled = false;
      submitButton.classList.remove('loading');
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

