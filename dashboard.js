(function () {
  function $(selector) { return document.querySelector(selector); }

  // i18n strings shared with dashboard
  const STRINGS = {
    en: {
      app_name: 'Finance Tracker',
      nav_dashboard: 'Dashboard', nav_accounts: 'Accounts', nav_budgets: 'Budgets', nav_reports: 'Reports', language: 'Language', logout: 'Logout',
      total_balance: 'Total Balance', monthly_spend: 'Monthly Spend', savings_rate: 'Savings Rate',
      pie_title: 'Expenditure by Category', line_title: 'Cash Flow (Last 12 Months)',
      add_expense: 'Add Expense', date: 'Date', category: 'Category', amount: 'Amount', note: 'Note', add_btn: 'Add Expense',
      recent_expenses: 'Recent Expenses',
      added_msg: 'Expense added.', fill_all: 'Please provide date, category, and a positive amount.'
    },
    hi: {
      app_name: 'वित्त ट्रैकर',
      nav_dashboard: 'डैशबोर्ड', nav_accounts: 'खाते', nav_budgets: 'बजट', nav_reports: 'रिपोर्ट', language: 'भाषा', logout: 'लॉग आउट',
      total_balance: 'कुल शेष', monthly_spend: 'मासिक खर्च', savings_rate: 'बचत दर',
      pie_title: 'श्रेणी अनुसार खर्च', line_title: 'नकदी प्रवाह (पिछले 12 महीने)',
      add_expense: 'खर्च जोड़ें', date: 'तारीख', category: 'श्रेणी', amount: 'राशि', note: 'नोट', add_btn: 'खर्च जोड़ें',
      recent_expenses: 'हाल के खर्च',
      added_msg: 'खर्च जोड़ा गया।', fill_all: 'कृपया तारीख, श्रेणी, और सही राशि दें।'
    }
  };
  function getLang() { try { return localStorage.getItem('ft_lang') || 'en'; } catch (_) { return 'en'; } }
  function t(key) { const lang = getLang(); return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key; }

  // Guard: redirect to login if not signed in (demo only)
  try {
    const authed = localStorage.getItem('ft_auth') === 'signed_in';
    if (!authed) {
      window.location.replace('index.html');
      return;
    }
  } catch (_) {}

  // Logout handler
  window.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        try { localStorage.removeItem('ft_auth'); } catch (_) {}
        window.location.href = 'index.html';
      });
    }
  });

  // Simple charts using Canvas API (no external deps)
  function drawPieChart(canvas, data) {
    const ctx = canvas.getContext('2d');
    const total = data.reduce((sum, d) => sum + d.value, 0);
    let start = -Math.PI / 2;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    data.forEach(({ value, color }) => {
      const angle = (value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, start, start + angle);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      start += angle;
    });
  }

  function drawLineChart(canvas, values) {
    const ctx = canvas.getContext('2d');
    const padding = 30;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;
    const min = Math.min(...values) * 0.95;
    const max = Math.max(...values) * 1.05;
    const toY = (v) => padding + height - ((v - min) / (max - min)) * height;
    const toX = (i) => padding + (i / (values.length - 1)) * width;

    // grid
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    [0, 0.25, 0.5, 0.75, 1].forEach((p) => {
      const y = padding + height * p;
      ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(padding + width, y); ctx.stroke();
    });

    // line
    ctx.strokeStyle = '#6ea8fe';
    ctx.lineWidth = 3;
    ctx.beginPath();
    values.forEach((v, i) => {
      const x = toX(i);
      const y = toY(v);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // gradient fill under line
    const gradient = ctx.createLinearGradient(0, padding, 0, padding + height);
    gradient.addColorStop(0, 'rgba(110,168,254,0.35)');
    gradient.addColorStop(1, 'rgba(110,168,254,0)');
    ctx.lineTo(padding + width, padding + height);
    ctx.lineTo(padding, padding + height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  // Demo data
  const defaultPie = [
    { label: 'Housing', value: 1200, color: '#6ea8fe' },
    { label: 'Food', value: 650, color: '#00d8a6' },
    { label: 'Transport', value: 250, color: '#ffd166' },
    { label: 'Entertainment', value: 180, color: '#f7b267' },
    { label: 'Other', value: 140, color: '#ff6b6b' }
  ];
  const defaultLine = [1800, 1500, 1650, 2100, 1900, 1750, 1950, 2200, 2050, 2350, 2400, 2260];

  // Expense storage helpers
  const STORAGE_KEY = 'ft_expenses';
  function loadExpenses() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (_) { return []; }
  }
  function saveExpenses(items) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (_) {}
  }

  function formatCurrency(amount) {
    try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(amount); }
    catch (_) { return `$${amount.toFixed(2)}`; }
  }

  function renderExpenseList(items) {
    const list = document.getElementById('expense-list');
    if (!list) return;
    list.innerHTML = '';
    items.slice().reverse().forEach((it) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="cat">${it.category}</span><span>${it.note || ''}</span><span class="amount">${formatCurrency(it.amount)}</span>`;
      list.appendChild(li);
    });
  }

  function aggregateByCategory(items) {
    const byCat = new Map();
    items.forEach((it) => {
      const curr = byCat.get(it.category) || 0;
      byCat.set(it.category, curr + Number(it.amount || 0));
    });
    const colors = {
      Food: '#00d8a6', Travel: '#6ea8fe', Bills: '#ffd166', Shopping: '#f7b267', Other: '#ff6b6b', Housing: '#6ea8fe', Transport: '#ffd166', Entertainment: '#f7b267'
    };
    return Array.from(byCat.entries()).map(([label, value]) => ({ label, value, color: colors[label] || '#9aa7ff' }));
  }

  function updateChartsFromExpenses() {
    const items = loadExpenses();
    const pie = items.length ? aggregateByCategory(items) : defaultPie;
    const pieCanvas = document.getElementById('pieChart');
    const lineCanvas = document.getElementById('lineChart');

    // Clear canvases
    [pieCanvas, lineCanvas].forEach((c) => { const ctx = c.getContext('2d'); ctx.clearRect(0, 0, c.width, c.height); });

    drawPieChart(pieCanvas, pie);
    drawLineChart(lineCanvas, defaultLine);
  }

  // Render on load
  window.addEventListener('DOMContentLoaded', () => {
    // Apply i18n to dashboard UI
    const langSel = document.getElementById('db-lang');
    if (langSel) { langSel.value = getLang(); }
    const ids = [
      ['db-app-name', 'app_name'], ['nav-dashboard', 'nav_dashboard'], ['nav-accounts', 'nav_accounts'], ['nav-budgets', 'nav_budgets'], ['nav-reports', 'nav_reports'], ['db-lang-label', 'language'], ['logout', 'logout'],
      ['t-balance', 'total_balance'], ['t-monthly', 'monthly_spend'], ['t-savings', 'savings_rate'], ['t-pie', 'pie_title'], ['t-line', 'line_title'],
      ['t-add-expense', 'add_expense'], ['l-date', 'date'], ['l-category', 'category'], ['l-amount', 'amount'], ['l-note', 'note'], ['btn-add-expense', 'add_btn'], ['t-recent', 'recent_expenses']
    ];
    ids.forEach(([id, key]) => { const el = document.getElementById(id); if (el) el.textContent = t(key); });
    if (langSel) {
      langSel.addEventListener('change', () => {
        try { localStorage.setItem('ft_lang', langSel.value); } catch (_) {}
        ids.forEach(([id, key]) => { const el = document.getElementById(id); if (el) el.textContent = t(key); });
      });
    }

    // Initial render
    updateChartsFromExpenses();
    renderExpenseList(loadExpenses());

    // Form handling
    const form = document.getElementById('expense-form');
    const status = document.getElementById('expense-status');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const date = document.getElementById('exp-date').value;
        const category = document.getElementById('exp-category').value;
        const amountStr = document.getElementById('exp-amount').value;
        const note = document.getElementById('exp-note').value.trim();
        const amount = Number(amountStr);
        if (!date || !category || !(amount > 0)) {
          status.textContent = t('fill_all');
          return;
        }
        const items = loadExpenses();
        items.push({ id: Date.now(), date, category, amount, note });
        saveExpenses(items);
        status.textContent = t('added_msg');
        form.reset();
        renderExpenseList(items);
        updateChartsFromExpenses();
      });
    }
  });
})();


