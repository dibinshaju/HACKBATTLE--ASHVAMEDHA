(function () {
  function $(selector) { return document.querySelector(selector); }

  // Shared category color map for charts and lists
  const CATEGORY_COLORS = {
    Food: '#00d8a6',
    Travel: '#6ea8fe',
    Health: '#8bd3dd',
    Bills: '#ffd166',
    Shopping: '#f7b267',
    Other: '#ff6b6b',
    Housing: '#6ea8fe',
    Transport: '#ffd166',
    Entertainment: '#f7b267'
  };

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

  function drawLineChart(canvas, values, points, categorySeries) {
    const ctx = canvas.getContext('2d');
    const padding = 30;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;
    const baseMin = Math.min(...values);
    const baseMax = Math.max(...values);
    // Consider points as well to keep scale consistent when plotting individual expenses
    const pointsMax = Array.isArray(points) && points.length ? Math.max(baseMax, ...points.map(p => p.amount)) : baseMax;
    const pointsMin = Array.isArray(points) && points.length ? Math.min(baseMin, ...points.map(p => p.amount)) : baseMin;
    const min = pointsMin * 0.95;
    const max = pointsMax * 1.05;
    const toY = (v) => padding + height - ((v - min) / (max - min)) * height;
    const toX = (i) => padding + (i / (values.length - 1)) * width;

    // grid
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    [0, 0.25, 0.5, 0.75, 1].forEach((p) => {
      const y = padding + height * p;
      ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(padding + width, y); ctx.stroke();
    });

    // optional multi-line series per category
    if (categorySeries && Object.keys(categorySeries).length) {
      Object.entries(categorySeries).forEach(([cat, arr]) => {
        ctx.strokeStyle = CATEGORY_COLORS[cat] || '#9aa7ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        arr.forEach((v, i) => {
          const x = toX(i);
          const y = toY(v);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.stroke();
      });
    } else {
      // single line fallback
      ctx.strokeStyle = '#6ea8fe';
      ctx.lineWidth = 3;
      ctx.beginPath();
      values.forEach((v, i) => {
        const x = toX(i);
        const y = toY(v);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // gradient fill under line
    const gradient = ctx.createLinearGradient(0, padding, 0, padding + height);
    gradient.addColorStop(0, 'rgba(110,168,254,0.35)');
    gradient.addColorStop(1, 'rgba(110,168,254,0)');
    if (!categorySeries || !Object.keys(categorySeries).length) {
      ctx.lineTo(padding + width, padding + height);
      ctx.lineTo(padding, padding + height);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Draw per-expense points if provided; draw smaller first so larger amounts appear on top
    if (Array.isArray(points) && points.length) {
      const sorted = points.slice().sort((a, b) => a.amount - b.amount);
      sorted.forEach((p) => {
        const x = toX(p.monthIndex);
        const y = toY(p.amount);
        ctx.beginPath();
        ctx.fillStyle = p.color || 'rgba(255,255,255,0.8)';
        ctx.strokeStyle = 'rgba(0,0,0,0.35)';
        ctx.lineWidth = 1;
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    }
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
  const CURR_KEY = 'ft_currency';
  const DEFAULT_RATE = 83.0; // USD -> INR (adjust as needed / make dynamic later)
  function loadExpenses() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (_) { return []; }
  }
  function saveExpenses(items) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (_) {}
  }

  function getCurrency() { try { return localStorage.getItem(CURR_KEY) || 'USD'; } catch (_) { return 'USD'; } }
  function setCurrency(code) { try { localStorage.setItem(CURR_KEY, code); } catch (_) {} }
  function convertAmount(usd) {
    const code = getCurrency();
    if (code === 'INR') return usd * DEFAULT_RATE;
    return usd;
  }
  function formatCurrency(amountUsd) {
    const code = getCurrency();
    const value = convertAmount(amountUsd);
    const currency = code === 'INR' ? 'INR' : 'USD';
    try { return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value); }
    catch (_) { return (code === 'INR' ? `₹${value.toFixed(2)}` : `$${value.toFixed(2)}`); }
  }

  function renderExpenseList(items) {
    const list = document.getElementById('expense-list');
    if (!list) return;
    list.innerHTML = '';
    const sorted = items.slice().reverse();
    sorted.forEach((it, idx) => {
      const li = document.createElement('li');
      const color = CATEGORY_COLORS[it.category] || '#9aa7ff';
      const cls = Number(it.amount) >= 100 ? 'positive' : 'negative';
      li.innerHTML = `<span class="dot" style="background:${color}"></span><span class="cat">${it.category}</span><span>${it.note || ''}</span><span class="amount ${cls}">${formatCurrency(it.amount)}</span>`;
      list.appendChild(li);
    });
    const totalEl = document.getElementById('expense-total');
    if (totalEl) {
      const sum = items.reduce((acc, it) => acc + Number(it.amount || 0), 0);
      totalEl.textContent = `Total: ${formatCurrency(sum)}`;
    }

    // Update selected month total display
    const sel = document.getElementById('clear-month');
    const monthTotalEl = document.getElementById('month-total');
    const lastAddedEl = document.getElementById('last-added');
    if (sel && monthTotalEl) {
      const idx = Number(sel.value || 11); // default to most recent month (index 11)
      const now = new Date();
      const target = new Date(now.getFullYear(), now.getMonth() - (11 - idx), 1);
      const monthSum = items.reduce((acc, it) => {
        const d = new Date(it.date);
        const match = d.getFullYear() === target.getFullYear() && d.getMonth() === target.getMonth();
        return acc + (match ? Number(it.amount || 0) : 0);
      }, 0);
      monthTotalEl.textContent = `Total: ${formatCurrency(monthSum)}`;
      if (lastAddedEl) {
        const latest = sorted.find((it) => {
          const d = new Date(it.date);
          return d.getFullYear() === target.getFullYear() && d.getMonth() === target.getMonth();
        });
        const amt = latest ? Number(latest.amount || 0) : 0;
        lastAddedEl.textContent = `Last: ${formatCurrency(amt)}`;
        lastAddedEl.style.color = amt >= 100 ? '#4cd4a8' : '#ff6b6b';
      }
    }
  }

  function aggregateByCategory(items) {
    const byCat = new Map();
    items.forEach((it) => {
      const curr = byCat.get(it.category) || 0;
      byCat.set(it.category, curr + Number(it.amount || 0));
    });
    return Array.from(byCat.entries()).map(([label, value]) => ({ label, value, color: CATEGORY_COLORS[label] || '#9aa7ff' }));
  }

  function updateChartsFromExpenses() {
    const items = loadExpenses();
    const pie = items.length ? aggregateByCategory(items) : defaultPie;
    const pieCanvas = document.getElementById('pieChart');
    const lineCanvas = document.getElementById('lineChart');

    // Build monthly totals for last 12 months and per-expense points
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ y: d.getFullYear(), m: d.getMonth() });
    }
    const monthlyTotals = new Array(12).fill(0);
    const perCategory = {};
    Object.keys(CATEGORY_COLORS).forEach(k => perCategory[k] = new Array(12).fill(0));
    const points = [];
    items.forEach((it) => {
      const d = new Date(it.date);
      // find index for this item's month in the last-12 list
      const idx = months.findIndex(mm => mm.y === d.getFullYear() && mm.m === d.getMonth());
      if (idx !== -1) {
        const amt = Number(it.amount || 0);
        monthlyTotals[idx] += amt;
        points.push({ monthIndex: idx, amount: amt, color: CATEGORY_COLORS[it.category] || '#9aa7ff' });
        if (!perCategory[it.category]) perCategory[it.category] = new Array(12).fill(0);
        perCategory[it.category][idx] += amt;
      }
    });

    const lineValues = items.length ? monthlyTotals : defaultLine;

    // Clear canvases
    [pieCanvas, lineCanvas].forEach((c) => { const ctx = c.getContext('2d'); ctx.clearRect(0, 0, c.width, c.height); });

    drawPieChart(pieCanvas, pie);
    // Only pass per-category if there is any non-zero data to show
    const hasCatSeries = Object.values(perCategory).some(arr => arr.some(v => v > 0));
    drawLineChart(lineCanvas, lineValues, points, hasCatSeries ? perCategory : null);

    // Render legend when showing per-category series
    const legend = document.getElementById('lineLegend');
    if (legend) {
      legend.innerHTML = '';
      if (hasCatSeries) {
        Object.keys(perCategory).forEach(cat => {
          if (perCategory[cat].some(v => v > 0)) {
            const div = document.createElement('div');
            div.className = 'item';
            div.innerHTML = `<span class="swatch" style="background:${CATEGORY_COLORS[cat] || '#9aa7ff'}"></span>${cat}`;
            legend.appendChild(div);
          }
        });
      }
    }

    // Update dynamic Monthly Spend (current month total)
    const monthSum = items.reduce((acc, it) => {
      const d = new Date(it.date);
      const match = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      return acc + (match ? Number(it.amount || 0) : 0);
    }, 0);
    const monthlySpendEl = document.getElementById('monthly-spend');
    if (monthlySpendEl) {
      if (items.length > 0) monthlySpendEl.textContent = formatCurrency(monthSum);
      else if (monthlySpendEl.dataset.usd) monthlySpendEl.textContent = formatCurrency(Number(monthlySpendEl.dataset.usd));
    }

    // Populate month selector for clearing a specific month (last 12 months)
    const sel = document.getElementById('clear-month');
    if (sel) {
      const prev = sel.value;
      sel.innerHTML = '';
      months.forEach((mm, idx) => {
        const d = new Date(mm.y, mm.m, 1);
        const opt = document.createElement('option');
        opt.value = String(idx);
        opt.textContent = d.toLocaleString(undefined, { month: 'short', year: 'numeric' });
        sel.appendChild(opt);
      });
      if (prev !== undefined) sel.value = prev;
    }
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

    // Initialize currency selector
    const currSel = document.getElementById('db-currency');
    if (currSel) {
      currSel.value = getCurrency();
      currSel.addEventListener('change', () => {
        setCurrency(currSel.value);
        // re-render values in chosen currency
        const items = loadExpenses();
        renderExpenseList(items);
        updateChartsFromExpenses();
        // update Total Balance from preset; Monthly Spend handled by updateChartsFromExpenses dynamically
        const tb = document.getElementById('total-balance');
        if (tb && tb.dataset.usd) tb.textContent = formatCurrency(Number(tb.dataset.usd));
      });
      // Set initial formatted values for summary
      const tb = document.getElementById('total-balance');
      if (tb && tb.dataset.usd) tb.textContent = formatCurrency(Number(tb.dataset.usd));
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

    // Clear current month's expenses (top button near Monthly Spend)
    const clearBtnTop = document.getElementById('btn-clear-expenses-top');
    if (clearBtnTop) {
      clearBtnTop.addEventListener('click', () => {
        const now = new Date();
        const items = loadExpenses();
        const kept = items.filter(it => {
          const d = new Date(it.date);
          return !(d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth());
        });
        if (kept.length === items.length) return; // nothing to clear for current month
        if (!confirm('Clear expenses for the current month?')) return;
        saveExpenses(kept);
        renderExpenseList(kept);
        updateChartsFromExpenses();
      });
    }

    // Respond to month selector changes by updating the month total
    const monthSel = document.getElementById('clear-month');
    if (monthSel) {
      monthSel.addEventListener('change', () => {
        renderExpenseList(loadExpenses());
      });
    }

    // Clear only the selected month
    const clearMonthBtn = document.getElementById('btn-clear-month');
    if (clearMonthBtn && monthSel) {
      clearMonthBtn.addEventListener('click', () => {
        const idx = Number(monthSel.value || 11);
        const now = new Date();
        const target = new Date(now.getFullYear(), now.getMonth() - (11 - idx), 1);
        const items = loadExpenses();
        const kept = items.filter(it => {
          const d = new Date(it.date);
          return !(d.getFullYear() === target.getFullYear() && d.getMonth() === target.getMonth());
        });
        if (kept.length === items.length) return;
        if (!confirm('Clear expenses for selected month?')) return;
        saveExpenses(kept);
        renderExpenseList(kept);
        updateChartsFromExpenses();
      });
    }
  });
})();


