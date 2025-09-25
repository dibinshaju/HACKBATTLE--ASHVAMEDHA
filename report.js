(function () {
  function loadExpenses() {
    try { return JSON.parse(localStorage.getItem('ft_expenses') || '[]'); } catch (_) { return []; }
  }
  function getCurrency() { try { return localStorage.getItem('ft_currency') || 'USD'; } catch (_) { return 'USD'; } }
  function formatCurrency(amountUsd) {
    const code = getCurrency();
    const rate = 83.0; // same as dashboard.js
    const value = code === 'INR' ? amountUsd * rate : amountUsd;
    const currency = code === 'INR' ? 'INR' : 'USD';
    try { return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value); }
    catch (_) { return (code === 'INR' ? `₹${value.toFixed(2)}` : `$${value.toFixed(2)}`); }
  }

  function aggregateByCategory(items) {
    const map = new Map();
    items.forEach(it => map.set(it.category, (map.get(it.category) || 0) + Number(it.amount || 0)));
    const arr = Array.from(map.entries()).map(([category, value]) => ({ category, value }));
    arr.sort((a, b) => b.value - a.value);
    return arr;
  }

  window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('gen-date').textContent = new Date().toLocaleString();
    const back = document.getElementById('back');
    const printBtn = document.getElementById('print');
    if (back) back.addEventListener('click', () => { window.location.href = 'dashboard.html'; });
    if (printBtn) printBtn.addEventListener('click', () => { window.print(); });

    const items = loadExpenses();
    const byCat = aggregateByCategory(items);
    const total = items.reduce((acc, it) => acc + Number(it.amount || 0), 0);
    const avg = total / 12;
    const top = byCat[0] ? byCat[0].category : '—';
    document.getElementById('tot-exp').textContent = formatCurrency(total);
    document.getElementById('avg-exp').textContent = formatCurrency(avg);
    document.getElementById('top-cat').textContent = top;

    const tbodyCat = document.getElementById('by-cat');
    if (tbodyCat) {
      tbodyCat.innerHTML = '';
      byCat.forEach(row => {
        const tr = document.createElement('tr');
        const share = total > 0 ? `${Math.round((row.value / total) * 100)}%` : '0%';
        tr.innerHTML = `<td>${row.category}</td><td>${formatCurrency(row.value)}</td><td>${share}</td>`;
        tbodyCat.appendChild(tr);
      });
    }

    const tbodyRecent = document.getElementById('recent');
    if (tbodyRecent) {
      tbodyRecent.innerHTML = '';
      const sorted = items.slice().reverse().slice(0, 20);
      sorted.forEach(it => {
        const tr = document.createElement('tr');
        const d = new Date(it.date);
        tr.innerHTML = `<td>${d.toLocaleDateString()}</td><td>${it.category}</td><td>${(it.note || '')}</td><td>${formatCurrency(Number(it.amount || 0))}</td>`;
        tbodyRecent.appendChild(tr);
      });
    }

    // Auto-open print on first load for convenience if query ?print=1
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('print') === '1') setTimeout(() => window.print(), 300);
    } catch (_) {}
  });
})();


