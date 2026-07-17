/* ============================================================
STORAGE SERVICE - Unlimited storage
============================================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getDatabase, ref, set, get, remove } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDInX4rFSX6iR_E9zlaZ8zezhAriFu5T2c",
  authDomain: "pharmtrack-dda5b.firebaseapp.com",
  databaseURL: "https://pharmtrack-dda5b-default-rtdb.firebaseio.com",
  projectId: "pharmtrack-dda5b",
  storageBucket: "pharmtrack-dda5b.firebasestorage.app",
  messagingSenderId: "832368803604",
  appId: "1:832368803604:web:4309b9e74836d5c07d4c01",
  measurementId: "G-WB6X6QW84S"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const StorageService = {
    getUserEmail() {
        return currentUser?.email?.replace(/\./g, '_') || 'guest';
    },
    async put(table, item) {
        const userEmail = this.getUserEmail();
        await set(ref(database, `users/${userEmail}/${table}/${item.id}`), item);
    },
    async getAll(table) {
        const userEmail = this.getUserEmail();
        const snapshot = await get(ref(database, `users/${userEmail}/${table}`));
        const data = snapshot.val();
        return data ? Object.values(data) : [];
    },
    async delete(table, id) {
        const userEmail = this.getUserEmail();
        await remove(ref(database, `users/${userEmail}/${table}/${id}`));
    }
};

/* ============================================================
PASSCODE SERVICE
============================================================ */
const PasscodeService = {
prefix: 'pharmtrack_',
hash(str) { let h = 0; for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h = h & h; } for (let r = 0; r < 1000; r++) { h = ((h << 5) - h) + str.charCodeAt(r % str.length); h = h & h; } return Math.abs(h).toString(36) + str.length.toString(36); },
hasPasscode() { return !!localStorage.getItem(this.prefix + 'passcode_hash'); },
getStoredName() { return localStorage.getItem(this.prefix + 'user_name') || 'User'; },
setup(name, passcode) {
if (!name || name.trim().length < 1) throw new Error('Please enter your name');
if (!passcode || passcode.length < 4) throw new Error('Passcode must be at least 4 characters');
localStorage.setItem(this.prefix + 'passcode_hash', this.hash(passcode));
localStorage.setItem(this.prefix + 'user_name', name.trim());
return { name: name.trim() };
},
verify(passcode) {
const storedHash = localStorage.getItem(this.prefix + 'passcode_hash');
if (!storedHash) throw new Error('No passcode set');
if (this.hash(passcode) !== storedHash) throw new Error('Incorrect passcode');
return { name: this.getStoredName() };
},
reset(newPasscode, confirmPasscode) {
if (!newPasscode || newPasscode.length < 4) throw new Error('New passcode must be at least 4 characters');
if (newPasscode !== confirmPasscode) throw new Error('Passcodes do not match');
localStorage.setItem(this.prefix + 'passcode_hash', this.hash(newPasscode));
return true;
},
clearSession() { sessionStorage.removeItem(this.prefix + 'session'); }
};

/* ============================================================
DATE HELPERS
============================================================ */
const DateHelper = {
today() { return new Date().toISOString().slice(0,10); },
nowTime() { return new Date().toTimeString().slice(0,5); },
yesterday() { return new Date(Date.now() - 86400000).toISOString().slice(0,10); },
thisWeek() { const now = new Date(); const day = now.getDay(); const diff = day === 0 ? 6 : day - 1; const monday = new Date(now); monday.setDate(now.getDate() - diff); return { from: monday.toISOString().slice(0,10), to: this.today() }; },
lastWeek() { const now = new Date(); const day = now.getDay(); const diff = day === 0 ? 6 : day - 1; const thisMonday = new Date(now); thisMonday.setDate(now.getDate() - diff); const lastMonday = new Date(thisMonday); lastMonday.setDate(thisMonday.getDate() - 7); const lastSunday = new Date(thisMonday); lastSunday.setDate(thisMonday.getDate() - 1); return { from: lastMonday.toISOString().slice(0,10), to: lastSunday.toISOString().slice(0,10) }; },
thisMonth() { const now = new Date(); const first = new Date(now.getFullYear(), now.getMonth(), 1); return { from: first.toISOString().slice(0,10), to: this.today() }; },
lastMonth() { const now = new Date(); const firstThisMonth = new Date(now.getFullYear(), now.getMonth(), 1); const lastMonthEnd = new Date(firstThisMonth); lastMonthEnd.setDate(lastMonthEnd.getDate() - 1); const lastMonthStart = new Date(lastMonthEnd.getFullYear(), lastMonthEnd.getMonth(), 1); return { from: lastMonthStart.toISOString().slice(0,10), to: lastMonthEnd.toISOString().slice(0,10) }; },
last30() { const end = new Date(); const start = new Date(); start.setDate(end.getDate() - 29); return { from: start.toISOString().slice(0,10), to: end.toISOString().slice(0,10) }; },
thisYear() { const now = new Date(); const first = new Date(now.getFullYear(), 0, 1); return { from: first.toISOString().slice(0,10), to: this.today() }; },
getRange(period, from, to) {
if (period === 'custom' && from && to) return { from, to };
switch(period) {
case 'today': return { from: this.today(), to: this.today() };
case 'yesterday': return { from: this.yesterday(), to: this.yesterday() };
case 'thisWeek': return this.thisWeek();
case 'lastWeek': return this.lastWeek();
case 'thisMonth': return this.thisMonth();
case 'lastMonth': return this.lastMonth();
case 'thisYear': return this.thisYear();
case 'all': return { from: '2000-01-01', to: '2099-12-31' };
default: return { from: this.today(), to: this.today() };
}
},
formatKES(amount) { return 'KES ' + (amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); },
formatKSh(amount) { return 'Ksh ' + (amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); },
formatDateDisplay(dateStr) { const d = new Date(dateStr + 'T00:00:00'); return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); },
formatDateShort(dateStr) { const d = new Date(dateStr + 'T00:00:00'); return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: '2-digit' }); },
daysBetween(date1, date2) { return Math.ceil((new Date(date2) - new Date(date1)) / 86400000); },
getTimeContext(dateStr) {
const d = new Date(dateStr + 'T00:00:00');
const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
const thisWeekStart = new Date(today); thisWeekStart.setDate(today.getDate() - today.getDay() + 1);
const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
if (d.getTime() === today.getTime()) return 'Today';
if (d.getTime() === yesterday.getTime()) return 'Yesterday';
if (d >= thisWeekStart) return 'This Week';
if (d >= thisMonthStart) return 'This Month';
return 'Earlier';
}
};

/* ============================================================
TOAST
============================================================ */
function showToast(message, type = 'info') {
const container = document.getElementById('toastContainer');
const toast = document.createElement('div');
toast.className = `toast ${type}`;
const icons = { success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>', error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>', info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>' };
toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
container.appendChild(toast);
setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(20px)'; toast.style.transition = 'all .25s'; setTimeout(() => toast.remove(), 250); }, 3500);
}

/* ============================================================
DATA STORE - Unlimited storage
============================================================ */
const DB = {
get inventory() { return StorageService.getAll('inventory'); },
get sales() { return StorageService.getAll('sales'); },
get expenses() { return StorageService.getAll('expenses'); },
get suppliers() { return StorageService.getAll('suppliers'); },
get patients() { return StorageService.getAll('patients'); },
get prescriptions() { return StorageService.getAll('prescriptions'); },
get adjustments() { return StorageService.getAll('adjustments'); },
get stockIn() { return StorageService.getAll('stockIn'); },
get purchaseOrders() { return StorageService.getAll('purchaseOrders'); },
get returns() { return StorageService.getAll('returns'); },
get bankAccounts() { return StorageService.getAll('bankAccounts'); },
get invoices() { return StorageService.getAll('invoices'); },
get purchases() { return StorageService.getAll('purchases'); },
get payments() { return StorageService.getAll('payments'); },
get grn() { return StorageService.getAll('grn'); },
get stockOut() { return StorageService.getAll('stockOut'); },
get activity() { return StorageService.getAll('activity').sort((a,b) => b.timestamp.localeCompare(a.timestamp)); }
};
function genId(prefix = '') { return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2, 6); }
function logActivity(type, message) {
const entry = { id: genId('act_'), type, message, timestamp: new Date().toISOString() };
StorageService.put('activity', entry);
updateNavBadges();
}

/* ============================================================
THRESHOLD SERVICE - Fixed to look at Category first
============================================================ */
const ThresholdService = {
defaults: { 'Tablet': 10, 'Capsule': 10, 'Syrup': 5, 'Suspension': 5, 'Injection': 5, 'Cream/Ointment': 5, 'Supplement': 5, 'Other': 5 },
get() { try { const saved = JSON.parse(localStorage.getItem('pharmtrack_thresholds') || '{}'); return { ...this.defaults, ...saved }; } catch(e) { return { ...this.defaults }; } },
save(thresholds) { localStorage.setItem('pharmtrack_thresholds', JSON.stringify(thresholds)); },
getThresholdInUnits(medicine) {
const thresholds = this.get();
// Always look at the Category (e.g., "Tablet", "Syrup") to find the exact threshold
const category = medicine.category || 'Other';
return thresholds[category] ?? 5;
},
isLowStock(medicine) { return medicine.qty < this.getThresholdInUnits(medicine); }
};

/* ============================================================
PASSCODE UI HANDLERS
============================================================ */
function showPasscodeError(msg) { const el = document.getElementById('passcodeError'); el.textContent = msg; el.style.display = 'block'; document.getElementById('passcodeSuccess').style.display = 'none'; }
function showPasscodeSuccess(msg) { const el = document.getElementById('passcodeSuccess'); el.textContent = msg; el.style.display = 'block'; document.getElementById('passcodeError').style.display = 'none'; }
function clearPasscodeMessages() { document.getElementById('passcodeError').style.display = 'none'; document.getElementById('passcodeSuccess').style.display = 'none'; }

function showUnlockLoading(progress, text) {
const loading = document.getElementById('unlockLoading');
loading.classList.add('active');
document.getElementById('unlockProgressFill').style.width = progress + '%';
if (text) document.getElementById('unlockLoadingText').textContent = text;
}

function hideUnlockLoading() {
document.getElementById('unlockLoading').classList.remove('active');
document.getElementById('unlockProgressFill').style.width = '0%';
}

function showSetupScreen() { 
document.getElementById('setupForm').classList.add('active'); 
document.getElementById('unlockForm').classList.remove('active'); 
document.getElementById('passcodeSubtitle').textContent = 'Create your passcode to get started';
hideUnlockLoading();
}
function showUnlockScreen() { 
document.getElementById('unlockForm').classList.add('active'); 
document.getElementById('setupForm').classList.remove('active'); 
document.getElementById('welcomeName').textContent = PasscodeService.getStoredName(); 
document.getElementById('passcodeSubtitle').innerHTML = 'Enter your passcode to continue';
setTimeout(() => document.getElementById('unlockPasscode').focus(), 100);
hideUnlockLoading();
}
function togglePasscodeVisibility(inputId, btn) {
const input = document.getElementById(inputId);
if (input.type === 'password') { input.type = 'text'; btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'; }
else { input.type = 'password'; btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'; }
}
function updatePasscodeStrength() {
const val = document.getElementById('setupPasscode').value;
const bars = ['str1','str2','str3','str4'];
const textEl = document.getElementById('strengthText');
let strength = 0;
if (val.length >= 4) strength++;
if (val.length >= 6) strength++;
if (/[A-Z]/.test(val) && /[a-z]/.test(val)) strength++;
if (/[0-9]/.test(val) || /[^A-Za-z0-9]/.test(val)) strength++;
bars.forEach((id, i) => { const el = document.getElementById(id); el.className = 'passcode-strength-bar'; if (i < strength) { if (strength <= 1) el.classList.add('weak'); else if (strength <= 2) el.classList.add('medium'); else el.classList.add('strong'); } });
const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const colors = ['', 'var(--danger)', 'var(--warning)', 'var(--success)', 'var(--success)'];
textEl.textContent = val.length > 0 ? labels[strength] : '';
textEl.style.color = colors[strength];
}
function handleSetup(event) {
event.preventDefault();
clearPasscodeMessages();
const name = document.getElementById('setupName').value.trim();
const passcode = document.getElementById('setupPasscode').value;
const confirm = document.getElementById('setupConfirm').value;
if (passcode !== confirm) { showPasscodeError('Passcodes do not match'); return; }
try { 
PasscodeService.setup(name, passcode); 
showPasscodeSuccess('Passcode created! Redirecting...'); 
setTimeout(() => { document.getElementById('passcodeOverlay').classList.add('hidden'); initializeApp({ name: name }); }, 800);
} catch (e) { showPasscodeError(e.message); }
}

function handleUnlock(event) {
event.preventDefault();
clearPasscodeMessages();
const passcode = document.getElementById('unlockPasscode').value;
showUnlockLoading(0, 'Verifying credentials...');
let progress = 0;
const interval = setInterval(() => {
progress += Math.random() * 15 + 5;
if (progress > 95) progress = 95;
document.getElementById('unlockProgressFill').style.width = progress + '%';
}, 150);
setTimeout(() => {
try {
const user = PasscodeService.verify(passcode);
clearInterval(interval);
showUnlockLoading(100, 'Access granted!');
setTimeout(() => {
document.getElementById('passcodeOverlay').classList.add('hidden');
hideUnlockLoading();
initializeApp(user);
}, 400);
} catch (e) {
clearInterval(interval);
hideUnlockLoading();
showPasscodeError(e.message);
document.getElementById('unlockPasscode').value = '';
document.getElementById('unlockPasscode').focus();
}
}, 800);
}

function handleResetPasscode() {
if (!confirm('This will reset your passcode. Your data will be preserved. Continue?')) return;
const newPass = prompt('Enter a new passcode (min 4 characters):');
if (!newPass) return;
const confirmPass = prompt('Confirm new passcode:');
if (!confirmPass) return;
try { PasscodeService.reset(newPass, confirmPass); showPasscodeSuccess('Passcode reset!'); document.getElementById('unlockPasscode').value = ''; document.getElementById('unlockPasscode').focus(); setTimeout(() => { document.getElementById('passcodeSuccess').style.display = 'none'; }, 2500); }
catch (e) { showPasscodeError(e.message); }
}
function handleLogout() {
if (!confirm('Lock the app? You will need your passcode to unlock.')) return;
PasscodeService.clearSession();
document.getElementById('appLayout').style.display = 'none';
document.getElementById('passcodeOverlay').classList.remove('hidden');
document.getElementById('unlockPasscode').value = '';
clearPasscodeMessages();
showUnlockScreen();
}

/* ============================================================
APP INITIALIZATION
============================================================ */
let currentUser = null;
function initializeApp(user) {
currentUser = user;
document.getElementById('appLayout').style.display = 'flex';
document.getElementById('userName').textContent = user.name;
document.getElementById('userRole').textContent = 'Pharmacy Admin';
const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
document.getElementById('userAvatar').textContent = initials;
updateNavBadges();
UIController.navigate('dashboard');
}
(function checkSession() {
if (PasscodeService.hasPasscode()) { showUnlockScreen(); } else { showSetupScreen(); }
})();
document.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); const gs = document.getElementById('globalSearch'); if (gs) gs.focus(); } });

/* ============================================================
GLOBAL SEARCH - Now interactive and clickable
============================================================ */
function globalSearch(query) {
    const resultsContainer = document.getElementById('globalSearchResults');
    // Remove old results if query is empty
    if (!query || query.trim().length < 2) {
        if(resultsContainer) resultsContainer.style.display = 'none';
        return;
    }
    
    const q = query.toLowerCase().trim();
    const results = [];
    
    // Search Medicine Inventory
    DB.inventory.filter(m => m.name.toLowerCase().includes(q) || (m.brand||'').toLowerCase().includes(q))
        .forEach(m => results.push({ type: 'Medicine', id: m.id, name: m.name, detail: `Qty: ${m.qty} | Exp: ${m.expiry}` }));

    // Search Patients
    DB.patients.filter(p => p.name.toLowerCase().includes(q) || p.phone.includes(q))
        .forEach(p => results.push({ type: 'Patient', id: p.id, name: p.name, detail: `Phone: ${p.phone}` }));

    // Search Sales
    DB.sales.filter(s => (s.customer||'').toLowerCase().includes(q)).slice(0,3)
        .forEach(s => results.push({ type: 'Sale', id: s.id, name: `SR-${s.receiptNumber}`, detail: `Customer: ${s.customer} | ${DateHelper.formatKES(s.total)}` }));

    if (results.length === 0) {
        if(resultsContainer) resultsContainer.style.display = 'none';
        return;
    }

    // Create the dynamic result container if it doesn't exist
    let container = document.getElementById('globalSearchResults');
    if (!container) {
        container = document.createElement('div');
        container.id = 'globalSearchResults';
        container.style.cssText = 'position:absolute; top:60px; left:0; right:0; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-lg); box-shadow:var(--shadow-md); padding:12px; max-height:400px; overflow-y:auto; z-index:2000;';
        document.getElementById('globalSearch').parentElement.style.position = 'relative';
        document.getElementById('globalSearch').parentElement.appendChild(container);
    }

    // Build the HTML
    let html = `<div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid var(--border);">Search Results (Click to view details)</div>`;
    results.forEach(r => {
        // Logic: If it's a medicine, trigger showStockDetails. If Sale, trigger viewSaleReceipt. If Patient, navigate to Patients.
        let clickAction = `showStockDetails('${r.id}')`;
        if(r.type === 'Sale') clickAction = `viewSaleReceipt('${r.id}')`;
        if(r.type === 'Patient') clickAction = `navigate('patients')`;

        html += `<div onclick="${clickAction}" style="cursor:pointer;padding:8px 12px;border-radius:var(--radius);transition:background 0.15s;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border);">
            <div>
                <div style="font-weight:500;color:var(--text);">${r.name}</div>
                <div style="font-size:12px;color:var(--text-muted);">${r.detail}</div>
            </div>
            <span class="badge badge-info">${r.type}</span>
        </div>`;
    });
    container.innerHTML = html;
    container.style.display = 'block';

    // Close search on clicking outside
    document.addEventListener('click', function closeSearch(e) {
        if (!e.target.closest('#globalSearch') && !e.target.closest('#globalSearchResults')) {
            container.style.display = 'none';
            document.removeEventListener('click', closeSearch);
        }
    });
}

/* ============================================================
UI CONTROLLER
============================================================ */
const UIController = {
charts: {},
currentPanel: 'dashboard',
navigate(panel) {
document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
const panelEl = document.getElementById(`panel-${panel}`);
if (panelEl) panelEl.classList.add('active');
const navEl = document.querySelector(`.nav-item[data-panel="${panel}"]`);
if (navEl) navEl.classList.add('active');
this.currentPanel = panel;
if (panel === 'dashboard') this.renderDashboard();
else if (panel === 'pos') initPOS();
else if (panel === 'sales') renderSalesTransactions();
else if (panel === 'receipt') renderReceiptPanel();
else if (panel === 'inventory') renderTable();
else if (panel === 'stock') renderStock();
else if (panel === 'thresholds') renderThresholds();
else if (panel === 'batches') renderBatches();
else if (panel === 'stockin') renderStockIn();
else if (panel === 'adjustments') renderAdjustments();
else if (panel === 'expiry') renderExpiry();
else if (panel === 'lowstock') renderLowStock();
else if (panel === 'stockout') renderStockOut();
else if (panel === 'suppliers') renderSuppliers();
else if (panel === 'purchases') renderPurchases();
else if (panel === 'purchaseorders') renderPurchaseOrders();
else if (panel === 'grn') renderGRN();
else if (panel === 'invoices') renderInvoices();
else if (panel === 'returns') renderReturns();
else if (panel === 'expenses') renderExpenses();
else if (panel === 'payments') renderPayments();
else if (panel === 'cashbook') renderCashBook();
else if (panel === 'bankaccounts') renderBankAccounts();
else if (panel === 'patients') renderPatients();
else if (panel === 'prescriptions') renderPrescriptions();
else if (panel === 'reports') renderReports();
else if (panel === 'activity') renderActivity();
updateNavBadges();
},
renderDashboard() {
const today = DateHelper.today();
document.getElementById('dashboardWelcome').textContent = `Here's what's happening today, ${DateHelper.formatDateDisplay(today)}`;
const todaySales = DB.sales.filter(s => s.date === today);
const yesterdaySales = DB.sales.filter(s => s.date === DateHelper.yesterday());
const todayExpenses = DB.expenses.filter(e => e.date === today);
const yesterdayExpenses = DB.expenses.filter(e => e.date === DateHelper.yesterday());
const revenue = todaySales.reduce((s,x) => s + (x.total || 0), 0);
const yesterdayRevenue = yesterdaySales.reduce((s,x) => s + (x.total || 0), 0);
const expenses = todayExpenses.reduce((s,x) => s + (x.amount || 0), 0);
const yesterdayExpensesTotal = yesterdayExpenses.reduce((s,x) => s + (x.amount || 0), 0);
const grossProfit = todaySales.reduce((s,x) => s + (x.total || 0) - ((x.lines || []).reduce((a,l) => a + l.costPrice * l.qty, 0)), 0);
const yesterdayGrossProfit = yesterdaySales.reduce((s,x) => s + (x.total || 0) - ((x.lines || []).reduce((a,l) => a + l.costPrice * l.qty, 0)), 0);
const netProfit = revenue - expenses;
const yesterdayNetProfit = yesterdayRevenue - yesterdayExpensesTotal;
const kpiHtml = `
<div class="kpi-card"><div class="kpi-icon-wrap blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg></div><div class="kpi-body"><div class="kpi-label">Total Sales (Today)</div><div class="kpi-value">${DateHelper.formatKES(revenue)}</div><div class="kpi-trend ${revenue >= yesterdayRevenue ? 'up' : 'down'}">${revenue >= yesterdayRevenue ? '↑' : '↓'} ${yesterdayRevenue > 0 ? Math.abs((revenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1) : 0}% vs yesterday</div></div></div>
<div class="kpi-card"><div class="kpi-icon-wrap green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div><div class="kpi-body"><div class="kpi-label">Gross Profit (Today)</div><div class="kpi-value">${DateHelper.formatKES(grossProfit)}</div><div class="kpi-trend ${grossProfit >= yesterdayGrossProfit ? 'up' : 'down'}">${grossProfit >= yesterdayGrossProfit ? '↑' : '↓'} ${yesterdayGrossProfit > 0 ? Math.abs((grossProfit - yesterdayGrossProfit) / yesterdayGrossProfit * 100).toFixed(1) : 0}% vs yesterday</div></div></div>
<div class="kpi-card"><div class="kpi-icon-wrap purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div><div class="kpi-body"><div class="kpi-label">Total Expenses (Today)</div><div class="kpi-value">${DateHelper.formatKES(expenses)}</div><div class="kpi-trend ${expenses <= yesterdayExpensesTotal ? 'up' : 'down'}">${expenses <= yesterdayExpensesTotal ? '↓' : '↑'} ${yesterdayExpensesTotal > 0 ? Math.abs((expenses - yesterdayExpensesTotal) / yesterdayExpensesTotal * 100).toFixed(1) : 0}% vs yesterday</div></div></div>
<div class="kpi-card"><div class="kpi-icon-wrap teal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg></div><div class="kpi-body"><div class="kpi-label">Net Profit (Today)</div><div class="kpi-value">${DateHelper.formatKES(netProfit)}</div><div class="kpi-trend ${netProfit >= yesterdayNetProfit ? 'up' : 'down'}">${netProfit >= yesterdayNetProfit ? '↑' : '↓'} ${yesterdayNetProfit !== 0 ? Math.abs((netProfit - yesterdayNetProfit) / Math.abs(yesterdayNetProfit) * 100).toFixed(1) : 0}% vs yesterday</div></div></div>
<div class="kpi-card"><div class="kpi-icon-wrap orange"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div><div class="kpi-body"><div class="kpi-label">Low Stock Items</div><div class="kpi-value">${DB.inventory.filter(m => ThresholdService.isLowStock(m)).length}</div><a class="kpi-link" onclick="navigate('lowstock')">View details</a></div></div>
<div class="kpi-card"><div class="kpi-icon-wrap red"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div><div class="kpi-body"><div class="kpi-label">Expiring Soon</div><div class="kpi-value">${DB.inventory.filter(m => { const diff = DateHelper.daysBetween(DateHelper.today(), m.expiry); return diff >= 0 && diff <= 30; }).length}</div><a class="kpi-link" onclick="navigate('expiry')">View details</a></div></div>
`;
document.getElementById('dashboardKPI').innerHTML = kpiHtml;

const dailyData = [];
for (let i = 6; i >= 0; i--) {
const d = new Date(Date.now() - i * 86400000).toISOString().slice(0,10);
const sales = DB.sales.filter(s => s.date === d);
const exps = DB.expenses.filter(e => e.date === d);
const rev = sales.reduce((s,x) => s + (x.total || 0), 0);
const profit = rev - exps.reduce((s,x) => s + (x.amount || 0), 0);
dailyData.push({ label: new Date(d).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }), revenue: rev, profit: profit });
}
this.renderChart('salesChart', 'line', { labels: dailyData.map(d => d.label), datasets: [{ label: 'Sales', data: dailyData.map(d => d.revenue), borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,.08)', fill: true, tension: .4, borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: '#2563eb' }, { label: 'Profit', data: dailyData.map(d => d.profit), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,.08)', fill: true, tension: .4, borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: '#10b981' }] }, { scales: { y: { beginAtZero: true, ticks: { callback: v => 'KES ' + (v/1000).toFixed(0) + 'K' } } }, plugins: { legend: { display: false } } });

const topDrugsMap = {};
todaySales.forEach(s => { (s.lines || []).forEach(l => { if (!topDrugsMap[l.productName]) topDrugsMap[l.productName] = { name: l.productName, qty: 0, revenue: 0 }; topDrugsMap[l.productName].qty += l.qty; topDrugsMap[l.productName].revenue += l.amount; }); });
const topDrugs = Object.values(topDrugsMap).sort((a,b) => b.revenue - a.revenue).slice(0, 5);
const list = document.getElementById('topDrugsList');
if (topDrugs.length === 0) list.innerHTML = '<li style="text-align:center;color:var(--text-muted);padding:20px;">No sales today</li>';
else list.innerHTML = topDrugs.map((d, i) => `<li class="top-item"><div class="top-rank">${i + 1}</div><div class="top-name">${d.name}</div><div class="top-qty">${d.qty}</div><div class="top-amount">${DateHelper.formatKES(d.revenue)}</div></li>`).join('');

const expiring = DB.inventory.filter(m => { const diff = DateHelper.daysBetween(DateHelper.today(), m.expiry); return diff >= 0 && diff <= 60; }).sort((a,b) => new Date(a.expiry) - new Date(b.expiry)).slice(0, 5);
const expBody = document.getElementById('expiringBody');
if (expiring.length === 0) expBody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text-muted);padding:20px;">No items expiring soon</td></tr>';
else expBody.innerHTML = expiring.map(m => { const days = DateHelper.daysBetween(DateHelper.today(), m.expiry); const badgeClass = days <= 7 ? 'badge-danger' : days <= 14 ? 'badge-warning' : 'badge-success'; return `<tr><td><div class="drug-name">${m.name}</div><div class="drug-batch">Batch: ${m.batch}</div></td><td>${DateHelper.formatDateDisplay(m.expiry)}</td><td><span class="badge ${badgeClass}">${days} days</span></td></tr>`; }).join('');

const lowStock = DB.inventory.filter(m => ThresholdService.isLowStock(m)).sort((a,b) => { const at = ThresholdService.getThresholdInUnits(a); const bt = ThresholdService.getThresholdInUnits(b); return (a.qty/at) - (b.qty/bt); }).slice(0, 5);
const lsBody = document.getElementById('lowStockBody');
if (lowStock.length === 0) lsBody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text-muted);padding:20px;">All stock levels healthy</td></tr>';
else lsBody.innerHTML = lowStock.map(m => `<tr><td class="drug-name">${m.name}</td><td>${m.qty}</td><td>${ThresholdService.getThresholdInUnits(m)}</td></tr>`).join('');

const recentSales = [...DB.sales].sort((a,b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 5);
const rsBody = document.getElementById('recentSalesBody');
if (recentSales.length === 0) rsBody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px;">No recent sales</td></tr>';
else rsBody.innerHTML = recentSales.map((s, i) => { const invNum = `SR-${String(s.receiptNumber || (DB.sales.length - i)).padStart(4, '0')}`; const time = new Date(s.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); return `<tr><td><span class="invoice-link">${invNum}</span></td><td>${s.customer || 'Walk-in Customer'}</td><td>${time}</td><td class="amount">${DateHelper.formatKES(s.total)}</td><td><span class="badge badge-paid">Paid</span></td></tr>`; }).join('');
updateNavBadges();
},
renderChart(id, type, data, options = {}) {
if (this.charts[id]) this.charts[id].destroy();
const ctx = document.getElementById(id); if (!ctx) return;
const textColor = '#475569'; const gridColor = 'rgba(15,23,42,.06)';
this.charts[id] = new Chart(ctx, { type, data, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: textColor, font: { family: 'Inter', size: 12 } }, ...(options.plugins?.legend || {}) } }, scales: type !== 'doughnut' && type !== 'pie' ? { x: { ticks: { color: textColor, font: { size: 11 } }, grid: { color: gridColor } }, y: { ticks: { color: textColor, font: { size: 11 } }, grid: { color: gridColor }, ...(options.scales?.y || {}) } } : undefined, ...options } });
}
};
function navigate(panel) { UIController.navigate(panel); }
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('collapsed'); }
function updateNavBadges() {
// Badges are hidden via CSS, but we keep this function for internal tracking
const ids = ['navInventoryCount','navSalesCount','navExpensesCount','navInvoicesCount','navReturnsCount','navStockInCount','navAdjustmentsCount','navLowStockCount','navSuppliersCount','navPurchasesCount','navPOCount','navGRNCount','navPaymentsCount','navBankAccountsCount','navPatientsCount','navPrescriptionsCount','navActivityCount'];
const data = { navInventoryCount: DB.inventory.length, navSalesCount: DB.sales.length, navExpensesCount: DB.expenses.length, navInvoicesCount: DB.invoices.length, navReturnsCount: DB.returns.length, navStockInCount: DB.stockIn.length, navAdjustmentsCount: DB.adjustments.length, navLowStockCount: DB.inventory.filter(m => ThresholdService.isLowStock(m)).length, navSuppliersCount: DB.suppliers.length, navPurchasesCount: DB.purchases.length, navPOCount: DB.purchaseOrders.length, navGRNCount: DB.grn.length, navPaymentsCount: DB.payments.length, navBankAccountsCount: DB.bankAccounts.length, navPatientsCount: DB.patients.length, navPrescriptionsCount: DB.prescriptions.length, navActivityCount: DB.activity.length };
// Badge numbers are hidden via CSS (display:none), but we still update for potential future use
const totalAlerts = DB.inventory.filter(m => ThresholdService.isLowStock(m) || (() => { const d = DateHelper.daysBetween(DateHelper.today(), m.expiry); return d >= 0 && d <= 30; })()).length;
const dot = document.getElementById('notifDot');
if (dot) { dot.style.display = totalAlerts > 0 ? 'flex' : 'none'; dot.textContent = totalAlerts; }
}

/* ============================================================
RECEIPT NUMBER COUNTER
============================================================ */
function getNextReceiptNumber() {
let counter = parseInt(localStorage.getItem(StorageService.prefix + 'receipt_counter') || '0');
counter++;
localStorage.setItem(StorageService.prefix + 'receipt_counter', counter.toString());
return counter;
}
function getCurrentReceiptNumber() { return parseInt(localStorage.getItem(StorageService.prefix + 'receipt_counter') || '0') + 1; }

/* ============================================================
POINT OF SALE
============================================================ */
let posCart = [];

function initPOS() {
document.getElementById('posDate').value = DateHelper.today();
document.getElementById('posTime').value = DateHelper.nowTime();
document.getElementById('posReceiptNumber').value = 'SR-' + String(getCurrentReceiptNumber()).padStart(4, '0');
posCart = [];
renderCart();
updateCartTotals();
updatePOSProductSelect();
// Reset payment container to a single row
document.getElementById('paymentContainer').innerHTML = `
<div style="display:flex;gap:8px;margin-bottom:4px;">
    <select class="payment-method-select" style="flex:1;padding:8px 12px;border:1px solid var(--border-strong);border-radius:var(--radius);font-size:13px;">
        <option value="">-- Select payment mode --</option>
        <option value="CASH">Cash</option>
        <option value="POCHI">Pochi (M-Pesa)</option>
        <option value="NCBA BANK">NCBA Bank</option>
        <option value="CARD">Card</option>
    </select>
    <input type="number" class="payment-amount-input" placeholder="Amount" step="0.01" min="0" style="width:100px;padding:8px 12px;border:1px solid var(--border-strong);border-radius:var(--radius);font-size:13px;">
    <input type="text" class="payment-ref-input" placeholder="Ref (Optional)" style="flex:0.8;padding:8px 12px;border:1px solid var(--border-strong);border-radius:var(--radius);font-size:13px;">
</div>
`;
}

/* ============================================================
SPLIT PAYMENT HANDLER
============================================================ */
function addSplitPaymentRow() {
    const container = document.getElementById('paymentContainer');
    const newRow = document.createElement('div');
    newRow.style.display = 'flex';
    newRow.style.gap = '8px';
    newRow.style.marginBottom = '4px';
    newRow.innerHTML = `
        <select class="payment-method-select" style="flex:1;padding:8px 12px;border:1px solid var(--border-strong);border-radius:var(--radius);font-size:13px;">
            <option value="">-- Select payment mode --</option>
            <option value="CASH">Cash</option>
            <option value="POCHI">Pochi (M-Pesa)</option>
            <option value="NCBA BANK">NCBA Bank</option>
            <option value="CARD">Card</option>
        </select>
        <input type="number" class="payment-amount-input" placeholder="Amount" step="0.01" min="0" style="width:100px;padding:8px 12px;border:1px solid var(--border-strong);border-radius:var(--radius);font-size:13px;">
        <input type="text" class="payment-ref-input" placeholder="Ref (Optional)" style="flex:0.8;padding:8px 12px;border:1px solid var(--border-strong);border-radius:var(--radius);font-size:13px;">
        <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">✕</button>
    `;
    container.appendChild(newRow);
}

function updatePOSProductSelect() {
const select = document.getElementById('posProductSelect');
const currentVal = select.value;
select.innerHTML = '<option value="">-- Choose a medicine --</option>' + 
DB.inventory.filter(m => m.qty > 0).map(m => `<option value="${m.id}">${m.name} ${m.brand ? '('+m.brand+')' : ''} — ${m.category} — Stock: ${m.qty}</option>`).join('');
select.value = currentVal;
if (currentVal) onProductSelect();
}

function onProductSelect() {
const select = document.getElementById('posProductSelect');
const medId = select.value;
const qtyInput = document.getElementById('posQty');
const priceInput = document.getElementById('posPriceInput');
const addBtn = document.getElementById('addToCartBtn');
if (!medId) {
document.getElementById('posDrugName').textContent = '—';
document.getElementById('posBrand').textContent = '—';
document.getElementById('posBatch').textContent = '—';
document.getElementById('posClass').textContent = '—';
document.getElementById('posFormulation').textContent = '—';
document.getElementById('posPrice').textContent = 'Ksh 0.00';
document.getElementById('posLineTotal').textContent = 'Ksh 0.00';
addBtn.disabled = true;
return;
}
const med = DB.inventory.find(m => m.id === medId);
if (!med) return;
document.getElementById('posDrugName').textContent = med.name;
document.getElementById('posBrand').textContent = med.brand || '—';
document.getElementById('posBatch').textContent = med.batch || '—';
document.getElementById('posClass').textContent = med.category || '—';
document.getElementById('posFormulation').textContent = med.category || '—';
document.getElementById('posPrice').textContent = DateHelper.formatKSh(med.price || 0);
// Pre-fill the price input with the default selling price, but allow user to change it
priceInput.value = med.price || 0;
qtyInput.max = med.qty;
addBtn.disabled = false;
updatePosTotal();
}

function updatePosTotal() {
const select = document.getElementById('posProductSelect');
const medId = select.value;
const qty = parseInt(document.getElementById('posQty').value) || 0;
const price = parseFloat(document.getElementById('posPriceInput').value) || 0;
const lineTotalDisplay = document.getElementById('posLineTotal');
if (!medId || qty < 1) { lineTotalDisplay.textContent = 'Ksh 0.00'; return; }
const med = DB.inventory.find(m => m.id === medId);
if (!med) { lineTotalDisplay.textContent = 'Ksh 0.00'; return; }
const total = qty * price;
lineTotalDisplay.textContent = DateHelper.formatKSh(total);
}

function addToCart() {
const select = document.getElementById('posProductSelect');
const medId = select.value;
const qty = parseInt(document.getElementById('posQty').value) || 0;
const price = parseFloat(document.getElementById('posPriceInput').value) || 0;
if (!medId || qty < 1) { showToast('Please select a medicine and enter quantity.', 'error'); return; }
if (price <= 0) { showToast('Please enter a valid selling price.', 'error'); return; }
const med = DB.inventory.find(m => m.id === medId);
if (!med) { showToast('Medicine not found.', 'error'); return; }
if (qty > med.qty) { showToast(`Insufficient stock. Available: ${med.qty}`, 'error'); return; }
const existingItem = posCart.find(item => item.medId === medId);
if (existingItem) {
const newQty = existingItem.qty + qty;
if (newQty > med.qty) { showToast(`Cannot add ${qty}. You already have ${existingItem.qty} in cart. Available: ${med.qty}`, 'error'); return; }
existingItem.qty = newQty;
existingItem.price = price; // Update price to the latest entered price
} else {
posCart.push({ medId: med.id, name: med.name, brand: med.brand || '', batch: med.batch || '', category: med.category || '', formulation: med.category || '', qty: qty, price: price, costPrice: med.costPrice || 0 });
}
showToast(`${med.name} added to cart!`, 'success');
renderCart();
updateCartTotals();
document.getElementById('posQty').value = 1;
document.getElementById('posPriceInput').value = med.price || 0;
updatePosTotal();
}

function renderCart() {
const tbody = document.getElementById('cartTableBody');
const emptyState = document.getElementById('cartEmptyState');
if (posCart.length === 0) { tbody.innerHTML = ''; emptyState.style.display = 'block'; document.getElementById('completeSaleBtn').disabled = true; return; }
emptyState.style.display = 'none';
document.getElementById('completeSaleBtn').disabled = false;
tbody.innerHTML = '';
posCart.forEach((item, index) => {
const subtotal = item.qty * item.price;
const tr = document.createElement('tr');
tr.innerHTML = `
<td style="padding:8px 10px;text-align:center;font-weight:600;color:var(--text-muted);">${index + 1}</td>
<td style="padding:8px 10px;"><div style="font-weight:600;color:var(--text);">${item.name}</div>${item.brand ? `<div style="font-size:11px;color:var(--text-faint);">${item.brand}</div>` : ''}</td>
<td style="padding:8px 10px;font-size:12px;color:var(--text-muted);">${item.batch}</td>
<td style="padding:8px 10px;font-size:12px;color:var(--text-muted);">${item.category}</td>
<td style="padding:8px 10px;font-size:12px;color:var(--text-muted);">${item.formulation}</td>
<td style="padding:8px 10px;text-align:center;">
<input type="number" value="${item.qty}" min="1" max="${DB.inventory.find(m => m.id === item.medId)?.qty || 0}" 
onchange="updateCartItemQty(${index}, this.value)" 
style="width:50px;padding:4px 6px;border:1px solid var(--border);border-radius:4px;text-align:center;font-size:13px;">
</td>
<td style="padding:8px 10px;text-align:right;font-size:13px;">${DateHelper.formatKSh(item.price)}</td>
<td style="padding:8px 10px;text-align:right;font-weight:600;font-variant-numeric:tabular-nums;">${DateHelper.formatKSh(subtotal)}</td>
<td style="padding:8px 10px;text-align:center;">
<span onclick="removeFromCart(${index})" style="cursor:pointer;color:var(--danger);font-size:18px;">×</span>
</td>
`;
tbody.appendChild(tr);
});
}

function updateCartItemQty(index, newQty) {
const qty = parseInt(newQty) || 0;
if (qty < 1) { removeFromCart(index); return; }
const item = posCart[index];
const med = DB.inventory.find(m => m.id === item.medId);
if (med && qty > med.qty) { showToast(`Cannot update. Available: ${med.qty}`, 'error'); renderCart(); updateCartTotals(); return; }
item.qty = qty;
renderCart();
updateCartTotals();
}

function removeFromCart(index) {
const item = posCart[index];
posCart.splice(index, 1);
showToast(`${item.name} removed from cart.`, 'info');
renderCart();
updateCartTotals();
}

function clearCart() {
if (posCart.length === 0) return;
if (!confirm('Empty the cart?')) return;
posCart = [];
renderCart();
updateCartTotals();
showToast('Cart emptied.', 'info');
}

function updateCartTotals() {
const totalItems = posCart.reduce((sum, item) => sum + item.qty, 0);
const grandTotal = posCart.reduce((sum, item) => sum + (item.qty * item.price), 0);
document.getElementById('cartTotalItems').textContent = totalItems;
document.getElementById('cartGrandTotal').textContent = DateHelper.formatKSh(grandTotal);
}

function completeSale() {
    if (posCart.length === 0) { showToast('Cart is empty.', 'error'); return; }
    const customer = document.getElementById('posCustomer').value.trim() || 'Walk-in Customer';
    const date = document.getElementById('posDate').value;
    const time = document.getElementById('posTime').value;
    const receiptNumber = document.getElementById('posReceiptNumber').value;

    if (!date) { showToast('Please select a date.', 'error'); return; }

    // Calculate total
    let total = 0;
    const lines = posCart.map(item => {
        const subtotal = item.qty * item.price;
        total += subtotal;
        return { productId: item.medId, productName: item.name, productBrand: item.brand, description: item.name, qty: item.qty, rate: item.price, amount: subtotal, serviceDate: date, costPrice: item.costPrice };
    });

    // Process Split Payments
    let totalPayment = 0;
    let paymentDesc = [];
    const selects = document.querySelectorAll('.payment-method-select');
    const amounts = document.querySelectorAll('.payment-amount-input');
    const refs = document.querySelectorAll('.payment-ref-input');

    for(let i=0; i<selects.length; i++) {
        let method = selects[i].value;
        let amount = parseFloat(amounts[i].value) || 0;
        let ref = refs[i].value.trim();
        if(method && amount > 0) {
            if(method !== 'CASH' && !ref) { showToast('Please enter a reference for non-cash split payments.', 'error'); return; }
            totalPayment += amount;
            paymentDesc.push(`${method}: ${DateHelper.formatKSh(amount)}${ref ? ' (Ref: '+ref+')' : ''}`);
        }
    }

    // Fallback to single payment if no split rows filled
    if(paymentDesc.length === 0) {
        // Check if a single method was selected in a hidden or non-split way
        showToast('Please enter at least one payment method and amount.', 'error'); 
        return;
    }

    if(totalPayment < total) { showToast(`Total payment (${DateHelper.formatKSh(totalPayment)}) is less than the total bill (${DateHelper.formatKSh(total)}).`, 'error'); return; }

    const receiptNum = getNextReceiptNumber();
    document.getElementById('posReceiptNumber').value = 'SR-' + String(receiptNum).padStart(4, '0');

    const sale = {
        id: genId('sal_'),
        date,
        receiptNumber: receiptNum,
        customer,
        paymentMethod: paymentDesc.join(' | '),
        payment: 'SPLIT',
        reference: 'Split Payment',
        lines,
        total,
        subtotal: total,
        tax: 0,
        discount: 0,
        txCode: 'SPLIT',
        status: 'Paid',
        createdAt: new Date().toISOString()
    };
    lines.forEach(line => { const med = DB.inventory.find(m => m.id === line.productId); if (med) { med.qty -= line.qty; StorageService.put('inventory', med); } });
    StorageService.put('sales', sale);
    const invoice = { id: genId('inv_'), saleId: sale.id, receiptNumber: sale.receiptNumber, date: sale.date, customer: customer, total, payment: paymentDesc.join(' | '), reference: 'Split Payment', status: 'Paid', createdAt: new Date().toISOString() };
    StorageService.put('invoices', invoice);
    logActivity('sale', `Sale receipt SR-${String(receiptNum).padStart(4, '0')} created for ${customer} — ${DateHelper.formatKES(total)}`);
    showToast(`Receipt SR-${String(receiptNum).padStart(4, '0')} saved successfully!`, 'success');
    posCart = []; renderCart(); updateCartTotals();
    currentReceiptSaleId = sale.id;
    navigate('receipt');
}

/* ============================================================
SALES TRANSACTIONS
============================================================ */
let salesCurrentPage = 1;
const SALES_PER_PAGE = 50;
let filteredSales = [];

function getFilteredSalesData() {
const typeFilter = document.getElementById('salesTypeFilter')?.value || 'all';
const dateFilter = document.getElementById('salesDateFilter')?.value || 'all';
const customerFilter = (document.getElementById('salesCustomerFilter')?.value || '').toLowerCase().trim();
let dateFrom = document.getElementById('salesDateFrom').value;
let dateTo = document.getElementById('salesDateTo').value;
let sales = [...DB.sales];
if (dateFilter !== 'all' || (dateFrom && dateTo)) {
let range;
if (dateFilter !== 'all') range = DateHelper.getRange(dateFilter);
else if (dateFrom && dateTo) range = { from: dateFrom, to: dateTo };
else range = { from: '2000-01-01', to: '2099-12-31' };
sales = sales.filter(s => s.date >= range.from && s.date <= range.to);
}
if (typeFilter !== 'all') { sales = sales.filter(s => s.paymentMethod === typeFilter || s.payment === typeFilter); }
if (customerFilter) { sales = sales.filter(s => (s.customer || '').toLowerCase().includes(customerFilter)); }
sales.sort((a, b) => { if (b.date !== a.date) return b.date.localeCompare(a.date); return (b.createdAt || '').localeCompare(a.createdAt || ''); });
return sales;
}

function renderSalesTransactions() {
filteredSales = getFilteredSalesData();
const totalPages = Math.max(1, Math.ceil(filteredSales.length / SALES_PER_PAGE));
if (salesCurrentPage > totalPages) salesCurrentPage = totalPages;
if (salesCurrentPage < 1) salesCurrentPage = 1;
const startIdx = (salesCurrentPage - 1) * SALES_PER_PAGE;
const endIdx = Math.min(startIdx + SALES_PER_PAGE, filteredSales.length);
const pageSales = filteredSales.slice(startIdx, endIdx);
const tbody = document.getElementById('salesTableBody');
const emptyState = document.getElementById('salesEmptyState');
if (!tbody) return;
tbody.innerHTML = '';
if (filteredSales.length === 0) { emptyState.style.display = 'block'; document.getElementById('salesGrandTotal').textContent = 'Ksh 0.00'; document.getElementById('salesFooterTotal').textContent = 'Ksh 0.00'; document.getElementById('salesPageInfo').textContent = '0-0 of 0'; return; }
emptyState.style.display = 'none';
let pageTotal = 0;
let grandTotal = 0;
filteredSales.forEach(s => grandTotal += s.total || 0);
pageSales.forEach((s) => {
const receiptNo = `SR-${String(s.receiptNumber || '0').padStart(4, '0')}`;
const customer = s.customer || 'Walk-in Customer';
const amount = s.total || 0;
pageTotal += amount;
const timeStr = s.createdAt ? new Date(s.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—';
const reference = s.reference || s.txCode || '—';
const tr = document.createElement('tr');
tr.innerHTML = `
<td style="padding:12px 14px;vertical-align:middle;"><input type="checkbox" class="sales-row-checkbox" data-id="${s.id}"></td>
<td style="padding:12px 14px;font-size:13px;border-bottom:1px solid var(--border);color:var(--text-secondary);">${DateHelper.formatDateShort(s.date)}</td>
<td style="padding:12px 14px;font-size:13px;border-bottom:1px solid var(--border);color:var(--text-secondary);">${timeStr}</td>
<td style="padding:12px 14px;font-size:13px;border-bottom:1px solid var(--border);color:var(--text-secondary);"><span style="font-weight:600;color:var(--brand);font-size:12px;">${receiptNo}</span></td>
<td style="padding:12px 14px;font-size:13px;border-bottom:1px solid var(--border);color:var(--text-secondary);"><span style="font-weight:500;color:var(--text);">${customer}</span></td>
<td style="padding:12px 14px;font-size:12px;color:var(--text-muted);border-bottom:1px solid var(--border);">${reference}</td>
<td style="padding:12px 14px;font-size:13px;border-bottom:1px solid var(--border);color:var(--text-secondary);text-align:right;font-weight:600;font-variant-numeric:tabular-nums;">${DateHelper.formatKSh(amount)}</td>
<td style="padding:12px 14px;font-size:13px;border-bottom:1px solid var(--border);color:var(--text-secondary);"><div style="display:flex;align-items:center;gap:6px;"><span style="width:18px;height:18px;border-radius:50%;background:var(--success);display:inline-flex;align-items:center;justify-content:center;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="width:10px;height:10px;color:#fff;"><polyline points="20 6 9 17 4 12"/></svg></span><span style="font-size:12px;font-weight:500;color:var(--text);">Paid</span></div></td>
<td style="padding:12px 14px;font-size:13px;border-bottom:1px solid var(--border);color:var(--text-secondary);text-align:right;"><div style="display:flex;align-items:center;gap:4px;font-size:12px;justify-content:flex-end;"><span class="action-link" onclick="viewSaleReceipt('${s.id}')" style="color:var(--brand);font-weight:500;cursor:pointer;padding:2px 4px;border-radius:4px;">View</span><span class="action-link print" onclick="printSaleReceipt('${s.id}')" style="color:var(--text-secondary);font-weight:500;cursor:pointer;padding:2px 4px;border-radius:4px;">Print</span><span class="action-dropdown" onclick="showSaleActions('${s.id}')" style="color:var(--text-muted);cursor:pointer;padding:2px 4px;">▾</span></div></td>
`;
tbody.appendChild(tr);
});
document.getElementById('salesGrandTotal').textContent = DateHelper.formatKSh(grandTotal);
document.getElementById('salesFooterTotal').textContent = DateHelper.formatKSh(pageTotal);
document.getElementById('salesPageInfo').textContent = `${startIdx + 1}-${endIdx} of ${filteredSales.length}`;
document.getElementById('salesPageFirst').disabled = salesCurrentPage === 1;
document.getElementById('salesPagePrev').disabled = salesCurrentPage === 1;
document.getElementById('salesPageNext').disabled = salesCurrentPage === totalPages;
document.getElementById('salesPageLast').disabled = salesCurrentPage === totalPages;
}

function applySalesFilters() { salesCurrentPage = 1; renderSalesTransactions(); }
function goToSalesPage(action) {
const totalPages = Math.max(1, Math.ceil(filteredSales.length / SALES_PER_PAGE));
if (action === 'first') salesCurrentPage = 1;
else if (action === 'prev') salesCurrentPage = Math.max(1, salesCurrentPage - 1);
else if (action === 'next') salesCurrentPage = Math.min(totalPages, salesCurrentPage + 1);
else if (action === 'last') salesCurrentPage = totalPages;
renderSalesTransactions();
}

function toggleSelectAllSales() {
const checked = document.getElementById('selectAllSales').checked;
document.querySelectorAll('.sales-row-checkbox').forEach(cb => cb.checked = checked);
}

function handleBatchActions() {
const selected = Array.from(document.querySelectorAll('.sales-row-checkbox:checked')).map(cb => cb.dataset.id);
if (selected.length === 0) { showToast('No sales selected', 'info'); return; }
if (confirm(`Delete ${selected.length} selected sale(s)?`)) {
selected.forEach(id => {
const s = DB.sales.find(x => x.id === id);
if (s) {
if (s.lines && Array.isArray(s.lines)) { s.lines.forEach(line => { const med = DB.inventory.find(m => m.id === line.productId); if (med) { med.qty += line.qty; StorageService.put('inventory', med); } }); }
StorageService.delete('sales', id);
}
});
showToast(`${selected.length} sale(s) deleted. Stock restored.`, 'success');
renderSalesTransactions(); updateNavBadges();
}
}

function showSaleActions(id) {
const s = DB.sales.find(x => x.id === id);
if (!s) return;
const receiptNo = `SR-${String(s.receiptNumber || '0').padStart(4, '0')}`;
if (confirm(`Delete receipt ${receiptNo}?`)) {
if (s.lines && Array.isArray(s.lines)) { s.lines.forEach(line => { const med = DB.inventory.find(m => m.id === line.productId); if (med) { med.qty += line.qty; StorageService.put('inventory', med); } }); }
StorageService.delete('sales', id);
showToast('Receipt deleted. Stock restored.', 'info');
renderSalesTransactions(); updateNavBadges();
}
}

/* ============================================================
TOP SELLING DRUGS MODAL
============================================================ */
function showTopSellingModal() {
const dateFilter = document.getElementById('salesDateFilter')?.value || 'all';
let dateFrom = document.getElementById('salesDateFrom').value;
let dateTo = document.getElementById('salesDateTo').value;
let sales = [...DB.sales];
if (dateFilter !== 'all' || (dateFrom && dateTo)) {
let range;
if (dateFilter !== 'all') range = DateHelper.getRange(dateFilter);
else if (dateFrom && dateTo) range = { from: dateFrom, to: dateTo };
else range = { from: '2000-01-01', to: '2099-12-31' };
sales = sales.filter(s => s.date >= range.from && s.date <= range.to);
}
const drugSales = {};
sales.forEach(s => {
(s.lines || []).forEach(line => {
if (!drugSales[line.productName]) drugSales[line.productName] = { name: line.productName, qty: 0, revenue: 0 };
drugSales[line.productName].qty += line.qty;
drugSales[line.productName].revenue += line.amount;
});
});
const sorted = Object.values(drugSales).sort((a,b) => b.revenue - a.revenue).slice(0, 10);
let html = '<h3 style="margin-bottom:16px;">Top Selling Drugs</h3><table class="data-table"><thead><tr><th>#</th><th>Drug Name</th><th>Quantity Sold</th><th>Revenue</th></tr></thead><tbody>';
if (sorted.length === 0) html += '<tr><td colspan="4" style="text-align:center;padding:20px;">No sales data available.</td></tr>';
else sorted.forEach((d, i) => {
html += `<tr><td>${i + 1}</td><td><strong>${d.name}</strong></td><td>${d.qty}</td><td>${DateHelper.formatKSh(d.revenue)}</td></tr>`;
});
html += '</tbody></table>';
showModal('Top Selling Drugs', html);
}

/* ============================================================
EXPENSES MODAL
============================================================ */
function showExpensesModal() {
const dateFilter = document.getElementById('salesDateFilter')?.value || 'all';
let dateFrom = document.getElementById('salesDateFrom').value;
let dateTo = document.getElementById('salesDateTo').value;
let expenses = [...DB.expenses];
if (dateFilter !== 'all' || (dateFrom && dateTo)) {
let range;
if (dateFilter !== 'all') range = DateHelper.getRange(dateFilter);
else if (dateFrom && dateTo) range = { from: dateFrom, to: dateTo };
else range = { from: '2000-01-01', to: '2099-12-31' };
expenses = expenses.filter(e => e.date >= range.from && e.date <= range.to);
}
const total = expenses.reduce((s,e) => s + (e.amount || 0), 0);
let html = `<h3 style="margin-bottom:16px;">Expenses Overview</h3>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
<div style="background:var(--surface-alt);padding:16px;border-radius:var(--radius);"><div style="font-size:12px;color:var(--text-muted);">Total Expenses</div><div style="font-size:24px;font-weight:700;color:var(--danger);">${DateHelper.formatKSh(total)}</div></div>
<div style="background:var(--surface-alt);padding:16px;border-radius:var(--radius);"><div style="font-size:12px;color:var(--text-muted);">Transaction Count</div><div style="font-size:24px;font-weight:700;">${expenses.length}</div></div>
</div>
<table class="data-table"><thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th>Payment</th></tr></thead><tbody>`;
if (expenses.length === 0) html += '<tr><td colspan="5" style="text-align:center;padding:20px;">No expenses available.</td></tr>';
else expenses.forEach(e => {
html += `<tr><td>${DateHelper.formatDateShort(e.date)}</td><td><span class="badge badge-neutral">${e.category}</span></td><td>${e.description}</td><td style="font-weight:600;color:var(--danger);">${DateHelper.formatKSh(e.amount)}</td><td>${e.payment}</td></tr>`;
});
html += '</tbody></table>';
showModal('Expenses', html);
}

/* ============================================================
PROFIT/LOSS MODAL
============================================================ */
function showProfitLossModal() {
const dateFilter = document.getElementById('salesDateFilter')?.value || 'all';
let dateFrom = document.getElementById('salesDateFrom').value;
let dateTo = document.getElementById('salesDateTo').value;
let sales = [...DB.sales];
let expenses = [...DB.expenses];
if (dateFilter !== 'all' || (dateFrom && dateTo)) {
let range;
if (dateFilter !== 'all') range = DateHelper.getRange(dateFilter);
else if (dateFrom && dateTo) range = { from: dateFrom, to: dateTo };
else range = { from: '2000-01-01', to: '2099-12-31' };
sales = sales.filter(s => s.date >= range.from && s.date <= range.to);
expenses = expenses.filter(e => e.date >= range.from && e.date <= range.to);
}
const totalRevenue = sales.reduce((s,x) => s + (x.total || 0), 0);
const totalCost = sales.reduce((s,x) => s + ((x.lines || []).reduce((a,l) => a + l.costPrice * l.qty, 0)), 0);
const totalExpenses = expenses.reduce((s,e) => s + (e.amount || 0), 0);
const grossProfit = totalRevenue - totalCost;
const netProfit = grossProfit - totalExpenses;
const margin = totalRevenue > 0 ? (netProfit / totalRevenue * 100) : 0;
let html = `<h3 style="margin-bottom:16px;">Profit/Loss Analysis</h3>
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:16px;">
<div style="background:var(--surface-alt);padding:16px;border-radius:var(--radius);"><div style="font-size:12px;color:var(--text-muted);">Revenue</div><div style="font-size:24px;font-weight:700;color:var(--brand);">${DateHelper.formatKSh(totalRevenue)}</div></div>
<div style="background:var(--surface-alt);padding:16px;border-radius:var(--radius);"><div style="font-size:12px;color:var(--text-muted);">Total Cost (COGS + Expenses)</div><div style="font-size:24px;font-weight:700;color:var(--danger);">${DateHelper.formatKSh(totalCost + totalExpenses)}</div></div>
<div style="background:var(--surface-alt);padding:16px;border-radius:var(--radius);"><div style="font-size:12px;color:var(--text-muted);">Net Profit</div><div style="font-size:24px;font-weight:700;color:${netProfit >= 0 ? 'var(--success)' : 'var(--danger)'};">${DateHelper.formatKSh(netProfit)}</div></div>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
<div style="background:var(--surface-alt);padding:16px;border-radius:var(--radius);"><div style="font-size:12px;color:var(--text-muted);">Gross Profit</div><div style="font-size:20px;font-weight:600;color:${grossProfit >= 0 ? 'var(--success)' : 'var(--danger)'};">${DateHelper.formatKSh(grossProfit)}</div></div>
<div style="background:var(--surface-alt);padding:16px;border-radius:var(--radius);"><div style="font-size:12px;color:var(--text-muted);">Profit Margin</div><div style="font-size:20px;font-weight:600;color:${margin >= 0 ? 'var(--success)' : 'var(--danger)'};">${margin.toFixed(1)}%</div></div>
</div>
<div style="margin-top:16px;"><button class="btn btn-secondary" onclick="closeModal()">Close</button></div>
`;
showModal('Profit/Loss Analysis', html);
}

/* ============================================================
ADD MEDICINE MODAL
============================================================ */
function showAddMedicineModal() {
const body = document.getElementById('modalBody');
body.innerHTML = `
<div class="form-grid">
<div class="form-group"><label>Date of Entry</label><input type="date" id="addDate" value="${DateHelper.today()}"></div>
<div class="form-group"><label>Drug Name *</label><input type="text" id="addDrugName" placeholder="e.g. Amoxicillin 500mg"></div>
<div class="form-group"><label>Brand Name</label><input type="text" id="addBrand" placeholder="e.g. Amoxil"></div>
<div class="form-group"><label>Company Name</label><input type="text" id="addCompany" placeholder="Manufacturer name"></div>
<div class="form-group"><label>Batch Number *</label><input type="text" id="addBatch" placeholder="e.g. BTH-2024-001"></div>
<div class="form-group"><label>Category</label><select id="addCategory"><option value="Antibiotic">Antibiotic</option><option value="Antifungal">Antifungal</option><option value="Antiviral">Antiviral</option><option value="Analgesic">Analgesic</option><option value="Antihypertensive">Antihypertensive</option><option value="Antidiabetic">Antidiabetic</option><option value="Supplement">Supplement</option><option value="Other">Other</option></select></div>
<div class="form-group"><label>Formulation</label><select id="addFormulation"><option value="Tablet">Tablet</option><option value="Capsule">Capsule</option><option value="Suspension">Suspension</option><option value="Syrup">Syrup</option><option value="Injection">Injection</option><option value="Cream">Cream</option><option value="Ointment">Ointment</option><option value="Powder">Powder</option><option value="Suppository">Suppository</option><option value="Drops">Drops</option><option value="Inhaler">Inhaler</option><option value="Other">Other</option></select></div>
<div class="form-group"><label>Type</label><select id="addType"><option value="Original">Original</option><option value="Generic">Generic</option></select></div>
<div class="form-group"><label>Buying Price (Total)</label><input type="number" id="addBuyingPrice" min="0" step="0.01" placeholder="1500.00"></div>
<div class="form-group"><label>Buying Price Per Unit</label><div class="calc-display" id="addUnitCost">KES 0.00</div></div>
<div class="form-group"><label>Selling Price Per Unit</label><input type="number" id="addSellingPrice" min="0" step="0.01" placeholder="20.00"></div>
<div class="form-group"><label>Expiry Date *</label><input type="date" id="addExpiry"></div>
<div class="form-group"><label>Quantity</label><input type="number" id="addQuantity" min="1" placeholder="10"></div>
</div>
<div style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end;"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveAddMedicine()">Add Medicine</button></div>
`;
document.getElementById('modalTitle').textContent = 'Add New Medicine';
document.getElementById('modalOverlay').classList.remove('hidden');
document.getElementById('addBuyingPrice').addEventListener('input', calculateAddUnitCost);
document.getElementById('addQuantity').addEventListener('input', calculateAddUnitCost);
document.getElementById('addFormulation').addEventListener('change', calculateAddUnitCost);
}

function calculateAddUnitCost() {
const buyingPrice = parseFloat(document.getElementById('addBuyingPrice').value) || 0;
const quantity = parseInt(document.getElementById('addQuantity').value) || 1;
const formulation = document.getElementById('addFormulation').value;
let unitCost = 0;
if (formulation === 'Tablet' || formulation === 'Capsule' || formulation === 'Powder') {
unitCost = buyingPrice / quantity;
} else {
unitCost = buyingPrice / quantity;
}
document.getElementById('addUnitCost').textContent = 'KES ' + unitCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function saveAddMedicine() {
const date = document.getElementById('addDate').value;
const name = document.getElementById('addDrugName').value.trim();
const brand = document.getElementById('addBrand').value.trim();
const company = document.getElementById('addCompany').value.trim();
const batch = document.getElementById('addBatch').value.trim();
const category = document.getElementById('addCategory').value;
const formulation = document.getElementById('addFormulation').value;
const type = document.getElementById('addType').value;
const buyingPrice = parseFloat(document.getElementById('addBuyingPrice').value) || 0;
const sellingPrice = parseFloat(document.getElementById('addSellingPrice').value) || 0;
const expiry = document.getElementById('addExpiry').value;
const quantity = parseInt(document.getElementById('addQuantity').value) || 0;
if (!name || !batch || !expiry || !quantity) { showToast('Please fill all required fields.', 'error'); return; }
const unitCost = formulation === 'Tablet' || formulation === 'Capsule' || formulation === 'Powder' ? buyingPrice / quantity : buyingPrice / quantity;
const med = { id: genId('med_'), name, brand, company, batch, category, formulation, type, buyingPrice, costPrice: unitCost, price: sellingPrice, expiry, qty: quantity, addedDate: date, createdAt: new Date().toISOString() };
StorageService.put('inventory', med);
logActivity('inventory', `Medicine added: ${name} (${batch})`);
showToast(`Medicine "${name}" added successfully.`, 'success');
closeModal();
navigate('stock');
}

/* ============================================================
INVENTORY CRUD - With Stock Out detection
============================================================ */
function renderTable() {
const tbody = document.getElementById('tableBody');
const empty = document.getElementById('emptyState');
const footer = document.getElementById('inventoryTableFooter');
const search = document.getElementById('searchInput').value.toLowerCase();
let data = DB.inventory;
if (search) data = data.filter(m => m.name.toLowerCase().includes(search) || (m.brand||'').toLowerCase().includes(search) || m.batch.toLowerCase().includes(search) || m.category.toLowerCase().includes(search));
tbody.innerHTML = '';
if (data.length === 0) { empty.style.display = 'block'; footer.style.display = 'none'; return; }
empty.style.display = 'none';
let totalValue = 0;
data.forEach(med => {
totalValue += med.buyingPrice || 0;
const qtyDisplay = med.formulation === 'Tablet' || med.formulation === 'Capsule' ? `${med.qty} units` : `${med.qty}`;
const tr = document.createElement('tr');
tr.innerHTML = `<td><div class="drug-name">${med.name}</div></td><td>${med.brand || '—'}</td><td>${med.batch}</td><td><span class="badge badge-neutral">${med.category}</span></td><td>${med.formulation || '—'}</td><td>${qtyDisplay}</td><td>${DateHelper.formatKES(med.buyingPrice||0)}</td><td>${DateHelper.formatKES(med.price)}</td><td>${med.price - med.costPrice > 0 ? '+' : ''}${DateHelper.formatKES(med.price - med.costPrice)}</td><td>${med.expiry}</td><td>${getStatusBadge(med)}</td><td><div class="actions-cell"><button class="btn btn-edit btn-sm" onclick="editMedicine('${med.id}')">Edit</button><button class="btn btn-delete btn-sm" onclick="deleteMedicine('${med.id}')">Delete</button></div></td>`;
tbody.appendChild(tr);
});
footer.style.display = 'flex';
document.getElementById('invFilteredCount').textContent = `${data.length} item${data.length !== 1 ? 's' : ''}`;
document.getElementById('invFilteredValue').textContent = DateHelper.formatKES(totalValue) + ' total value';
}

function getStatusBadge(medicine) {
const diff = DateHelper.daysBetween(DateHelper.today(), medicine.expiry);
if (diff < 0) return '<span class="badge badge-danger">Expired</span>';
if (diff <= 30) return '<span class="badge badge-warning">Expiring Soon</span>';
if (ThresholdService.isLowStock(medicine)) return '<span class="badge badge-danger">Low Stock</span>';
return '<span class="badge badge-success">In Stock</span>';
}

function editMedicine(id) {
const med = DB.inventory.find(m => m.id === id);
if (!med) return;
const body = document.getElementById('modalBody');
body.innerHTML = `
<div class="form-grid">
<div class="form-group"><label>Drug Name</label><input type="text" id="editDrugName" value="${med.name}"></div>
<div class="form-group"><label>Brand Name</label><input type="text" id="editBrand" value="${med.brand || ''}"></div>
<div class="form-group"><label>Batch Number</label><input type="text" id="editBatch" value="${med.batch}"></div>
<div class="form-group"><label>Category</label><select id="editCategory"><option value="Antibiotic" ${med.category === 'Antibiotic' ? 'selected' : ''}>Antibiotic</option><option value="Antifungal" ${med.category === 'Antifungal' ? 'selected' : ''}>Antifungal</option><option value="Antiviral" ${med.category === 'Antiviral' ? 'selected' : ''}>Antiviral</option><option value="Analgesic" ${med.category === 'Analgesic' ? 'selected' : ''}>Analgesic</option><option value="Antihypertensive" ${med.category === 'Antihypertensive' ? 'selected' : ''}>Antihypertensive</option><option value="Antidiabetic" ${med.category === 'Antidiabetic' ? 'selected' : ''}>Antidiabetic</option><option value="Supplement" ${med.category === 'Supplement' ? 'selected' : ''}>Supplement</option><option value="Other" ${med.category === 'Other' ? 'selected' : ''}>Other</option></select></div>
<div class="form-group"><label>Formulation</label><select id="editFormulation"><option value="Tablet" ${med.formulation === 'Tablet' ? 'selected' : ''}>Tablet</option><option value="Capsule" ${med.formulation === 'Capsule' ? 'selected' : ''}>Capsule</option><option value="Suspension" ${med.formulation === 'Suspension' ? 'selected' : ''}>Suspension</option><option value="Syrup" ${med.formulation === 'Syrup' ? 'selected' : ''}>Syrup</option><option value="Injection" ${med.formulation === 'Injection' ? 'selected' : ''}>Injection</option><option value="Cream" ${med.formulation === 'Cream' ? 'selected' : ''}>Cream</option><option value="Ointment" ${med.formulation === 'Ointment' ? 'selected' : ''}>Ointment</option><option value="Powder" ${med.formulation === 'Powder' ? 'selected' : ''}>Powder</option><option value="Suppository" ${med.formulation === 'Suppository' ? 'selected' : ''}>Suppository</option><option value="Drops" ${med.formulation === 'Drops' ? 'selected' : ''}>Drops</option><option value="Inhaler" ${med.formulation === 'Inhaler' ? 'selected' : ''}>Inhaler</option><option value="Other" ${med.formulation === 'Other' ? 'selected' : ''}>Other</option></select></div>
<div class="form-group"><label>Quantity</label><input type="number" id="editQuantity" value="${med.qty}"></div>
<div class="form-group"><label>Buying Price (Total)</label><input type="number" id="editBuyingPrice" value="${med.buyingPrice || 0}" step="0.01"></div>
<div class="form-group"><label>Selling Price Per Unit</label><input type="number" id="editSellingPrice" value="${med.price}" step="0.01"></div>
<div class="form-group"><label>Expiry Date</label><input type="date" id="editExpiry" value="${med.expiry}"></div>
</div>
<div style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end;"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveEditMedicine('${med.id}')">Update</button></div>
`;
document.getElementById('modalTitle').textContent = 'Edit Medicine';
document.getElementById('modalOverlay').classList.remove('hidden');
}

function saveEditMedicine(id) {
const med = DB.inventory.find(m => m.id === id);
if (!med) return;
med.name = document.getElementById('editDrugName').value.trim();
med.brand = document.getElementById('editBrand').value.trim();
med.batch = document.getElementById('editBatch').value.trim();
med.category = document.getElementById('editCategory').value;
med.formulation = document.getElementById('editFormulation').value;
med.qty = parseInt(document.getElementById('editQuantity').value) || 0;
med.buyingPrice = parseFloat(document.getElementById('editBuyingPrice').value) || 0;
med.price = parseFloat(document.getElementById('editSellingPrice').value) || 0;
med.expiry = document.getElementById('editExpiry').value;
if (!med.name || !med.batch || !med.expiry) { showToast('Please fill all required fields.', 'error'); return; }
StorageService.put('inventory', med);
logActivity('inventory', `Medicine updated: ${med.name}`);
showToast('Medicine updated successfully.', 'success');
closeModal();
renderTable();
updateNavBadges();
}

function deleteMedicine(id) {
const med = DB.inventory.find(m => m.id === id);
if (!med) return;
if (!confirm(`Delete "${med.name}"?`)) return;
StorageService.delete('inventory', id);
logActivity('inventory', `Medicine deleted: ${med.name}`);
showToast(`"${med.name}" deleted.`, 'info');
renderTable();
}

/* ============================================================
STOCK
============================================================ */
function renderStock() {
const container = document.getElementById('stockContent');
let items = [...DB.inventory];
items.sort((a, b) => a.name.localeCompare(b.name));
if (items.length === 0) { container.innerHTML = '<div class="empty-state"><h4>No stock items</h4></div>'; return; }
let html = `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;">`;
items.forEach(m => {
const threshold = ThresholdService.getThresholdInUnits(m);
const status = m.qty < threshold ? 'critical' : m.qty < threshold * 1.5 ? 'low' : 'ok';
const statusColor = status === 'critical' ? 'var(--danger)' : status === 'low' ? 'var(--warning)' : 'var(--success)';
const lastStockIn = DB.stockIn.filter(s => s.medicineId === m.id).sort((a,b) => b.createdAt.localeCompare(a.createdAt))[0];
const arrivalTime = lastStockIn ? new Date(lastStockIn.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
html += `<div onclick="showStockDetails('${m.id}')" style="cursor:pointer;background:var(--surface-alt);border:1px solid var(--border);border-radius:var(--radius-lg);padding:16px;transition:all 0.2s;hover:transform:translateY(-2px);box-shadow:var(--shadow-md);">
<div style="display:flex;justify-content:space-between;align-items:center;"><strong style="font-size:15px;">${m.name}</strong><span class="badge ${status === 'critical' ? 'badge-danger' : status === 'low' ? 'badge-warning' : 'badge-success'}">${status === 'critical' ? 'Critical' : status === 'low' ? 'Low' : 'OK'}</span></div>
<div style="font-size:12px;color:var(--text-muted);">${m.brand || ''} | Batch: ${m.batch} | Category: ${m.category} | Formulation: ${m.formulation || '—'}</div>
<div style="margin-top:10px;display:flex;justify-content:space-between;font-size:13px;"><span>In Stock: <strong>${m.qty}</strong></span><span>Threshold: ${threshold}</span></div>
<div style="margin-top:6px;height:6px;background:var(--border);border-radius:3px;overflow:hidden;"><div style="height:100%;width:${Math.min(100, (m.qty / threshold) * 100)}%;background:${statusColor};border-radius:3px;"></div></div>
<div style="margin-top:8px;font-size:12px;color:var(--text-muted);display:flex;justify-content:space-between;"><span>Buying: ${DateHelper.formatKES(m.buyingPrice)} | Selling: ${DateHelper.formatKES(m.price)}</span><span>Profit: ${DateHelper.formatKES(m.price - m.costPrice)}/unit</span></div>
<div style="margin-top:4px;font-size:12px;color:var(--text-muted);display:flex;justify-content:space-between;"><span>Expiry: ${DateHelper.formatDateDisplay(m.expiry)} (${DateHelper.daysBetween(DateHelper.today(), m.expiry)} days left)</span><span style="color:var(--brand);">📦 Arrived: ${arrivalTime}</span></div>
<div style="margin-top:8px;font-size:11px;color:var(--text-faint);text-align:center;">Click for full details</div>
</div>`;
});
html += '</div>';
container.innerHTML = html;
}

function showStockDetails(id) {
const med = DB.inventory.find(m => m.id === id);
if (!med) return;
const body = document.getElementById('modalBody');
const stockIns = DB.stockIn.filter(s => s.medicineId === med.id).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
let html = `<h3 style="margin-bottom:16px;">${med.name} - Complete Stock Details</h3>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
<div style="background:var(--surface-alt);padding:12px;border-radius:var(--radius);"><strong>Brand:</strong> ${med.brand || '—'}</div>
<div style="background:var(--surface-alt);padding:12px;border-radius:var(--radius);"><strong>Batch:</strong> ${med.batch}</div>
<div style="background:var(--surface-alt);padding:12px;border-radius:var(--radius);"><strong>Category:</strong> ${med.category}</div>
<div style="background:var(--surface-alt);padding:12px;border-radius:var(--radius);"><strong>Formulation:</strong> ${med.formulation || '—'}</div>
<div style="background:var(--surface-alt);padding:12px;border-radius:var(--radius);"><strong>Current Quantity:</strong> ${med.qty}</div>
<div style="background:var(--surface-alt);padding:12px;border-radius:var(--radius);"><strong>Expiry:</strong> ${DateHelper.formatDateDisplay(med.expiry)} (${DateHelper.daysBetween(DateHelper.today(), med.expiry)} days left)</div>
<div style="background:var(--surface-alt);padding:12px;border-radius:var(--radius);"><strong>Buying Price (Total):</strong> ${DateHelper.formatKES(med.buyingPrice || 0)}</div>
<div style="background:var(--surface-alt);padding:12px;border-radius:var(--radius);"><strong>Selling Price/Unit:</strong> ${DateHelper.formatKES(med.price)}</div>
<div style="background:var(--surface-alt);padding:12px;border-radius:var(--radius);"><strong>Profit/Unit:</strong> ${DateHelper.formatKES(med.price - med.costPrice)}</div>
<div style="background:var(--surface-alt);padding:12px;border-radius:var(--radius);"><strong>Threshold:</strong> ${ThresholdService.getThresholdInUnits(med)}</div>
<div style="background:var(--surface-alt);padding:12px;border-radius:var(--radius);"><strong>Status:</strong> ${ThresholdService.isLowStock(med) ? '⚠️ Low Stock' : '✅ OK'}</div>
<div style="background:var(--surface-alt);padding:12px;border-radius:var(--radius);"><strong>Added Date:</strong> ${DateHelper.formatDateDisplay(med.addedDate)}</div>
</div>
<h4 style="margin:16px 0 8px;">Stock In History</h4>
<table class="data-table"><thead><tr><th>Date</th><th>Time</th><th>Quantity</th><th>Unit Cost</th><th>Total Cost</th><th>Supplier</th><th>Invoice</th></tr></thead><tbody>`;
if (stockIns.length === 0) html += '<tr><td colspan="7" style="text-align:center;padding:20px;">No stock in records found.</td></tr>';
else stockIns.forEach(s => {
const timeStr = new Date(s.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
html += `<tr><td>${DateHelper.formatDateShort(s.date)}</td><td>${timeStr}</td><td style="color:var(--success);font-weight:600;">+${s.qty}</td><td>${DateHelper.formatKES(s.unitCost || 0)}</td><td>${DateHelper.formatKES((s.qty * (s.unitCost || 0)))}</td><td>${s.supplier || '—'}</td><td>${s.invoiceNo || '—'}</td></tr>`;
});
html += '</tbody></table>';
showModal(`${med.name} - Stock Details`, html);
}

/* ============================================================
THRESHOLDS - Enhanced with Units label and accurate Low Stock tracking
============================================================ */
function renderThresholds() {
const container = document.getElementById('thresholdContent');
const thresholds = ThresholdService.get();
let html = `<div style="margin-bottom:16px;"><p style="color:var(--text-secondary);font-size:13px;">Set minimum stock levels per formulation category. <strong>Units:</strong> For Tablets/Capsules, this is the count of individual pills. For Syrups/Suspensions, this is the number of bottles.</p></div>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">`;
Object.keys(thresholds).forEach(cat => {
html += `<div style="display:flex;align-items:center;gap:8px;padding:12px 16px;background:var(--bg);border-radius:var(--radius);border:1px solid var(--border);">
<label style="font-size:13px;font-weight:500;color:var(--text-secondary);flex:1;">${cat}</label>
<input type="number" id="thresh_${cat}" value="${thresholds[cat]}" min="1" style="width:70px;padding:6px 8px;border:1px solid var(--border);border-radius:6px;font-size:13px;text-align:center;">
<span style="font-size:12px;color:var(--text-muted);font-weight:500;">units</span>
</div>`;
});
html += `</div><div style="margin-top:16px;"><button class="btn btn-primary" onclick="saveThresholds()">Save Thresholds</button></div>`;
container.innerHTML = html;
}

function saveThresholds() {
const thresholds = ThresholdService.get();
Object.keys(thresholds).forEach(cat => {
const el = document.getElementById(`thresh_${cat}`);
if (el) thresholds[cat] = parseInt(el.value) || 5;
});
ThresholdService.save(thresholds);
logActivity('threshold', 'Alert thresholds updated');
showToast('Thresholds saved successfully. All panels will reflect these values.', 'success');
renderThresholds();
renderStock();
renderLowStock();
updateNavBadges();
}

/* ============================================================
BATCHES
============================================================ */
function renderBatches() {
const container = document.getElementById('batchesContent');
const items = DB.inventory;
if (items.length === 0) { container.innerHTML = '<div class="empty-state"><h4>No batches found</h4></div>'; return; }
let html = `<table class="data-table"><thead><tr><th>Batch</th><th>Drug</th><th>Brand</th><th>Category</th><th>Formulation</th><th>Qty</th><th>Expiry</th><th>Status</th></tr></thead><tbody>`;
items.forEach(m => {
const diff = DateHelper.daysBetween(DateHelper.today(), m.expiry);
const status = diff < 0 ? 'Expired' : diff <= 30 ? 'Expiring' : 'Active';
const badge = diff < 0 ? 'badge-danger' : diff <= 30 ? 'badge-warning' : 'badge-success';
html += `<tr><td><strong>${m.batch}</strong></td><td>${m.name}</td><td>${m.brand || '—'}</td><td>${m.category}</td><td>${m.formulation || '—'}</td><td>${m.qty}</td><td>${DateHelper.formatDateDisplay(m.expiry)}</td><td><span class="badge ${badge}">${status}</span></td></tr>`;
});
html += '</tbody></table>';
container.innerHTML = html;
}

/* ============================================================
STOCK IN - Enhanced with time filters
============================================================ */
function renderStockIn() {
const container = document.getElementById('stockinContent');
let items = [...DB.stockIn];
const timeFilter = document.getElementById('stockinTimeFilter')?.value || 'all';
const dateFrom = document.getElementById('stockinDateFrom')?.value;
const dateTo = document.getElementById('stockinDateTo')?.value;
let range = DateHelper.getRange(timeFilter, dateFrom, dateTo);
items = items.filter(item => item.date >= range.from && item.date <= range.to);
const searchTerm = document.getElementById('stockinSearch')?.value?.toLowerCase() || '';
if (searchTerm) {
items = items.filter(item => 
item.medicineName.toLowerCase().includes(searchTerm) || 
item.supplier?.toLowerCase().includes(searchTerm) || 
item.invoiceNo?.toLowerCase().includes(searchTerm)
);
}
if (items.length === 0) { container.innerHTML = '<div class="empty-state"><h4>No stock in records</h4><button class="btn btn-primary" onclick="showStockInModal()">+ Record Stock In</button></div>'; return; }
let totalQty = 0;
let totalValue = 0;
let html = `<div style="margin-bottom:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
<button class="btn btn-primary" onclick="showStockInModal()">+ Record Stock In</button>
<button class="btn btn-secondary btn-sm" onclick="showStockInSearch()">🔍 Search</button>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px;">
<div style="background:var(--surface-alt);padding:12px 16px;border-radius:var(--radius);text-align:center;"><div style="font-size:12px;color:var(--text-muted);">Total Stock In Records</div><div style="font-size:24px;font-weight:700;">${items.length}</div></div>
<div style="background:var(--surface-alt);padding:12px 16px;border-radius:var(--radius);text-align:center;"><div style="font-size:12px;color:var(--text-muted);">Total Quantity Added</div><div style="font-size:24px;font-weight:700;color:var(--success);">${items.reduce((s,i) => s + i.qty, 0)}</div></div>
<div style="background:var(--surface-alt);padding:12px 16px;border-radius:var(--radius);text-align:center;"><div style="font-size:12px;color:var(--text-muted);">Total Value</div><div style="font-size:24px;font-weight:700;color:var(--brand);">${DateHelper.formatKES(items.reduce((s,i) => s + (i.qty * (i.unitCost || 0)), 0))}</div></div>
</div>
<table class="data-table"><thead><tr><th>Date</th><th>Time</th><th>Medicine</th><th>Category</th><th>Batch</th><th>Qty Added</th><th>Unit Cost</th><th>Total Cost</th><th>Supplier</th><th>Invoice No</th><th>Received By</th><th style="text-align:right;">Actions</th></tr></thead><tbody>`;
items.forEach(item => {
const timeStr = item.createdAt ? new Date(item.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—';
const totalCost = item.qty * (item.unitCost || 0);
html += `<tr><td>${DateHelper.formatDateShort(item.date)}</td><td>${timeStr}</td><td><strong>${item.medicineName}</strong></td><td>${item.category || '—'}</td><td>${item.batch || '—'}</td><td style="color:var(--success);font-weight:600;">+${item.qty}</td><td>${DateHelper.formatKES(item.unitCost || 0)}</td><td>${DateHelper.formatKES(totalCost)}</td><td>${item.supplier || '—'}</td><td>${item.invoiceNo || '—'}</td><td>${item.receivedBy || '—'}</td><td style="text-align:right;"><button class="btn btn-edit btn-sm" onclick="editStockIn('${item.id}')">Edit</button><button class="btn btn-delete btn-sm" onclick="deleteStockIn('${item.id}')">Delete</button></td></tr>`;
});
html += '</tbody></table>';
container.innerHTML = html;
}

function showStockInSearch() {
const searchInput = document.getElementById('stockinSearch');
searchInput.style.display = searchInput.style.display === 'none' ? 'inline-block' : 'none';
if (searchInput.style.display === 'inline-block') searchInput.focus();
}

function showStockInModal(data) {
const body = document.getElementById('modalBody');
const meds = DB.inventory.map(m => `<option value="${m.id}">${m.name} (${m.qty} in stock)</option>`).join('');
const d = data || {};
body.innerHTML = `
<input type="hidden" id="stockinId" value="${d.id || ''}">
<div class="form-grid">
<div class="form-group"><label>Date</label><input type="date" id="stockinDate" value="${d.date || DateHelper.today()}"></div>
<div class="form-group"><label>Medicine</label><select id="stockinMed">${meds}</select></div>
<div class="form-group"><label>Quantity Added</label><input type="number" id="stockinQty" min="1" value="${d.qty || ''}" placeholder="10"></div>
<div class="form-group"><label>Unit Cost (KES)</label><input type="number" id="stockinUnitCost" min="0" step="0.01" value="${d.unitCost || ''}" placeholder="150.00"></div>
<div class="form-group"><label>Supplier</label><input type="text" id="stockinSupplier" value="${d.supplier || ''}" placeholder="Supplier name"></div>
<div class="form-group"><label>Invoice No.</label><input type="text" id="stockinInvoice" value="${d.invoiceNo || ''}" placeholder="Invoice number"></div>
<div class="form-group"><label>Received By</label><input type="text" id="stockinReceivedBy" value="${d.receivedBy || ''}" placeholder="Your name"></div>
</div>
<div style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end;"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveStockIn()">Save</button></div>
`;
document.getElementById('modalTitle').textContent = data ? 'Edit Stock In' : 'Record Stock In';
document.getElementById('modalOverlay').classList.remove('hidden');
}

function saveStockIn() {
const id = document.getElementById('stockinId').value;
const medId = document.getElementById('stockinMed').value;
const qty = parseInt(document.getElementById('stockinQty').value);
const unitCost = parseFloat(document.getElementById('stockinUnitCost').value) || 0;
const supplier = document.getElementById('stockinSupplier').value.trim();
const invoiceNo = document.getElementById('stockinInvoice').value.trim();
const receivedBy = document.getElementById('stockinReceivedBy').value.trim() || 'System';
const date = document.getElementById('stockinDate').value;
if (!medId || !qty || qty < 1) { showToast('Please select medicine and enter quantity.', 'error'); return; }
const med = DB.inventory.find(m => m.id === medId);
if (!med) { showToast('Medicine not found.', 'error'); return; }
if (id) {
const existing = DB.stockIn.find(s => s.id === id);
if (!existing) { showToast('Record not found.', 'error'); return; }
med.qty -= existing.qty;
StorageService.delete('stockIn', id);
}
med.qty += qty;
med.costPrice = ((med.costPrice || 0) + unitCost) / 2;
StorageService.put('inventory', med);
const record = { id: id || genId('si_'), date, medicineId: medId, medicineName: med.name, category: med.category, batch: med.batch, qty, unitCost, supplier, invoiceNo, receivedBy, createdAt: id ? existing?.createdAt || new Date().toISOString() : new Date().toISOString() };
StorageService.put('stockIn', record);
logActivity('stock', `Stock In ${id ? 'updated' : 'added'}: ${qty} of ${med.name} added`);
showToast(`Stock In ${id ? 'updated' : 'added'} successfully.`, 'success');
closeModal();
renderStockIn();
renderStock();
updateNavBadges();
}

function editStockIn(id) {
const s = DB.stockIn.find(x => x.id === id);
if (s) showStockInModal(s);
}

function deleteStockIn(id) {
if (!confirm('Delete this stock in record? Stock will be restored.')) return;
const s = DB.stockIn.find(x => x.id === id);
if (!s) return;
const med = DB.inventory.find(m => m.id === s.medicineId);
if (med) {
med.qty -= s.qty;
StorageService.put('inventory', med);
}
StorageService.delete('stockIn', id);
logActivity('stock', `Stock In deleted: ${s.qty} of ${s.medicineName}`);
showToast('Stock In record deleted. Stock restored.', 'info');
renderStockIn();
renderStock();
updateNavBadges();
}

/* ============================================================
ADJUSTMENTS
============================================================ */
function renderAdjustments() {
const container = document.getElementById('adjustmentsContent');
const items = DB.adjustments;
if (items.length === 0) { container.innerHTML = '<div class="empty-state"><h4>No adjustments</h4><button class="btn btn-primary" onclick="showAdjustmentModal()">+ New Adjustment</button></div>'; return; }
let html = `<div style="margin-bottom:12px;"><button class="btn btn-primary" onclick="showAdjustmentModal()">+ New Adjustment</button></div><table class="data-table"><thead><tr><th>Date</th><th>Medicine</th><th>Change</th><th>Reason</th><th>Note</th><th style="text-align:right;">Actions</th></tr></thead><tbody>`;
items.forEach(item => {
html += `<tr><td>${DateHelper.formatDateShort(item.date)}</td><td>${item.medicineName}</td><td style="${item.change < 0 ? 'color:var(--danger)' : 'color:var(--success)'}">${item.change > 0 ? '+' : ''}${item.change}</td><td>${item.reason}</td><td>${item.note || '—'}</td><td style="text-align:right;"><button class="btn btn-delete btn-sm" onclick="deleteAdjustment('${item.id}')">Delete</button></td></tr>`;
});
html += '</tbody></table>';
container.innerHTML = html;
}

function deleteAdjustment(id) {
if (!confirm('Delete this adjustment?')) return;
const adj = DB.adjustments.find(x => x.id === id);
if (!adj) return;
const med = DB.inventory.find(m => m.id === adj.medicineId);
if (med) {
med.qty -= adj.change;
StorageService.put('inventory', med);
}
StorageService.delete('adjustments', id);
logActivity('adjustment', `Adjustment deleted: ${adj.change} for ${adj.medicineName}`);
showToast('Adjustment deleted. Stock restored.', 'info');
renderAdjustments();
renderStock();
updateNavBadges();
}

function showAdjustmentModal() {
const body = document.getElementById('modalBody');
const meds = DB.inventory.map(m => `<option value="${m.id}">${m.name} (${m.qty} in stock)</option>`).join('');
body.innerHTML = `
<div class="form-grid">
<div class="form-group"><label>Date</label><input type="date" id="adjDate" value="${DateHelper.today()}"></div>
<div class="form-group"><label>Medicine</label><select id="adjMed">${meds}</select></div>
<div class="form-group"><label>Change (±)</label><input type="number" id="adjChange" placeholder="e.g. -5 or +10"></div>
<div class="form-group"><label>Reason</label><select id="adjReason"><option value="Damaged">Damaged</option><option value="Theft">Theft</option><option value="Expired">Expired</option><option value="Manual Count">Manual Count</option><option value="Other">Other</option></select></div>
<div class="form-group"><label>Note</label><input type="text" id="adjNote" placeholder="Additional info"></div>
</div>
<div style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end;"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveAdjustment()">Save</button></div>
`;
document.getElementById('modalTitle').textContent = 'Stock Adjustment';
document.getElementById('modalOverlay').classList.remove('hidden');
}
function saveAdjustment() {
const medId = document.getElementById('adjMed').value;
const change = parseInt(document.getElementById('adjChange').value);
const reason = document.getElementById('adjReason').value;
const note = document.getElementById('adjNote').value.trim();
const date = document.getElementById('adjDate').value;
if (!medId || isNaN(change) || change === 0) { showToast('Please select medicine and enter a non-zero change.', 'error'); return; }
const med = DB.inventory.find(m => m.id === medId);
if (!med) { showToast('Medicine not found.', 'error'); return; }
if (med.qty + change < 0) { showToast(`Cannot adjust: only ${med.qty} in stock.`, 'error'); return; }
med.qty += change;
StorageService.put('inventory', med);
const record = { id: genId('adj_'), date, medicineId: medId, medicineName: med.name, change, reason, note, createdAt: new Date().toISOString() };
StorageService.put('adjustments', record);
logActivity('adjustment', `Stock adjusted: ${change} for ${med.name} (${reason})`);
showToast(`Stock adjusted for ${med.name}.`, 'success');
closeModal();
renderAdjustments();
renderStock();
updateNavBadges();
}

/* ============================================================
EXPIRY - Enforced 90 Day Alert System
============================================================ */
function renderExpiry() {
const container = document.getElementById('expiryContent');
const timeFilter = document.getElementById('expiryTimeFilter').value;
const dateFrom = document.getElementById('expiryDateFrom').value;
const dateTo = document.getElementById('expiryDateTo').value;
let range = DateHelper.getRange(timeFilter, dateFrom, dateTo);
const today = DateHelper.today();

// Filter for items expiring within 90 days (enforced)
let items = DB.inventory.filter(m => {
const diff = DateHelper.daysBetween(today, m.expiry);
return diff >= 0 && diff <= 90 && m.expiry >= range.from && m.expiry <= range.to;
}).sort((a,b) => DateHelper.daysBetween(today, a.expiry) - DateHelper.daysBetween(today, b.expiry));

if (items.length === 0) { container.innerHTML = '<div class="empty-state"><h4>No items expiring in the selected time range.</h4></div>'; return; }
let html = `<p style="color:var(--text-secondary);font-size:13px;margin-bottom:12px;">Showing ${items.length} items expiring within the next 90 days.</p><table class="data-table"><thead><tr><th>Medicine</th><th>Batch</th><th>Category</th><th>Supplier</th><th>Qty</th><th>Expiry Date</th><th>Days Left</th><th>Status</th><th style="text-align:right;">Actions</th></tr></thead><tbody>`;
items.forEach(m => {
const days = DateHelper.daysBetween(today, m.expiry);
const badge = days <= 7 ? 'badge-danger' : days <= 30 ? 'badge-warning' : 'badge-success';
const label = days <= 0 ? 'Expired' : days <= 7 ? 'Critical' : days <= 30 ? 'Soon' : 'OK';
html += `<tr><td><strong>${m.name}</strong></td><td>${m.batch}</td><td>${m.category}</td><td>${m.company || '—'}</td><td>${m.qty}</td><td>${DateHelper.formatDateDisplay(m.expiry)}</td><td>${days}</td><td><span class="badge ${badge}">${label}</span></td><td style="text-align:right;"><button class="btn btn-edit btn-sm" onclick="editMedicine('${m.id}')">Edit</button><button class="btn btn-delete btn-sm" onclick="deleteMedicine('${m.id}')">Delete</button></td></tr>`;
});
html += '</tbody></table>';
container.innerHTML = html;
}

/* ============================================================
LOW STOCK
============================================================ */
function renderLowStock() {
const container = document.getElementById('lowstockContent');
const timeFilter = document.getElementById('lowstockTimeFilter').value;
const dateFrom = document.getElementById('lowstockDateFrom').value;
const dateTo = document.getElementById('lowstockDateTo').value;
let range = DateHelper.getRange(timeFilter, dateFrom, dateTo);
let items = DB.inventory.filter(m => ThresholdService.isLowStock(m) && m.addedDate >= range.from && m.addedDate <= range.to)
.sort((a,b) => { const at = ThresholdService.getThresholdInUnits(a); const bt = ThresholdService.getThresholdInUnits(b); return (a.qty/at) - (b.qty/bt); });
if (items.length === 0) { container.innerHTML = '<div class="empty-state"><h4>No low stock items in the selected time range.</h4></div>'; return; }
let html = `<p style="color:var(--text-secondary);font-size:13px;margin-bottom:12px;">${items.length} items below threshold. Consider reordering.</p><table class="data-table" id="lowstockTable"><thead><tr><th>Medicine</th><th>Batch</th><th>Category</th><th>Current Qty</th><th>Threshold</th><th>Shortage</th><th>Action</th><th style="text-align:right;">Actions</th></tr></thead><tbody>`;
items.forEach(m => {
const threshold = ThresholdService.getThresholdInUnits(m);
const shortage = threshold - m.qty;
html += `<tr><td><strong>${m.name}</strong></td><td>${m.batch}</td><td>${m.category}</td><td style="color:var(--danger);font-weight:600;">${m.qty}</td><td>${threshold}</td><td style="color:var(--danger);">${shortage}</td><td><button class="btn btn-primary btn-sm" onclick="navigate('purchaseorders')">Reorder</button></td><td style="text-align:right;"><button class="btn btn-edit btn-sm" onclick="editMedicine('${m.id}')">Edit</button><button class="btn btn-delete btn-sm" onclick="deleteMedicine('${m.id}')">Delete</button></td></tr>`;
});
html += '</tbody></table>';
container.innerHTML = html;
}

function downloadLowStock() {
const table = document.getElementById('lowstockTable');
if (!table) { showToast('No low stock data to download.', 'info'); return; }
let csv = 'Medicine,Batch,Category,Current Qty,Threshold,Shortage\n';
const rows = table.querySelectorAll('tbody tr');
rows.forEach(row => {
const cells = row.querySelectorAll('td');
csv += `${cells[0].textContent},${cells[1].textContent},${cells[2].textContent},${cells[3].textContent},${cells[4].textContent},${cells[5].textContent}\n`;
});
const blob = new Blob([csv], { type: 'text/csv' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `low_stock_${DateHelper.today()}.csv`;
a.click();
URL.revokeObjectURL(url);
showToast('Low stock report downloaded.', 'success');
}

function printLowStock() {
const table = document.getElementById('lowstockTable');
if (!table) { showToast('No low stock data to print.', 'info'); return; }
const printWindow = window.open('', '_blank');
printWindow.document.write('<html><head><title>Low Stock Report</title><style>body{font-family:Arial,sans-serif;padding:20px;}table{width:100%;border-collapse:collapse;}th,td{padding:10px;border:1px solid #ddd;text-align:left;}th{background:#f2f2f2;}</style></head><body>');
printWindow.document.write('<h1>Low Stock Report</h1>');
printWindow.document.write('<p>Generated: ' + new Date().toLocaleString() + '</p>');
printWindow.document.write(table.outerHTML);
printWindow.document.write('</body></html>');
printWindow.document.close();
printWindow.print();
showToast('Low stock report sent to printer.', 'success');
}

/* ============================================================
STOCK OUT
============================================================ */
function renderStockOut() {
const container = document.getElementById('stockoutContent');
const items = DB.stockOut;
if (items.length === 0) { container.innerHTML = '<div class="empty-state"><h4>No drugs currently out of stock</h4><p style="color:var(--text-muted);">When a drug reaches 0 quantity, it will automatically appear here.</p></div>'; return; }
let html = `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;">`;
items.forEach(m => {
const timeStr = m.stockOutDate ? new Date(m.stockOutDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
html += `<div onclick="showStockOutDetails('${m.id}')" style="cursor:pointer;background:var(--surface-alt);border:1px solid var(--border);border-radius:var(--radius-lg);padding:16px;transition:all 0.2s;border-left:4px solid var(--danger);">
<div style="display:flex;justify-content:space-between;align-items:center;"><strong style="font-size:15px;color:var(--danger);">${m.name}</strong><span class="badge badge-danger">Out of Stock</span></div>
<div style="font-size:12px;color:var(--text-muted);">${m.brand || ''} | Batch: ${m.batch} | Category: ${m.category} | Formulation: ${m.formulation || '—'}</div>
<div style="margin-top:8px;font-size:12px;color:var(--text-muted);display:flex;justify-content:space-between;">
<span>📅 Stocked Out: ${timeStr}</span>
<span>💰 Last Price: ${DateHelper.formatKES(m.price)}</span>
</div>
<div style="margin-top:8px;display:flex;gap:8px;">
<button class="btn btn-success btn-sm" onclick="event.stopPropagation();restockFromStockOut('${m.id}')">🔄 Restock</button>
<button class="btn btn-delete btn-sm" onclick="event.stopPropagation();deleteStockOut('${m.id}')">Delete</button>
</div>
<div style="margin-top:8px;font-size:11px;color:var(--text-faint);text-align:center;">Click for full details</div>
</div>`;
});
html += '</div>';
container.innerHTML = html;
}

function showStockOutDetails(id) {
const med = DB.stockOut.find(m => m.id === id);
if (!med) return;
const body = document.getElementById('modalBody');
let html = `<h3 style="margin-bottom:16px;color:var(--danger);">${med.name} - Stock Out Details</h3>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
<div style="background:var(--surface-alt);padding:12px;border-radius:var(--radius);"><strong>Brand:</strong> ${med.brand || '—'}</div>
<div style="background:var(--surface-alt);padding:12px;border-radius:var(--radius);"><strong>Batch:</strong> ${med.batch}</div>
<div style="background:var(--surface-alt);padding:12px;border-radius:var(--radius);"><strong>Category:</strong> ${med.category}</div>
<div style="background:var(--surface-alt);padding:12px;border-radius:var(--radius);"><strong>Formulation:</strong> ${med.formulation || '—'}</div>
<div style="background:var(--surface-alt);padding:12px;border-radius:var(--radius);"><strong>Last Quantity:</strong> 0 (Sold out)</div>
<div style="background:var(--surface-alt);padding:12px;border-radius:var(--radius);"><strong>Expiry:</strong> ${DateHelper.formatDateDisplay(med.expiry)} (${DateHelper.daysBetween(DateHelper.today(), med.expiry)} days left)</div>
<div style="background:var(--surface-alt);padding:12px;border-radius:var(--radius);"><strong>Last Buying Price:</strong> ${DateHelper.formatKES(med.buyingPrice || 0)}</div>
<div style="background:var(--surface-alt);padding:12px;border-radius:var(--radius);"><strong>Last Selling Price:</strong> ${DateHelper.formatKES(med.price)}</div>
<div style="background:var(--surface-alt);padding:12px;border-radius:var(--radius);"><strong>Stocked Out Date:</strong> ${med.stockOutDate ? new Date(med.stockOutDate).toLocaleString() : '—'}</div>
<div style="background:var(--surface-alt);padding:12px;border-radius:var(--radius);"><strong>Company:</strong> ${med.company || '—'}</div>
</div>
<div style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end;">
<button class="btn btn-success" onclick="closeModal();restockFromStockOut('${med.id}')">🔄 Restock Now</button>
<button class="btn btn-secondary" onclick="closeModal()">Close</button>
</div>
`;
showModal(`${med.name} - Stock Out Details`, html);
}

function restockFromStockOut(id) {
const med = DB.stockOut.find(m => m.id === id);
if (!med) { showToast('Drug not found in stock out list.', 'error'); return; }
// Remove from stock out
StorageService.delete('stockOut', id);
// Add back to inventory
const inventoryMed = {
id: genId('med_'),
name: med.name,
brand: med.brand || '',
company: med.company || '',
batch: med.batch,
category: med.category,
formulation: med.formulation || '',
type: med.type || 'Generic',
buyingPrice: med.buyingPrice || 0,
costPrice: med.costPrice || 0,
price: med.price || 0,
expiry: med.expiry,
qty: 0,
addedDate: DateHelper.today(),
createdAt: new Date().toISOString()
};
StorageService.put('inventory', inventoryMed);
// Navigate to stock in with pre-filled information
showStockInModalForRestock(inventoryMed.id, med.name, med.category, med.formulation, med.batch, med.company);
logActivity('stock', `Restock initiated for ${med.name}`);
showToast(`${med.name} moved from Stock Out to Stock In. Please complete the restock details.`, 'success');
renderStockOut();
updateNavBadges();
}

function showStockInModalForRestock(medId, medName, category, formulation, batch, company) {
const body = document.getElementById('modalBody');
body.innerHTML = `
<input type="hidden" id="stockinId" value="">
<input type="hidden" id="stockinMed" value="${medId}">
<div class="form-grid">
<div class="form-group"><label>Date</label><input type="date" id="stockinDate" value="${DateHelper.today()}"></div>
<div class="form-group"><label>Medicine</label><input type="text" value="${medName}" disabled style="background:var(--bg);"></div>
<div class="form-group"><label>Category</label><input type="text" value="${category || '—'}" disabled style="background:var(--bg);"></div>
<div class="form-group"><label>Formulation</label><input type="text" value="${formulation || '—'}" disabled style="background:var(--bg);"></div>
<div class="form-group"><label>Batch</label><input type="text" value="${batch}" disabled style="background:var(--bg);"></div>
<div class="form-group"><label>Company</label><input type="text" value="${company || '—'}" disabled style="background:var(--bg);"></div>
<div class="form-group"><label>Quantity Added *</label><input type="number" id="stockinQty" min="1" placeholder="Enter quantity"></div>
<div class="form-group"><label>Unit Cost (KES) *</label><input type="number" id="stockinUnitCost" min="0" step="0.01" placeholder="Enter unit cost"></div>
<div class="form-group"><label>Supplier</label><input type="text" id="stockinSupplier" placeholder="Supplier name"></div>
<div class="form-group"><label>Invoice No.</label><input type="text" id="stockinInvoice" placeholder="Invoice number"></div>
<div class="form-group"><label>Received By</label><input type="text" id="stockinReceivedBy" placeholder="Your name"></div>
</div>
<div style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end;">
<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
<button class="btn btn-success" onclick="saveRestockFromStockOut()">✅ Complete Restock</button>
</div>
`;
document.getElementById('modalTitle').textContent = `Restock: ${medName}`;
document.getElementById('modalOverlay').classList.remove('hidden');
}

function saveRestockFromStockOut() {
const medId = document.getElementById('stockinMed').value;
const qty = parseInt(document.getElementById('stockinQty').value);
const unitCost = parseFloat(document.getElementById('stockinUnitCost').value) || 0;
const supplier = document.getElementById('stockinSupplier').value.trim();
const invoiceNo = document.getElementById('stockinInvoice').value.trim();
const receivedBy = document.getElementById('stockinReceivedBy').value.trim() || 'System';
const date = document.getElementById('stockinDate').value;
if (!medId || !qty || qty < 1 || !unitCost || unitCost <= 0) {
showToast('Please enter quantity and unit cost.', 'error');
return;
}
const med = DB.inventory.find(m => m.id === medId);
if (!med) { showToast('Medicine not found.', 'error'); return; }
med.qty += qty;
med.buyingPrice = (med.buyingPrice || 0) + (qty * unitCost);
med.costPrice = ((med.costPrice || 0) + unitCost) / 2;
StorageService.put('inventory', med);
const record = { id: genId('si_'), date, medicineId: medId, medicineName: med.name, category: med.category, batch: med.batch, qty, unitCost, supplier, invoiceNo, receivedBy, createdAt: new Date().toISOString() };
StorageService.put('stockIn', record);
logActivity('stock', `Restock completed: ${qty} of ${med.name} added`);
showToast(`✅ ${med.name} restocked successfully with ${qty} units!`, 'success');
closeModal();
renderStockIn();
renderStock();
renderStockOut();
updateNavBadges();
navigate('stockin');
}

function deleteStockOut(id) {
if (!confirm('Delete this record from Stock Out?')) return;
StorageService.delete('stockOut', id);
showToast('Stock Out record deleted.', 'info');
renderStockOut();
updateNavBadges();
}

/* ============================================================
SUPPLIERS - Enhanced with price comparison
============================================================ */
function renderSuppliers() {
const container = document.getElementById('suppliersContent');
const items = DB.suppliers;
if (items.length === 0) { container.innerHTML = '<div class="empty-state"><h4>No suppliers</h4><button class="btn btn-primary" onclick="showSupplierModal()">+ Add Supplier</button></div>'; return; }
let html = `<div style="margin-bottom:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
<button class="btn btn-primary" onclick="showSupplierModal()">+ Add Supplier</button>
<input type="text" id="supplierSearch" placeholder="🔍 Search suppliers..." oninput="renderSuppliers()" style="padding:8px 12px;border:1px solid var(--border-strong);border-radius:var(--radius);font-size:13px;width:200px;">
</div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;">`;
const searchTerm = document.getElementById('supplierSearch')?.value?.toLowerCase() || '';
let filtered = items;
if (searchTerm) filtered = filtered.filter(s => s.name.toLowerCase().includes(searchTerm) || s.contact?.toLowerCase().includes(searchTerm));
filtered.forEach(s => {
const rating = s.rating || 0;
const stars = '⭐'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
// Price comparison logic for this supplier
const deliveries = DB.purchases.filter(p => p.supplier === s.name);
let avgPrice = 0;
let cheapestDrug = '—';
let mostExpensiveDrug = '—';
if (deliveries.length > 0) {
avgPrice = deliveries.reduce((sum, d) => sum + d.unitCost, 0) / deliveries.length;
// Find cheapest and most expensive drugs delivered by this supplier
const drugPrices = {};
deliveries.forEach(d => {
if (!drugPrices[d.medicineName] || d.unitCost < drugPrices[d.medicineName]) {
drugPrices[d.medicineName] = d.unitCost;
}
});
const sortedDrugs = Object.entries(drugPrices).sort((a,b) => a[1] - b[1]);
if (sortedDrugs.length > 0) {
cheapestDrug = `${sortedDrugs[0][0]} (${DateHelper.formatKES(sortedDrugs[0][1])})`;
mostExpensiveDrug = `${sortedDrugs[sortedDrugs.length-1][0]} (${DateHelper.formatKES(sortedDrugs[sortedDrugs.length-1][1])})`;
}
}
html += `<div style="background:var(--surface-alt);border:1px solid var(--border);border-radius:var(--radius-lg);padding:16px;">
<div style="display:flex;justify-content:space-between;align-items:center;"><strong style="font-size:15px;">${s.name}</strong><div><button class="btn btn-edit btn-sm" onclick="editSupplier('${s.id}')">Edit</button><button class="btn btn-delete btn-sm" onclick="deleteSupplier('${s.id}')">Delete</button></div></div>
<div style="font-size:12px;color:var(--text-muted);">${s.contact || ''} ${s.phone ? '| '+s.phone : ''}</div>
<div style="font-size:12px;color:var(--text-muted);">${s.email || ''} ${s.address ? '| '+s.address : ''}</div>
<div style="margin-top:8px;display:flex;align-items:center;gap:8px;"><span style="font-size:14px;">${stars}</span><span style="font-size:12px;color:var(--text-muted);">(${rating.toFixed(1)}/5)</span></div>
<div style="margin-top:8px;display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;color:var(--text-muted);">
<div><strong>📊 Avg. Price:</strong> ${deliveries.length > 0 ? DateHelper.formatKES(avgPrice) : '—'}</div>
<div><strong>📦 Deliveries:</strong> ${deliveries.length}</div>
<div><strong>🟢 Cheapest:</strong> ${cheapestDrug}</div>
<div><strong>🔴 Most Expensive:</strong> ${mostExpensiveDrug}</div>
</div>
<div style="margin-top:8px;display:flex;gap:8px;">
<button class="btn btn-secondary btn-sm" onclick="viewSupplierCredentials('${s.id}')">📋 View Credentials</button>
<button class="btn btn-secondary btn-sm" onclick="rateSupplier('${s.id}')">⭐ Rate</button>
</div>
</div>`;
});
html += '</div>';
container.innerHTML = html;
}

function viewSupplierCredentials(id) {
const s = DB.suppliers.find(x => x.id === id);
if (!s) return;
const deliveries = DB.purchases.filter(p => p.supplier === s.name);
let html = `<h3 style="margin-bottom:16px;">${s.name} - Credentials & Delivery History</h3>
<div style="background:var(--surface-alt);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:16px;">
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px;">
<div><strong>Contact Person:</strong> ${s.contact || '—'}</div>
<div><strong>Phone:</strong> ${s.phone || '—'}</div>
<div><strong>Email:</strong> ${s.email || '—'}</div>
<div><strong>Address:</strong> ${s.address || '—'}</div>
<div><strong>Rating:</strong> ${'⭐'.repeat(Math.round(s.rating || 0))} (${(s.rating || 0).toFixed(1)}/5)</div>
<div><strong>Total Deliveries:</strong> ${deliveries.length}</div>
</div>
</div>
<h4 style="margin:16px 0 8px;">Delivery History</h4>
<table class="data-table"><thead><tr><th>Date</th><th>Time</th><th>Medicine</th><th>Quantity</th><th>Cost</th><th>Status</th><th>Payment Method</th><th style="text-align:right;">Actions</th></tr></thead><tbody>`;
if (deliveries.length === 0) html += '<tr><td colspan="8" style="text-align:center;padding:20px;">No deliveries recorded.</td></tr>';
else deliveries.forEach(d => {
const status = d.paid ? 'Paid' : 'Unpaid';
const timeStr = d.createdAt ? new Date(d.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—';
html += `<tr><td>${DateHelper.formatDateShort(d.date)}</td><td>${timeStr}</td><td>${d.medicineName}</td><td>${d.qty}</td><td>${DateHelper.formatKSh(d.total)}</td><td><span class="badge ${status === 'Paid' ? 'badge-success' : 'badge-danger'}">${status}</span></td><td>${d.paymentMethod || '—'}</td><td style="text-align:right;"><button class="btn btn-edit btn-sm" onclick="editPurchase('${d.id}')">Edit</button><button class="btn btn-delete btn-sm" onclick="deletePurchase('${d.id}')">Delete</button></td></tr>`;
});
html += '</tbody></table>';
showModal(`${s.name} - Credentials`, html);
}

function rateSupplier(id) {
const s = DB.suppliers.find(x => x.id === id);
if (!s) return;
const body = document.getElementById('modalBody');
body.innerHTML = `
<h4 style="margin-bottom:16px;">Rate ${s.name}</h4>
<form id="ratingForm">
<div style="margin-bottom:12px;">
<label style="display:block;font-weight:600;margin-bottom:4px;">1. How would you rate delivery timeliness?</label>
<select id="q1"><option value="5">Excellent - Always on time</option><option value="4">Good - Usually on time</option><option value="3">Average - Sometimes late</option><option value="2">Poor - Often late</option><option value="1">Very Poor - Always late</option></select>
</div>
<div style="margin-bottom:12px;">
<label style="display:block;font-weight:600;margin-bottom:4px;">2. Quality of products delivered?</label>
<select id="q2"><option value="5">Excellent - Perfect condition</option><option value="4">Good - Minor issues</option><option value="3">Average - Some issues</option><option value="2">Poor - Many issues</option><option value="1">Very Poor - Unacceptable</option></select>
</div>
<div style="margin-bottom:12px;">
<label style="display:block;font-weight:600;margin-bottom:4px;">3. Communication and responsiveness?</label>
<select id="q3"><option value="5">Excellent - Very responsive</option><option value="4">Good - Usually responsive</option><option value="3">Average - Sometimes responsive</option><option value="2">Poor - Rarely responsive</option><option value="1">Very Poor - Never responsive</option></select>
</div>
<div style="margin-bottom:12px;">
<label style="display:block;font-weight:600;margin-bottom:4px;">4. Pricing competitiveness?</label>
<select id="q4"><option value="5">Excellent - Best prices</option><option value="4">Good - Competitive</option><option value="3">Average - Fair prices</option><option value="2">Poor - Expensive</option><option value="1">Very Poor - Overpriced</option></select>
</div>
<div style="margin-bottom:12px;">
<label style="display:block;font-weight:600;margin-bottom:4px;">5. Overall satisfaction?</label>
<select id="q5"><option value="5">Very Satisfied</option><option value="4">Satisfied</option><option value="3">Neutral</option><option value="2">Dissatisfied</option><option value="1">Very Dissatisfied</option></select>
</div>
<div style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end;"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="submitRating('${id}')">Submit Rating</button></div>
</form>
`;
document.getElementById('modalTitle').textContent = `Rate Supplier`;
document.getElementById('modalOverlay').classList.remove('hidden');
}

function submitRating(id) {
const q1 = parseInt(document.getElementById('q1').value);
const q2 = parseInt(document.getElementById('q2').value);
const q3 = parseInt(document.getElementById('q3').value);
const q4 = parseInt(document.getElementById('q4').value);
const q5 = parseInt(document.getElementById('q5').value);
const avg = (q1 + q2 + q3 + q4 + q5) / 5;
const s = DB.suppliers.find(x => x.id === id);
if (!s) return;
s.rating = avg;
StorageService.put('suppliers', s);
logActivity('supplier', `Supplier ${s.name} rated: ${avg.toFixed(1)}/5`);
showToast(`Rating submitted: ${avg.toFixed(1)}/5`, 'success');
closeModal();
renderSuppliers();
updateNavBadges();
}

function showSupplierModal(data) {
const body = document.getElementById('modalBody');
const d = data || {};
body.innerHTML = `
<input type="hidden" id="supplierId" value="${d.id || ''}">
<div class="form-grid">
<div class="form-group"><label>Supplier Name *</label><input type="text" id="supName" value="${d.name || ''}" placeholder="e.g. MedX Distributors"></div>
<div class="form-group"><label>Contact Person</label><input type="text" id="supContact" value="${d.contact || ''}" placeholder="Contact person name"></div>
<div class="form-group"><label>Phone</label><input type="text" id="supPhone" value="${d.phone || ''}" placeholder="Phone number"></div>
<div class="form-group"><label>Email</label><input type="email" id="supEmail" value="${d.email || ''}" placeholder="supplier@email.com"></div>
<div class="form-group"><label>Address</label><input type="text" id="supAddress" value="${d.address || ''}" placeholder="Physical address"></div>
</div>
<div style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end;"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveSupplier()">Save</button></div>
`;
document.getElementById('modalTitle').textContent = data ? 'Edit Supplier' : 'Add Supplier';
document.getElementById('modalOverlay').classList.remove('hidden');
}
function saveSupplier() {
const id = document.getElementById('supplierId').value;
const name = document.getElementById('supName').value.trim();
if (!name) { showToast('Please enter a supplier name.', 'error'); return; }
const data = { id: id || genId('sup_'), name, contact: document.getElementById('supContact').value.trim(), phone: document.getElementById('supPhone').value.trim(), email: document.getElementById('supEmail').value.trim(), address: document.getElementById('supAddress').value.trim(), rating: 0 };
StorageService.put('suppliers', data);
logActivity('supplier', `Supplier ${id ? 'updated' : 'added'}: ${name}`);
showToast(`Supplier ${id ? 'updated' : 'added'} successfully.`, 'success');
closeModal();
renderSuppliers();
updateNavBadges();
}
function editSupplier(id) { const s = DB.suppliers.find(x => x.id === id); if (s) showSupplierModal(s); }
function deleteSupplier(id) { if (!confirm('Delete this supplier?')) return; StorageService.delete('suppliers', id); logActivity('supplier', `Supplier deleted: ${id}`); showToast('Supplier deleted.', 'info'); renderSuppliers(); updateNavBadges(); }

/* ============================================================
PURCHASES
============================================================ */
function renderPurchases() {
const container = document.getElementById('purchasesContent');
const timeFilter = document.getElementById('purchasesTimeFilter').value;
const dateFrom = document.getElementById('purchasesDateFrom').value;
const dateTo = document.getElementById('purchasesDateTo').value;
let range = DateHelper.getRange(timeFilter, dateFrom, dateTo);
let items = DB.purchases.filter(p => p.date >= range.from && p.date <= range.to);
if (items.length === 0) { container.innerHTML = '<div class="empty-state"><h4>No purchases</h4><button class="btn btn-primary" onclick="showPurchaseModal()">+ New Purchase</button></div>'; return; }
let totalCost = 0;
let html = `<div style="margin-bottom:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
<button class="btn btn-primary" onclick="showPurchaseModal()">+ New Purchase</button>
<input type="text" id="purchaseSearch" placeholder="🔍 Search purchases..." oninput="renderPurchases()" style="padding:8px 12px;border:1px solid var(--border-strong);border-radius:var(--radius);font-size:13px;width:200px;">
</div><table class="data-table"><thead><tr><th>Date</th><th>Supplier</th><th>Item</th><th>Qty</th><th>Cost</th><th>Total</th><th>Status</th><th>Payment</th><th style="text-align:right;">Actions</th></tr></thead><tbody>`;
items.forEach(p => {
totalCost += p.total;
const status = p.paid ? 'Paid' : 'Unpaid';
html += `<tr><td>${DateHelper.formatDateShort(p.date)}</td><td>${p.supplier}</td><td>${p.medicineName}</td><td>${p.qty}</td><td>${DateHelper.formatKES(p.unitCost)}</td><td>${DateHelper.formatKES(p.total)}</td><td><span class="badge ${status === 'Paid' ? 'badge-success' : 'badge-danger'}">${status}</span></td><td>${p.paymentMethod || '—'}</td><td style="text-align:right;"><button class="btn ${p.paid ? 'btn-secondary' : 'btn-success'} btn-sm" onclick="togglePurchasePayment('${p.id}')">${p.paid ? 'Paid' : 'Mark Paid'}</button><button class="btn btn-edit btn-sm" onclick="editPurchase('${p.id}')">Edit</button><button class="btn btn-delete btn-sm" onclick="deletePurchase('${p.id}')">Delete</button></td></tr>`;
});
html += `</tbody></table><div class="table-footer"><span>Total Purchases</span><span class="total-amount expense">${DateHelper.formatKES(totalCost)}</span></div>`;
container.innerHTML = html;
}

function togglePurchasePayment(id) {
const p = DB.purchases.find(x => x.id === id);
if (!p) return;
p.paid = !p.paid;
StorageService.put('purchases', p);
logActivity('purchase', `Purchase ${p.id} marked as ${p.paid ? 'Paid' : 'Unpaid'}`);
showToast(`Purchase marked as ${p.paid ? 'Paid' : 'Unpaid'}`, 'success');
renderPurchases();
updateNavBadges();
}

function editPurchase(id) {
const p = DB.purchases.find(x => x.id === id);
if (!p) return;
const body = document.getElementById('modalBody');
const meds = DB.inventory.map(m => `<option value="${m.id}" ${m.id === p.medicineId ? 'selected' : ''}>${m.name}</option>`).join('');
const suppliers = DB.suppliers.map(s => `<option value="${s.name}" ${s.name === p.supplier ? 'selected' : ''}>${s.name}</option>`).join('');
body.innerHTML = `
<input type="hidden" id="purchaseId" value="${p.id}">
<div class="form-grid">
<div class="form-group"><label>Date</label><input type="date" id="purchaseDate" value="${p.date}"></div>
<div class="form-group"><label>Supplier</label><select id="purchaseSupplier">${suppliers}</select></div>
<div class="form-group"><label>Medicine</label><select id="purchaseMed">${meds}</select></div>
<div class="form-group"><label>Quantity</label><input type="number" id="purchaseQty" min="1" value="${p.qty}"></div>
<div class="form-group"><label>Unit Cost (KES)</label><input type="number" id="purchaseCost" min="0" step="0.01" value="${p.unitCost}"></div>
<div class="form-group"><label>Payment Method</label><select id="purchasePaymentMethod"><option value="CASH" ${p.paymentMethod === 'CASH' ? 'selected' : ''}>Cash</option><option value="NCBA BANK" ${p.paymentMethod === 'NCBA BANK' ? 'selected' : ''}>NCBA Bank</option><option value="POCHI" ${p.paymentMethod === 'POCHI' ? 'selected' : ''}>Pochi (M-Pesa)</option></select></div>
</div>
<div style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end;"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="savePurchaseEdit()">Update</button></div>
`;
document.getElementById('modalTitle').textContent = 'Edit Purchase';
document.getElementById('modalOverlay').classList.remove('hidden');
}

function savePurchaseEdit() {
const id = document.getElementById('purchaseId').value;
const p = DB.purchases.find(x => x.id === id);
if (!p) return;
const date = document.getElementById('purchaseDate').value;
const supplier = document.getElementById('purchaseSupplier').value;
const medId = document.getElementById('purchaseMed').value;
const qty = parseInt(document.getElementById('purchaseQty').value);
const unitCost = parseFloat(document.getElementById('purchaseCost').value);
const paymentMethod = document.getElementById('purchasePaymentMethod').value;
if (!medId || !qty || !unitCost || !paymentMethod) { showToast('Please fill all fields.', 'error'); return; }
const med = DB.inventory.find(m => m.id === medId);
if (!med) { showToast('Medicine not found.', 'error'); return; }
const oldTotal = p.qty * p.unitCost;
const newTotal = qty * unitCost;
p.date = date;
p.supplier = supplier;
p.medicineId = medId;
p.medicineName = med.name;
p.qty = qty;
p.unitCost = unitCost;
p.total = newTotal;
p.paymentMethod = paymentMethod;
StorageService.put('purchases', p);
const newTotalCost = (med.buyingPrice || 0) - oldTotal + newTotal;
const newQty = med.qty - p.qty + qty;
med.buyingPrice = newTotalCost;
med.qty = newQty;
med.costPrice = newQty > 0 ? newTotalCost / newQty : 0;
StorageService.put('inventory', med);
logActivity('purchase', `Purchase ${p.id} updated`);
showToast('Purchase updated successfully.', 'success');
closeModal();
renderPurchases();
renderStock();
updateNavBadges();
}

function deletePurchase(id) {
if (!confirm('Delete this purchase? Stock will be restored.')) return;
const p = DB.purchases.find(x => x.id === id);
if (!p) return;
const med = DB.inventory.find(m => m.id === p.medicineId);
if (med) {
med.qty -= p.qty;
med.buyingPrice -= p.total;
StorageService.put('inventory', med);
}
StorageService.delete('purchases', id);
logActivity('purchase', `Purchase ${p.id} deleted`);
showToast('Purchase deleted. Stock restored.', 'info');
renderPurchases();
renderStock();
updateNavBadges();
}

function showPurchaseModal() {
const body = document.getElementById('modalBody');
const meds = DB.inventory.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
const suppliers = DB.suppliers.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
body.innerHTML = `
<div class="form-grid">
<div class="form-group"><label>Date</label><input type="date" id="purchaseDate" value="${DateHelper.today()}"></div>
<div class="form-group"><label>Supplier</label><select id="purchaseSupplier"><option value="">Select supplier</option>${suppliers}</select></div>
<div class="form-group"><label>Medicine</label><select id="purchaseMed">${meds}</select></div>
<div class="form-group"><label>Quantity</label><input type="number" id="purchaseQty" min="1" placeholder="10"></div>
<div class="form-group"><label>Unit Cost (KES)</label><input type="number" id="purchaseCost" min="0" step="0.01" placeholder="150.00"></div>
<div class="form-group"><label>Payment Method</label><select id="purchasePaymentMethod"><option value="CASH">Cash</option><option value="NCBA BANK">NCBA Bank</option><option value="POCHI">Pochi (M-Pesa)</option></select></div>
</div>
<div style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end;"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="savePurchase()">Save</button></div>
`;
document.getElementById('modalTitle').textContent = 'New Purchase';
document.getElementById('modalOverlay').classList.remove('hidden');
}
function savePurchase() {
const date = document.getElementById('purchaseDate').value;
const supplier = document.getElementById('purchaseSupplier').value;
const medId = document.getElementById('purchaseMed').value;
const qty = parseInt(document.getElementById('purchaseQty').value);
const unitCost = parseFloat(document.getElementById('purchaseCost').value);
const paymentMethod = document.getElementById('purchasePaymentMethod').value;
if (!medId || !qty || !unitCost || !paymentMethod) { showToast('Please fill all fields.', 'error'); return; }
const med = DB.inventory.find(m => m.id === medId);
if (!med) { showToast('Medicine not found.', 'error'); return; }
const total = qty * unitCost;
const purchase = { id: genId('pur_'), date, supplier, medicineId: medId, medicineName: med.name, qty, unitCost, total, paymentMethod, paid: false, createdAt: new Date().toISOString() };
StorageService.put('purchases', purchase);
const newTotalCost = (med.buyingPrice || 0) + total;
const newQty = med.qty + qty;
med.buyingPrice = newTotalCost;
med.qty = newQty;
med.costPrice = newQty > 0 ? newTotalCost / newQty : 0;
StorageService.put('inventory', med);
logActivity('purchase', `Purchase: ${qty} of ${med.name} from ${supplier} — ${DateHelper.formatKES(total)}`);
showToast(`Purchase recorded. ${qty} of ${med.name} added to stock.`, 'success');
closeModal();
renderPurchases();
renderStock();
updateNavBadges();
}

/* ============================================================
PURCHASE ORDERS
============================================================ */
function renderPurchaseOrders() {
const container = document.getElementById('purchaseordersContent');
const items = DB.purchaseOrders;
if (items.length === 0) { container.innerHTML = '<div class="empty-state"><h4>No purchase orders</h4><button class="btn btn-primary" onclick="showPOModal()">+ New PO</button></div>'; return; }
let html = `<div style="margin-bottom:12px;"><button class="btn btn-primary" onclick="showPOModal()">+ New PO</button></div><table class="data-table"><thead><tr><th>PO#</th><th>Date</th><th>Supplier</th><th>Items</th><th>Total</th><th>Status</th><th style="text-align:right;">Actions</th></tr></thead><tbody>`;
items.forEach(po => {
const statusBadge = po.status === 'Received' ? 'badge-success' : po.status === 'Ordered' ? 'badge-warning' : 'badge-neutral';
html += `<tr><td><strong>${po.poNumber}</strong></td><td>${DateHelper.formatDateShort(po.date)}</td><td>${po.supplier}</td><td>${po.items.length}</td><td>${DateHelper.formatKES(po.total)}</td><td><span class="badge ${statusBadge}">${po.status}</span></td><td style="text-align:right;"><button class="btn btn-primary btn-sm" onclick="receivePO('${po.id}')">Receive</button><button class="btn btn-delete btn-sm" onclick="deletePO('${po.id}')">Delete</button></td></tr>`;
});
html += '</tbody></table>';
container.innerHTML = html;
}

function deletePO(id) {
if (!confirm('Delete this purchase order?')) return;
StorageService.delete('purchaseOrders', id);
logActivity('purchase', `PO ${id} deleted`);
showToast('Purchase order deleted.', 'info');
renderPurchaseOrders();
updateNavBadges();
}

function showPOModal() {
const body = document.getElementById('modalBody');
const suppliers = DB.suppliers.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
const meds = DB.inventory.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
body.innerHTML = `
<div class="form-grid">
<div class="form-group"><label>PO Number</label><input type="text" id="poNumber" value="PO-${String(Date.now()).slice(-6)}"></div>
<div class="form-group"><label>Date</label><input type="date" id="poDate" value="${DateHelper.today()}"></div>
<div class="form-group"><label>Supplier</label><select id="poSupplier">${suppliers}</select></div>
</div>
<div style="margin-top:12px;"><h4 style="font-size:13px;">Order Items</h4></div>
<div id="poItemsContainer">
<div style="display:flex;gap:8px;margin-top:8px;"><select id="poItemMed" style="flex:1;padding:8px 12px;border:1px solid var(--border);border-radius:var(--radius);">${meds}</select><input type="number" id="poItemQty" placeholder="Qty" style="width:80px;padding:8px 12px;border:1px solid var(--border);border-radius:var(--radius);"><button class="btn btn-secondary btn-sm" onclick="addPOItem()">Add</button></div>
<div id="poItemsList" style="margin-top:8px;"></div>
</div>
<div style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end;"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="savePO()">Create PO</button></div>
`;
window._poItems = [];
document.getElementById('modalTitle').textContent = 'New Purchase Order';
document.getElementById('modalOverlay').classList.remove('hidden');
}
function addPOItem() {
const medSelect = document.getElementById('poItemMed');
const qty = parseInt(document.getElementById('poItemQty').value);
if (!medSelect.value || !qty) { showToast('Select medicine and quantity.', 'error'); return; }
const med = DB.inventory.find(m => m.id === medSelect.value);
if (!med) return;
window._poItems.push({ id: med.id, name: med.name, qty });
renderPOItems();
document.getElementById('poItemQty').value = '';
}
function renderPOItems() {
const list = document.getElementById('poItemsList');
if (!list) return;
if (window._poItems.length === 0) { list.innerHTML = '<div style="color:var(--text-muted);font-size:13px;">No items added.</div>'; return; }
list.innerHTML = window._poItems.map((item, i) => `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:13px;"><span>${item.name} × ${item.qty}</span><span onclick="window._poItems.splice(${i},1);renderPOItems();" style="color:var(--danger);cursor:pointer;">✕</span></div>`).join('');
}
function savePO() {
const poNumber = document.getElementById('poNumber').value.trim();
const date = document.getElementById('poDate').value;
const supplier = document.getElementById('poSupplier').value;
if (!poNumber || !supplier || window._poItems.length === 0) { showToast('Please fill all fields and add items.', 'error'); return; }
const total = window._poItems.reduce((sum, item) => { const med = DB.inventory.find(m => m.id === item.id); return sum + (med ? med.price * item.qty : 0); }, 0);
const po = { id: genId('po_'), poNumber, date, supplier, items: window._poItems, total, status: 'Ordered', createdAt: new Date().toISOString() };
StorageService.put('purchaseOrders', po);
logActivity('purchase', `PO ${poNumber} created for ${supplier}`);
showToast(`PO ${poNumber} created.`, 'success');
closeModal();
renderPurchaseOrders();
updateNavBadges();
}
function receivePO(id) {
const po = DB.purchaseOrders.find(p => p.id === id);
if (!po) return;
if (!confirm(`Mark PO ${po.poNumber} as received?`)) return;
po.items.forEach(item => {
const med = DB.inventory.find(m => m.id === item.id);
if (med) { med.qty += item.qty; StorageService.put('inventory', med); }
});
po.status = 'Received';
StorageService.put('purchaseOrders', po);
const grn = { id: genId('grn_'), date: DateHelper.today(), poNumber: po.poNumber, supplier: po.supplier, items: po.items, total: po.total, createdAt: new Date().toISOString() };
StorageService.put('grn', grn);
logActivity('purchase', `PO ${po.poNumber} received and stocked in`);
showToast(`PO ${po.poNumber} received. Stock updated.`, 'success');
renderPurchaseOrders();
renderStock();
updateNavBadges();
}

/* ============================================================
GRN
============================================================ */
function renderGRN() {
const container = document.getElementById('grnContent');
const items = DB.grn;
if (items.length === 0) { container.innerHTML = '<div class="empty-state"><h4>No GRN records</h4></div>'; return; }
let html = `<table class="data-table"><thead><tr><th>Date</th><th>PO#</th><th>Supplier</th><th>Items</th><th>Total</th><th style="text-align:right;">Actions</th></tr></thead><tbody>`;
items.forEach(g => {
html += `<tr><td>${DateHelper.formatDateShort(g.date)}</td><td>${g.poNumber}</td><td>${g.supplier}</td><td>${g.items.length}</td><td>${DateHelper.formatKES(g.total)}</td><td style="text-align:right;"><button class="btn btn-delete btn-sm" onclick="deleteGRN('${g.id}')">Delete</button></td></tr>`;
});
html += '</tbody></table>';
container.innerHTML = html;
}

function deleteGRN(id) {
if (!confirm('Delete this GRN record?')) return;
StorageService.delete('grn', id);
logActivity('grn', `GRN ${id} deleted`);
showToast('GRN deleted.', 'info');
renderGRN();
updateNavBadges();
}

function showGRNModal() { showToast('GRN is automatically created when receiving a PO.', 'info'); }

/* ============================================================
INVOICES
============================================================ */
function renderInvoices() {
const container = document.getElementById('invoicesContent');
const items = DB.invoices.sort((a,b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
if (items.length === 0) { container.innerHTML = '<div class="empty-state"><h4>No invoices</h4></div>'; return; }
let html = `<table class="data-table"><thead><tr><th>Invoice#</th><th>Date</th><th>Customer</th><th>Amount</th><th>Payment</th><th>Reference</th><th>Status</th><th style="text-align:right;">Actions</th></tr></thead><tbody>`;
items.forEach(inv => {
const invNum = `INV-${String(inv.receiptNumber || '0').padStart(4, '0')}`;
html += `<tr><td><strong>${invNum}</strong></td><td>${DateHelper.formatDateShort(inv.date)}</td><td>${inv.customer}</td><td>${DateHelper.formatKES(inv.total)}</td><td>${inv.payment}</td><td>${inv.reference || '—'}</td><td><span class="badge badge-paid">${inv.status}</span></td><td style="text-align:right;"><button class="btn btn-edit btn-sm" onclick="viewSaleReceipt('${inv.saleId}')">View</button><button class="btn btn-delete btn-sm" onclick="deleteInvoice('${inv.id}')">Delete</button></td></tr>`;
});
html += '</tbody></table>';
container.innerHTML = html;
}

function deleteInvoice(id) {
if (!confirm('Delete this invoice?')) return;
StorageService.delete('invoices', id);
logActivity('invoice', `Invoice ${id} deleted`);
showToast('Invoice deleted.', 'info');
renderInvoices();
updateNavBadges();
}

/* ============================================================
RETURNS
============================================================ */
function renderReturns() {
const container = document.getElementById('returnsContent');
const items = DB.returns.sort((a,b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
if (items.length === 0) { container.innerHTML = '<div class="empty-state"><h4>No returns processed</h4><button class="btn btn-primary" onclick="showReturnModal()">+ New Return</button></div>'; return; }
let html = `<div style="margin-bottom:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
<button class="btn btn-primary" onclick="showReturnModal()">+ New Return</button>
<input type="text" id="returnSearch" placeholder="🔍 Search returns..." oninput="renderReturns()" style="padding:8px 12px;border:1px solid var(--border-strong);border-radius:var(--radius);font-size:13px;width:200px;">
</div><table class="data-table"><thead><tr><th>Return Date</th><th>Time</th><th>Receipt</th><th>Customer</th><th>Items</th><th>Total</th><th>Reason</th><th>Condition</th><th>Refunded</th><th>Refund Method</th><th>Refund Code</th><th style="text-align:right;">Actions</th></tr></thead><tbody>`;
const searchTerm = document.getElementById('returnSearch')?.value?.toLowerCase() || '';
let filtered = items;
if (searchTerm) filtered = filtered.filter(r => r.receiptNo.toLowerCase().includes(searchTerm) || r.customer.toLowerCase().includes(searchTerm));
filtered.forEach(r => {
const refundStatus = r.refunded ? '✅ Refunded' : '❌ Not Refunded';
html += `<tr><td>${DateHelper.formatDateShort(r.date)}</td><td>${r.time || '—'}</td><td>${r.receiptNo}</td><td>${r.customer}</td><td>${r.items}</td><td style="color:var(--danger);">${DateHelper.formatKES(r.total)}</td><td>${r.reason}</td><td>${r.condition || '—'}</td><td><span class="badge ${r.refunded ? 'badge-success' : 'badge-danger'}">${refundStatus}</span></td><td>${r.refundMethod || '—'}</td><td>${r.refundCode || '—'}</td><td style="text-align:right;"><button class="btn btn-edit btn-sm" onclick="editReturn('${r.id}')">Edit</button><button class="btn btn-delete btn-sm" onclick="deleteReturn('${r.id}')">Delete</button></td></tr>`;
});
html += '</tbody></table>';
container.innerHTML = html;
}

function editReturn(id) {
const r = DB.returns.find(x => x.id === id);
if (!r) return;
const body = document.getElementById('modalBody');
body.innerHTML = `
<input type="hidden" id="returnId" value="${r.id}">
<div class="form-grid">
<div class="form-group"><label>Return Date</label><input type="date" id="returnDate" value="${r.date}"></div>
<div class="form-group"><label>Return Time</label><input type="time" id="returnTime" value="${r.time}"></div>
<div class="form-group"><label>Reason</label><select id="returnReason"><option value="Customer returned" ${r.reason === 'Customer returned' ? 'selected' : ''}>Customer returned</option><option value="Damaged" ${r.reason === 'Damaged' ? 'selected' : ''}>Damaged</option><option value="Expired" ${r.reason === 'Expired' ? 'selected' : ''}>Expired</option><option value="Wrong item" ${r.reason === 'Wrong item' ? 'selected' : ''}>Wrong item</option></select></div>
<div class="form-group"><label>Condition</label><select id="returnCondition"><option value="Like New" ${r.condition === 'Like New' ? 'selected' : ''}>Like New</option><option value="Good" ${r.condition === 'Good' ? 'selected' : ''}>Good</option><option value="Fair" ${r.condition === 'Fair' ? 'selected' : ''}>Fair</option><option value="Poor" ${r.condition === 'Poor' ? 'selected' : ''}>Poor</option></select></div>
<div class="form-group"><label>Refunded?</label><select id="returnRefunded"><option value="yes" ${r.refunded ? 'selected' : ''}>Yes</option><option value="no" ${!r.refunded ? 'selected' : ''}>No</option></select></div>
<div class="form-group"><label>Refund Method</label><select id="returnRefundMethod"><option value="CASH" ${r.refundMethod === 'CASH' ? 'selected' : ''}>Cash</option><option value="POCHI" ${r.refundMethod === 'POCHI' ? 'selected' : ''}>Pochi (M-Pesa)</option><option value="NCBA BANK" ${r.refundMethod === 'NCBA BANK' ? 'selected' : ''}>NCBA Bank</option><option value="CARD" ${r.refundMethod === 'CARD' ? 'selected' : ''}>Card</option></select></div>
<div class="form-group"><label>Refund Code/Reference</label><input type="text" id="returnRefundCode" value="${r.refundCode || ''}" placeholder="Enter refund reference code"></div>
</div>
<div style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end;"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveReturnEdit()">Update</button></div>
`;
document.getElementById('modalTitle').textContent = 'Edit Return';
document.getElementById('modalOverlay').classList.remove('hidden');
}

function saveReturnEdit() {
const id = document.getElementById('returnId').value;
const r = DB.returns.find(x => x.id === id);
if (!r) return;
r.date = document.getElementById('returnDate').value;
r.time = document.getElementById('returnTime').value;
r.reason = document.getElementById('returnReason').value;
r.condition = document.getElementById('returnCondition').value;
r.refunded = document.getElementById('returnRefunded').value === 'yes';
r.refundMethod = document.getElementById('returnRefundMethod').value;
r.refundCode = document.getElementById('returnRefundCode').value.trim();
StorageService.put('returns', r);
logActivity('return', `Return ${r.id} updated`);
showToast('Return updated successfully.', 'success');
closeModal();
renderReturns();
updateNavBadges();
}

function deleteReturn(id) {
if (!confirm('Delete this return?')) return;
StorageService.delete('returns', id);
logActivity('return', `Return ${id} deleted`);
showToast('Return deleted.', 'info');
renderReturns();
updateNavBadges();
}

function showReturnModal() {
const body = document.getElementById('modalBody');
const sales = DB.sales.map(s => `<option value="${s.id}">SR-${String(s.receiptNumber || '0').padStart(4, '0')} — ${s.customer || 'Walk-in'}</option>`).join('');
body.innerHTML = `
<div class="form-grid">
<div class="form-group"><label>Sales Receipt</label><select id="returnSale" onchange="loadReturnItems()">${sales}</select></div>
<div class="form-group"><label>Return Date</label><input type="date" id="returnDate" value="${DateHelper.today()}"></div>
<div class="form-group"><label>Return Time</label><input type="time" id="returnTime" value="${DateHelper.nowTime()}"></div>
<div class="form-group"><label>Reason</label><select id="returnReason"><option value="Customer returned">Customer returned</option><option value="Damaged">Damaged</option><option value="Expired">Expired</option><option value="Wrong item">Wrong item</option></select></div>
<div class="form-group"><label>Condition</label><select id="returnCondition"><option value="Like New">Like New</option><option value="Good">Good</option><option value="Fair">Fair</option><option value="Poor">Poor</option></select></div>
<div class="form-group"><label>Refunded?</label><select id="returnRefunded"><option value="yes">Yes</option><option value="no">No</option></select></div>
<div class="form-group"><label>Refund Method</label><select id="returnRefundMethod"><option value="CASH">Cash</option><option value="POCHI">Pochi (M-Pesa)</option><option value="NCBA BANK">NCBA Bank</option><option value="CARD">Card</option></select></div>
<div class="form-group"><label>Refund Code/Reference</label><input type="text" id="returnRefundCode" placeholder="Enter refund reference code (optional)"></div>
</div>
<div id="returnItemsContainer" style="margin-top:12px;"></div>
<div style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end;"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveReturn()">Process Return</button></div>
`;
document.getElementById('modalTitle').textContent = 'New Return';
document.getElementById('modalOverlay').classList.remove('hidden');
loadReturnItems();
}

function loadReturnItems() {
const saleId = document.getElementById('returnSale').value;
const container = document.getElementById('returnItemsContainer');
if (!saleId) { container.innerHTML = ''; return; }
const sale = DB.sales.find(s => s.id === saleId);
if (!sale) { container.innerHTML = ''; return; }
let html = '<div style="font-size:13px;font-weight:600;margin-bottom:8px;">Select items to return:</div>';
(sale.lines || []).forEach((line, i) => {
html += `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);font-size:13px;">
<input type="checkbox" id="retItem_${i}" checked>
<label for="retItem_${i}">${line.productName} × ${line.qty} — ${DateHelper.formatKES(line.amount)}</label>
<input type="number" id="retQty_${i}" value="${line.qty}" min="1" max="${line.qty}" style="width:60px;padding:4px 8px;border:1px solid var(--border);border-radius:4px;font-size:12px;margin-left:auto;">
</div>`;
});
container.innerHTML = html;
}

function saveReturn() {
const saleId = document.getElementById('returnSale').value;
const date = document.getElementById('returnDate').value;
const time = document.getElementById('returnTime').value;
const reason = document.getElementById('returnReason').value;
const condition = document.getElementById('returnCondition').value;
const refunded = document.getElementById('returnRefunded').value === 'yes';
const refundMethod = document.getElementById('returnRefundMethod').value;
const refundCode = document.getElementById('returnRefundCode').value.trim();
if (!saleId) { showToast('Please select a sale.', 'error'); return; }
const sale = DB.sales.find(s => s.id === saleId);
if (!sale) { showToast('Sale not found.', 'error'); return; }
const returnItems = [];
let total = 0;
(sale.lines || []).forEach((line, i) => {
const cb = document.getElementById(`retItem_${i}`);
const qtyEl = document.getElementById(`retQty_${i}`);
if (cb && cb.checked && qtyEl) {
const qty = parseInt(qtyEl.value) || 0;
if (qty > 0) {
returnItems.push({ productId: line.productId, productName: line.productName, qty, rate: line.rate, amount: qty * line.rate });
total += qty * line.rate;
const med = DB.inventory.find(m => m.id === line.productId);
if (med) { med.qty += qty; StorageService.put('inventory', med); }
}
}
});
if (returnItems.length === 0) { showToast('No items selected for return.', 'error'); return; }
const ret = { id: genId('ret_'), date, time, saleId, receiptNo: `SR-${String(sale.receiptNumber || '0').padStart(4, '0')}`, customer: sale.customer || 'Walk-in', items: returnItems.map(i => i.productName).join(', '), total, reason, condition, refunded, refundMethod, refundCode, createdAt: new Date().toISOString() };
StorageService.put('returns', ret);
logActivity('return', `Return processed for ${ret.receiptNo} — ${DateHelper.formatKES(total)}`);
showToast(`Return processed. ${returnItems.length} items restored to stock.`, 'success');
closeModal();
renderReturns();
updateNavBadges();
}

/* ============================================================
EXPENSES
============================================================ */
function renderExpenses() {
const container = document.getElementById('expensesContent');
const timeFilter = document.getElementById('expensesTimeFilter')?.value || 'all';
const dateFrom = document.getElementById('expensesDateFrom')?.value;
const dateTo = document.getElementById('expensesDateTo')?.value;
let range = DateHelper.getRange(timeFilter, dateFrom, dateTo);
let items = DB.expenses.filter(e => e.date >= range.from && e.date <= range.to);
if (items.length === 0) { container.innerHTML = '<div class="empty-state"><h4>No expenses recorded</h4><button class="btn btn-primary" onclick="showExpenseModal()">+ Add Expense</button></div>'; return; }
let total = 0;
let html = `<div style="margin-bottom:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
<button class="btn btn-primary" onclick="showExpenseModal()">+ Add Expense</button>
<input type="text" id="expenseSearch" placeholder="🔍 Search expenses..." oninput="renderExpenses()" style="padding:8px 12px;border:1px solid var(--border-strong);border-radius:var(--radius);font-size:13px;width:200px;">
</div><table class="data-table"><thead><tr><th>Date</th><th>Time</th><th>Category</th><th>Description</th><th>Amount</th><th>Payment</th><th>TX Code</th><th style="text-align:right;">Actions</th></tr></thead><tbody>`;
const searchTerm = document.getElementById('expenseSearch')?.value?.toLowerCase() || '';
if (searchTerm) items = items.filter(e => e.description.toLowerCase().includes(searchTerm) || e.category.toLowerCase().includes(searchTerm));
items.forEach(e => {
total += e.amount;
const timeStr = e.createdAt ? new Date(e.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—';
html += `<tr><td>${DateHelper.formatDateShort(e.date)}</td><td>${timeStr}</td><td><span class="badge badge-neutral">${e.category}</span></td><td>${e.description}</td><td style="font-weight:600;color:var(--danger);">${DateHelper.formatKES(e.amount)}</td><td>${e.payment}</td><td>${e.txCode || '—'}</td><td style="text-align:right;"><button class="btn btn-edit btn-sm" onclick="editExpense('${e.id}')">Edit</button><button class="btn btn-delete btn-sm" onclick="deleteExpense('${e.id}')">Delete</button></td></tr>`;
});
html += `</tbody></table><div class="table-footer"><span>Total Expenses</span><span class="total-amount expense">${DateHelper.formatKES(total)}</span></div>`;
container.innerHTML = html;
}

function editExpense(id) {
const e = DB.expenses.find(x => x.id === id);
if (!e) return;
const body = document.getElementById('modalBody');
body.innerHTML = `
<input type="hidden" id="expenseId" value="${e.id}">
<div class="form-grid">
<div class="form-group"><label>Date</label><input type="date" id="expDate" value="${e.date}"></div>
<div class="form-group"><label>Category</label><select id="expCategory"><option value="Rent" ${e.category === 'Rent' ? 'selected' : ''}>Rent</option><option value="Electricity" ${e.category === 'Electricity' ? 'selected' : ''}>Electricity</option><option value="Salaries" ${e.category === 'Salaries' ? 'selected' : ''}>Salaries</option><option value="Internet" ${e.category === 'Internet' ? 'selected' : ''}>Internet</option><option value="Supplies" ${e.category === 'Supplies' ? 'selected' : ''}>Supplies</option><option value="Transport" ${e.category === 'Transport' ? 'selected' : ''}>Transport</option><option value="Miscellaneous" ${e.category === 'Miscellaneous' ? 'selected' : ''}>Miscellaneous</option></select></div>
<div class="form-group"><label>Description</label><input type="text" id="expDesc" value="${e.description}"></div>
<div class="form-group"><label>Amount (KES)</label><input type="number" id="expAmount" value="${e.amount}" min="0" step="0.01"></div>
<div class="form-group"><label>Payment Method</label><select id="expPayment"><option value="CASH" ${e.payment === 'CASH' ? 'selected' : ''}>Cash</option><option value="NCBA BANK" ${e.payment === 'NCBA BANK' ? 'selected' : ''}>NCBA Bank</option><option value="POCHI" ${e.payment === 'POCHI' ? 'selected' : ''}>Pochi (M-Pesa)</option></select></div>
<div class="form-group"><label>TX Code</label><input type="text" id="expTxCode" value="${e.txCode || ''}"></div>
</div>
<div style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end;"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveExpenseEdit()">Update</button></div>
`;
document.getElementById('modalTitle').textContent = 'Edit Expense';
document.getElementById('modalOverlay').classList.remove('hidden');
}

function saveExpenseEdit() {
const id = document.getElementById('expenseId').value;
const e = DB.expenses.find(x => x.id === id);
if (!e) return;
e.date = document.getElementById('expDate').value;
e.category = document.getElementById('expCategory').value;
e.description = document.getElementById('expDesc').value.trim();
e.amount = parseFloat(document.getElementById('expAmount').value);
e.payment = document.getElementById('expPayment').value;
e.txCode = document.getElementById('expTxCode').value.trim();
if (!e.date || !e.description || !e.amount) { showToast('Please fill all required fields.', 'error'); return; }
if (e.payment !== 'CASH' && !e.txCode) { showToast('Please enter a transaction code for non-cash payments.', 'error'); return; }
StorageService.put('expenses', e);
logActivity('expense', `Expense ${e.id} updated`);
showToast('Expense updated successfully.', 'success');
closeModal();
renderExpenses();
updateNavBadges();
}

function deleteExpense(id) {
if (!confirm('Delete this expense?')) return;
StorageService.delete('expenses', id);
logActivity('expense', `Expense deleted`);
showToast('Expense deleted.', 'info');
renderExpenses();
updateNavBadges();
}
function showExpenseModal(data) {
const body = document.getElementById('modalBody');
const d = data || {};
body.innerHTML = `
<input type="hidden" id="expenseId" value="${d.id || ''}">
<div class="form-grid">
<div class="form-group"><label>Date</label><input type="date" id="expDate" value="${d.date || DateHelper.today()}"></div>
<div class="form-group"><label>Category</label><select id="expCategory"><option value="Rent" ${d.category === 'Rent' ? 'selected' : ''}>Rent</option><option value="Electricity" ${d.category === 'Electricity' ? 'selected' : ''}>Electricity</option><option value="Salaries" ${d.category === 'Salaries' ? 'selected' : ''}>Salaries</option><option value="Internet" ${d.category === 'Internet' ? 'selected' : ''}>Internet</option><option value="Supplies" ${d.category === 'Supplies' ? 'selected' : ''}>Supplies</option><option value="Transport" ${d.category === 'Transport' ? 'selected' : ''}>Transport</option><option value="Miscellaneous" ${d.category === 'Miscellaneous' ? 'selected' : ''}>Miscellaneous</option></select></div>
<div class="form-group"><label>Description</label><input type="text" id="expDesc" value="${d.description || ''}" placeholder="What was this for?"></div>
<div class="form-group"><label>Amount (KES)</label><input type="number" id="expAmount" value="${d.amount || ''}" min="0" step="0.01" placeholder="1000.00"></div>
<div class="form-group"><label>Payment Method</label><select id="expPayment"><option value="CASH" ${d.payment === 'CASH' ? 'selected' : ''}>Cash</option><option value="NCBA BANK" ${d.payment === 'NCBA BANK' ? 'selected' : ''}>NCBA Bank</option><option value="POCHI" ${d.payment === 'POCHI' ? 'selected' : ''}>Pochi (M-Pesa)</option></select></div>
<div class="form-group"><label>TX Code</label><input type="text" id="expTxCode" value="${d.txCode || ''}" placeholder="Transaction code"></div>
</div>
<div style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end;"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveExpense()">Save</button></div>
`;
document.getElementById('modalTitle').textContent = data ? 'Edit Expense' : 'Add Expense';
document.getElementById('modalOverlay').classList.remove('hidden');
}
function saveExpense() {
const id = document.getElementById('expenseId').value;
const date = document.getElementById('expDate').value;
const category = document.getElementById('expCategory').value;
const description = document.getElementById('expDesc').value.trim();
const amount = parseFloat(document.getElementById('expAmount').value);
const payment = document.getElementById('expPayment').value;
const txCode = document.getElementById('expTxCode').value.trim();
if (!date || !description || !amount) { showToast('Please fill all required fields.', 'error'); return; }
if (payment !== 'CASH' && !txCode) { showToast('Please enter a transaction code for non-cash payments.', 'error'); return; }
const data = { id: id || genId('exp_'), date, category, description, amount, payment, txCode: payment === 'CASH' ? '' : txCode, createdAt: id ? undefined : new Date().toISOString() };
StorageService.put('expenses', data);
logActivity('expense', `Expense ${id ? 'updated' : 'added'}: ${description} — ${DateHelper.formatKES(amount)}`);
showToast(`Expense ${id ? 'updated' : 'added'} successfully.`, 'success');
closeModal();
renderExpenses();
updateNavBadges();
}

/* ============================================================
PAYMENTS
============================================================ */
function renderPayments() {
const container = document.getElementById('paymentsContent');
const items = DB.payments;
if (items.length === 0) { container.innerHTML = '<div class="empty-state"><h4>No payments recorded</h4><button class="btn btn-primary" onclick="showPaymentModal()">+ New Payment</button></div>'; return; }
let html = `<div style="margin-bottom:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
<button class="btn btn-primary" onclick="showPaymentModal()">+ New Payment</button>
<input type="text" id="paymentSearch" placeholder="🔍 Search payments..." oninput="renderPayments()" style="padding:8px 12px;border:1px solid var(--border-strong);border-radius:var(--radius);font-size:13px;width:200px;">
</div><table class="data-table"><thead><tr><th>Date</th><th>Time</th><th>Supplier</th><th>Amount</th><th>Method</th><th>Reference</th><th style="text-align:right;">Actions</th></tr></thead><tbody>`;
const searchTerm = document.getElementById('paymentSearch')?.value?.toLowerCase() || '';
let filtered = items;
if (searchTerm) filtered = filtered.filter(p => p.supplier.toLowerCase().includes(searchTerm));
filtered.forEach(p => {
const timeStr = p.createdAt ? new Date(p.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—';
html += `<tr><td>${DateHelper.formatDateShort(p.date)}</td><td>${timeStr}</td><td>${p.supplier}</td><td style="font-weight:600;color:var(--danger);">${DateHelper.formatKES(p.amount)}</td><td>${p.method}</td><td>${p.reference || '—'}</td><td style="text-align:right;"><button class="btn btn-edit btn-sm" onclick="editPayment('${p.id}')">Edit</button><button class="btn btn-delete btn-sm" onclick="deletePayment('${p.id}')">Delete</button></td></tr>`;
});
html += '</tbody></table>';
container.innerHTML = html;
}

function editPayment(id) {
const p = DB.payments.find(x => x.id === id);
if (!p) return;
const body = document.getElementById('modalBody');
body.innerHTML = `
<input type="hidden" id="paymentId" value="${p.id}">
<div class="form-grid">
<div class="form-group"><label>Date</label><input type="date" id="payDate" value="${p.date}"></div>
<div class="form-group"><label>Supplier</label><select id="paySupplier">${DB.suppliers.map(s => `<option value="${s.name}" ${s.name === p.supplier ? 'selected' : ''}>${s.name}</option>`).join('')}</select></div>
<div class="form-group"><label>Amount (KES)</label><input type="number" id="payAmount" min="0" step="0.01" value="${p.amount}"></div>
<div class="form-group"><label>Method</label><select id="payMethod"><option value="CASH" ${p.method === 'CASH' ? 'selected' : ''}>Cash</option><option value="NCBA BANK" ${p.method === 'NCBA BANK' ? 'selected' : ''}>NCBA Bank</option><option value="POCHI" ${p.method === 'POCHI' ? 'selected' : ''}>Pochi (M-Pesa)</option></select></div>
<div class="form-group"><label>Reference</label><input type="text" id="payReference" value="${p.reference || ''}"></div>
</div>
<div style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end;"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="savePaymentEdit()">Update</button></div>
`;
document.getElementById('modalTitle').textContent = 'Edit Payment';
document.getElementById('modalOverlay').classList.remove('hidden');
}

function savePaymentEdit() {
const id = document.getElementById('paymentId').value;
const p = DB.payments.find(x => x.id === id);
if (!p) return;
p.date = document.getElementById('payDate').value;
p.supplier = document.getElementById('paySupplier').value;
p.amount = parseFloat(document.getElementById('payAmount').value);
p.method = document.getElementById('payMethod').value;
p.reference = document.getElementById('payReference').value.trim();
if (!p.date || !p.supplier || !p.amount) { showToast('Please fill all fields.', 'error'); return; }
if (p.method !== 'CASH' && !p.reference) { showToast('Please enter a reference for non-cash payments.', 'error'); return; }
StorageService.put('payments', p);
logActivity('payment', `Payment ${p.id} updated`);
showToast('Payment updated successfully.', 'success');
closeModal();
renderPayments();
renderCashBook();
updateNavBadges();
}

function deletePayment(id) {
if (!confirm('Delete this payment?')) return;
StorageService.delete('payments', id);
logActivity('payment', `Payment ${id} deleted`);
showToast('Payment deleted.', 'info');
renderPayments();
renderCashBook();
updateNavBadges();
}

function showPaymentModal() {
const body = document.getElementById('modalBody');
const suppliers = DB.suppliers.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
body.innerHTML = `
<div class="form-grid">
<div class="form-group"><label>Date</label><input type="date" id="payDate" value="${DateHelper.today()}"></div>
<div class="form-group"><label>Supplier</label><select id="paySupplier">${suppliers}</select></div>
<div class="form-group"><label>Amount (KES)</label><input type="number" id="payAmount" min="0" step="0.01" placeholder="5000.00"></div>
<div class="form-group"><label>Method</label><select id="payMethod"><option value="CASH">Cash</option><option value="NCBA BANK">NCBA Bank</option><option value="POCHI">Pochi (M-Pesa)</option></select></div>
<div class="form-group"><label>Reference</label><input type="text" id="payReference" placeholder="Transaction reference"></div>
</div>
<div style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end;"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="savePayment()">Save</button></div>
`;
document.getElementById('modalTitle').textContent = 'New Payment';
document.getElementById('modalOverlay').classList.remove('hidden');
}
function savePayment() {
const date = document.getElementById('payDate').value;
const supplier = document.getElementById('paySupplier').value;
const amount = parseFloat(document.getElementById('payAmount').value);
const method = document.getElementById('payMethod').value;
const reference = document.getElementById('payReference').value.trim();
if (!date || !supplier || !amount) { showToast('Please fill all fields.', 'error'); return; }
if (method !== 'CASH' && !reference) { showToast('Please enter a reference for non-cash payments.', 'error'); return; }
const payment = { id: genId('pay_'), date, supplier, amount, method, reference, createdAt: new Date().toISOString() };
StorageService.put('payments', payment);
logActivity('payment', `Payment to ${supplier} of ${DateHelper.formatKES(amount)}`);
showToast(`Payment of ${DateHelper.formatKES(amount)} to ${supplier} recorded.`, 'success');
closeModal();
renderPayments();
renderCashBook();
updateNavBadges();
}

/* ============================================================
CASH BOOK - Enhanced with drill-down capabilities
============================================================ */
function renderCashBook() {
const container = document.getElementById('cashbookContent');
const timeFilter = document.getElementById('cashbookTimeFilter')?.value || 'all';
const dateFrom = document.getElementById('cashbookDateFrom')?.value;
const dateTo = document.getElementById('cashbookDateTo')?.value;
let range = DateHelper.getRange(timeFilter, dateFrom, dateTo);
const cashSales = DB.sales.filter(s => (s.payment === 'CASH' || s.paymentMethod === 'CASH') && s.date >= range.from && s.date <= range.to);
const cashExpenses = DB.expenses.filter(e => e.payment === 'CASH' && e.date >= range.from && e.date <= range.to);
const cashPayments = DB.payments.filter(p => p.method === 'CASH' && p.date >= range.from && p.date <= range.to);
const items = [
...cashSales.map(s => ({ date: s.date, type: 'Sale', description: `SR-${String(s.receiptNumber || '0').padStart(4, '0')} — ${s.customer || 'Walk-in'}`, amount: s.total, inflow: true, id: s.id, panel: 'sales' })),
...cashExpenses.map(e => ({ date: e.date, type: 'Expense', description: e.description, amount: e.amount, inflow: false, id: e.id, panel: 'expenses' })),
...cashPayments.map(p => ({ date: p.date, type: 'Payment', description: `Payment to ${p.supplier}`, amount: p.amount, inflow: false, id: p.id, panel: 'payments' }))
];
items.sort((a,b) => b.date.localeCompare(a.date));
if (items.length === 0) { container.innerHTML = '<div class="empty-state"><h4>No cash transactions in the selected time range</h4></div>'; return; }
let totalIn = 0, totalOut = 0, balance = 0;
let html = `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:16px;">
<div style="background:var(--surface-alt);padding:16px;border-radius:var(--radius);text-align:center;"><div style="font-size:12px;color:var(--text-muted);">Cash Inflow</div><div style="font-size:24px;font-weight:700;color:var(--success);">${DateHelper.formatKSh(0)}</div></div>
<div style="background:var(--surface-alt);padding:16px;border-radius:var(--radius);text-align:center;"><div style="font-size:12px;color:var(--text-muted);">Cash Outflow</div><div style="font-size:24px;font-weight:700;color:var(--danger);">${DateHelper.formatKSh(0)}</div></div>
<div style="background:var(--surface-alt);padding:16px;border-radius:var(--radius);text-align:center;"><div style="font-size:12px;color:var(--text-muted);">Net Cash Balance</div><div style="font-size:24px;font-weight:700;color:var(--brand);">${DateHelper.formatKSh(0)}</div></div>
</div>
<table class="data-table"><thead><tr><th>Date</th><th>Type</th><th>Description</th><th>Inflow</th><th>Outflow</th><th>Balance</th></tr></thead><tbody>`;
items.forEach(item => {
if (item.inflow) totalIn += item.amount; else totalOut += item.amount;
balance = totalIn - totalOut;
html += `<tr onclick="drillDownCashBook('${item.panel}', '${item.id}')" style="cursor:pointer;">
<td>${DateHelper.formatDateShort(item.date)}</td>
<td><span class="badge ${item.inflow ? 'badge-success' : 'badge-danger'}">${item.type}</span></td>
<td>${item.description}</td>
<td style="${item.inflow ? 'color:var(--success);font-weight:600;' : ''}">${item.inflow ? DateHelper.formatKSh(item.amount) : ''}</td>
<td style="${!item.inflow ? 'color:var(--danger);font-weight:600;' : ''}">${!item.inflow ? DateHelper.formatKSh(item.amount) : ''}</td>
<td style="font-weight:600;${balance >= 0 ? 'color:var(--success)' : 'color:var(--danger)'}">${DateHelper.formatKSh(balance)}</td>
</tr>`;
});
html += `</tbody></table>
<div class="table-footer" style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;">
<span>Total Inflow: <span style="color:var(--success);font-weight:700;">${DateHelper.formatKSh(totalIn)}</span></span>
<span>Total Outflow: <span style="color:var(--danger);font-weight:700;">${DateHelper.formatKSh(totalOut)}</span></span>
<span>Net Balance: <span style="font-weight:700;${totalIn - totalOut >= 0 ? 'color:var(--success)' : 'color:var(--danger)'}">${DateHelper.formatKSh(totalIn - totalOut)}</span></span>
</div>
<div style="margin-top:12px;font-size:12px;color:var(--text-muted);text-align:center;">Click any row to view the original transaction details</div>`;
container.innerHTML = html;
}

function drillDownCashBook(panel, id) {
if (panel === 'sales') {
const sale = DB.sales.find(s => s.id === id);
if (sale) {
viewSaleReceipt(sale.id);
}
} else if (panel === 'expenses') {
navigate('expenses');
// Highlight the expense row (implemented via search)
const searchInput = document.getElementById('expenseSearch');
if (searchInput) {
// Find the expense and filter by description or ID
const expense = DB.expenses.find(e => e.id === id);
if (expense) {
searchInput.value = expense.description;
renderExpenses();
}
}
} else if (panel === 'payments') {
navigate('payments');
// Highlight the payment row (implemented via search)
const searchInput = document.getElementById('paymentSearch');
if (searchInput) {
const payment = DB.payments.find(p => p.id === id);
if (payment) {
searchInput.value = payment.supplier;
renderPayments();
}
}
}
showToast(`Viewing details for the selected transaction.`, 'info');
}

/* ============================================================
BANK ACCOUNTS - Fully Active
============================================================ */
function renderBankAccounts() {
const container = document.getElementById('bankaccountsContent');
const items = DB.bankAccounts;
if (items.length === 0) { container.innerHTML = '<div class="empty-state"><h4>No bank accounts</h4><button class="btn btn-primary" onclick="showBankAccountModal()">+ Add Account</button></div>'; return; }
let html = `<div style="margin-bottom:12px;"><button class="btn btn-primary" onclick="showBankAccountModal()">+ Add Account</button></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;">`;
items.forEach(acc => {
html += `<div style="background:var(--surface-alt);border:1px solid var(--border);border-radius:var(--radius-lg);padding:16px;">
<div style="display:flex;justify-content:space-between;align-items:center;"><strong>${acc.name}</strong><div><button class="btn btn-edit btn-sm" onclick="editBankAccount('${acc.id}')">Edit</button><button class="btn btn-delete btn-sm" onclick="deleteBankAccount('${acc.id}')">Delete</button></div></div>
<div style="font-size:12px;color:var(--text-muted);">${acc.accountNo || ''}</div>
<div style="font-size:12px;color:var(--text-muted);">${acc.bank || ''}</div>
<div style="margin-top:8px;font-size:13px;">Balance: <strong>${DateHelper.formatKES(acc.balance || 0)}</strong></div>
</div>`;
});
html += '</div>';
container.innerHTML = html;
}

function showBankAccountModal(data) {
const body = document.getElementById('modalBody');
const d = data || {};
body.innerHTML = `
<input type="hidden" id="bankId" value="${d.id || ''}">
<div class="form-grid">
<div class="form-group"><label>Account Name *</label><input type="text" id="bankAccName" value="${d.name || ''}" placeholder="e.g. NCBA Business Account"></div>
<div class="form-group"><label>Bank Name</label><input type="text" id="bankAccBank" value="${d.bank || ''}" placeholder="e.g. NCBA Bank"></div>
<div class="form-group"><label>Account Number</label><input type="text" id="bankAccNo" value="${d.accountNo || ''}" placeholder="Account number"></div>
<div class="form-group"><label>Initial Balance</label><input type="number" id="bankAccBalance" min="0" step="0.01" value="${d.balance || 0}" placeholder="0.00"></div>
</div>
<div style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end;"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveBankAccount()">Save</button></div>
`;
document.getElementById('modalTitle').textContent = data ? 'Edit Bank Account' : 'Add Bank Account';
document.getElementById('modalOverlay').classList.remove('hidden');
}

function saveBankAccount() {
const id = document.getElementById('bankId').value;
const name = document.getElementById('bankAccName').value.trim();
const bank = document.getElementById('bankAccBank').value.trim();
const accountNo = document.getElementById('bankAccNo').value.trim();
const balance = parseFloat(document.getElementById('bankAccBalance').value) || 0;
if (!name) { showToast('Please enter account name.', 'error'); return; }
const acc = { id: id || genId('bank_'), name, bank, accountNo, balance, createdAt: id ? undefined : new Date().toISOString() };
StorageService.put('bankAccounts', acc);
logActivity('bank', `Bank account ${id ? 'updated' : 'added'}: ${name}`);
showToast('Bank account saved successfully.', 'success');
closeModal();
renderBankAccounts();
updateNavBadges();
}

function editBankAccount(id) {
const acc = DB.bankAccounts.find(x => x.id === id);
if (acc) showBankAccountModal(acc);
}

function deleteBankAccount(id) {
if (!confirm('Delete this bank account?')) return;
StorageService.delete('bankAccounts', id);
logActivity('bank', `Bank account deleted: ${id}`);
showToast('Bank account deleted.', 'info');
renderBankAccounts();
updateNavBadges();
}

/* ============================================================
RECEIPT VIEW
============================================================ */
let currentReceiptSaleId = null;
function viewSaleReceipt(id) { currentReceiptSaleId = id; navigate('receipt'); }
function printSaleReceipt(id) { currentReceiptSaleId = id; renderReceiptContent(id); setTimeout(() => window.print(), 300); }
function renderReceiptPanel() {
if (currentReceiptSaleId) renderReceiptContent(currentReceiptSaleId);
else { const body = document.getElementById('receiptViewBody'); if (body) body.innerHTML = '<div class="empty-state"><h4>No receipt selected</h4><p>Select a sale from Sales History to view its receipt.</p></div>'; }
}
function renderReceiptContent(saleId) {
const sale = DB.sales.find(s => s.id === saleId);
if (!sale) return;
const body = document.getElementById('receiptViewBody');
if (!body) return;
const receiptNo = `SR-${String(sale.receiptNumber || '0').padStart(4, '0')}`;
const customer = sale.customer || 'Walk-in Customer';
const date = DateHelper.formatDateDisplay(sale.date);
const payment = sale.paymentMethod || sale.payment || 'CASH';
const reference = sale.reference || sale.txCode || '—';
const message = sale.message || '';
const lines = sale.lines || [];
const total = sale.total || 0;
const pharmacyName = currentUser ? currentUser.name : 'PharmTrack Pro';
let linesHtml = '';
lines.forEach((line, idx) => {
linesHtml += `<tr><td style="padding:12px;font-size:13px;border-bottom:1px solid var(--border);color:var(--text-secondary);">${idx + 1}</td><td style="padding:12px;font-size:13px;border-bottom:1px solid var(--border);color:var(--text-secondary);">${line.serviceDate || sale.date}</td><td style="padding:12px;font-size:13px;border-bottom:1px solid var(--border);color:var(--text-secondary);"><div style="font-weight:600;color:var(--text);">${line.productName}</div>${line.productBrand ? `<div style="font-size:11px;color:var(--text-faint);">${line.productBrand}</div>` : ''}</td><td style="padding:12px;font-size:13px;border-bottom:1px solid var(--border);color:var(--text-secondary);">${line.description || ''}</td><td style="padding:12px;font-size:13px;border-bottom:1px solid var(--border);color:var(--text-muted);text-align:center;">${line.qty}</td><td style="padding:12px;font-size:13px;border-bottom:1px solid var(--border);color:var(--text-secondary);text-align:right;font-variant-numeric:tabular-nums;">${DateHelper.formatKSh(line.rate)}</td><td style="padding:12px;font-size:13px;border-bottom:1px solid var(--border);color:var(--text-secondary);text-align:right;font-weight:600;font-variant-numeric:tabular-nums;">${DateHelper.formatKSh(line.amount)}</td></tr>`;
});
body.innerHTML = `
<div style="text-align:center;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid var(--border);">
<div style="width:56px;height:56px;background:linear-gradient(135deg, var(--brand), var(--brand-dark));border-radius:12px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:28px;height:28px;color:#fff;"><path d="M8 2v4"/><path d="M16 2v4"/><path d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8"/><path d="M3 10h18"/></svg></div>
<div style="font-size:22px;font-weight:800;color:var(--text);letter-spacing:-.02em;">${pharmacyName}</div>
<div style="font-size:12px;color:var(--text-muted);margin-top:4px;">Enterprise Pharmacy Management System</div>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:32px;">
<div><h4 style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);margin-bottom:8px;">Customer Details</h4><p style="font-size:13px;font-weight:600;color:var(--text);">${customer}</p></div>
<div><h4 style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);margin-bottom:8px;">Receipt Details</h4><p style="font-size:11px;color:var(--text-muted);">Sales Receipt No.</p><p style="font-size:13px;font-weight:600;color:var(--text);">${receiptNo}</p><p style="font-size:11px;color:var(--text-muted);margin-top:8px;">Date</p><p style="font-size:13px;font-weight:600;color:var(--text);">${date}</p><p style="font-size:11px;color:var(--text-muted);margin-top:8px;">Payment Method</p><p style="font-size:13px;font-weight:600;color:var(--text);">${payment}</p><p style="font-size:11px;color:var(--text-muted);margin-top:8px;">Reference Number</p><p style="font-size:13px;font-weight:600;color:var(--text);">${reference}</p></div>
</div>
<table style="width:100%;border-collapse:collapse;margin-bottom:24px;"><thead><tr><th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted);border-bottom:2px solid var(--border);background:var(--surface-alt);width:40px;">#</th><th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted);border-bottom:2px solid var(--border);background:var(--surface-alt);">SERVICE DATE</th><th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted);border-bottom:2px solid var(--border);background:var(--surface-alt);">PRODUCT/SERVICE</th><th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted);border-bottom:2px solid var(--border);background:var(--surface-alt);">DESCRIPTION</th><th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted);border-bottom:2px solid var(--border);background:var(--surface-alt);width:80px;">QTY</th><th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted);border-bottom:2px solid var(--border);background:var(--surface-alt);width:110px;">RATE</th><th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted);border-bottom:2px solid var(--border);background:var(--surface-alt);width:120px;">AMOUNT</th></tr></thead><tbody>${linesHtml}</tbody></table>
<div style="display:flex;justify-content:flex-end;margin-bottom:32px;"><div style="width:280px;"><div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px;color:var(--text-secondary);"><span style="font-weight:500;">Subtotal</span><span style="font-weight:600;font-variant-numeric:tabular-nums;">${DateHelper.formatKSh(sale.subtotal || total)}</span></div><div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px;color:var(--text-secondary);"><span style="font-weight:500;">Tax (0%)</span><span style="font-weight:600;font-variant-numeric:tabular-nums;">${DateHelper.formatKSh(sale.tax || 0)}</span></div><div style="display:flex;justify-content:space-between;border-top:2px solid var(--border);padding-top:12px;margin-top:8px;font-size:16px;"><span style="font-weight:700;color:var(--text);">Total</span><span style="font-weight:800;color:var(--brand);font-size:18px;font-variant-numeric:tabular-nums;">${DateHelper.formatKSh(total)}</span></div></div></div>
<div style="background:var(--success-bg);border:1px solid var(--success);border-radius:var(--radius);padding:16px 20px;margin-bottom:32px;"><div style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--success);margin-bottom:8px;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><polyline points="20 6 9 17 4 12"/></svg>Payment Confirmed</div><div style="font-size:12px;color:var(--text-secondary);line-height:1.6;"><strong>Method:</strong> ${payment}<br><strong>Amount Paid:</strong> ${DateHelper.formatKSh(total)}<br><strong>Reference:</strong> ${reference}</div></div>
${message ? `<div style="background:var(--surface-alt);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:24px;font-size:13px;color:var(--text-secondary);white-space:pre-wrap;">${message}</div>` : ''}
<div style="text-align:center;padding-top:24px;border-top:1px dashed var(--border);"><p style="font-size:14px;font-weight:600;color:var(--text);margin-bottom:8px;">Thank you for your purchase!</p><p style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">PharmTrack Pro © 2026 — All rights reserved.</p></div>
`;
}
function printReceipt() { if (currentReceiptSaleId) window.print(); else showToast('No receipt to print', 'info'); }
function attachToReceipt() { document.getElementById('attachmentInput').click(); }
function handleAttachment(event) {
const file = event.target.files[0];
if (!file) return;
if (!currentReceiptSaleId) { showToast('No receipt selected', 'info'); return; }
const sale = DB.sales.find(s => s.id === currentReceiptSaleId);
if (!sale) return;
if (!sale.attachments) sale.attachments = [];
sale.attachments.push({ name: file.name, size: file.size, date: new Date().toISOString() });
StorageService.put('sales', sale);
showToast(`Attachment "${file.name}" added to receipt.`, 'success');
event.target.value = '';
}

/* ============================================================
PATIENTS
============================================================ */
function renderPatients() {
const container = document.getElementById('patientsContent');
const items = DB.patients;
if (items.length === 0) { container.innerHTML = '<div class="empty-state"><h4>No patients</h4><button class="btn btn-primary" onclick="showPatientModal()">+ Add Patient</button></div>'; return; }
let html = `<div style="margin-bottom:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
<button class="btn btn-primary" onclick="showPatientModal()">+ Add Patient</button>
<input type="text" id="patientSearch" placeholder="🔍 Search patients..." oninput="renderPatients()" style="padding:8px 12px;border:1px solid var(--border-strong);border-radius:var(--radius);font-size:13px;width:200px;">
</div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;">`;
const searchTerm = document.getElementById('patientSearch')?.value?.toLowerCase() || '';
let filtered = items;
if (searchTerm) filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm) || p.phone.includes(searchTerm));
filtered.forEach(p => {
html += `<div style="background:var(--surface-alt);border:1px solid var(--border);border-radius:var(--radius-lg);padding:16px;">
<div style="display:flex;justify-content:space-between;align-items:center;"><strong>${p.name}</strong><div><button class="btn btn-edit btn-sm" onclick="editPatient('${p.id}')">Edit</button><button class="btn btn-delete btn-sm" onclick="deletePatient('${p.id}')">Delete</button></div></div>
<div style="font-size:12px;color:var(--text-muted);">${p.phone || ''} ${p.email ? '| '+p.email : ''}</div>
<div style="font-size:12px;color:var(--text-muted);">${p.gender || ''} ${p.dob ? '| DOB: '+DateHelper.formatDateDisplay(p.dob) : ''}</div>
<div style="font-size:12px;color:var(--text-muted);">${p.address || ''}</div>
${p.comorbidities && p.comorbidities.length > 0 ? `<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px;">${p.comorbidities.map(c => `<span class="badge badge-info">${c}</span>`).join('')}</div>` : ''}
<div style="font-size:11px;color:var(--text-muted);margin-top:8px;">Last visit: ${p.lastVisit ? DateHelper.formatDateDisplay(p.lastVisit) : '—'}</div>
<div style="margin-top:8px;display:flex;gap:8px;">
<button class="btn btn-secondary btn-sm" onclick="viewPatientPrescriptions('${p.id}')">📋 View Prescriptions</button>
<button class="btn btn-secondary btn-sm" onclick="navigate('prescriptions')">+ New Prescription</button>
</div>
</div>`;
});
html += '</div>';
container.innerHTML = html;
}

function viewPatientPrescriptions(id) {
const patient = DB.patients.find(p => p.id === id);
if (!patient) return;
const prescriptions = DB.prescriptions.filter(p => p.patientId === id).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
let html = `<h3 style="margin-bottom:16px;">${patient.name} - Prescription History</h3>
<div style="background:var(--surface-alt);padding:12px;border-radius:var(--radius);margin-bottom:16px;">
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px;">
<div><strong>Phone:</strong> ${patient.phone}</div>
<div><strong>Email:</strong> ${patient.email || '—'}</div>
<div><strong>Gender:</strong> ${patient.gender || '—'}</div>
<div><strong>DOB:</strong> ${patient.dob ? DateHelper.formatDateDisplay(patient.dob) : '—'}</div>
</div>
</div>
<table class="data-table"><thead><tr><th>Date</th><th>Medicines</th><th>Doctor</th><th>Status</th></tr></thead><tbody>`;
if (prescriptions.length === 0) html += '<tr><td colspan="4" style="text-align:center;padding:20px;">No prescriptions found.</td></tr>';
else prescriptions.forEach(rx => {
html += `<tr><td>${DateHelper.formatDateShort(rx.date)}</td><td>${rx.medicines}</td><td>${rx.doctor || '—'}</td><td><span class="badge badge-info">${rx.status}</span></td></tr>`;
});
html += '</tbody></table>';
showModal(`${patient.name} - Prescription History`, html);
}

function showPatientModal(data) {
const body = document.getElementById('modalBody');
const d = data || {};
body.innerHTML = `
<input type="hidden" id="patientId" value="${d.id || ''}">
<div class="form-grid">
<div class="form-group"><label>Full Name *</label><input type="text" id="patName" value="${d.name || ''}" placeholder="Patient name"></div>
<div class="form-group"><label>Phone *</label><input type="text" id="patPhone" value="${d.phone || ''}" placeholder="Phone number"></div>
<div class="form-group"><label>Email</label><input type="email" id="patEmail" value="${d.email || ''}" placeholder="Email"></div>
<div class="form-group"><label>Date of Birth</label><input type="date" id="patDob" value="${d.dob || ''}"></div>
<div class="form-group"><label>Gender</label><select id="patGender"><option value="Male" ${d.gender === 'Male' ? 'selected' : ''}>Male</option><option value="Female" ${d.gender === 'Female' ? 'selected' : ''}>Female</option><option value="Other" ${d.gender === 'Other' ? 'selected' : ''}>Other</option></select></div>
<div class="form-group"><label>Address</label><input type="text" id="patAddress" value="${d.address || ''}" placeholder="Address"></div>
<div class="form-group"><label>Comorbidities (comma-separated)</label><input type="text" id="patComorbidities" value="${(d.comorbidities || []).join(', ')}" placeholder="e.g. Diabetes, Hypertension"></div>
</div>
<div style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end;"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="savePatient()">Save</button></div>
`;
document.getElementById('modalTitle').textContent = data ? 'Edit Patient' : 'Add Patient';
document.getElementById('modalOverlay').classList.remove('hidden');
}
function savePatient() {
const id = document.getElementById('patientId').value;
const name = document.getElementById('patName').value.trim();
const phone = document.getElementById('patPhone').value.trim();
if (!name || !phone) { showToast('Please enter name and phone.', 'error'); return; }
const comorbidities = document.getElementById('patComorbidities').value.split(',').map(s => s.trim()).filter(Boolean);
const data = { id: id || genId('pat_'), name, phone, email: document.getElementById('patEmail').value.trim(), dob: document.getElementById('patDob').value, gender: document.getElementById('patGender').value, address: document.getElementById('patAddress').value.trim(), comorbidities, lastVisit: DateHelper.today(), createdAt: id ? undefined : new Date().toISOString() };
StorageService.put('patients', data);
logActivity('patient', `Patient ${id ? 'updated' : 'added'}: ${name}`);
showToast(`Patient ${id ? 'updated' : 'added'} successfully.`, 'success');
closeModal();
renderPatients();
updateNavBadges();
}
function editPatient(id) { const p = DB.patients.find(x => x.id === id); if (p) showPatientModal(p); }
function deletePatient(id) { if (!confirm('Delete this patient?')) return; StorageService.delete('patients', id); showToast('Patient deleted.', 'info'); renderPatients(); updateNavBadges(); }

/* ============================================================
PRESCRIPTIONS
============================================================ */
function renderPrescriptions() {
const container = document.getElementById('prescriptionsContent');
const items = DB.prescriptions;
if (items.length === 0) { container.innerHTML = '<div class="empty-state"><h4>No prescriptions</h4><button class="btn btn-primary" onclick="showPrescriptionModal()">+ New Prescription</button></div>'; return; }
let html = `<div style="margin-bottom:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
<button class="btn btn-primary" onclick="showPrescriptionModal()">+ New Prescription</button>
<input type="text" id="prescriptionSearch" placeholder="🔍 Search prescriptions..." oninput="renderPrescriptions()" style="padding:8px 12px;border:1px solid var(--border-strong);border-radius:var(--radius);font-size:13px;width:200px;">
</div><table class="data-table"><thead><tr><th>Date</th><th>Patient</th><th>Medicines</th><th>Doctor</th><th>Status</th><th style="text-align:right;">Actions</th></tr></thead><tbody>`;
const searchTerm = document.getElementById('prescriptionSearch')?.value?.toLowerCase() || '';
let filtered = items;
if (searchTerm) filtered = filtered.filter(p => p.patientName.toLowerCase().includes(searchTerm) || p.medicines.toLowerCase().includes(searchTerm));
filtered.forEach(pr => {
html += `<tr><td>${DateHelper.formatDateShort(pr.date)}</td><td>${pr.patientName}</td><td>${pr.medicines}</td><td>${pr.doctor || '—'}</td><td><span class="badge badge-info">${pr.status}</span></td><td style="text-align:right;"><button class="btn btn-edit btn-sm" onclick="editPrescription('${pr.id}')">Edit</button><button class="btn btn-delete btn-sm" onclick="deletePrescription('${pr.id}')">Delete</button></td></tr>`;
});
html += '</tbody></table>';
container.innerHTML = html;
}

function editPrescription(id) {
const pr = DB.prescriptions.find(x => x.id === id);
if (!pr) return;
const body = document.getElementById('modalBody');
const patients = DB.patients.map(p => `<option value="${p.id}" ${p.id === pr.patientId ? 'selected' : ''}>${p.name}</option>`).join('');
const meds = DB.inventory.map(m => `<option value="${m.id}" ${pr.medicines.includes(m.name) ? 'selected' : ''}>${m.name}</option>`).join('');
body.innerHTML = `
<input type="hidden" id="rxId" value="${pr.id}">
<div class="form-grid">
<div class="form-group"><label>Date</label><input type="date" id="rxDate" value="${pr.date}"></div>
<div class="form-group"><label>Patient</label><select id="rxPatient">${patients}</select></div>
<div class="form-group"><label>Medicines</label><select multiple id="rxMeds" style="height:80px;">${meds}</select></div>
<div class="form-group"><label>Doctor</label><input type="text" id="rxDoctor" value="${pr.doctor || ''}" placeholder="Doctor name"></div>
<div class="form-group"><label>Status</label><select id="rxStatus"><option value="Active" ${pr.status === 'Active' ? 'selected' : ''}>Active</option><option value="Filled" ${pr.status === 'Filled' ? 'selected' : ''}>Filled</option><option value="Expired" ${pr.status === 'Expired' ? 'selected' : ''}>Expired</option></select></div>
</div>
<div style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end;"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="savePrescriptionEdit()">Update</button></div>
`;
document.getElementById('modalTitle').textContent = 'Edit Prescription';
document.getElementById('modalOverlay').classList.remove('hidden');
}

function savePrescriptionEdit() {
const id = document.getElementById('rxId').value;
const pr = DB.prescriptions.find(x => x.id === id);
if (!pr) return;
pr.date = document.getElementById('rxDate').value;
const patientId = document.getElementById('rxPatient').value;
const patient = DB.patients.find(p => p.id === patientId);
pr.patientId = patientId;
pr.patientName = patient ? patient.name : 'Unknown';
const medSelect = document.getElementById('rxMeds');
pr.medicines = Array.from(medSelect.selectedOptions).map(o => o.text).join(', ');
pr.doctor = document.getElementById('rxDoctor').value.trim();
pr.status = document.getElementById('rxStatus').value;
StorageService.put('prescriptions', pr);
logActivity('prescription', `Prescription ${pr.id} updated`);
showToast('Prescription updated successfully.', 'success');
closeModal();
renderPrescriptions();
updateNavBadges();
}

function deletePrescription(id) {
if (!confirm('Delete this prescription?')) return;
StorageService.delete('prescriptions', id);
logActivity('prescription', `Prescription ${id} deleted`);
showToast('Prescription deleted.', 'info');
renderPrescriptions();
updateNavBadges();
}

function showPrescriptionModal() {
const body = document.getElementById('modalBody');
const patients = DB.patients.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
const meds = DB.inventory.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
body.innerHTML = `
<div class="form-grid">
<div class="form-group"><label>Date</label><input type="date" id="rxDate" value="${DateHelper.today()}"></div>
<div class="form-group"><label>Patient</label><select id="rxPatient">${patients}</select></div>
<div class="form-group"><label>Medicines</label><select multiple id="rxMeds" style="height:80px;">${meds}</select></div>
<div class="form-group"><label>Doctor</label><input type="text" id="rxDoctor" placeholder="Doctor name"></div>
<div class="form-group"><label>Status</label><select id="rxStatus"><option value="Active">Active</option><option value="Filled">Filled</option><option value="Expired">Expired</option></select></div>
</div>
<div style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end;"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="savePrescription()">Save</button></div>
`;
document.getElementById('modalTitle').textContent = 'New Prescription';
document.getElementById('modalOverlay').classList.remove('hidden');
}
function savePrescription() {
const date = document.getElementById('rxDate').value;
const patientId = document.getElementById('rxPatient').value;
const doctor = document.getElementById('rxDoctor').value.trim();
const status = document.getElementById('rxStatus').value;
const medSelect = document.getElementById('rxMeds');
const selectedMeds = Array.from(medSelect.selectedOptions).map(o => o.text).join(', ');
if (!patientId || !selectedMeds) { showToast('Please select patient and medicines.', 'error'); return; }
const patient = DB.patients.find(p => p.id === patientId);
const rx = { id: genId('rx_'), date, patientId, patientName: patient ? patient.name : 'Unknown', medicines: selectedMeds, doctor, status, createdAt: new Date().toISOString() };
StorageService.put('prescriptions', rx);
logActivity('prescription', `Prescription created for ${rx.patientName}`);
showToast('Prescription saved.', 'success');
closeModal();
renderPrescriptions();
updateNavBadges();
}

/* ============================================================
REPORTS
============================================================ */
function renderReports() {
const container = document.getElementById('reportsContent');
const timeFilter = document.getElementById('reportsTimeFilter')?.value || 'all';
const dateFrom = document.getElementById('reportsDateFrom')?.value;
const dateTo = document.getElementById('reportsDateTo')?.value;
let range = DateHelper.getRange(timeFilter, dateFrom, dateTo);
let html = `<div style="margin-bottom:16px;display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
<h3 style="font-size:14px;font-weight:600;color:var(--text);">Financial Reports by Time Period</h3>
<select id="reportsTimeFilter" onchange="renderReports()" style="padding:8px 12px;border:1px solid var(--border-strong);border-radius:var(--radius);font-size:13px;">
<option value="today">Today</option><option value="yesterday">Yesterday</option><option value="thisWeek">This Week</option><option value="lastWeek">Last Week</option><option value="thisMonth">This Month</option><option value="lastMonth">Last Month</option><option value="thisYear">This Year</option><option value="all">All Time</option>
</select>
<input type="date" id="reportsDateFrom" onchange="renderReports()" style="padding:8px 12px;border:1px solid var(--border-strong);border-radius:var(--radius);font-size:13px;">
<span style="color:var(--text-muted);">to</span>
<input type="date" id="reportsDateTo" onchange="renderReports()" style="padding:8px 12px;border:1px solid var(--border-strong);border-radius:var(--radius);font-size:13px;">
</div>`;
const sales = DB.sales.filter(s => s.date >= range.from && s.date <= range.to);
const expenses = DB.expenses.filter(e => e.date >= range.from && e.date <= range.to);
const revenue = sales.reduce((a,s) => a + (s.total || 0), 0);
const cost = sales.reduce((a,s) => a + ((s.lines || []).reduce((b,l) => b + (l.costPrice || 0) * l.qty, 0)), 0);
const profit = revenue - cost;
const totalExpenses = expenses.reduce((s,e) => s + (e.amount || 0), 0);
const netProfit = profit - totalExpenses;
const margin = revenue > 0 ? (netProfit / revenue * 100) : 0;
html += `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px;margin-bottom:24px;">`;
html += `<div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:20px;text-align:center;box-shadow:var(--shadow-sm);">
<div style="font-size:12px;color:var(--text-muted);font-weight:500;">Total Revenue</div>
<div style="font-size:24px;font-weight:800;color:var(--brand);margin:4px 0;">${DateHelper.formatKSh(revenue)}</div>
<div style="font-size:11px;color:var(--text-muted);">${sales.length} transactions</div>
</div>
<div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:20px;text-align:center;box-shadow:var(--shadow-sm);">
<div style="font-size:12px;color:var(--text-muted);font-weight:500;">Total Cost (COGS)</div>
<div style="font-size:24px;font-weight:800;color:var(--warning);margin:4px 0;">${DateHelper.formatKSh(cost)}</div>
<div style="font-size:11px;color:var(--text-muted);">${sales.reduce((a,s) => a + (s.lines || []).reduce((b,l) => b + l.qty, 0), 0)} units sold</div>
</div>
<div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:20px;text-align:center;box-shadow:var(--shadow-sm);">
<div style="font-size:12px;color:var(--text-muted);font-weight:500;">Gross Profit</div>
<div style="font-size:24px;font-weight:800;color:${profit >= 0 ? 'var(--success)' : 'var(--danger)'};margin:4px 0;">${DateHelper.formatKSh(profit)}</div>
<div style="font-size:11px;color:var(--text-muted);">${profit >= 0 ? 'Profit' : 'Loss'}</div>
</div>
<div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:20px;text-align:center;box-shadow:var(--shadow-sm);">
<div style="font-size:12px;color:var(--text-muted);font-weight:500;">Total Expenses</div>
<div style="font-size:24px;font-weight:800;color:var(--danger);margin:4px 0;">${DateHelper.formatKSh(totalExpenses)}</div>
<div style="font-size:11px;color:var(--text-muted);">${expenses.length} expenses</div>
</div>
<div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:20px;text-align:center;box-shadow:var(--shadow-sm);">
<div style="font-size:12px;color:var(--text-muted);font-weight:500;">Net Profit/Loss</div>
<div style="font-size:24px;font-weight:800;color:${netProfit >= 0 ? 'var(--success)' : 'var(--danger)'};margin:4px 0;">${DateHelper.formatKSh(netProfit)}</div>
<div style="font-size:11px;color:var(--text-muted);">${netProfit >= 0 ? 'Profit' : 'Loss'}</div>
</div>
<div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:20px;text-align:center;box-shadow:var(--shadow-sm);">
<div style="font-size:12px;color:var(--text-muted);font-weight:500;">Profit Margin</div>
<div style="font-size:24px;font-weight:800;color:${margin >= 0 ? 'var(--success)' : 'var(--danger)'};margin:4px 0;">${margin.toFixed(2)}%</div>
<div style="font-size:11px;color:var(--text-muted);">${margin >= 0 ? 'Positive' : 'Negative'}</div>
</div>`;
html += '</div>';
html += `<div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap;">
<button class="btn btn-secondary" onclick="exportData('inventory')">Export Inventory</button>
<button class="btn btn-secondary" onclick="exportData('sales')">Export Sales</button>
<button class="btn btn-secondary" onclick="exportData('expenses')">Export Expenses</button>
<button class="btn btn-secondary" onclick="exportData('patients')">Export Patients</button>
<button class="btn btn-secondary" onclick="exportData('activity')">Export Activity Log</button>
</div>
<div style="margin-top:16px;">
<h4 style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:8px;">Cash Book Summary for Selected Period</h4>
<p style="font-size:12px;color:var(--text-muted);">Cash inflow and outflow details are available in the Cash Book panel with the same time filters.</p>
</div>`;
container.innerHTML = html;
}

/* ============================================================
ACTIVITY LOG
============================================================ */
function renderActivity() {
const container = document.getElementById('activityContent');
const items = DB.activity;
if (items.length === 0) { container.innerHTML = '<div class="empty-state"><h4>No activity yet</h4></div>'; return; }
let html = `<div style="max-height:500px;overflow-y:auto;"><table class="data-table"><thead><tr><th>Time</th><th>Type</th><th>Message</th><th style="text-align:right;">Actions</th></tr></thead><tbody>`;
items.slice(0, 200).forEach(a => {
const time = new Date(a.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
const badge = a.type === 'sale' ? 'badge-success' : a.type === 'expense' ? 'badge-danger' : a.type === 'inventory' ? 'badge-info' : a.type === 'patient' ? 'badge-info' : a.type === 'purchase' ? 'badge-warning' : 'badge-neutral';
html += `<tr><td style="font-size:12px;color:var(--text-muted);">${time}</td><td><span class="badge ${badge}">${a.type}</span></td><td>${a.message}</td><td style="text-align:right;"><button class="btn btn-delete btn-sm" onclick="deleteActivity('${a.id}')">Delete</button></td></tr>`;
});
html += '</tbody></table></div>';
container.innerHTML = html;
}

function deleteActivity(id) {
if (!confirm('Delete this activity log entry?')) return;
StorageService.delete('activity', id);
showToast('Activity log entry deleted.', 'info');
renderActivity();
updateNavBadges();
}

function clearActivityLog() {
if (!confirm('Clear all activity logs?')) return;
StorageService.clear('activity');
showToast('Activity log cleared.', 'info');
renderActivity();
updateNavBadges();
}

/* ============================================================
SYSTEM RESET - ONE BUTTON CLEAR
============================================================ */
function resetEntireSystem() {
if (!confirm('⚠️ WARNING: You are about to DELETE ALL DATA! This includes all sales, inventory, patients, suppliers, and settings. Are you sure?')) return;
if (!confirm('🔴 FINAL WARNING: This action cannot be undone! Are you absolutely sure?')) return;
if (!confirm('🛑 Last chance: Enter the word "RESET" to confirm permanent deletion of all data.')) return;
const userInput = prompt('To confirm, please type the word "RESET" below:');
if (userInput !== 'RESET') {
showToast('Reset cancelled. Incorrect confirmation word.', 'error');
return;
}
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
const key = localStorage.key(i);
if (key && key.startsWith('pharmtrack_')) {
keysToRemove.push(key);
}
}
keysToRemove.forEach(key => localStorage.removeItem(key));
localStorage.removeItem('pharmtrack_receipt_counter');
showToast('🧹 System reset successfully! The page will now reload.', 'success');
setTimeout(() => {
location.reload();
}, 2000);
}

/* ============================================================
EXPORT DATA
============================================================ */
function exportData(type) {
let data = []; let filename = '';
if (type === 'inventory') { data = DB.inventory.map(m => ({ 'Drug Name': m.name, Brand: m.brand, Batch: m.batch, Category: m.category, Formulation: m.formulation, Quantity: m.qty, 'Buying Price': m.buyingPrice, 'Selling Price': m.price, 'Unit Cost': m.costPrice, Expiry: m.expiry, 'Date Added': m.addedDate })); filename = 'medicines'; }
else if (type === 'sales') { data = DB.sales.map(s => ({ Date: s.date, 'Receipt No': 'SR-' + String(s.receiptNumber||'0').padStart(4,'0'), Customer: s.customer||'', Reference: s.reference||s.txCode||'', Total: s.total, Payment: s.paymentMethod||s.payment, Status: s.status||'Paid' })); filename = 'sales'; }
else if (type === 'expenses') { data = DB.expenses.map(e => ({ Date: e.date, Category: e.category, Description: e.description, Amount: e.amount, Payment: e.payment, 'TX Code': e.txCode })); filename = 'expenses'; }
else if (type === 'patients') { data = DB.patients.map(p => ({ Name: p.name, Phone: p.phone, Email: p.email, Gender: p.gender, 'Comorbidities': (p.comorbidities||[]).join(', ') })); filename = 'patients'; }
else if (type === 'suppliers') { data = DB.suppliers.map(s => ({ Name: s.name, Contact: s.contact, Phone: s.phone, Email: s.email, Address: s.address, Rating: s.rating || 0 })); filename = 'suppliers'; }
else if (type === 'activity') { data = DB.activity.map(a => ({ Time: a.timestamp, Type: a.type, Message: a.message })); filename = 'activity_log'; }
else if (type === 'stock') { data = DB.inventory.map(m => ({ Name: m.name, Category: m.category, Formulation: m.formulation, Quantity: m.qty, 'Threshold': ThresholdService.getThresholdInUnits(m), 'Status': ThresholdService.isLowStock(m) ? 'Low' : 'OK', Expiry: m.expiry })); filename = 'stock'; }
else if (type === 'batches') { data = DB.inventory.map(m => ({ Batch: m.batch, Drug: m.name, Brand: m.brand, Category: m.category, Formulation: m.formulation, Quantity: m.qty, 'Buying Price': m.buyingPrice, Expiry: m.expiry })); filename = 'batches'; }
else if (type === 'stockin') { data = DB.stockIn; filename = 'stock_in'; }
else if (type === 'adjustments') { data = DB.adjustments; filename = 'adjustments'; }
else if (type === 'expiry') { data = DB.inventory.map(m => ({ Name: m.name, Batch: m.batch, Category: m.category, Supplier: m.company, Quantity: m.qty, Expiry: m.expiry, 'Days Left': DateHelper.daysBetween(DateHelper.today(), m.expiry) })); filename = 'expiry'; }
else if (type === 'lowstock') { data = DB.inventory.filter(m => ThresholdService.isLowStock(m)).map(m => ({ Name: m.name, Batch: m.batch, Category: m.category, 'Current Qty': m.qty, Threshold: ThresholdService.getThresholdInUnits(m), Shortage: ThresholdService.getThresholdInUnits(m) - m.qty })); filename = 'low_stock'; }
else if (type === 'purchases') { data = DB.purchases; filename = 'purchases'; }
else if (type === 'purchaseorders') { data = DB.purchaseOrders; filename = 'purchase_orders'; }
else if (type === 'grn') { data = DB.grn; filename = 'grn'; }
else if (type === 'invoices') { data = DB.invoices; filename = 'invoices'; }
else if (type === 'returns') { data = DB.returns; filename = 'returns'; }
else if (type === 'payments') { data = DB.payments; filename = 'payments'; }
else if (type === 'cashbook') { data = [...DB.sales.filter(s => s.payment === 'CASH' || s.paymentMethod === 'CASH'), ...DB.expenses.filter(e => e.payment === 'CASH')]; filename = 'cashbook'; }
else if (type === 'bankaccounts') { data = DB.bankAccounts; filename = 'bank_accounts'; }
else if (type === 'prescriptions') { data = DB.prescriptions; filename = 'prescriptions'; }
else if (type === 'reports') { data = [...DB.inventory, ...DB.sales, ...DB.expenses, ...DB.patients, ...DB.suppliers]; filename = 'all_reports'; }
else if (type === 'stockout') { data = DB.stockOut; filename = 'stock_out'; }
if (data.length === 0) { showToast('No data to export.', 'info'); return; }
const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, filename);
XLSX.writeFile(wb, `${filename}_${DateHelper.today()}.xlsx`);
showToast(`Exported ${data.length} records.`, 'success');
}

/* ============================================================
IMPORT HANDLER - UNIVERSAL & ROBUST
Supports ANY date format, incomplete columns, smart header detection, and numeric batch numbers
============================================================ */
function normalizePayment(val) { if (!val) return 'CASH'; const v = val.toString().toUpperCase().trim(); if (v.includes('BANK') || v.includes('NCBA')) return 'NCBA BANK'; if (v.includes('POCHI') || v.includes('MPESA') || v.includes('M-PESA')) return 'POCHI'; return 'CASH'; }

// Universal Date Parser - Handles YYYY/MM/DD, DD/MM/YYYY, MM/DD/YYYY, DD-MMM-YYYY, and Excel Serial Dates
function parseAnyDate(val) {
    if (!val) return DateHelper.today();
    if (val instanceof Date && !isNaN(val)) return val.toISOString().split('T')[0];
    let str = String(val).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    str = str.replace(/[\/\.]/g, '-').replace(/\s+/g, '-');
    let parts = str.split('-').filter(p => p.length > 0);
    const monthMap = { 'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'may': '05', 'jun': '06', 'jul': '07', 'aug': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12' };
    let monthIndex = parts.findIndex(p => monthMap[p.toLowerCase()] !== undefined);
    if (monthIndex !== -1) {
        let day = String(parts[monthIndex - 1] || '01').padStart(2, '0');
        let month = monthMap[parts[monthIndex].toLowerCase()];
        let year = String(parts[monthIndex + 1] || new Date().getFullYear().toString());
        if (year.length === 2) year = (parseInt(year) > 30 ? '19' : '20') + year;
        return `${year}-${month}-${day}`;
    }
    if (parts.length === 3) {
        if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2,'0')}-${parts[2].padStart(2,'0')}`;
        else if (parts[2].length === 4) {
            if (parseInt(parts[0]) > 12) return `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
            else if (parseInt(parts[1]) > 12) return `${parts[2]}-${parts[0].padStart(2,'0')}-${parts[1].padStart(2,'0')}`;
            else return `${parts[2]}-${parts[0].padStart(2,'0')}-${parts[1].padStart(2,'0')}`;
        }
    }
    let d = new Date(str);
    if (!isNaN(d)) return d.toISOString().split('T')[0];
    return DateHelper.today();
}

function handleImport(event, type) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const wb = XLSX.read(data, { type: 'array', cellDates: true });
            const raw = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
            if (raw.length === 0) { showToast('File is empty.', 'error'); return; }

            // SMART COLUMN DETECTION
            const nk = (obj, keys) => {
                const lo = Object.keys(obj).reduce((a,k) => { 
                    a[String(k).toLowerCase().replace(/[_\s\/\.\-]/g, '')] = k; 
                    return a; 
                }, {});
                for (let k of keys) { 
                    const c = String(k).toLowerCase().replace(/[_\s\/\.\-]/g, ''); 
                    if (lo[c] !== undefined) return obj[lo[c]]; 
                }
                return ""; 
            };

            let count = 0;
            
            if (type === 'inventory') {
                for (const row of raw) {
                    const name = String(nk(row, ["drugname","name","generic","product","drug"]) || "").trim();
                    if (!name) continue;

                    let qtyRaw = String(nk(row, ["quantity","qty","stock","qnt","stoc in"]) || "0");
                    let qty = parseInt(qtyRaw.replace(/[^0-9]/g, '')) || 0;
                    if (qtyRaw.toLowerCase().includes('strip') && qtyRaw.includes('(')) {
                        let match = qtyRaw.match(/\(.*?\)\s*(\d+)/);
                        if (match) qty = parseInt(match[1]);
                    }

                    const price = parseFloat(nk(row, ["price","sellingprice","unitprice","sell","selling"])) || 0;
                    const buyingPrice = parseFloat(nk(row, ["buyingprice","totalcost","cost","buyprice","buying"])) || 0;
                    const category = String(nk(row, ["category","type","class"]) || "Other").trim();
                    const formulation = String(nk(row, ["formulation","form","type","drug type"]) || "Other").trim();
                    const company = String(nk(row, ["company","manufacturer","supplier","vendor"]) || "").trim();
                    const brand = String(nk(row, ["brand","brandname","manufacturer"]) || "").trim();
                    // Force batch to be a String to prevent .trim() crash
                    const batch = String(nk(row, ["batch","batchno","lot","batch no.","batch number"]) || "").trim();
                    
                    let expiry = parseAnyDate(nk(row, ["expiry","expirydate","date","exp","ex"]));
                    const costPrice = qty > 0 ? buyingPrice / qty : 0;

                    const med = { 
                        id: genId('med_'), 
                        name, 
                        brand, 
                        company,
                        batch, 
                        category, 
                        formulation, 
                        type: "Generic", 
                        buyingPrice, 
                        costPrice, 
                        price, 
                        expiry, 
                        qty, 
                        addedDate: DateHelper.today(), 
                        createdAt: new Date().toISOString() 
                    };
                    StorageService.put('inventory', med); 
                    count++;
                }
                showToast(`✅ Imported ${count} medicines to inventory and stock.`, 'success'); 
                renderTable(); renderStock(); updateNavBadges();
                
            } else if (type === 'sales') {
                for (const row of raw) {
                    const drugName = String(nk(row, ["drug","drugname","name","product"]) || "").trim();
                    if (!drugName) continue;
                    const med = DB.inventory.find(m => String(m.name).toLowerCase() === drugName.toLowerCase());
                    if (!med) continue;

                    let qty = parseInt(nk(row, ["quantity","qty","sold","qnt"])) || 0; 
                    if (qty <= 0 || qty > med.qty) continue;
                    
                    const price = parseFloat(nk(row, ["price","unitprice"])) || med.price;
                    const payment = normalizePayment(nk(row, ["payment","mode","method"]));
                    let txCode = String(nk(row, ["txcode","transactioncode","tx","reference"]) || "").trim();
                    if (payment === 'CASH') txCode = ''; else if (!txCode) continue;

                    let date = parseAnyDate(nk(row, ["date","saledate","sale date"]));
                    const receiptNumber = getNextReceiptNumber();
                    const sale = { 
                        id: genId('sal_'), 
                        date, 
                        receiptNumber, 
                        customer: 'Walk-in Customer', 
                        lines: [{ 
                            productId: med.id, 
                            productName: med.name, 
                            productBrand: med.brand, 
                            description: med.name, 
                            qty, 
                            rate: price, 
                            amount: qty * price, 
                            serviceDate: date, 
                            costPrice: med.costPrice 
                        }], 
                        total: qty * price, 
                        subtotal: qty * price, 
                        tax: 0, 
                        discount: 0, 
                        payment, 
                        paymentMethod: payment, 
                        txCode, 
                        reference: txCode, 
                        status: 'Paid', 
                        createdAt: new Date().toISOString() 
                    };
                    StorageService.put('sales', sale); 
                    med.qty -= qty; 
                    StorageService.put('inventory', med); 
                    count++;
                }
                showToast(`✅ Imported ${count} sales.`, 'success');
                if (UIController.currentPanel === 'sales') renderSalesTransactions();
                if (UIController.currentPanel === 'dashboard') UIController.renderDashboard();
                
            } else if (type === 'expenses') {
                for (const row of raw) {
                    let date = parseAnyDate(nk(row, ["date","expensedate","expense date"]));
                    const category = String(nk(row, ["category","type"]) || "Miscellaneous").trim();
                    const description = String(nk(row, ["description","desc","details"]) || "").trim();
                    if (!description) continue;
                    const amount = parseFloat(nk(row, ["amount","total","cost"])) || 0;
                    if (amount <= 0) continue;
                    const payment = normalizePayment(nk(row, ["payment","mode","method"]));
                    let txCode = String(nk(row, ["txcode","transactioncode","tx","reference"]) || "").trim();
                    if (payment === 'CASH') txCode = ''; else if (!txCode) continue;
                    const exp = { id: genId('exp_'), date, category, description, amount, payment, txCode, createdAt: new Date().toISOString() };
                    StorageService.put('expenses', exp); 
                    count++;
                }
                showToast(`✅ Imported ${count} expenses.`, 'success');
                
            } else if (type === 'patients') {
                for (const row of raw) {
                    const name = String(nk(row, ["name","patientname","fullname"]) || "").trim();
                    if (!name) continue;
                    const phone = String(nk(row, ["phone","phonenumber","mobile"]) || "").trim();
                    if (!phone) continue;
                    let dob = parseAnyDate(nk(row, ["dob","dateofbirth","birthdate"]));
                    const patient = { 
                        id: genId('pat_'), 
                        name, 
                        phone, 
                        email: String(nk(row, ["email"]) || "").trim(), 
                        dob, 
                        gender: String(nk(row, ["gender","sex"]) || "Other").trim(), 
                        address: String(nk(row, ["address"]) || "").trim(), 
                        comorbidities: [], 
                        lastVisit: DateHelper.today(), 
                        createdAt: new Date().toISOString() 
                    };
                    StorageService.put('patients', patient); 
                    count++;
                }
                showToast(`✅ Imported ${count} patients.`, 'success');
                
            } else if (type === 'suppliers') {
                for (const row of raw) {
                    const name = String(nk(row, ["name","suppliername","vendor"]) || "").trim();
                    if (!name) continue;
                    const supplier = { 
                        id: genId('sup_'), 
                        name, 
                        contact: String(nk(row, ["contact","contactperson"]) || "").trim(), 
                        phone: String(nk(row, ["phone","phonenumber"]) || "").trim(), 
                        email: String(nk(row, ["email"]) || "").trim(), 
                        address: String(nk(row, ["address"]) || "").trim(), 
                        rating: 0, 
                        createdAt: new Date().toISOString() 
                    };
                    StorageService.put('suppliers', supplier); 
                    count++;
                }
                showToast(`✅ Imported ${count} suppliers.`, 'success');
            } else { 
                showToast(`Import for ${type} is not yet supported.`, 'info'); 
            }
            event.target.value = '';
        } catch (err) { 
            console.error(err); 
            showToast('Error reading file: ' + err.message, 'error'); 
        }
    };
    reader.readAsArrayBuffer(file);
}

/* ============================================================
MODAL FUNCTIONS
============================================================ */
function closeModal() { document.getElementById('modalOverlay').classList.add('hidden'); }
function showModal(title, bodyHtml) {
document.getElementById('modalTitle').textContent = title;
document.getElementById('modalBody').innerHTML = bodyHtml;
document.getElementById('modalOverlay').classList.remove('hidden');
}
document.getElementById('modalOverlay').addEventListener('click', function(e) { if (e.target === this) closeModal(); });

/* ============================================================
INIT
============================================================ */
setTimeout(() => {
if (document.getElementById('panel-dashboard').classList.contains('active')) UIController.renderDashboard();
}, 100);